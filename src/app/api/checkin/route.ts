import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/checkin
 *
 * Submit (or update) a daily check-in for the authenticated client.
 * Uses upsert so re-submissions update rather than fail.
 *
 * Body: { date: "YYYY-MM-DD", responses: Record<string, unknown> }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, responses } = await req.json();

  if (!date || !responses) {
    return NextResponse.json(
      { error: "date and responses are required" },
      { status: 400 }
    );
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  const clientId = session.user.id;

  try {
    // Verify client has a tracker template (plan was approved)
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
    });

    if (!template) {
      return NextResponse.json(
        {
          error:
            "No tracker template found. Your coach needs to approve your plan first.",
        },
        { status: 400 }
      );
    }

    // Upsert: create or update for this client + date
    const checkIn = await prisma.dailyCheckIn.upsert({
      where: {
        clientId_date: {
          clientId,
          date: new Date(date + "T00:00:00.000Z"),
        },
      },
      update: {
        responses: responses as object,
        submittedAt: new Date(),
      },
      create: {
        clientId,
        date: new Date(date + "T00:00:00.000Z"),
        responses: responses as object,
      },
    });

    return NextResponse.json({
      id: checkIn.id,
      date: checkIn.date,
      saved: true,
    });
  } catch (error) {
    console.error("Check-in save error:", error);
    return NextResponse.json(
      { error: "Failed to save check-in" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkin?clientId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Fetch daily check-ins for a date range.
 * CLIENT can only fetch own data. COACH can fetch their client's data.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  let clientId = searchParams.get("clientId");

  // Clients can only fetch their own check-ins
  if (session.user.role === "CLIENT") {
    clientId = session.user.id;
  }

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  // Access control for coaches
  if (session.user.role === "COACH") {
    try {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { coachId: true },
      });
      if (!client || client.coachId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to verify access" },
        { status: 500 }
      );
    }
  }

  // Default: last 7 days
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 6);

  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  const from = fromStr
    ? new Date(fromStr + "T00:00:00.000Z")
    : new Date(
        defaultFrom.toISOString().split("T")[0] + "T00:00:00.000Z"
      );
  const to = toStr
    ? new Date(toStr + "T23:59:59.999Z")
    : new Date(now.toISOString().split("T")[0] + "T23:59:59.999Z");

  try {
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        clientId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: "desc" },
    });

    // Extract just the date strings for calendar dot rendering
    const checkedInDates = checkIns.map((c) =>
      c.date.toISOString().split("T")[0]
    );

    return NextResponse.json({ checkIns, checkedInDates });
  } catch (error) {
    console.error("Check-in fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
