"use client";

import Link from "next/link";

interface CheckInCardProps {
  hasCheckedInToday: boolean;
  checkedInDates: string[];
}

export default function CheckInCard({
  hasCheckedInToday,
  checkedInDates,
}: CheckInCardProps) {
  // Build past 7 days
  const past7Days: string[] = [];
  const today = new Date().toLocaleDateString("en-CA");
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push(d.toLocaleDateString("en-CA"));
  }

  const checkedInCount = past7Days.filter((d) =>
    checkedInDates.includes(d)
  ).length;

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-1">
        How are things going today?
      </h2>
      <p className="text-stone-500 text-sm mb-5">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      {hasCheckedInToday ? (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-stone-800">
              You&apos;ve checked in today
            </p>
            <Link
              href="/client/checkin"
              className="text-xs text-stone-500 hover:text-stone-700 underline"
            >
              View or edit
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <Link
            href="/client/checkin"
            className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-500 transition-colors"
          >
            Check in
          </Link>
          <p className="text-xs text-stone-400 mt-2">
            Takes about 90 seconds.
          </p>
        </div>
      )}

      {/* Gentle streak dots */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {past7Days
            .slice()
            .reverse()
            .map((dateStr) => {
              const hasCheckIn = checkedInDates.includes(dateStr);
              const isToday = dateStr === today;
              return (
                <div
                  key={dateStr}
                  className={`w-2.5 h-2.5 rounded-full ${
                    hasCheckIn
                      ? "bg-amber-400"
                      : isToday
                        ? "border border-amber-300 bg-amber-50"
                        : "bg-stone-200"
                  }`}
                />
              );
            })}
        </div>
        <span className="text-xs text-stone-400">
          {checkedInCount} of {past7Days.length} days this week
        </span>
      </div>
    </div>
  );
}
