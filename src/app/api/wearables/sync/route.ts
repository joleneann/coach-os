import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWearableAdapter } from "@/lib/wearables";
import type { WearableProvider } from "@/lib/wearables";

/**
 * POST /api/wearables/sync
 *
 * Sync wearable data for a specific date range.
 * Auth: CLIENT (own data) or COACH (own client).
 * Body: { clientId?: string, provider: WearableProvider, from?: string, to?: string }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const clientId =
    session.user.role === "CLIENT" ? session.user.id : body.clientId;
  const provider = body.provider as WearableProvider;

  if (!clientId || !provider) {
    return NextResponse.json(
      { error: "clientId and provider are required" },
      { status: 400 }
    );
  }

  try {
    // Verify access
    if (session.user.role === "COACH") {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });
      if (!client || client.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Get connection
    const connection = await prisma.wearableConnection.findUnique({
      where: { clientId_provider: { clientId, provider } },
    });

    if (!connection || !connection.isActive) {
      return NextResponse.json(
        { error: "No active connection for this provider" },
        { status: 400 }
      );
    }

    const adapter = getWearableAdapter(provider);
    if (!adapter) {
      return NextResponse.json(
        { error: "Provider not configured" },
        { status: 503 }
      );
    }

    // Refresh tokens if expired
    let accessToken = connection.accessToken;
    if (connection.expiresAt && connection.expiresAt < new Date()) {
      if (!connection.refreshToken) {
        return NextResponse.json(
          { error: "Token expired. Please reconnect." },
          { status: 401 }
        );
      }
      const newTokens = await adapter.refreshTokens(connection.refreshToken);
      accessToken = newTokens.accessToken;

      await prisma.wearableConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || connection.refreshToken,
          expiresAt: newTokens.expiresAt,
        },
      });
    }

    // Determine date range (default: last 7 days)
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const from = body.from || sevenDaysAgo.toISOString().split("T")[0];
    const to = body.to || today;

    // Fetch data for each day
    let synced = 0;
    const current = new Date(from + "T12:00:00");
    const end = new Date(to + "T12:00:00");

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];

      try {
        const dataPoints = await adapter.fetchData(accessToken, dateStr);

        for (const point of dataPoints) {
          await prisma.wearableData.upsert({
            where: {
              clientId_provider_date_dataType: {
                clientId,
                provider,
                date: new Date(dateStr + "T00:00:00.000Z"),
                dataType: point.dataType,
              },
            },
            update: {
              value: point.value,
              unit: point.unit,
            },
            create: {
              clientId,
              provider,
              date: new Date(dateStr + "T00:00:00.000Z"),
              dataType: point.dataType,
              value: point.value,
              unit: point.unit,
            },
          });
          synced++;
        }
      } catch (e) {
        console.error(`Wearable sync error for ${dateStr}:`, e);
      }

      current.setDate(current.getDate() + 1);
    }

    // Update last sync timestamp
    await prisma.wearableConnection.update({
      where: { id: connection.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      synced,
      from,
      to,
      provider,
    });
  } catch (error) {
    console.error("Wearable sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync wearable data" },
      { status: 500 }
    );
  }
}
