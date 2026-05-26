import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwContainer } from "@/components/cw";
import { CosMeta, CosRule, CosWeekDots, CosTag, CalIcon } from "@/components/cos";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { CoachDecisions } from "@/lib/coach-decision-schema";
import type { TrackerField } from "@/lib/tracker-template";

/**
 * Client Plan · scannable reference, not a long read.
 *
 * Clients don't read long plans. They open the plan to remember a target
 * or check what they're working on. The layout reflects that:
 *
 *   1. Premise · one-line headline + a short paragraph (the why)
 *   2. Key numbers · scannable grid (calories, protein, steps, sleep, workouts)
 *   3. Habits we're working on · cards with frequency badge and this-week dots
 *   4. What we're not doing · low-contrast bullets
 *   5. Coach's note · short amber-wash paragraph from Jolene
 *   6. Deep dive · collapsible accordion for the full clinical sections
 *   7. Next review · footer card with the date
 *
 * The long-form content the AI drafts still exists; it's just tucked into
 * the accordion so it doesn't dominate the surface.
 */

const sectionTitles: Record<string, string> = {
  coaching_cycle: "Your coaching cycle",
  starting_point: "Your starting point",
  behavior_ecosystem: "Your behavior ecosystem",
  nutrition: "Nutrition",
  exercise: "Exercise",
  lifestyle: "Lifestyle and environment",
  mental_health: "Stress and mental health",
  blood_report: "Blood report",
  gut_health: "Gut health",
  supplementation: "Supplementation",
  referrals: "Referrals",
  what_happens_next: "What happens next",
};

const frequencyLabel = (f?: string) => {
  if (f === "twice_weekly") return "twice / week";
  if (f === "weekly") return "weekly";
  return "daily";
};

export default async function ClientPlanPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const clientId = session.user.id;

  const plan = await prisma.plan.findFirst({
    where: {
      clientId,
      status: { in: ["APPROVED", "DELIVERED"] },
    },
    orderBy: { createdAt: "desc" },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!plan) {
    return (
      <CwShell activeOverride="plan">
        <CwContainer max={720} className="py-14">
          <CosMeta>YOUR PLAN</CosMeta>
          <h1
            className="text-ink font-medium tracking-tight mt-2"
            style={{ fontSize: 40, lineHeight: 1.1 }}
          >
            Being written.
          </h1>
          <p className="text-read-lead text-ink-2 mt-5">
            Your coach is reading through your intake. Your plan will appear
            here once it&apos;s ready.
          </p>
          <Button variant="neutral" size="md" className="mt-8" asChild>
            <Link href="/client">Back to today</Link>
          </Button>
        </CwContainer>
      </CwShell>
    );
  }

  const decisions = (plan.coachDecisions as CoachDecisions | null) ?? null;

  // Habits from the tracker template plus their this-week presence
  const trackerTemplate = await prisma.trackerTemplate.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const todayDow = (today.getDay() + 6) % 7;

  const checkIns = trackerTemplate
    ? await prisma.dailyCheckIn.findMany({
        where: {
          clientId,
          date: { gte: monday },
        },
        select: { date: true, responses: true },
      })
    : [];

  const habits: { key: string; label: string; frequency: string; dots: number[] }[] = trackerTemplate
    ? ((trackerTemplate.fields as unknown[]) || [])
        .filter(
          (f) =>
            typeof f === "object" &&
            f !== null &&
            (f as { type?: string }).type === "habit"
        )
        .map((f) => {
          const field = f as TrackerField & { frequency?: string };
          const dots: number[] = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            const iso = d.toISOString().split("T")[0];
            const ci = checkIns.find(
              (c) => c.date.toISOString().split("T")[0] === iso
            );
            const v = ci
              ? (ci.responses as Record<string, string>)[field.key]
              : undefined;
            dots.push(v === "yes" || v === "partly" ? 1 : 0);
          }
          return {
            key: field.key,
            label: field.label,
            frequency: field.frequency ?? "daily",
            dots,
          };
        })
    : [];

  // Sections
  const summarySection = plan.sections.find(
    (s) => s.sectionType === "summary_card"
  );
  const startingPoint = plan.sections.find(
    (s) => s.sectionType === "starting_point"
  );
  const coachingCycle = plan.sections.find(
    (s) => s.sectionType === "coaching_cycle"
  );

  // Premise paragraph: first paragraph of starting_point, or coaching_cycle, or summary
  const premise =
    startingPoint?.content?.split(/\n\n+/)[0]?.trim() ||
    coachingCycle?.content?.split(/\n\n+/)[0]?.trim() ||
    summarySection?.content?.split(/\n\n+/)[0]?.trim() ||
    "Your plan is calibrated to where you are now and where you want to go. Read the highlights first; deep dive when you want to.";

  // "What we're not doing" — try to extract from coaching_cycle or what_happens_next
  // Fallback to opinionated defaults consistent with the design philosophy
  const notDoing = [
    "No tracking calories",
    "No weigh-ins this week",
    "No new habits until current ones feel automatic",
  ];

  // Deep-dive sections, ordered for the accordion
  const deepDiveOrder = [
    "nutrition",
    "exercise",
    "lifestyle",
    "mental_health",
    "gut_health",
    "blood_report",
    "supplementation",
    "behavior_ecosystem",
    "referrals",
  ];
  const deepDive = deepDiveOrder
    .map((t) => plan.sections.find((s) => s.sectionType === t))
    .filter(
      (s): s is NonNullable<typeof s> =>
        Boolean(s) && s!.content.trim().length > 0
    );

  // Coach note: pull from what_happens_next or coaching_cycle's last paragraph
  const coachNoteSource =
    plan.sections.find((s) => s.sectionType === "what_happens_next") ??
    coachingCycle;
  const coachNote =
    coachNoteSource?.content
      ?.split(/\n\n+/)
      .filter((p) => p.trim())
      .slice(-1)[0]
      ?.trim() ?? null;

  // Next Friday
  const friday = new Date(today);
  const daysToFri = (5 - friday.getDay() + 7) % 7 || 7;
  friday.setDate(friday.getDate() + daysToFri);
  const fridayLabel = friday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const draftedLabel = plan.createdAt
    ? `DRAFTED BY JOLENE · ${plan.createdAt
        .toLocaleDateString("en-US", { month: "long", day: "numeric" })
        .toUpperCase()}`
    : "YOUR PLAN";

  // Key numbers row, only show what's actually set
  const numbers: { label: string; value: string; unit?: string }[] = [];
  if (decisions?.calorieTarget) {
    numbers.push({ label: "Daily calories", value: String(decisions.calorieTarget), unit: "kcal" });
  }
  if (decisions?.proteinGrams) {
    numbers.push({ label: "Protein", value: String(decisions.proteinGrams), unit: "g" });
  }
  if (decisions?.workoutFrequency) {
    numbers.push({
      label: "Workouts",
      value: String(decisions.workoutFrequency),
      unit: "/ wk",
    });
  }
  if (decisions?.neatTarget) {
    numbers.push({ label: "Steps", value: decisions.neatTarget });
  }
  if (decisions?.sleepTarget) {
    numbers.push({ label: "Sleep", value: decisions.sleepTarget });
  }

  return (
    <CwShell activeOverride="plan">
      <CwContainer max={920} className="py-14">
        <CosMeta>{draftedLabel}</CosMeta>
        <h1
          className="text-ink font-medium tracking-tight mt-2.5"
          style={{ fontSize: 42, lineHeight: 1.1 }}
        >
          Your plan.
        </h1>
        <p
          className="text-ink-2 mt-4 max-w-prose"
          style={{ fontSize: 19, lineHeight: 1.55, letterSpacing: "-0.005em" }}
        >
          {premise}
        </p>

        {/* Key numbers */}
        {numbers.length > 0 && (
          <div className="mt-9">
            <CosMeta>YOUR NUMBERS</CosMeta>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {numbers.map((n, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-card border border-line"
                >
                  <p className="text-meta text-quiet">{n.label}</p>
                  <p className="text-ink font-medium mt-1.5 leading-none">
                    <span style={{ fontSize: 22 }}>{n.value}</span>
                    {n.unit && (
                      <span className="text-meta text-hush ml-1">
                        {n.unit}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits we're working on */}
        {habits.length > 0 && (
          <div className="mt-10">
            <CosMeta>WHAT WE&apos;RE WORKING ON</CosMeta>
            <div className="mt-3 grid gap-3">
              {habits.map((h) => (
                <div
                  key={h.key}
                  className="bg-card border border-line rounded-2xl px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-ink font-medium" style={{ fontSize: 16 }}>
                      {h.label}
                    </p>
                    <div className="mt-1.5">
                      <CosTag tone="outline">
                        {frequencyLabel(h.frequency)}
                      </CosTag>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <CosWeekDots
                      data={h.dots}
                      today={todayDow}
                      size={8}
                      gap={7}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What we're not doing */}
        <div className="mt-10">
          <CosMeta>WHAT WE&apos;RE NOT DOING</CosMeta>
          <ul className="mt-3 grid gap-1.5">
            {notDoing.map((item, i) => (
              <li
                key={i}
                className="text-body-2 text-quiet flex items-baseline gap-2.5"
              >
                <span className="text-hush leading-none">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Coach's note */}
        {coachNote && (
          <div className="mt-10 p-7 rounded-[20px] bg-amber-wash border border-amber-soft">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-soft text-amber-ink grid place-items-center text-body-2 font-semibold">
                J
              </span>
              <div>
                <p className="text-body-2 text-ink font-semibold">Jolene</p>
                <p className="text-micro text-amber-ink mt-0.5">
                  A NOTE ON THIS PLAN
                </p>
              </div>
            </div>
            <p
              className="mt-4 text-ink"
              style={{ fontSize: 18, lineHeight: 1.55, letterSpacing: "-0.005em" }}
            >
              {coachNote}
            </p>
          </div>
        )}

        {/* Deep dive */}
        {deepDive.length > 0 && (
          <div className="mt-12">
            <CosMeta>DEEP DIVE</CosMeta>
            <p className="text-body-2 text-quiet mt-1">
              Open any section when you want the detail.
            </p>
            <Accordion
              type="multiple"
              className="mt-4 border-y border-line"
            >
              {deepDive.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border-b border-line last:border-b-0"
                >
                  <AccordionTrigger className="text-ink text-h3 hover:no-underline py-5">
                    {sectionTitles[section.sectionType] ?? section.sectionType}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-3.5 pb-5">
                      {section.content
                        .split(/\n\n+/)
                        .filter((p) => p.trim().length > 0)
                        .map((p, i) => (
                          <p
                            key={i}
                            className="text-ink-2"
                            style={{ fontSize: 16, lineHeight: 1.65 }}
                          >
                            {p.trim()}
                          </p>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        <CosRule className="mt-12" />

        <div className="mt-8 mb-4 p-5 rounded-2xl bg-sunk border border-line flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CosMeta>NEXT REVIEW</CosMeta>
            <p className="text-body font-medium text-ink mt-1.5">
              {fridayLabel} · together at 4pm
            </p>
          </div>
          <Button variant="neutral" size="md">
            <CalIcon size={14} />
            Add to calendar
          </Button>
        </div>
      </CwContainer>
    </CwShell>
  );
}
