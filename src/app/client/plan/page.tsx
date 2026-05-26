import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwContainer } from "@/components/cw";
import { CosMeta, CosRule, CalIcon } from "@/components/cos";
import { Button } from "@/components/ui/button";

/**
 * Client Plan · long-form magazine read.
 *
 * Ports docs/design/design_files/client-web.jsx · ClientWebPlan.
 * Centered reading column at ~720px max width, generous vertical rhythm,
 * sections separated by hairline rules with h2 titles in medium weight.
 * Footer has a Next Review block.
 */

const sectionTitles: Record<string, string> = {
  summary_card: "Summary",
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

export default async function ClientPlanPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const plan = await prisma.plan.findFirst({
    where: {
      clientId: session.user.id,
      status: { in: ["APPROVED", "DELIVERED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      sections: { orderBy: { order: "asc" } },
    },
  });

  // Next Friday at 4pm
  const today = new Date();
  const friday = new Date(today);
  const daysToFri = (5 - friday.getDay() + 7) % 7 || 7;
  friday.setDate(friday.getDate() + daysToFri);
  const fridayLabel = friday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const draftedLabel = plan?.createdAt
    ? `DRAFTED BY JOLENE · ${plan.createdAt
        .toLocaleDateString("en-US", { month: "long", day: "numeric" })
        .toUpperCase()}`
    : null;

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

  const summarySection = plan.sections.find(
    (s) => s.sectionType === "summary_card"
  );
  const otherSections = plan.sections.filter(
    (s) => s.sectionType !== "summary_card"
  );

  return (
    <CwShell activeOverride="plan">
      <CwContainer max={720} className="py-14">
        {draftedLabel && <CosMeta>{draftedLabel}</CosMeta>}
        <h1
          className="text-ink font-medium tracking-tight mt-2.5"
          style={{ fontSize: 48, lineHeight: 1.1 }}
        >
          {plan.title || "Your plan"}
        </h1>

        {summarySection?.content && (
          <div
            className="text-ink-2 mt-4"
            style={{
              fontSize: 21,
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
            }}
          >
            {summarySection.content
              .split(/\n\n+/)
              .slice(0, 1)
              .map((p, i) => (
                <p key={i}>{p.trim()}</p>
              ))}
          </div>
        )}

        {otherSections.map((section) => (
          <section key={section.id} className="mt-8">
            <CosRule />
            <h2 className="text-h2 text-ink font-medium mt-7">
              {sectionTitles[section.sectionType] ?? section.sectionType}
            </h2>
            <div className="mt-3.5 grid gap-4">
              {section.content
                .split(/\n\n+/)
                .filter((p) => p.trim().length > 0)
                .map((p, i) => (
                  <p
                    key={i}
                    className="text-ink-2"
                    style={{
                      fontSize: 17,
                      lineHeight: 1.7,
                    }}
                  >
                    {p.trim()}
                  </p>
                ))}
            </div>
          </section>
        ))}

        <div className="mt-9 mb-4 p-5 rounded-2xl bg-sunk border border-line flex items-center justify-between gap-4">
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
