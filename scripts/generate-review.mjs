/**
 * Generate a weekly review for a client.
 *
 * Usage (via Claude Code):
 *   node scripts/generate-review.mjs --client <clientId>
 *   node scripts/generate-review.mjs --client <clientId> --week 2026-04-14
 *   node scripts/generate-review.mjs --client <clientId> --save --review-file <path>
 *
 * What it does:
 *   1. Reads the client's check-in data, tracker template, and plan context
 *   2. Aggregates habits, metrics, reflections for the week
 *   3. Prints all data organized for Claude Code to generate the synthesis
 *   4. Save mode writes the review back to the database
 *
 * Workflow:
 *   1. Coach opens client page, sees check-in data for the week
 *   2. Coach runs: claude "Generate weekly review for [client name]"
 *   3. Claude Code runs this script, reads the data, generates the 3-part review
 *   4. Claude Code runs this script again in --save mode to persist
 *   5. Coach reviews at /coach/clients/[id], edits if needed, approves, delivers
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const clientIdIdx = args.indexOf("--client");
const clientId = clientIdIdx !== -1 ? args[clientIdIdx + 1] : null;
const weekIdx = args.indexOf("--week");
const weekParam = weekIdx !== -1 ? args[weekIdx + 1] : null;
const saveMode = args.includes("--save");
const reviewFileIdx = args.indexOf("--review-file");
const reviewFile = reviewFileIdx !== -1 ? args[reviewFileIdx + 1] : null;

/** Get Monday of the given date's week. */
function getWeekStart(date) {
  const d = new Date(date || new Date());
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

function getWeekEnd(weekStart) {
  const d = new Date(weekStart + "T00:00:00.000Z");
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00.000Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

async function main() {
  if (!clientId) {
    console.error("Usage: node scripts/generate-review.mjs --client <clientId>");
    console.error("       node scripts/generate-review.mjs --client <clientId> --week 2026-04-14");
    console.error("       node scripts/generate-review.mjs --client <clientId> --save --review-file <path>");
    process.exit(1);
  }

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, dashboardMode: true },
  });

  if (!client) {
    console.error(`Client not found: ${clientId}`);
    process.exit(1);
  }

  const weekStart = weekParam ? getWeekStart(new Date(weekParam)) : getWeekStart();
  const weekEnd = getWeekEnd(weekStart);

  if (saveMode && reviewFile) {
    // ── SAVE MODE ──
    const content = readFileSync(reviewFile, "utf-8");
    const reviewData = JSON.parse(content);

    const weekStartDate = new Date(weekStart + "T00:00:00.000Z");

    // Fetch check-ins for citations
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

    // Build basic citations from check-in dates
    const citations = checkIns.map((ci) => ({
      type: "checkin",
      date: ci.date.toISOString().split("T")[0],
    }));

    // Upsert the review
    const existing = await prisma.weeklyReview.findUnique({
      where: { clientId_weekStartDate: { clientId, weekStartDate } },
    });

    if (existing) {
      await prisma.weeklyReview.update({
        where: { id: existing.id },
        data: {
          synthesisData: reviewData,
          citations,
          status: "COACH_REVIEW",
        },
      });
      console.log(`Review updated for ${client.name}, week of ${weekStart}. Status: COACH_REVIEW`);
    } else {
      await prisma.weeklyReview.create({
        data: {
          clientId,
          weekStartDate,
          synthesisData: reviewData,
          citations,
          status: "COACH_REVIEW",
        },
      });
      console.log(`Review created for ${client.name}, week of ${weekStart}. Status: COACH_REVIEW`);
    }

    console.log(`Coach can review and approve at the client's page in the web app.`);
    return;
  }

  // ── DATA COLLECTION MODE ──

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
    console.error(`No check-ins found for ${client.name} in week of ${weekStart}.`);
    process.exit(1);
  }

  // Fetch tracker template
  const template = await prisma.trackerTemplate.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });

  if (!template) {
    console.error(`No tracker template found for ${client.name}.`);
    process.exit(1);
  }

  const fields = template.fields;

  // Fetch plan for context
  const plan = await prisma.plan.findFirst({
    where: { clientId, status: { in: ["APPROVED", "DELIVERED"] } },
    orderBy: { createdAt: "desc" },
  });

  const decisions = plan?.coachDecisions || {};

  // Fetch previous week's review for trends
  const prevWeekStart = new Date(weekStart + "T00:00:00.000Z");
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const previousReview = await prisma.weeklyReview.findUnique({
    where: {
      clientId_weekStartDate: {
        clientId,
        weekStartDate: prevWeekStart,
      },
    },
    select: { synthesisData: true },
  });

  // ── Fetch extended check-in history for graduation evaluation (last 4 weeks) ──
  const fourWeeksAgo = new Date(weekStart + "T00:00:00.000Z");
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21); // 3 extra weeks back

  const allCheckIns = await prisma.dailyCheckIn.findMany({
    where: {
      clientId,
      date: {
        gte: fourWeeksAgo,
        lte: new Date(weekEnd + "T23:59:59.999Z"),
      },
    },
    orderBy: { date: "asc" },
  });

  // ── Aggregate data ──
  const habitFields = fields.filter((f) => f.type === "habit");
  const metricFields = fields.filter((f) => f.type === "metric");
  const reflectionFields = fields.filter((f) => f.type === "reflection");

  // ── Graduation evaluation (inline version of habit-graduation.ts logic) ──
  function getWeekKeyForDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d.toISOString().split("T")[0];
  }

  const graduationRecs = [];
  for (const habit of habitFields) {
    const freq = habit.frequency || "daily";
    const weekMap = new Map();

    for (const ci of allCheckIns) {
      const wk = getWeekKeyForDate(ci.date);
      const val = ci.responses[habit.key];
      if (val === undefined || val === null) continue;

      if (!weekMap.has(wk)) weekMap.set(wk, { checked: 0, adherent: 0 });
      const w = weekMap.get(wk);
      w.checked++;
      if (val === "yes" || val === "partly") w.adherent++;
    }

    const weeks = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([wk, d]) => ({
        week: wk,
        rate: d.checked > 0 ? Math.round((d.adherent / d.checked) * 100) : 0,
      }));

    if (freq === "daily" && weeks.length >= 3) {
      const last3 = weeks.slice(-3);
      if (last3.every(w => w.rate >= 80)) {
        const avg = Math.round(last3.reduce((s, w) => s + w.rate, 0) / 3);
        graduationRecs.push({
          label: habit.label,
          key: habit.key,
          from: "DAILY",
          to: "TWICE-WEEKLY",
          reason: `${avg}% average adherence over last 3 weeks (${last3.map(w => w.rate + "%").join(", ")})`,
        });
      }
    } else if (freq === "twice_weekly") {
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek && lastWeek.rate < 100) {
        graduationRecs.push({
          label: habit.label, key: habit.key, from: "TWICE-WEEKLY", to: "DAILY",
          reason: `${lastWeek.rate}% on twice-weekly checks. Needs more daily practice.`,
        });
      } else if (weeks.length >= 3 && weeks.slice(-3).every(w => w.rate === 100)) {
        graduationRecs.push({
          label: habit.label, key: habit.key, from: "TWICE-WEEKLY", to: "WEEKLY",
          reason: `100% on twice-weekly checks for 3 consecutive weeks`,
        });
      }
    } else if (freq === "weekly") {
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek && lastWeek.rate < 100) {
        graduationRecs.push({
          label: habit.label, key: habit.key, from: "WEEKLY", to: "TWICE-WEEKLY",
          reason: `Not maintained on weekly check. Needs more frequent tracking.`,
        });
      }
    }
  }

  // ── Print everything ──
  console.log("=== WEEKLY REVIEW GENERATION ===");
  console.log(`Client: ${client.name}`);
  console.log(`Week: ${weekStart} to ${weekEnd} (${formatDate(weekStart)} to ${formatDate(weekEnd)})`);
  console.log(`Days checked in: ${checkIns.length} of 7`);
  console.log(`Dashboard mode: ${client.dashboardMode}`);
  console.log("");

  // Habit summary
  console.log("=== HABIT DATA ===\n");
  for (const habit of habitFields) {
    let yes = 0, partly = 0, notToday = 0;
    for (const ci of checkIns) {
      const val = ci.responses[habit.key];
      if (val === "yes") yes++;
      else if (val === "partly") partly++;
      else if (val === "not_today") notToday++;
    }
    console.log(`  ${habit.label}:`);
    console.log(`    Yes: ${yes}, Partly: ${partly}, Not today: ${notToday} (out of ${checkIns.length} check-in days)`);
  }
  console.log("");

  // Metric summary
  if (metricFields.length > 0) {
    console.log("=== METRIC DATA ===\n");
    for (const metric of metricFields) {
      const values = [];
      for (const ci of checkIns) {
        const val = ci.responses[metric.key];
        if (val !== undefined && val !== null && val !== "") {
          const dateStr = ci.date.toISOString().split("T")[0];
          values.push({ date: dateStr, value: val });
        }
      }
      if (values.length > 0) {
        const numericVals = values.map((v) => Number(v.value)).filter((n) => !isNaN(n));
        const avg = numericVals.length > 0
          ? Math.round((numericVals.reduce((a, b) => a + b, 0) / numericVals.length) * 10) / 10
          : null;
        console.log(`  ${metric.label}${metric.unit ? ` (${metric.unit})` : ""}:`);
        for (const v of values) {
          console.log(`    ${formatDate(v.date)}: ${v.value}`);
        }
        if (avg !== null) console.log(`    Average: ${avg}`);
      }
    }
    console.log("");
  }

  // Reflections
  console.log("=== CLIENT REFLECTIONS ===\n");
  let hasReflections = false;
  for (const ci of checkIns) {
    for (const field of reflectionFields) {
      const val = ci.responses[field.key];
      if (val && typeof val === "string" && val.trim()) {
        const dateStr = ci.date.toISOString().split("T")[0];
        console.log(`  ${formatDate(dateStr)}:`);
        console.log(`    "${val.trim()}"`);
        console.log("");
        hasReflections = true;
      }
    }
  }
  if (!hasReflections) console.log("  No reflections shared this week.\n");

  // Plan context
  console.log("=== PLAN CONTEXT ===\n");
  console.log(`  Starting habits: ${decisions.startingHabits?.join(", ") || "Not set"}`);
  console.log(`  Calorie target: ${decisions.calorieTarget || "Not set"}`);
  console.log(`  Protein target: ${decisions.proteinGrams || "Not set"}g`);
  console.log(`  NEAT target: ${decisions.neatTarget || "Not set"}`);
  console.log(`  Sleep target: ${decisions.sleepTarget || "Not set"}`);
  console.log("");

  // Previous review for trends
  if (previousReview?.synthesisData) {
    console.log("=== PREVIOUS WEEK'S REVIEW ===\n");
    const prev = previousReview.synthesisData;
    if (prev.sections) {
      for (const s of prev.sections) {
        console.log(`  ${s.title}: ${s.content}`);
      }
    }
    console.log("");
  }

  // Day-by-day breakdown
  console.log("=== DAY-BY-DAY BREAKDOWN ===\n");
  for (const ci of checkIns) {
    const dateStr = ci.date.toISOString().split("T")[0];
    console.log(`  ${formatDate(dateStr)}:`);
    for (const [key, val] of Object.entries(ci.responses)) {
      if (val !== undefined && val !== null && val !== "") {
        const field = fields.find((f) => f.key === key);
        const label = field?.label || key;
        console.log(`    ${label}: ${val}`);
      }
    }
    console.log("");
  }

  // Graduation recommendations
  console.log("=== HABIT GRADUATION RECOMMENDATIONS ===\n");
  if (graduationRecs.length === 0) {
    console.log("  No graduation changes recommended this week.\n");
  } else {
    for (const rec of graduationRecs) {
      console.log(`  ${rec.label}: ${rec.from} → ${rec.to} (recommended)`);
      console.log(`    Reason: ${rec.reason}\n`);
    }
  }

  // Generation instructions
  console.log("=== GENERATION INSTRUCTIONS ===");
  console.log(`
Generate a weekly review for ${client.name.split(" ")[0]}. The review has THREE sections:

1. "Your week" (under 80 words)
   Brief factual summary. How many days checked in, which habits were consistent.
   Cite specific days when mentioning patterns.

2. "What stood out" (under 120 words)
   Identify 1-2 behavioral wins. Name the behavior being formed, not just the metric.
   "You're building a protein habit" not "71% adherence."
   If reflections were shared, acknowledge what the client said.
   Connect tracker data to plan goals.

3. "For next week" (under 100 words)
   1-2 specific, small, actionable suggestions based on observed patterns.
   "Try prepping protein on Sunday evening" not "Keep it up."

RULES:
- Never say "missed", "failed", or "skipped." Use "not today" or "took a break."
- Lead with what went well, even in sparse weeks.
- Frame streaks as "5 of 7 days" not "missed 2 days."
- Never use em dashes. Use periods, commas, or rewrite.
- Total length under 300 words across all three sections.
- Sound like a warm, professional coach. Not a report generator.
- If fewer than 3 check-ins: keep it under 100 words total. Be brief and curious.

After generating, save by creating a JSON file with this structure:
{
  "sections": [
    { "title": "Your week", "content": "..." },
    { "title": "What stood out", "content": "..." },
    { "title": "For next week", "content": "..." }
  ]
}

Then run:
  node scripts/generate-review.mjs --client ${clientId} --week ${weekStart} --save --review-file <path>
`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
