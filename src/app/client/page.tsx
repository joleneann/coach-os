import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwCard, CwContainer } from "@/components/cw";
import { CosMeta, CosWeekDots, CosWeekLabels, MicIcon } from "@/components/cos";
import { Button } from "@/components/ui/button";

/**
 * Client landing · Today.
 *
 * Ports docs/design/design_files/client-web.jsx · ClientWebDashboard.
 * Two-column on desktop (reading left, quiet rail right); single column on
 * mobile. The Today card adapts to the client's current state: needs
 * intake, plan in progress, plan ready, or active.
 */
export default async function ClientHome() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  // ── State guards ───────────────────────────────────────────
  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  const intakeComplete = submission?.status === "COMPLETE";

  const plan = intakeComplete
    ? await prisma.plan.findFirst({
        where: {
          clientId: session.user.id,
          status: { in: ["APPROVED", "DELIVERED"] },
        },
        orderBy: { createdAt: "desc" },
      })
    : null;

  const trackerTemplate = plan
    ? await prisma.trackerTemplate.findFirst({
        where: { clientId: session.user.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  // ── Real data for the active state ─────────────────────────
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const today = new Date();
  const todayIso = today.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recentCheckIns = trackerTemplate
    ? await prisma.dailyCheckIn.findMany({
        where: {
          clientId: session.user.id,
          date: {
            gte: new Date(
              sevenDaysAgo.toISOString().split("T")[0] + "T00:00:00.000Z"
            ),
            lte: new Date(todayIso + "T23:59:59.999Z"),
          },
        },
        select: { date: true, responses: true },
      })
    : [];

  const checkedInDates = new Set(
    recentCheckIns.map((c) => c.date.toISOString().split("T")[0])
  );
  const hasCheckedInToday = checkedInDates.has(todayIso);

  // Build the seven-dot adherence array, Monday-first, for the current week
  const monday = new Date(today);
  const dow = (monday.getDay() + 6) % 7; // 0 = Monday
  monday.setDate(monday.getDate() - dow);
  const weekDots: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    weekDots.push(checkedInDates.has(d.toISOString().split("T")[0]) ? 1 : 0);
  }
  const todayDow = dow; // for the halo

  // Habits from the tracker template
  const habits = trackerTemplate
    ? ((trackerTemplate.fields as unknown[]) || [])
        .filter(
          (f) =>
            typeof f === "object" &&
            f !== null &&
            (f as { type?: string }).type === "habit"
        )
        .slice(0, 3)
        .map((f) => ({
          name: (f as { label: string }).label,
          // For now, mock the per-habit week. A future pass reads responses[key] across check-ins.
          data: weekDots,
        }))
    : [];

  // Last delivered weekly review for the Note from Jolene card
  const latestReview = trackerTemplate
    ? await prisma.weeklyReview.findFirst({
        where: { clientId: session.user.id, status: "DELIVERED" },
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

  // Next Friday at 4pm
  const friday = new Date(today);
  const daysToFri = (5 - friday.getDay() + 7) % 7 || 7;
  friday.setDate(friday.getDate() + daysToFri);
  const fridayLabel = friday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // ── Decide the Today card ──────────────────────────────────
  const todayCard = !intakeComplete ? (
    <>
      <CosMeta>BEFORE WE START</CosMeta>
      <h2 className="text-h1 font-medium mt-3">
        Tell us about you.
      </h2>
      <p className="text-body text-quiet mt-2">
        Your coach needs your story before they can write your plan. About
        thirty minutes. You can pause and come back.
      </p>
      <div className="mt-5 flex items-center justify-between">
        <Button variant="accent" size="lg" asChild>
          <Link href="/intake">
            {submission ? "Continue intake" : "Start intake"}
          </Link>
        </Button>
      </div>
    </>
  ) : !plan ? (
    <>
      <CosMeta>WITH YOUR COACH</CosMeta>
      <h2 className="text-h1 font-medium mt-3">
        Your plan is being written.
      </h2>
      <p className="text-body text-quiet mt-2">
        Jolene is reading through your intake. You&apos;ll see your plan here
        when it&apos;s ready.
      </p>
    </>
  ) : !trackerTemplate ? (
    <>
      <CosMeta>YOUR PLAN IS READY</CosMeta>
      <h2 className="text-h1 font-medium mt-3">A quieter spring.</h2>
      <p className="text-body text-quiet mt-2">
        Drafted for you. Read it through, then we&apos;ll start the daily
        check-ins.
      </p>
      <div className="mt-5">
        <Button variant="accent" size="lg" asChild>
          <Link href="/client/plan">Read your plan</Link>
        </Button>
      </div>
    </>
  ) : (
    <>
      <CosMeta>TODAY</CosMeta>
      <h2 className="text-[28px] leading-tight font-medium tracking-tight mt-3 text-ink">
        {habits[0]?.name ?? "One small thing today."}
      </h2>
      <p className="text-body text-quiet mt-2">
        Twenty minutes is plenty. No phone if you can.
      </p>
      <div className="mt-5 flex items-center justify-between gap-4">
        <Button variant="accent" size="lg" asChild>
          <Link href="/client/checkin">
            <MicIcon size={16} />
            {hasCheckedInToday ? "Today, again" : "Today's check-in"}
          </Link>
        </Button>
        <span className="text-meta text-hush hidden sm:inline">
          or write at your desk
        </span>
      </div>
    </>
  );

  return (
    <CwShell activeOverride="today">
      <CwContainer max={1120} className="py-10 md:py-12">
        <p className="text-h2 text-quiet font-normal">Good morning,</p>
        <h1
          className="text-ink font-medium tracking-tight mt-1"
          style={{ fontSize: 44, lineHeight: 1.1 }}
        >
          {firstName}.
        </h1>

        <div className="mt-9 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-7 items-start">
          {/* Left · reading column */}
          <div className="grid gap-[18px]">
            <CwCard>{todayCard}</CwCard>

            {reviewParagraph && (
              <CwCard>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-amber-soft text-amber-ink grid place-items-center text-meta font-semibold">
                    J
                  </span>
                  <CosMeta style={{ color: "#92400e" }}>
                    NOTE FROM JOLENE
                    {latestReview?.deliveredAt && (
                      <>
                        {" · "}
                        {new Date(
                          latestReview.deliveredAt
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </>
                    )}
                  </CosMeta>
                </div>
                <p className="text-read-lead text-ink mt-3.5">
                  {reviewParagraph.split("\n")[0]}
                </p>
                {reviewParagraph.split("\n").slice(1, 3).join(" ").trim() && (
                  <p className="text-read text-ink-2 mt-2.5">
                    {reviewParagraph.split("\n").slice(1, 3).join(" ").trim()}
                  </p>
                )}
              </CwCard>
            )}
          </div>

          {/* Right · quiet rail */}
          <div className="grid gap-[18px]">
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

            {trackerTemplate && (
              <CwCard>
                <CosMeta>NEXT REVIEW</CosMeta>
                <p className="text-body font-medium text-ink mt-2">
                  {fridayLabel}
                </p>
                <p className="text-meta text-quiet mt-1">Together at 4pm</p>
              </CwCard>
            )}
          </div>
        </div>
      </CwContainer>
    </CwShell>
  );
}
