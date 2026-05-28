import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

import { CwShell, CwContainer } from "@/components/cw";
import { CosMeta, CosRule, CosWeekDots } from "@/components/cos";
import { Button } from "@/components/ui/button";
import { formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * Client Progress · the journey surface.
 *
 * Merges the old Week (review) and History tabs. The latest delivered
 * review sits at the top with Jolene's paragraph on amberWash. Earlier
 * weeks and written entries form a journal index below.
 */
export default async function ClientProgressPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const clientId = session.user.id;

  const [reviews, checkIns] = await Promise.all([
    prisma.weeklyReview.findMany({
      where: { clientId, status: "DELIVERED" },
      orderBy: { weekStartDate: "desc" },
      take: 20,
      select: {
        id: true,
        weekStartDate: true,
        synthesisData: true,
        coachFeedback: true,
        deliveredAt: true,
      },
    }),
    prisma.dailyCheckIn.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
      take: 60,
      select: { id: true, date: true, responses: true },
    }),
  ]);

  const latest = reviews[0] ?? null;

  // ── Latest review block ────────────────────────────────────
  let latestBlock: React.ReactNode = null;
  if (latest) {
    const start = latest.weekStartDate.toISOString().split("T")[0];
    const end = getWeekEndDate(start);
    const data = latest.synthesisData as
      | { sections?: { title: string; content: string }[] }
      | null;
    const coachSection = data?.sections?.find((s) =>
      s.title.toLowerCase().includes("coach")
    );
    const paras = (coachSection?.content ?? latest.coachFeedback ?? "")
      .split(/\n\n+/)
      .filter((p) => p.trim());

    // week dots
    const ws = new Date(start + "T00:00:00.000Z");
    const dots: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      dots.push(
        checkIns.some((c) => c.date.toISOString().split("T")[0] === iso) ? 1 : 0
      );
    }

    latestBlock = (
      <div>
        <CosMeta>THIS WEEK&apos;S REVIEW</CosMeta>
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <CosWeekDots data={dots} size={11} gap={10} />
          <span className="text-body-2 text-quiet">
            {formatWeekRange(start, end)}
          </span>
        </div>

        {paras[0] && (
          <div className="mt-6 p-7 md:p-8 rounded-[20px] bg-amber-wash border border-amber-soft">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-amber-soft text-amber-ink grid place-items-center text-body-2 font-semibold">
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
              style={{ fontSize: 21, lineHeight: 1.45, letterSpacing: "-0.005em" }}
            >
              {paras[0]}
            </p>
            {paras.slice(1).map((p, i) => (
              <p
                key={i}
                className="mt-3.5 text-ink-2"
                style={{ fontSize: 16, lineHeight: 1.7 }}
              >
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="neutral" size="md">
            Reply to Jolene
          </Button>
          <Button variant="accent" size="md">
            Acknowledge
          </Button>
        </div>
      </div>
    );
  }

  // ── Earlier journal index ──────────────────────────────────
  type Row =
    | { kind: "review"; id: string; week: number; date: string; pull: string; dots: number[] }
    | { kind: "entry"; id: string; date: string; pull: string };

  const reviewRows: Row[] = reviews.slice(latest ? 1 : 0).map((r, idx) => {
    const start = r.weekStartDate.toISOString().split("T")[0];
    const end = getWeekEndDate(start);
    const data = r.synthesisData as
      | { sections?: { title: string; content: string }[] }
      | null;
    const coach = data?.sections?.find((s) =>
      s.title.toLowerCase().includes("coach")
    );
    const src = coach?.content ?? r.coachFeedback ?? "";
    const pull = src.split(/[.\n]/)[0].trim() + (src ? "." : "");
    const ws = new Date(start + "T00:00:00.000Z");
    const dots: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      dots.push(
        checkIns.some((c) => c.date.toISOString().split("T")[0] === iso) ? 1 : 0
      );
    }
    return {
      kind: "review",
      id: r.id,
      week: reviews.length - 1 - idx,
      date: formatWeekRange(start, end),
      pull: pull || "Read your coach's reflection.",
      dots,
    };
  });

  const entryRows: Row[] = checkIns
    .map((c) => {
      const r = (c.responses as Record<string, unknown>) ?? {};
      const reflection =
        typeof r.reflection === "string" ? r.reflection.trim() : "";
      if (!reflection) return null;
      const iso = c.date.toISOString().split("T")[0];
      const dateLabel = new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return {
        kind: "entry" as const,
        id: c.id,
        date: dateLabel,
        pull:
          reflection.length > 150 ? reflection.slice(0, 148) + "…" : reflection,
      };
    })
    .filter((x): x is Row => x !== null);

  const earlier = [...reviewRows, ...entryRows].slice(0, 30);

  return (
    <CwShell activeOverride="progress">
      <CwContainer max={920} className="py-10 md:py-14">
        <CosMeta>PROGRESS</CosMeta>
        <h1
          className="text-ink font-medium tracking-tight mt-2"
          style={{ fontSize: 36, lineHeight: 1.1 }}
        >
          {reviews.length === 0
            ? "Your journey starts here."
            : "Your journey, in your words."}
        </h1>

        {latestBlock && <div className="mt-10">{latestBlock}</div>}

        {earlier.length > 0 && (
          <div className="mt-12">
            <CosRule />
            <p className="text-micro text-hush mt-6 mb-4">EARLIER</p>
            <div className="grid gap-3.5">
              {earlier.map((row) => (
                <div
                  key={row.id}
                  className={
                    "grid items-center gap-4 md:gap-6 rounded-2xl border px-5 md:px-6 py-5 " +
                    "grid-cols-1 md:grid-cols-[130px_1fr_170px] " +
                    (row.kind === "review"
                      ? "bg-amber-wash border-amber-soft"
                      : "bg-card border-line")
                  }
                >
                  <div>
                    <CosMeta color={row.kind === "review" ? "#92400e" : undefined}>
                      {row.kind === "review" ? `WEEK ${row.week} REVIEW` : "ENTRY"}
                    </CosMeta>
                    <p className="text-meta text-hush mt-1.5">{row.date}</p>
                  </div>
                  <p
                    className={
                      "text-read-lead text-ink leading-snug " +
                      (row.kind === "entry" ? "italic" : "")
                    }
                  >
                    {row.kind === "entry" ? `“${row.pull}”` : row.pull}
                  </p>
                  <div className="flex md:justify-end">
                    {row.kind === "review" ? (
                      <CosWeekDots data={row.dots} size={8} gap={7} />
                    ) : (
                      <span className="text-meta text-hush">read</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reviews.length === 0 && earlier.length === 0 && (
          <p className="text-body text-quiet mt-10">
            Once you have a few check-ins and your first weekly review, your
            journey will gather here.
          </p>
        )}

        <div className="mt-12">
          <Button variant="quiet" size="md" asChild>
            <Link href="/client">Back to today</Link>
          </Button>
        </div>
      </CwContainer>
    </CwShell>
  );
}
