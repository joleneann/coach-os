import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWearableAdapter } from "@/lib/wearables";
import type { WearableProvider } from "@/lib/wearables";

/**
 * GET /api/wearables/callback?code=xxx&state=xxx
 *
 * OAuth callback from wearable provider.
 * Exchanges code for tokens, saves connection, redirects to dashboard.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Wearable OAuth error:", error);
    return NextResponse.redirect(new URL("/client?wearable=error", req.url));
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL("/client?wearable=error", req.url));
  }

  try {
    const state = JSON.parse(
      Buffer.from(stateParam, "base64url").toString()
    ) as { userId: string; provider: WearableProvider };

    // Verify state matches current user
    if (state.userId !== session.user.id) {
      return NextResponse.redirect(new URL("/client?wearable=error", req.url));
    }

    const adapter = getWearableAdapter(state.provider);
    if (!adapter) {
      return NextResponse.redirect(new URL("/client?wearable=error", req.url));
    }

    const tokens = await adapter.exchangeCode(code);

    // Upsert wearable connection
    await prisma.wearableConnection.upsert({
      where: {
        clientId_provider: {
          clientId: session.user.id,
          provider: state.provider,
        },
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt: tokens.expiresAt || undefined,
        scope: tokens.scope || undefined,
        providerUserId: tokens.providerUserId || undefined,
        isActive: true,
      },
      create: {
        clientId: session.user.id,
        provider: state.provider,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || undefined,
        expiresAt: tokens.expiresAt || undefined,
        scope: tokens.scope || undefined,
        providerUserId: tokens.providerUserId || undefined,
      },
    });

    return NextResponse.redirect(
      new URL("/client?wearable=connected", req.url)
    );
  } catch (err) {
    console.error("Wearable callback error:", err);
    return NextResponse.redirect(new URL("/client?wearable=error", req.url));
  }
}
