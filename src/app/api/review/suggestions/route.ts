import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { TrackerField } from "@/lib/tracker-template";
import {
  evaluateHabitGraduation,
  type GraduationRecommendation,
} from "@/lib/habit-graduation";
import { getWeekStartDate } from "@/lib/weekly-review";

/**
 * GET /api/review/suggestions?clientId=xxx
 *
 * Returns suggested tracker changes based on:
 * 1. Habit graduation recommendations (adherence-based)
 * 2. (Future: parsed review suggestions for new habits)
 *
 * Auth: COACH only (own client)
 */

export interface TrackerSuggestion {
  type: "graduate" | "demote" | "add_habit" | "remove_habit";
  fieldKey?: string;
  newFrequency?: "daily" | "twice_weekly" | "weekly";
  newField?: TrackerField;
  reason: string;
  source: "graduation" | "review";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COACH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const clientId = url.searchParams.get("clientId");

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
      select: { coachId: true },
    });

    if (!client || client.coachId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch tracker template
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      return NextResponse.json({ suggestions: [] });
    }

    const fields = template.fields as unknown as TrackerField[];
    const habitFields = fields.filter((f) => f.type === "habit");

    // Fetch last 4 weeks of check-ins for graduation evaluation
    const weekStart = getWeekStartDate();
    const fourWeeksAgo = new Date(weekStart + "T00:00:00.000Z");
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        clientId,
        date: { gte: fourWeeksAgo },
      },
      orderBy: { date: "asc" },
    });

    const checkInRecords = checkIns.map((c) => ({
      date: c.date,
      responses: c.responses as Record<string, unknown>,
    }));

    // Evaluate graduation recommendations
    const graduationRecs = evaluateHabitGraduation(habitFields, checkInRecords);

    // Convert to TrackerSuggestions
    const suggestions: TrackerSuggestion[] = graduationRecs.map(
      (rec: GraduationRecommendation) => {
        const isPromotion =
          (rec.currentFrequency === "daily" &&
            rec.recommendedFrequency === "twice_weekly") ||
          (rec.currentFrequency === "twice_weekly" &&
            rec.recommendedFrequency === "weekly");

        return {
          type: isPromotion ? ("graduate" as const) : ("demote" as const),
          fieldKey: rec.fieldKey,
          newFrequency: rec.recommendedFrequency,
          reason: rec.reason,
          source: "graduation" as const,
        };
      }
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Review suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
