import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwCard, CwContainer } from "@/components/cw";
import { CosMeta, CosWeekDots, CosWeekLabels, MicIcon } from "@/components/cos";
import { Button } from "@/components/ui/button";
import type { TrackerField } from "@/lib/tracker-template";

/**
 * Client landing · Today.
 *
 * Leads with the daily action. When the client hasn't checked in yet, the
 * check-in is the hero of the page, not a button buried in a dashboard.
 * Once they've checked in, Today settles into a calm state: this week,
 * the latest note from the coach, the next review.
 *
 * Adapts to the client's lifecycle: needs intake, plan in progress, plan
 * ready, or active.
 */
export default async function ClientHome() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const clientId = session.user.id;

  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  const intakeComplete = submission?.status === "COMPLETE";

  const plan = intakeComplete
    ? await prisma.plan.findFirst({
        where: { clientId, status: { in: ["APPROVED", "DELIVERED"] } },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const trackerTemplate = plan
    ? await prisma.trackerTemplate.findFirst({
        where: { clientId },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const partOfDay =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  // ── Active-state data ──────────────────────────────────────
  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const todayDow = (today.getDay() + 6) % 7;

  const weekCheckIns = trackerTemplate
    ? await prisma.dailyCheckIn.findMany({
        where: { clientId, date: { gte: monday } },
        select: { date: true, responses: true },
      })
    : [];

  const checkedInDates = new Set(
    weekCheckIns.map((c) => c.date.toISOString().split("T")[0])
  );
  const hasCheckedInToday = checkedInDates.has(todayIso);

  const weekDots: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    weekDots.push(checkedInDates.has(d.toISOString().split("T")[0]) ? 1 : 0);
  }

  const habits = trackerTemplate
    ? ((trackerTemplate.fields as unknown[]) || [])
        .filter(
          (f) =>
            typeof f === "object" &&
            f !== null &&
            (f as { type?: string }).type === "habit"
        )
        .slice(0, 3)
        .map((f) => ({ name: (f as TrackerField).label, data: weekDots }))
    : [];
  const todaysFocus = habits[0]?.name ?? null;

  const latestReview = trackerTemplate
    ? await prisma.weeklyReview.findFirst({
        where: { clientId, status: "DELIVERED" },
        orderBy: { weekStartDate: "desc" },
        select: { synthesisData: true, coachFeedback: true, deliveredAt: true },
      })
    : null;
  const reviewParagraph = (() => {
    if (!latestReview) return null;
    const data = latestReview.synthesisData as
      | { sections?: { title: string; content: string }[] }
      | null;
    if (!data?.sections) return latestReview.coachFeedback ?? null;
    const jolene = data.sections.find((s) =>
      s.title.toLowerCase().includes("coach")
    );
    return jolene?.content ?? data.sections[0]?.content ?? null;
  })();

  const friday = new Date(today);
  const daysToFri = (5 - friday.getDay() + 7) % 7 || 7;
  friday.setDate(friday.getDate() + daysToFri);
  const fridayLabel = friday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const greeting = (
    <>
      <p className="text-h2 text-quiet font-normal">Good {partOfDay},</p>
      <h1
        className="text-ink font-medium tracking-tight mt-1"
        style={{ fontSize: 40, lineHeight: 1.1 }}
      >
        {firstName}.
      </h1>
    </>
  );

  // ── Pre-active lifecycle states ────────────────────────────
  if (!intakeComplete) {
    return (
      <CwShell activeOverride="today">
        <CwContainer max={720} className="py-10 md:py-14">
          {greeting}
          <CwCard className="mt-8">
            <CosMeta>BEFORE WE START</CosMeta>
            <h2 className="text-h1 font-medium mt-3">Tell us about you.</h2>
            <p className="text-body text-quiet mt-2">
              Your coach needs your story before writing your plan. About
              thirty minutes. You can pause and come back.
            </p>
            <Button variant="accent" size="lg" className="mt-5" asChild>
              <Link href="/intake">
                {submission ? "Continue intake" : "Start intake"}
              </Link>
            </Button>
          </CwCard>
        </CwContainer>
      </CwShell>
    );
  }

  if (!plan) {
    return (
      <CwShell activeOverride="today">
        <CwContainer max={720} className="py-10 md:py-14">
          {greeting}
          <CwCard className="mt-8">
            <CosMeta>WITH YOUR COACH</CosMeta>
            <h2 className="text-h1 font-medium mt-3">
              Your plan is being written.
            </h2>
            <p className="text-body text-quiet mt-2">
              Jolene is reading through your intake. You&apos;ll see your plan
              here when it&apos;s ready.
            </p>
          </CwCard>
        </CwContainer>
      </CwShell>
    );
  }

  if (!trackerTemplate) {
    return (
      <CwShell activeOverride="today">
        <CwContainer max={720} className="py-10 md:py-14">
          {greeting}
          <CwCard className="mt-8">
            <CosMeta>YOUR PLAN IS READY</CosMeta>
            <h2 className="text-h1 font-medium mt-3">A quieter spring.</h2>
            <p className="text-body text-quiet mt-2">
              Drafted for you. Read it through, then we&apos;ll start the daily
              check-ins.
            </p>
            <Button variant="accent" size="lg" className="mt-5" asChild>
              <Link href="/client/plan">Read your plan</Link>
            </Button>
          </CwCard>
        </CwContainer>
      </CwShell>
    );
  }

  // ── Active state · lead with the check-in ──────────────────
  return (
    <CwShell activeOverride="today">
      <CwContainer max={920} className="py-10 md:py-14">
        {greeting}

        {/* Hero · the daily action */}
        {!hasCheckedInToday ? (
          <div className="mt-8 p-7 md:p-9 rounded-[20px] bg-card border border-line">
            <CosMeta>TODAY&apos;S CHECK-IN</CosMeta>
            <h2
              className="text-ink font-medium tracking-tight mt-3"
              style={{ fontSize: 28, lineHeight: 1.15 }}
            >
              How was your day?
            </h2>
            <p className="text-body text-quiet mt-2 max-w-prose">
              A minute, by voice or writing. Whatever lands.
              {todaysFocus && (
                <>
                  {" "}
                  Today&apos;s focus is{" "}
                  <span className="text-ink-2">{todaysFocus.toLowerCase()}</span>.
                </>
              )}
            </p>
            <Button variant="accent" size="lg" className="mt-6" asChild>
              <Link href="/client/checkin">
                <MicIcon size={16} />
                Check in
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 p-7 md:p-9 rounded-[20px] bg-amber-wash border border-amber-soft">
            <CosMeta style={{ color: "#92400e" }}>TODAY</CosMeta>
            <h2
              className="text-ink font-medium tracking-tight mt-3"
              style={{ fontSize: 26, lineHeight: 1.2 }}
            >
              You checked in today.
            </h2>
            <p className="text-body text-ink-2 mt-2 max-w-prose">
              That&apos;s the one thing. The rest of the day is yours.
            </p>
            <Link
              href="/client/checkin"
              className="inline-block text-meta text-amber-ink mt-4 hover:underline"
            >
              Add to today&apos;s note
            </Link>
          </div>
        )}

        {/* Quiet supporting row */}
        <div className="mt-7 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-[18px] items-start">
          {habits.length > 0 && (
            <CwCard>
              <div className="flex justify-between items-center">
                <CosMeta>THIS WEEK</CosMeta>
                <span className="text-meta text-hush">
                  {weekDots.filter(Boolean).length} of 7
                </span>
              </div>
              <div className="mt-4 grid gap-3.5">
                {habits.map((h, i) => (
                  <div key={i}>
                    <p className="text-body-2 text-ink mb-1.5">{h.name}</p>
                    <div className="flex justify-between items-center">
                      <CosWeekLabels />
                      <CosWeekDots
                        data={h.data}
                        today={todayDow}
                        size={7}
                        gap={7}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CwCard>
          )}

          <div className="grid gap-[18px]">
            {reviewParagraph && (
              <CwCard>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-amber-soft text-amber-ink grid place-items-center text-meta font-semibold">
                    J
                  </span>
                  <CosMeta style={{ color: "#92400e" }}>
                    NOTE FROM JOLENE
                  </CosMeta>
                </div>
                <p className="text-read text-ink mt-3">
                  {reviewParagraph.split("\n")[0]}
                </p>
                <Link
                  href="/client/progress"
                  className="inline-block text-meta text-quiet mt-3 hover:text-ink"
                >
                  Read the full review
                </Link>
              </CwCard>
            )}

            <CwCard>
              <CosMeta>NEXT REVIEW</CosMeta>
              <p className="text-body font-medium text-ink mt-2">
                {fridayLabel}
              </p>
              <p className="text-meta text-quiet mt-1">Together at 4pm</p>
            </CwCard>
          </div>
        </div>
      </CwContainer>
    </CwShell>
  );
}
