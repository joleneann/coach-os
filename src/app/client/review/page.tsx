import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwContainer } from "@/components/cw";
import { CosMeta, CosRule, CosWeekDots, CosTag, ArrowIcon, CheckIcon, QuoteIcon } from "@/components/cos";
import { Button } from "@/components/ui/button";
import { formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * Client Weekly Review · long-form reading.
 *
 * Ports docs/design/design_files/client-web.jsx · ClientWebReview.
 * Reading column max 760px. Coach paragraph sits on amberWash with the
 * J avatar, "YOUR COACH'S READ" eyebrow in amberInk. The suggested
 * adjustment card uses the outline → soft tag transition.
 */
export default async function ClientReviewPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const clientId = session.user.id;

  const review = await prisma.weeklyReview.findFirst({
    where: { clientId, status: "DELIVERED" },
    orderBy: { weekStartDate: "desc" },
  });

  if (!review) {
    return (
      <CwShell activeOverride="week">
        <CwContainer max={760} className="py-14">
          <CosMeta>YOUR WEEK</CosMeta>
          <h1
            className="text-ink font-medium tracking-tight mt-2"
            style={{ fontSize: 40, lineHeight: 1.1 }}
          >
            Your first review is coming.
          </h1>
          <p className="text-read-lead text-ink-2 mt-5">
            Keep checking in. Once you have a full week, Jolene will send a
            written reflection here.
          </p>
          <Button variant="neutral" size="md" className="mt-8" asChild>
            <Link href="/client">Back to today</Link>
          </Button>
        </CwContainer>
      </CwShell>
    );
  }

  const start = review.weekStartDate.toISOString().split("T")[0];
  const end = getWeekEndDate(start);
  const weekLabel = formatWeekRange(start, end);
  const weekNumber = (() => {
    // ISO-ish week number using year base
    const first = new Date(review.weekStartDate.getFullYear(), 0, 1);
    const diff = Math.floor(
      (review.weekStartDate.getTime() - first.getTime()) / 86400000
    );
    return Math.floor(diff / 7) + 1;
  })();

  // Pull the coach paragraph and the suggested-adjustment snippet from synthesisData
  const data = review.synthesisData as
    | { sections?: { title: string; content: string }[] }
    | null;
  const coachSection = data?.sections?.find((s) =>
    s.title.toLowerCase().includes("coach")
  );
  const adjustmentSection = data?.sections?.find((s) =>
    s.title.toLowerCase().includes("adjust") ||
    s.title.toLowerCase().includes("habit") ||
    s.title.toLowerCase().includes("graduat")
  );
  const yourWeekSection = data?.sections?.find((s) =>
    s.title.toLowerCase().includes("week") ||
    s.title.toLowerCase().includes("your")
  );
  const coachParas = (coachSection?.content ?? review.coachFeedback ?? "")
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0);
  const coachLead = coachParas[0] ?? "";
  const coachRest = coachParas.slice(1).join(" ").trim();

  // Dots for that week
  const ws = new Date(start + "T00:00:00.000Z");
  const checkIns = await prisma.dailyCheckIn.findMany({
    where: {
      clientId,
      date: {
        gte: ws,
        lte: new Date(end + "T23:59:59.999Z"),
      },
    },
    select: { date: true },
  });
  const dots: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(ws);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    dots.push(checkIns.some((c) => c.date.toISOString().split("T")[0] === iso) ? 1 : 0);
  }
  const presentCount = dots.filter(Boolean).length;

  const deliveredLabel = review.deliveredAt
    ? `published ${new Date(review.deliveredAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).toLowerCase()}`
    : "";

  return (
    <CwShell activeOverride="week">
      <CwContainer max={760} className="py-14">
        <CosMeta>WEEK {weekNumber} REVIEW</CosMeta>
        <h1
          className="text-ink font-medium tracking-tight mt-2"
          style={{ fontSize: 42, lineHeight: 1.1 }}
        >
          Friday&apos;s reflection
        </h1>
        <p className="text-meta text-quiet mt-1.5">
          {weekLabel}
          {deliveredLabel && ` · ${deliveredLabel}`}
        </p>

        {/* Your week */}
        <div className="mt-8">
          <CosMeta>YOUR WEEK</CosMeta>
          <div className="mt-3 flex items-center gap-4.5 flex-wrap">
            <CosWeekDots data={dots} size={11} gap={10} />
            <p className="text-body-2 text-quiet">
              {yourWeekSection?.content?.split(/[.\n]/)[0]?.trim() ||
                `${presentCount} of 7 days with movement.`}
            </p>
          </div>
        </div>

        {/* Coach paragraph · amber wash */}
        {coachLead && (
          <div className="mt-8 p-8 rounded-[20px] bg-amber-wash border border-amber-soft">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-amber-soft text-amber-ink grid place-items-center text-body-2 font-semibold">
                J
              </span>
              <div>
                <p className="text-body-2 text-ink font-semibold">Jolene</p>
                <p className="text-micro text-amber-ink mt-0.5">
                  YOUR COACH&apos;S READ
                </p>
              </div>
            </div>
            <p
              className="mt-5 text-ink"
              style={{ fontSize: 22, lineHeight: 1.45, letterSpacing: "-0.005em" }}
            >
              {coachLead}
            </p>
            {coachRest && (
              <p
                className="mt-3.5 text-ink-2"
                style={{ fontSize: 17, lineHeight: 1.7 }}
              >
                {coachRest}
              </p>
            )}
          </div>
        )}

        {/* Suggested adjustment */}
        {adjustmentSection?.content && (
          <div className="mt-9">
            <CosMeta>SUGGESTED ADJUSTMENT</CosMeta>
            <div className="mt-3 p-5 rounded-2xl bg-card border border-line">
              <p
                className="text-ink font-medium"
                style={{ fontSize: 16, lineHeight: 1.4 }}
              >
                {adjustmentSection.content.split(/[.\n]/)[0]?.trim() || "Adjustment to consider."}
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <CosTag tone="outline">current</CosTag>
                <ArrowIcon size={14} />
                <CosTag tone="soft">proposed</CosTag>
              </div>
              {adjustmentSection.content.split(/\n\n+/).slice(1, 2).map((p, i) => (
                <p key={i} className="mt-3 text-body-2 text-quiet">
                  {p.trim()}
                </p>
              ))}
            </div>
          </div>
        )}

        <CosRule className="mt-10" />

        <div className="mt-8 mb-2 flex gap-3 justify-end">
          <Button variant="neutral" size="md">
            <QuoteIcon size={14} />
            Reply to Jolene
          </Button>
          <Button variant="accent" size="md">
            <CheckIcon size={14} />
            Acknowledge
          </Button>
        </div>
      </CwContainer>
    </CwShell>
  );
}
