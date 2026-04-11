"use client";

import { useEffect, useState, useCallback } from "react";
import { intakeSections } from "@/lib/intake-schema";
import type { IntakeQuestion } from "@/lib/intake-schema";

export default function IntakePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [responses, setResponses] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(false);

  const section = intakeSections[currentSection];
  const sectionResponses = responses[section?.key] || {};
  const totalSections = intakeSections.length;

  // Load existing submission on mount
  useEffect(() => {
    fetch("/api/intake")
      .then((r) => r.json())
      .then((data) => {
        if (data.submission) {
          setSubmissionId(data.submission.id);
          setCurrentSection(data.submission.currentSection);
          setResponses(data.submission.responses);
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

  const goNext = useCallback(async () => {
    await saveSection();
    if (currentSection < totalSections - 1) {
      setCurrentSection((s) => s + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit final
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
  }, [saveSection, currentSection, totalSections, submissionId, section?.key, responses]);

  const goPrev = useCallback(async () => {
    await saveSection();
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      window.scrollTo(0, 0);
    }
  }, [saveSection, currentSection]);

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
            You're all done!
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
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-stone-500">
              Section {currentSection + 1} of {totalSections}
            </span>
            <span className="text-xs text-stone-500">
              {saving ? "Saving..." : "Auto-saved"}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div
              className="bg-stone-700 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${((currentSection + 1) / totalSections) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Section content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-stone-900 mb-2">
          {section.title}
        </h1>
        <p className="text-stone-500 text-sm mb-8">{section.description}</p>

        <div className="space-y-6">
          {section.questions.map((q) => {
            if (!shouldShow(q)) return null;
            return (
              <QuestionField
                key={q.key}
                question={q}
                value={sectionResponses[q.key]}
                onChange={(v) => updateResponse(q.key, v)}
              />
            );
          })}
        </div>

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
            {currentSection === totalSections - 1
              ? "Submit"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Field Component ─────────────────────────────

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: IntakeQuestion;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const q = question;
  const strValue = (value as string) || "";

  return (
    <div>
      <label className="block text-sm font-medium text-stone-800 mb-1">
        {q.label}
        {q.required && <span className="text-amber-600 ml-1">*</span>}
      </label>
      {q.helperText && (
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

      {q.type === "number" && (
        <input
          type="number"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      )}

      {q.type === "textarea" && (
        <div>
          <textarea
            value={strValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={q.placeholder}
            rows={4}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
          />
          {q.voiceEnabled && (
            <p className="text-xs text-stone-400 mt-1">
              Voice input coming soon
            </p>
          )}
        </div>
      )}

      {q.type === "voice" && (
        <textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={q.placeholder || "Type or use voice input..."}
          rows={4}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
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
                onClick={() => onChange(boolVal)}
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
