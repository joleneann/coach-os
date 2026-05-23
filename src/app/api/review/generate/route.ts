import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  aggregateWeeklyCheckIns,
  buildCitations,
  getWeekStartDate,
  getWeekEndDate,
} from "@/lib/weekly-review";
import type { TrackerField } from "@/lib/tracker-template";

/**
 * POST /api/review/generate
 *
 * Creates a weekly review record with aggregated data.
 * The actual synthesis is generated via Claude Code script
 * (scripts/generate-review.mjs), not via an LLM API call.
 *
 * This route creates the record with a placeholder so the coach
 * can either:
 *   a) Run the Claude Code script to generate the synthesis, or
 *   b) Write the review manually in the web UI
 *
 * Body: { clientId: string, weekStart?: string (YYYY-MM-DD) }
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId, weekStart: weekStartParam } = await req.json();

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId is required" },
      { status: 400 }
    );
  }

  try {
    // Verify coach owns this client
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { coachId: true, name: true },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const weekStart = weekStartParam || getWeekStartDate();
    const weekEnd = getWeekEndDate(weekStart);

    // Check for existing review this week
    const existing = await prisma.weeklyReview.findUnique({
      where: {
        clientId_weekStartDate: {
          clientId,
          weekStartDate: new Date(weekStart + "T00:00:00.000Z"),
        },
      },
    });

    if (existing && existing.status !== "GENERATING") {
      return NextResponse.json(
        {
          error:
            "Review already exists for this week. Status: " + existing.status,
        },
        { status: 400 }
      );
    }

    // Fetch check-ins for the week
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        clientId,
        date: {
          gte: new Date(weekStart + "T00:00:00.000Z"),
          lte: new Date(weekEnd + "T23:59:59.999Z"),
        },
      },
      orderBy: { date: "asc" },
    });

    if (checkIns.length === 0) {
      return NextResponse.json(
        {
          error:
            "No check-ins found for this week. At least 1 check-in is needed.",
        },
        { status: 400 }
      );
    }

    // Fetch tracker template
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      return NextResponse.json(
        { error: "No tracker template found for this client" },
        { status: 400 }
      );
    }

    const templateFields = template.fields as unknown as TrackerField[];

    // Aggregate check-in data
    const checkInRecords = checkIns.map((c) => ({
      date: c.date,
      responses: c.responses as Record<string, unknown>,
    }));

    const aggregation = aggregateWeeklyCheckIns(checkInRecords, templateFields);
    const citations = buildCitations(checkInRecords, templateFields);

    // Build placeholder synthesis with real stats
    const clientFirstName = client.name?.split(" ")[0] || "there";
    const habitSummaries = aggregation.habits.map(
      (h) => `${h.label}: ${h.yes} yes, ${h.partly} partly, ${h.notToday} not today`
    );

    const synthesisData = {
      sections: [
        {
          title: "Your week",
          content: `${clientFirstName} checked in ${aggregation.daysCheckedIn} of 7 days this week.`,
        },
        {
          title: "What stood out",
          content: "Generate via Claude Code, or write your observations here.",
        },
        {
          title: "For next week",
          content: "Generate via Claude Code, or add your suggestions here.",
        },
      ],
      aggregation: {
        daysCheckedIn: aggregation.daysCheckedIn,
        habits: habitSummaries,
        metrics: aggregation.metrics.map((m) => ({
          label: m.label,
          average: m.average,
          unit: m.unit,
        })),
        reflectionCount: aggregation.reflections.length,
      },
      generationNote:
        "Click 'Edit before approving' to write your review, or use Claude Code to generate it.",
    };

    // Upsert the review
    const weekStartDate = new Date(weekStart + "T00:00:00.000Z");
    const review = existing
      ? await prisma.weeklyReview.update({
          where: { id: existing.id },
          data: {
            synthesisData: synthesisData as object,
            citations: citations as unknown as object,
            status: "COACH_REVIEW",
          },
        })
      : await prisma.weeklyReview.create({
          data: {
            clientId,
            weekStartDate,
            synthesisData: synthesisData as object,
            citations: citations as unknown as object,
            status: "COACH_REVIEW",
          },
        });

    return NextResponse.json({
      review: {
        id: review.id,
        weekStartDate: weekStart,
        weekEnd,
        status: review.status,
        synthesisData: review.synthesisData,
        daysCheckedIn: aggregation.daysCheckedIn,
      },
    });
  } catch (error) {
    console.error("Review generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate review" },
      { status: 500 }
    );
  }
}
