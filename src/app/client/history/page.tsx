import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

import { CwShell, CwContainer } from "@/components/cw";
import { CosMeta, CosWeekDots } from "@/components/cos";
import { getWeekStartDate, formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * Client History · journal index.
 *
 * Ports docs/design/design_files/client-web.jsx · ClientWebHistory.
 * Past weeks read like a journal. Reviews sit on amberWash; entries on
 * card. Each row has a left meta column, a centered pull quote, and a
 * right rail of week dots for reviews or a "read" label for entries.
 */
type Row =
  | {
      kind: "review";
      id: string;
      week: number;
      date: string;
      pull: string;
      dots: number[];
    }
  | {
      kind: "entry";
      id: string;
      date: string;
      pull: string;
    };

export default async function ClientHistoryPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLIENT") redirect("/");

  const clientId = session.user.id;

  // Fetch delivered reviews and recent reflections in parallel
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
      },
    }),
    prisma.dailyCheckIn.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
      take: 60,
      select: { id: true, date: true, responses: true },
    }),
  ]);

  // For each review, build the row · pull a one-line excerpt and compute the dots
  const reviewRows: Row[] = reviews.map((r, idx) => {
    const start = r.weekStartDate.toISOString().split("T")[0];
    const end = getWeekEndDate(start);
    const data = r.synthesisData as
      | { sections?: { title: string; content: string }[] }
      | null;
    const jolene = data?.sections?.find((s) =>
      s.title.toLowerCase().includes("coach")
    );
    const pullSource =
      jolene?.content ?? r.coachFeedback ?? data?.sections?.[0]?.content ?? "";
    const pull = pullSource.split(/[.\n]/)[0].trim() + (pullSource ? "." : "");

    // Dots for that week: which days had a check-in?
    const ws = new Date(start + "T00:00:00.000Z");
    const dots: number[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(ws);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const present = checkIns.some(
        (c) => c.date.toISOString().split("T")[0] === iso
      );
      dots.push(present ? 1 : 0);
    }

    return {
      kind: "review",
      id: r.id,
      week: reviews.length - idx,
      date: formatWeekRange(start, end),
      pull: pull || "Read your coach's reflection.",
      dots,
    };
  });

  // Entries from check-ins, pulling reflection field if present
  const entryRows: Row[] = checkIns
    .map((c) => {
      const r = (c.responses as Record<string, unknown>) ?? {};
      const reflection =
        typeof r.reflection === "string" ? r.reflection.trim() : "";
      if (!reflection) return null;
      const dateIso = c.date.toISOString().split("T")[0];
      const dateLabel = new Date(dateIso + "T12:00:00").toLocaleDateString(
        "en-US",
        { weekday: "short", month: "short", day: "numeric" }
      );
      return {
        kind: "entry" as const,
        id: c.id,
        date: dateLabel,
        pull: reflection.length > 160 ? reflection.slice(0, 158) + "…" : reflection,
      };
    })
    .filter((x): x is Row => x !== null);

  // Merge by date desc · reviews above entries on the same week is a design choice
  const rows: Row[] = [...reviewRows, ...entryRows]
    .sort((a, b) => {
      const ad = a.kind === "review" ? a.date : a.date;
      const bd = b.kind === "review" ? b.date : b.date;
      return ad < bd ? 1 : -1;
    })
    .slice(0, 40);

  const totalWeeks = reviews.length;

  return (
    <CwShell activeOverride="history">
      <CwContainer max={920} className="py-14">
        <CosMeta>HISTORY</CosMeta>
        <h1
          className="text-ink font-medium tracking-tight mt-2"
          style={{ fontSize: 40, lineHeight: 1.1 }}
        >
          {totalWeeks === 0
            ? "Your journal starts here."
            : `${totalWeeks} ${totalWeeks === 1 ? "week" : "weeks"}, in your words.`}
        </h1>

        {rows.length === 0 ? (
          <p className="text-body text-quiet mt-10">
            Once you have a few check-ins and a weekly review, they will land
            here as a quiet journal.
          </p>
        ) : (
          <div className="mt-10 grid gap-3.5">
            {rows.map((row) => (
              <div
                key={row.id}
                className={
                  "grid items-center gap-6 rounded-2xl border px-6 py-5 " +
                  "md:grid-cols-[140px_1fr_180px] grid-cols-1 " +
                  (row.kind === "review"
                    ? "bg-amber-wash border-amber-soft"
                    : "bg-card border-line")
                }
              >
                <div>
                  <CosMeta
                    color={row.kind === "review" ? "#92400e" : undefined}
                  >
                    {row.kind === "review"
                      ? `WEEK ${row.week} REVIEW`
                      : "ENTRY"}
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
        )}
      </CwContainer>
    </CwShell>
  );
}
