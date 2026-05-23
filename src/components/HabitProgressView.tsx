"use client";

/**
 * HabitProgressView
 *
 * Shows each habit's lifecycle: current frequency, weeks at that frequency,
 * and a simple 4-week adherence trend. Used on both coach and client pages.
 *
 * Not a full dashboard (that's Phase 5). Just enough to show habit graduation.
 */

interface HabitProgress {
  key: string;
  label: string;
  frequency: "daily" | "twice_weekly" | "weekly";
  weeklyAdherence: { week: string; rate: number }[]; // last 4 weeks
  graduatedAt?: string;
}

interface Props {
  habits: HabitProgress[];
}

const frequencyLabels: Record<string, { label: string; color: string; bg: string }> = {
  daily: { label: "Daily", color: "text-stone-600", bg: "bg-stone-100" },
  twice_weekly: { label: "2x/week", color: "text-amber-700", bg: "bg-amber-50" },
  weekly: { label: "1x/week", color: "text-amber-800", bg: "bg-amber-100" },
};

function AdherenceDots({ weeks }: { weeks: { week: string; rate: number }[] }) {
  // Show last 4 weeks as small visual bars
  const display = weeks.slice(-4);

  if (display.length === 0) {
    return (
      <span className="text-[10px] text-stone-300 italic">No data yet</span>
    );
  }

  return (
    <div className="flex items-end gap-1" title="Weekly adherence (last 4 weeks)">
      {display.map((w) => {
        const height = Math.max(6, Math.round((w.rate / 100) * 24));
        const color =
          w.rate >= 80
            ? "bg-amber-400"
            : w.rate >= 50
              ? "bg-amber-200"
              : "bg-stone-200";
        return (
          <div
            key={w.week}
            className={`w-4 rounded-sm ${color}`}
            style={{ height: `${height}px` }}
            title={`Week of ${w.week}: ${w.rate}%`}
          />
        );
      })}
    </div>
  );
}

export default function HabitProgressView({ habits }: Props) {
  if (habits.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5">
      <h3 className="text-sm font-semibold text-stone-700 mb-4">
        Habit Progress
      </h3>
      <div className="space-y-3">
        {habits.map((habit) => {
          const freq = frequencyLabels[habit.frequency] || frequencyLabels.daily;

          return (
            <div
              key={habit.key}
              className="flex items-center justify-between py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-700 truncate">
                    {habit.label}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${freq.bg} ${freq.color}`}
                  >
                    {freq.label}
                  </span>
                </div>
                {habit.graduatedAt && (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Graduated{" "}
                    {new Date(habit.graduatedAt + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </p>
                )}
              </div>
              <div className="ml-4">
                <AdherenceDots weeks={habit.weeklyAdherence} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-stone-400 mt-3">
        Bars show weekly adherence (last 4 weeks). Taller = higher consistency.
      </p>
    </div>
  );
}
