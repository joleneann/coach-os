"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import type { TrackerField } from "@/lib/tracker-template";
import { reflectionPrompts } from "@/lib/tracker-template";
import { shouldShowHabitToday } from "@/lib/habit-graduation";
import VoiceRecorder from "@/components/VoiceRecorder";

interface CheckInRecord {
  id: string;
  date: string;
  responses: Record<string, unknown>;
}

// ── Relative day labels ────────────────────────────────────────

function getRelativeLabel(dateStr: string, todayStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date(todayStr + "T12:00:00");
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

function getFormattedDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ── Get today's reflection prompt ──────────────────────────────

function getTodayPrompt(): string {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return reflectionPrompts[dayOfYear % reflectionPrompts.length];
}

// ── Habit toggle component ─────────────────────────────────────

function HabitCard({
  field,
  value,
  onChange,
}: {
  field: TrackerField;
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  const states = ["yes", "partly", "not_today"] as const;
  const current = value || "";

  const cycle = () => {
    const idx = states.indexOf(current as (typeof states)[number]);
    const next = states[(idx + 1) % states.length];
    onChange(next);
  };

  return (
    <button
      onClick={cycle}
      className="w-full bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 hover:border-stone-300 transition-colors text-left"
    >
      {/* Status indicator */}
      <div className="flex-shrink-0">
        {current === "yes" ? (
          <div className="w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-600"
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
        ) : current === "partly" ? (
          <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-amber-300" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-stone-50 border-2 border-stone-200" />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800">{field.label}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {current === "yes"
            ? "Yes"
            : current === "partly"
              ? "Partly"
              : current === "not_today"
                ? "Not today"
                : "Tap to respond"}
        </p>
      </div>
    </button>
  );
}

// ── Select metric component ────────────────────────────────────

function SelectCard({
  field,
  value,
  onChange,
}: {
  field: TrackerField;
  value: string | undefined;
  onChange: (val: string) => void;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <p className="text-sm font-medium text-stone-800 mb-3">{field.label}</p>
      <div className="flex gap-2">
        {(field.options || []).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
              value === opt
                ? "bg-amber-100 border-2 border-amber-400 text-amber-800 font-medium"
                : "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Number metric component ────────────────────────────────────

function NumberCard({
  field,
  value,
  onChange,
}: {
  field: TrackerField;
  value: number | undefined;
  onChange: (val: number) => void;
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <label className="text-sm font-medium text-stone-800">
        {field.label}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          min={0}
        />
        {field.unit && (
          <span className="text-sm text-stone-500">{field.unit}</span>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function CheckInPage() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState<TrackerField[]>([]);
  const [dashboardMode, setDashboardMode] = useState<string>("STANDARD");
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [checkedInDates, setCheckedInDates] = useState<string[]>([]);
  const [viewingDate, setViewingDate] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  // Load template + recent check-ins
  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return;

      try {
        // Fetch template and check-ins in parallel
        const [templateRes, checkInRes] = await Promise.all([
          fetch("/api/tracker/template"),
          fetch("/api/checkin"),
        ]);

        if (templateRes.ok) {
          const templateData = await templateRes.json();
          if (templateData.template) {
            setFields(templateData.template.fields as TrackerField[]);
            setDashboardMode(templateData.dashboardMode || "STANDARD");
          }
        }

        if (checkInRes.ok) {
          const checkInData = await checkInRes.json();
          setRecentCheckIns(checkInData.checkIns || []);
          setCheckedInDates(checkInData.checkedInDates || []);

          // Pre-populate today's responses if already checked in
          const todayCheckIn = (checkInData.checkIns || []).find(
            (c: CheckInRecord) =>
              c.date.split("T")[0] === today
          );
          if (todayCheckIn) {
            setResponses(
              todayCheckIn.responses as Record<string, unknown>
            );
          }
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session?.user?.id, today]);

  // Filter fields by dashboard mode
  const visibleFields = fields.filter((f) =>
    f.dashboardModes.includes(
      dashboardMode as "MINIMAL" | "STANDARD" | "DATA_HEAVY"
    )
  );

  // Filter habits by frequency — only show habits scheduled for today
  const todayDate = new Date(today + "T12:00:00");
  const allHabits = visibleFields.filter((f) => f.type === "habit");
  const habits = allHabits.filter((f) => shouldShowHabitToday(f, todayDate));
  const graduatedCount = allHabits.length - habits.length;
  const metrics = visibleFields.filter((f) => f.type === "metric");
  const meals = visibleFields.filter((f) => f.type === "meal");
  const reflection = visibleFields.find((f) => f.type === "reflection");

  // Update a single response
  const updateResponse = useCallback((key: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  // Save check-in
  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, responses }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);

      // Update local check-in list
      if (!checkedInDates.includes(today)) {
        setCheckedInDates((prev) => [today, ...prev]);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [today, responses, checkedInDates]);

  // Count habits answered for a given check-in
  const countHabits = (checkIn: CheckInRecord) => {
    const r = checkIn.responses as Record<string, string>;
    let done = 0;
    let total = 0;
    for (const f of fields.filter((f) => f.type === "habit")) {
      if (
        f.dashboardModes.includes(
          dashboardMode as "MINIMAL" | "STANDARD" | "DATA_HEAVY"
        )
      ) {
        total++;
        if (r[f.key] === "yes" || r[f.key] === "partly") done++;
      }
    }
    return { done, total };
  };

  // ── Past 7 days data ──
  const past7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    past7Days.push(d.toLocaleDateString("en-CA"));
  }

  const checkedInCount = past7Days.filter((d) =>
    checkedInDates.includes(d)
  ).length;

  // Viewing a past day's check-in
  const viewingCheckIn = viewingDate
    ? recentCheckIns.find(
        (c) => c.date.split("T")[0] === viewingDate
      )
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-white border-b border-stone-200">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/client"
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              ← Back
            </Link>
            <LogoutButton />
          </div>
        </header>
        <div className="max-w-lg mx-auto px-6 py-16 text-center">
          <p className="text-stone-500">
            Your check-in will be ready once your coach approves your plan.
          </p>
          <Link
            href="/client"
            className="inline-block mt-4 text-sm text-stone-600 underline"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/client"
            className="text-stone-400 hover:text-stone-600 text-sm"
          >
            ← Back
          </Link>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">
            How was your day?
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {getFormattedDate(today)}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              dismiss
            </button>
          </div>
        )}

        {/* Habits */}
        {habits.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Your habits
              {graduatedCount > 0 && (
                <span className="ml-2 font-normal normal-case text-stone-400">
                  ({habits.length} today)
                </span>
              )}
            </h2>
            <div className="space-y-3">
              {habits.map((field) => (
                <HabitCard
                  key={field.key}
                  field={field}
                  value={responses[field.key] as string | undefined}
                  onChange={(val) => updateResponse(field.key, val)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Quick numbers
            </h2>
            <div className="space-y-3">
              {metrics.map((field) =>
                field.inputType === "select" ? (
                  <SelectCard
                    key={field.key}
                    field={field}
                    value={responses[field.key] as string | undefined}
                    onChange={(val) => updateResponse(field.key, val)}
                  />
                ) : (
                  <NumberCard
                    key={field.key}
                    field={field}
                    value={responses[field.key] as number | undefined}
                    onChange={(val) => updateResponse(field.key, val)}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* Meals */}
        {meals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Meals
            </h2>
            <div className="space-y-3">
              {meals.map((field) => (
                <div
                  key={field.key}
                  className="bg-white border border-stone-200 rounded-xl p-4"
                >
                  <label className="text-sm font-medium text-stone-800">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={(responses[field.key] as string) || ""}
                    onChange={(e) =>
                      updateResponse(field.key, e.target.value)
                    }
                    placeholder="Skip if you'd rather not log this one"
                    className="mt-2 w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflection */}
        {reflection && (
          <div className="mb-8">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-800">
                  {getTodayPrompt()}
                </label>
                <VoiceRecorder
                  onTranscript={(text) => {
                    const current = (responses[reflection.key] as string) || "";
                    const separator = current.trim() ? " " : "";
                    updateResponse(reflection.key, current + separator + text);
                  }}
                  onAudioUrl={(url) => {
                    updateResponse("_voiceNoteUrl", url);
                  }}
                />
              </div>
              <textarea
                value={(responses[reflection.key] as string) || ""}
                onChange={(e) =>
                  updateResponse(reflection.key, e.target.value)
                }
                rows={3}
                placeholder="Totally optional. Write, or tap the mic to speak."
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-none"
                style={{ minHeight: "80px" }}
              />
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mb-10">
          {saved ? (
            <div className="text-center py-4">
              <p className="text-amber-700 font-medium">
                Saved. See you tomorrow.
              </p>
              <p className="text-xs text-stone-400 mt-1">
                You can edit this check-in anytime today.
              </p>
            </div>
          ) : (
            <button
              onClick={save}
              disabled={saving}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>

        {/* Gentle streak / Past 7 days */}
        <div className="border-t border-stone-200 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              This week
            </h2>
            <p className="text-xs text-stone-400">
              {checkedInCount} of {past7Days.length} days
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            {past7Days
              .slice()
              .reverse()
              .map((dateStr) => {
                const hasCheckIn = checkedInDates.includes(dateStr);
                const isToday = dateStr === today;
                const dayLabel = new Date(
                  dateStr + "T12:00:00"
                ).toLocaleDateString("en-US", { weekday: "narrow" });

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (dateStr === today) {
                        setViewingDate(null); // Show today's form
                      } else if (hasCheckIn) {
                        setViewingDate(
                          viewingDate === dateStr ? null : dateStr
                        );
                      }
                    }}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
                      viewingDate === dateStr
                        ? "bg-amber-50 border border-amber-200"
                        : "hover:bg-stone-100"
                    }`}
                  >
                    <span className="text-xs text-stone-400">{dayLabel}</span>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        hasCheckIn
                          ? "bg-amber-400"
                          : isToday
                            ? "border-2 border-amber-300 bg-amber-50"
                            : "bg-stone-200"
                      }`}
                    />
                  </button>
                );
              })}
          </div>

          {/* Expanded past day view */}
          {viewingDate && viewingCheckIn && (
            <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-stone-800">
                  {getRelativeLabel(viewingDate, today)}
                </p>
                <button
                  onClick={() => setViewingDate(null)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Close
                </button>
              </div>

              {/* Show habits */}
              {(() => {
                const r = viewingCheckIn.responses as Record<string, string>;
                const habitFields = fields.filter(
                  (f) =>
                    f.type === "habit" &&
                    f.dashboardModes.includes(
                      dashboardMode as
                        | "MINIMAL"
                        | "STANDARD"
                        | "DATA_HEAVY"
                    )
                );
                const { done, total } = countHabits(viewingCheckIn);

                return (
                  <div className="space-y-2">
                    <p className="text-xs text-stone-500">
                      {done} of {total} habits
                    </p>
                    {habitFields.map((f) => {
                      const val = r[f.key];
                      return (
                        <div
                          key={f.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              val === "yes"
                                ? "bg-amber-400"
                                : val === "partly"
                                  ? "bg-amber-200"
                                  : "bg-stone-200"
                            }`}
                          />
                          <span className="text-stone-700">{f.label}</span>
                          <span className="text-stone-400 text-xs ml-auto">
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

                    {/* Reflection if present */}
                    {r.reflection && (
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <p className="text-xs text-stone-500 mb-1">
                          Reflection
                        </p>
                        <p className="text-sm text-stone-700 italic">
                          &ldquo;{r.reflection}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
