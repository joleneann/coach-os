"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { intakeSections } from "@/lib/intake-schema";
import type { IntakeQuestion } from "@/lib/intake-schema";
import VoiceRecorder from "@/components/VoiceRecorder";

type UnitSystem = "metric" | "imperial";

// ─── Completion helper ────────────────────────────────────
// A section is "complete" when every visible question has a non-empty value.
// A section is "in progress" when at least one question has a value.

function getSectionState(
  sectionKey: string,
  questions: IntakeQuestion[],
  allResponses: Record<string, Record<string, unknown>>
): "empty" | "partial" | "complete" {
  const resp = allResponses[sectionKey] || {};
  const visibleQuestions = questions.filter((q) => {
    if (!q.condition) return true;
    return resp[q.condition.questionKey] === q.condition.value;
  });
  if (visibleQuestions.length === 0) return "complete";
  const answered = visibleQuestions.filter((q) => {
    const v = resp[q.key];
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v) && v.length === 0) return false;
    return true;
  });
  if (answered.length === 0) return "empty";
  if (answered.length >= visibleQuestions.length) return "complete";
  return "partial";
}

export default function IntakePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  const section = intakeSections[currentSection];
  const sectionResponses = responses[section?.key] || {};
  const totalSections = intakeSections.length;

  const hasUnitFields = section?.questions.some((q) => q.unitToggle);

  // Compute completion states for all sections
  const sectionStates = useMemo(
    () =>
      intakeSections.map((s) =>
        getSectionState(s.key, s.questions, responses)
      ),
    [responses]
  );

  const completedCount = sectionStates.filter((s) => s === "complete").length;
  const currentSectionState = sectionStates[currentSection];

  // Load existing submission on mount
  useEffect(() => {
    fetch("/api/intake")
      .then((r) => r.json())
      .then((data) => {
        if (data.submission) {
          setSubmissionId(data.submission.id);
          const responseMap = data.submission.responses as Record<
            string,
            Record<string, unknown>
          >;
          setResponses(responseMap);
          // Resume at the first section that has no saved responses yet
          const firstEmpty = intakeSections.findIndex(
            (s) =>
              !responseMap[s.key] ||
              Object.keys(responseMap[s.key]).length === 0
          );
          setCurrentSection(firstEmpty === -1 ? 0 : firstEmpty);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const updateResponse = useCallback(
    (questionKey: string, value: unknown) => {
      setResponses((prev) => ({
        ...prev,
        [section.key]: {
          ...(prev[section.key] || {}),
          [questionKey]: value,
        },
      }));
    },
    [section?.key]
  );

  const saveSection = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          sectionKey: section.key,
          responses: responses[section.key] || {},
          currentSection,
        }),
      });
      const data = await res.json();
      if (data.submissionId) setSubmissionId(data.submissionId);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  }, [submissionId, section?.key, responses, currentSection]);

  const jumpToSection = useCallback(
    async (index: number) => {
      if (index === currentSection) return;
      await saveSection();
      setCurrentSection(index);
      window.scrollTo(0, 0);
    },
    [currentSection, saveSection]
  );

  const goNext = useCallback(async () => {
    await saveSection();
    if (currentSection < totalSections - 1) {
      setCurrentSection((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          sectionKey: section.key,
          responses: responses[section.key] || {},
          currentSection: totalSections,
        }),
      });
      setCompleted(true);
    }
  }, [
    saveSection,
    currentSection,
    totalSections,
    submissionId,
    section?.key,
    responses,
  ]);

  const goPrev = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      window.scrollTo(0, 0);
    }
  }, [currentSection]);

  const shouldShow = useCallback(
    (q: IntakeQuestion) => {
      if (!q.condition) return true;
      const depValue = sectionResponses[q.condition.questionKey];
      return depValue === q.condition.value;
    },
    [sectionResponses]
  );

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold text-stone-900 mb-3">
            You&apos;re all done!
          </h1>
          <p className="text-stone-600">
            Thank you for taking the time to fill this out thoroughly. Your
            coach will review your responses and start working on your
            personalized plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto flex gap-8 px-6">
        {/* ─── Sidebar ───────────────────────────────────── */}
        <aside className="w-64 shrink-0 sticky top-0 h-screen overflow-y-auto py-6">
          <p className="text-xs text-stone-400 mb-4 px-3">
            {completedCount} of {totalSections} sections complete
          </p>
          <nav className="space-y-1">
            {intakeSections.map((s, i) => {
              const state = sectionStates[i];
              const isActive = i === currentSection;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => jumpToSection(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : state === "complete"
                        ? "text-emerald-700 hover:bg-emerald-50"
                        : state === "partial"
                          ? "text-stone-700 hover:bg-stone-50"
                          : "text-stone-400 hover:bg-stone-50 hover:text-stone-600"
                  }`}
                >
                  {state === "complete" && !isActive && (
                    <svg
                      className="w-4 h-4 shrink-0 text-emerald-500"
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
                  )}
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>
          <p className="text-xs text-stone-400 mt-6 px-3">
            {saving ? "Saving..." : "Auto-saved"}
          </p>
        </aside>

        {/* ─── Main content ────────────────────────────────── */}
        <main className="flex-1 min-h-screen py-10">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-semibold text-stone-900">
              {section.title}
            </h1>
            {/* Global unit toggle */}
            {hasUnitFields && (
              <div className="flex items-center gap-0.5 bg-stone-100 rounded-lg p-0.5 shrink-0 ml-4 mt-1">
                <button
                  type="button"
                  onClick={() => setUnitSystem("metric")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    unitSystem === "metric"
                      ? "bg-white text-stone-900 shadow-sm font-medium"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem("imperial")}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    unitSystem === "imperial"
                      ? "bg-white text-stone-900 shadow-sm font-medium"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  Imperial
                </button>
              </div>
            )}
          </div>
          <p className="text-stone-500 text-sm mb-2">{section.description}</p>

          <div className="mb-6" />

          {/* GHQ-28 renders as a matrix; all others as stacked fields */}
          {section.key === "ghq28" ? (
            <GHQMatrix
              questions={section.questions}
              responses={sectionResponses}
              onUpdate={updateResponse}
            />
          ) : (
            <div className="space-y-6">
              {section.questions.map((q) => {
                if (!shouldShow(q)) return null;
                return (
                  <QuestionField
                    key={q.key}
                    question={q}
                    value={sectionResponses[q.key]}
                    onChange={(v) => updateResponse(q.key, v)}
                    unitSystem={unitSystem}
                  />
                );
              })}
            </div>
          )}

          {/* Inline completion message */}
          {currentSectionState === "complete" && section.completionMessage && (
            <p className="text-emerald-600 text-sm mt-8 flex items-center gap-1.5">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {section.completionMessage}
            </p>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12 pt-6 border-t border-stone-200">
            <button
              onClick={goPrev}
              disabled={currentSection === 0}
              className="px-5 py-2 text-sm text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            <button
              onClick={goNext}
              className="px-6 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              {currentSection === totalSections - 1 ? "Submit" : "Continue"}
            </button>
          </div>
      </main>
      </div>
    </div>
  );
}

// ─── Question Field Component ─────────────────────────────

function QuestionField({
  question,
  value,
  onChange,
  unitSystem,
}: {
  question: IntakeQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  unitSystem: UnitSystem;
}) {
  const q = question;
  const strValue = (value as string) || "";
  const [focused, setFocused] = useState(false);

  return (
    <div onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <label className="block text-sm font-medium text-stone-800 mb-1">
        {q.label}
      </label>
      {q.helperText && focused && (
        <p className="text-xs text-stone-400 mb-2">{q.helperText}</p>
      )}

      {q.type === "text" && (
        <input
          type="text"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      )}

      {q.type === "number" && !q.unitToggle && (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={strValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "" || /^\d*\.?\d*$/.test(v)) onChange(v);
          }}
          placeholder={q.placeholder}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      )}

      {q.type === "number" && q.unitToggle && (
        <UnitNumberField
          question={q}
          value={value}
          onChange={onChange}
          unitSystem={unitSystem}
        />
      )}

      {q.type === "textarea" && (
        <div>
          {q.voiceEnabled && (
            <div className="flex justify-end mb-1">
              <VoiceRecorder
                onTranscript={(text) => {
                  const current = strValue || "";
                  const sep = current.trim() ? " " : "";
                  onChange(current + sep + text);
                }}
              />
            </div>
          )}
          <textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.voiceEnabled ? (q.placeholder || "Type, or tap the mic to speak.") : q.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>
      )}

      {q.type === "voice" && (
        <div>
          <div className="flex justify-end mb-1">
            <VoiceRecorder
              onTranscript={(text) => {
                const current = strValue || "";
                const sep = current.trim() ? " " : "";
                onChange(current + sep + text);
              }}
            />
          </div>
          <textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder || "Type, or tap the mic to speak."}
            rows={4}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
        </div>
      )}

      {q.type === "select" && (
        <select
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Select...</option>
          {q.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {q.type === "multiselect" && (
        <div className="space-y-2">
          {q.options?.map((opt) => {
            const selected = Array.isArray(value) ? value : [];
            const isChecked = selected.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      onChange(selected.filter((s: string) => s !== opt));
                    } else {
                      onChange([...selected, opt]);
                    }
                  }}
                  className="rounded border-stone-300"
                />
                {opt}
              </label>
            );
          })}
        </div>
      )}

      {q.type === "yesno" && (
        <div className="flex gap-3">
          {["Yes", "No"].map((opt) => {
            const boolVal = opt === "Yes";
            const isSelected = value === boolVal;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(isSelected ? undefined : boolVal)}
                className={`px-5 py-2 rounded-lg text-sm border transition-colors ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "scale" && (
        <div className="flex items-center gap-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                value === n
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-600 border border-stone-300 hover:border-stone-400"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {q.type === "date" && (
        <input
          type="date"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      )}
    </div>
  );
}

// ─── Unit Number Field ────────────────────────────────────

function UnitNumberField({
  question,
  value,
  onChange,
  unitSystem,
}: {
  question: IntakeQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
  unitSystem: UnitSystem;
}) {
  const unitToggle = question.unitToggle!;
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const lastMetric = useRef<number | null>(null);

  const metricValue =
    value !== undefined && value !== "" ? Number(value) : null;
  const isHeightFtIn =
    unitSystem === "imperial" && unitToggle.imperial === "ft / in";

  useEffect(() => {
    if (isHeightFtIn && metricValue !== null) {
      const totalIn = metricValue / 2.54;
      const newFt = String(Math.floor(totalIn / 12));
      const newIn = String(Math.round(totalIn % 12));
      setFeet((prev) => (prev === newFt ? prev : newFt));
      setInches((prev) => (prev === newIn ? prev : newIn));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHeightFtIn]);

  const displayValue = (() => {
    if (metricValue === null) return "";
    if (unitSystem === "metric") return String(metricValue);
    if (question.key === "weight")
      return String(Math.round(metricValue * 2.20462 * 10) / 10);
    if (question.key === "waist" || question.key === "hip")
      return String(Math.round((metricValue / 2.54) * 10) / 10);
    return String(metricValue);
  })();

  const handleSingleChange = (raw: string) => {
    if (raw === "") {
      onChange("");
      return;
    }
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    if (unitSystem === "metric") {
      onChange(n);
    } else if (question.key === "weight") {
      onChange(Math.round((n / 2.20462) * 10) / 10);
    } else {
      onChange(Math.round(n * 2.54 * 10) / 10);
    }
  };

  const handleFeetInches = (ft: string, inc: string) => {
    setFeet(ft);
    setInches(inc);
    const ftNum = parseFloat(ft) || 0;
    const inNum = parseFloat(inc) || 0;
    if (ftNum === 0 && inNum === 0) {
      onChange("");
      return;
    }
    const cm = Math.round((ftNum * 12 + inNum) * 2.54 * 10) / 10;
    if (cm !== lastMetric.current) {
      lastMetric.current = cm;
      onChange(cm);
    }
  };

  if (isHeightFtIn) {
    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={feet}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d+$/.test(v)) handleFeetInches(v, inches);
            }}
            placeholder="5"
            className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
            ft
          </span>
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inches}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{1,2}$/.test(v)) handleFeetInches(feet, v);
            }}
            placeholder="11"
            className="w-full px-3 py-2 pr-9 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
            in
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        value={displayValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || /^\d*\.?\d*$/.test(v)) handleSingleChange(v);
        }}
        placeholder={question.placeholder}
        className="w-full px-3 py-2 pr-12 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">
        {unitSystem === "metric" ? unitToggle.metric : unitToggle.imperial}
      </span>
    </div>
  );
}

// ─── GHQ-28 Matrix ────────────────────────────────────────

const GHQ_OPTIONS = [
  "Better than usual",
  "Same as usual",
  "Worse than usual",
  "Much worse than usual",
];

function GHQMatrix({
  questions,
  responses,
  onUpdate,
}: {
  questions: IntakeQuestion[];
  responses: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-stone-500 pb-3 pr-4 w-1/2">
              Recently, have you:
            </th>
            {GHQ_OPTIONS.map((opt) => (
              <th
                key={opt}
                className="text-center text-xs font-medium text-stone-500 pb-3 px-2 w-[12.5%]"
              >
                {opt}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => {
            const selected = (responses[q.key] as string) || "";
            return (
              <tr
                key={q.key}
                className="border-t border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <td className="py-3 pr-4 text-sm text-stone-700">{q.label}</td>
                {GHQ_OPTIONS.map((opt) => (
                  <td key={opt} className="py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate(q.key, selected === opt ? "" : opt)
                      }
                      className="inline-flex items-center justify-center"
                      aria-label={`${q.label}: ${opt}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selected === opt
                            ? "border-stone-900"
                            : "border-stone-300 hover:border-stone-400"
                        }`}
                      >
                        {selected === opt && (
                          <span className="w-2.5 h-2.5 rounded-full bg-stone-900" />
                        )}
                      </span>
                    </button>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
