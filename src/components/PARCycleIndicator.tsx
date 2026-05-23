"use client";

/**
 * PAR Cycle Indicator
 *
 * Shows the client where they are in the Plan > Act > Record > Reassess cycle.
 * A gentle visual cue, not interactive. Uses stone/amber palette.
 */
export default function PARCycleIndicator({
  hasCheckedInToday,
  hasWeeklyReview = false,
}: {
  hasCheckedInToday: boolean;
  hasWeeklyReview?: boolean;
}) {
  const steps = [
    { label: "Plan", active: true },
    { label: "Act", active: true },
    { label: "Record", active: hasCheckedInToday },
    { label: "Reassess", active: hasWeeklyReview },
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                step.active
                  ? "bg-amber-400"
                  : "bg-stone-200"
              }`}
            />
            <span
              className={`text-[10px] mt-1 ${
                step.active
                  ? "text-amber-700 font-medium"
                  : "text-stone-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mb-3 mx-0.5 ${
                steps[i + 1].active ? "bg-amber-300" : "bg-stone-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
