import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { TrackerField } from "@/lib/tracker-template";
import { getWeekStartDate, getWeekEndDate } from "@/lib/weekly-review";

/**
 * GET /api/dashboard?range=4w
 *
 * Pre-aggregated dashboard data for the logged-in client.
 * Auth: CLIENT only (own data).
 * Range: "4w" (default, for STANDARD) or "8w" (for DATA_HEAVY)
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = session.user.id;
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get("range") || "4w";
  const weeks = rangeParam === "8w" ? 8 : 4;

  try {
    // Fetch user for dashboardMode
    const user = await prisma.user.findUnique({
      where: { id: clientId },
      select: { dashboardMode: true },
    });

    const dashboardMode = user?.dashboardMode || "STANDARD";

    // If MINIMAL, return minimal data
    if (dashboardMode === "MINIMAL") {
      const todayStr = new Date().toISOString().split("T")[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const recentCheckIns = await prisma.dailyCheckIn.findMany({
        where: {
          clientId,
          date: {
            gte: new Date(sevenDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z"),
            lte: new Date(todayStr + "T23:59:59.999Z"),
          },
        },
        select: { date: true },
      });

      const recentCheckInDates = recentCheckIns.map(
        (c) => c.date.toISOString().split("T")[0]
      );

      const latestReview = await prisma.weeklyReview.findFirst({
        where: { clientId, status: "DELIVERED" },
        orderBy: { weekStartDate: "desc" },
        select: { weekStartDate: true, synthesisData: true, status: true },
      });

      const snippet = latestReview?.synthesisData
        ? ((latestReview.synthesisData as { sections?: { content: string }[] })
            .sections?.[0]?.content || "")
            .slice(0, 100)
        : null;

      return NextResponse.json({
        dashboardMode,
        recentCheckInDates,
        hasCheckedInToday: recentCheckInDates.includes(todayStr),
        latestReview: latestReview
          ? {
              weekStart: latestReview.weekStartDate.toISOString().split("T")[0],
              snippet,
              status: latestReview.status,
            }
          : null,
        habitWeekly: {},
        metricDaily: {},
        weeklySummaries: [],
        habitProgress: [],
      });
    }

    // STANDARD / DATA_HEAVY: full data
    const template = await prisma.trackerTemplate.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    if (!template) {
      return NextResponse.json({ error: "No tracker template" }, { status: 400 });
    }

    const fields = template.fields as unknown as TrackerField[];
    const habitFields = fields.filter((f) => f.type === "habit");
    const metricFields = fields.filter(
      (f) => f.type === "metric" && f.dashboardModes.includes(dashboardMode as "STANDARD" | "DATA_HEAVY")
    );

    // Date range
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - weeks * 7);

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: {
        clientId,
        date: {
          gte: new Date(rangeStart.toISOString().split("T")[0] + "T00:00:00.000Z"),
          lte: new Date(todayStr + "T23:59:59.999Z"),
        },
      },
      orderBy: { date: "asc" },
    });

    // Recent 7 days for streak
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const recentCheckInDates = checkIns
      .filter((c) => c.date >= sevenDaysAgo)
      .map((c) => c.date.toISOString().split("T")[0]);

    // ── Habit weekly adherence ──
    const habitWeekly: Record<string, { week: string; rate: number; frequency: string }[]> = {};

    for (const habit of habitFields) {
      const weekMap = new Map<string, { yes: number; total: number }>();

      for (const ci of checkIns) {
        const weekKey = getWeekStartDate(ci.date);
        const val = (ci.responses as Record<string, unknown>)[habit.key];
        if (val === undefined || val === null) continue;

        if (!weekMap.has(weekKey)) weekMap.set(weekKey, { yes: 0, total: 0 });
        const w = weekMap.get(weekKey)!;
        w.total++;
        if (val === "yes" || val === "partly") w.yes++;
      }

      habitWeekly[habit.key] = Array.from(weekMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, d]) => ({
          week,
          rate: d.total > 0 ? Math.round((d.yes / d.total) * 100) : 0,
          frequency: habit.frequency || "daily",
        }));
    }

    // ── Metric daily values ──
    const metricDaily: Record<string, { date: string; value: number }[]> = {};

    for (const metric of metricFields) {
      metricDaily[metric.key] = [];
      for (const ci of checkIns) {
        const val = (ci.responses as Record<string, unknown>)[metric.key];
        if (val !== undefined && val !== null && val !== "") {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            metricDaily[metric.key].push({
              date: ci.date.toISOString().split("T")[0],
              value: numVal,
            });
          }
        }
      }
    }

    // ── Weekly summaries ──
    const weekSumMap = new Map<string, { daysCheckedIn: number; habitYes: number; habitTotal: number }>();

    for (const ci of checkIns) {
      const weekKey = getWeekStartDate(ci.date);
      if (!weekSumMap.has(weekKey)) {
        weekSumMap.set(weekKey, { daysCheckedIn: 0, habitYes: 0, habitTotal: 0 });
      }
      const ws = weekSumMap.get(weekKey)!;
      ws.daysCheckedIn++;

      for (const habit of habitFields) {
        const val = (ci.responses as Record<string, unknown>)[habit.key];
        if (val !== undefined && val !== null) {
          ws.habitTotal++;
          if (val === "yes" || val === "partly") ws.habitYes++;
        }
      }
    }

    const weeklySummaries = Array.from(weekSumMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, d]) => ({
        week,
        daysCheckedIn: d.daysCheckedIn,
        habitAdherenceAvg: d.habitTotal > 0 ? Math.round((d.habitYes / d.habitTotal) * 100) : 0,
      }));

    // ── Habit progress ──
    const habitProgress = habitFields.map((habit) => ({
      key: habit.key,
      label: habit.label,
      frequency: (habit.frequency || "daily") as "daily" | "twice_weekly" | "weekly",
      weeklyAdherence: habitWeekly[habit.key] || [],
      graduatedAt: habit.graduatedAt,
    }));

    // ── Latest review ──
    const latestReview = await prisma.weeklyReview.findFirst({
      where: { clientId, status: "DELIVERED" },
      orderBy: { weekStartDate: "desc" },
      select: { weekStartDate: true, synthesisData: true, status: true },
    });

    const snippet = latestReview?.synthesisData
      ? ((latestReview.synthesisData as { sections?: { content: string }[] })
          .sections?.[0]?.content || "")
          .slice(0, 120)
      : null;

    // Past reviews (DATA_HEAVY only)
    let pastReviews: { weekStart: string; status: string }[] = [];
    if (dashboardMode === "DATA_HEAVY") {
      const reviews = await prisma.weeklyReview.findMany({
        where: { clientId, status: "DELIVERED" },
        orderBy: { weekStartDate: "desc" },
        take: 5,
        select: { weekStartDate: true, status: true },
      });
      pastReviews = reviews.map((r) => ({
        weekStart: r.weekStartDate.toISOString().split("T")[0],
        status: r.status,
      }));
    }

    // ── Metric labels for chart titles ──
    const metricLabels: Record<string, { label: string; unit?: string }> = {};
    for (const m of metricFields) {
      metricLabels[m.key] = { label: m.label, unit: m.unit };
    }

    return NextResponse.json({
      dashboardMode,
      recentCheckInDates,
      hasCheckedInToday: recentCheckInDates.includes(todayStr),
      habitWeekly,
      metricDaily,
      metricLabels,
      weeklySummaries,
      habitProgress,
      latestReview: latestReview
        ? {
            weekStart: latestReview.weekStartDate.toISOString().split("T")[0],
            snippet,
            status: latestReview.status,
          }
        : null,
      pastReviews,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
