"use client";

/**
 * WeekAtAGlance
 *
 * 7-day grid showing daily check-in status.
 * Each day: day initial + amber/stone dot + optional metric value.
 * STANDARD: just dots. DATA_HEAVY: dots + key numbers.
 */

interface DaySummary {
  date: string;
  dayLabel: string;
  checkedIn: boolean;
  habitRate?: number; // % of habits done that day
}

interface Props {
  days: DaySummary[];
  showNumbers?: boolean; // DATA_HEAVY shows percentages
}

function getDayInitial(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "narrow" });
}

export default function WeekAtAGlance({ days, showNumbers = false }: Props) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex items-center justify-between gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[10px] font-medium text-stone-400">
              {day.dayLabel || getDayInitial(day.date)}
            </span>
            <div
              className={`w-5 h-5 rounded-full ${
                day.checkedIn
                  ? "bg-amber-400"
                  : "bg-stone-200"
              }`}
            />
            {showNumbers && day.checkedIn && day.habitRate !== undefined && (
              <span className="text-[10px] text-stone-500">
                {day.habitRate}%
              </span>
            )}
            {showNumbers && !day.checkedIn && (
              <span className="text-[10px] text-stone-300">&ndash;</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
