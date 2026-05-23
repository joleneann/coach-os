"use client";

import { useState } from "react";
import type { TrackerField } from "@/lib/tracker-template";

interface CheckInData {
  id: string;
  date: string;
  responses: Record<string, unknown>;
}

interface CheckInWeekViewProps {
  checkIns: CheckInData[];
  templateFields: TrackerField[];
  dashboardMode: string;
}

function getRelativeLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CheckInWeekView({
  checkIns,
  templateFields,
  dashboardMode,
}: CheckInWeekViewProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Build past 7 days
  const past7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push(d.toLocaleDateString("en-CA"));
  }

  const checkInMap = new Map<string, CheckInData>();
  for (const ci of checkIns) {
    const dateStr = ci.date.split("T")[0];
    checkInMap.set(dateStr, ci);
  }

  const checkedInCount = past7Days.filter((d) => checkInMap.has(d)).length;

  // Filter fields by dashboard mode
  const visibleFields = templateFields.filter((f) =>
    f.dashboardModes.includes(
      dashboardMode as "MINIMAL" | "STANDARD" | "DATA_HEAVY"
    )
  );
  const habitFields = visibleFields.filter((f) => f.type === "habit");

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-900">
          Recent Check-ins
        </h3>
        <span className="text-xs text-stone-400">
          {checkedInCount} of {past7Days.length} days
        </span>
      </div>

      {/* 7-day grid */}
      <div className="flex gap-1.5 mb-3">
        {past7Days
          .slice()
          .reverse()
          .map((dateStr) => {
            const hasCheckIn = checkInMap.has(dateStr);
            const isToday =
              dateStr === new Date().toLocaleDateString("en-CA");
            const dayLabel = new Date(
              dateStr + "T12:00:00"
            ).toLocaleDateString("en-US", { weekday: "narrow" });

            return (
              <button
                key={dateStr}
                onClick={() => {
                  if (hasCheckIn) {
                    setExpandedDate(
                      expandedDate === dateStr ? null : dateStr
                    );
                  }
                }}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded transition-colors ${
                  expandedDate === dateStr
                    ? "bg-amber-50 border border-amber-200"
                    : hasCheckIn
                      ? "hover:bg-stone-50 cursor-pointer"
                      : ""
                }`}
                disabled={!hasCheckIn}
              >
                <span className="text-xs text-stone-400">{dayLabel}</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    hasCheckIn
                      ? "bg-amber-400"
                      : isToday
                        ? "border border-amber-300 bg-amber-50"
                        : "bg-stone-200"
                  }`}
                />
              </button>
            );
          })}
      </div>

      {/* Expanded day detail */}
      {expandedDate && checkInMap.has(expandedDate) && (
        <div className="border-t border-stone-100 pt-3 mt-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-stone-700">
              {getRelativeLabel(expandedDate)}
            </p>
            <button
              onClick={() => setExpandedDate(null)}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Close
            </button>
          </div>

          {(() => {
            const ci = checkInMap.get(expandedDate)!;
            const r = ci.responses as Record<string, string>;

            // Count habits
            let done = 0;
            let total = 0;
            for (const f of habitFields) {
              total++;
              if (r[f.key] === "yes" || r[f.key] === "partly") done++;
            }

            // Max 3 loss signals: only show first 3 "not today" habits
            let lossCount = 0;

            return (
              <div className="space-y-1.5">
                <p className="text-xs text-stone-500 mb-2">
                  {done} of {total} habits
                </p>

                {habitFields.map((f) => {
                  const val = r[f.key];
                  const isLoss =
                    val === "not_today" || val === undefined || val === "";

                  if (isLoss) {
                    lossCount++;
                    if (lossCount > 3) return null; // Max 3 loss signals
                  }

                  return (
                    <div
                      key={f.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          val === "yes"
                            ? "bg-amber-400"
                            : val === "partly"
                              ? "bg-amber-200"
                              : "bg-stone-200"
                        }`}
                      />
                      <span className="text-stone-600 truncate">
                        {f.label}
                      </span>
                      <span className="text-stone-400 ml-auto flex-shrink-0">
                        {val === "yes"
                          ? "Yes"
                          : val === "partly"
                            ? "Partly"
                            : val === "not_today"
                              ? "Not today"
                              : ""}
                      </span>
                    </div>
                  );
                })}

                {lossCount > 3 && (
                  <p className="text-xs text-stone-400 pl-4">
                    +{lossCount - 3} more
                  </p>
                )}

                {/* Reflection */}
                {r.reflection && (
                  <div className="mt-2 pt-2 border-t border-stone-100">
                    <p className="text-xs text-stone-500 mb-1">
                      Reflection
                    </p>
                    <p className="text-xs text-stone-600 italic">
                      &ldquo;{r.reflection}&rdquo;
                    </p>
                  </div>
                )}

                {/* Metrics */}
                {visibleFields
                  .filter((f) => f.type === "metric" && r[f.key])
                  .map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="text-stone-500">{f.label}:</span>
                      <span className="text-stone-700">
                        {r[f.key]}
                        {f.unit ? ` ${f.unit}` : ""}
                      </span>
                    </div>
                  ))}
              </div>
            );
          })()}
        </div>
      )}

      {checkIns.length === 0 && (
        <p className="text-xs text-stone-400">
          No check-ins yet this week.
        </p>
      )}
    </div>
  );
}
