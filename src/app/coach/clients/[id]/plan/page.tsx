"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CoachDecisions } from "@/lib/coach-decision-schema";
import {
  defaultCoachDecisions,
  decisionSections,
  fieldMeta,
} from "@/lib/coach-decision-schema";
import type { RedFlag } from "@/lib/red-flag-detection";

export default function CoachPlanPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clientName, setClientName] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [computedMetrics, setComputedMetrics] = useState<{
    bmi: number | null;
    whr: number | null;
    ghqScores: object | null;
  }>({ bmi: null, whr: null, ghqScores: null });
  const [decisions, setDecisions] =
    useState<CoachDecisions>(defaultCoachDecisions);
  const [planId, setPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-suggest referrals and supplements from red flags
  const prefillFromFlags = useCallback(
    (flags: RedFlag[]) => {
      const suggestedReferrals: CoachDecisions["referrals"] = [];
      const suggestedSupplements: CoachDecisions["supplements"] = [];

      for (const flag of flags) {
        if (
          flag.category === "mental_health" &&
          flag.severity === "critical" &&
          flag.title.toLowerCase().includes("depression")
        ) {
          suggestedReferrals.push({
            type: "Psychologist / Psychiatrist",
            reason: flag.detail,
            urgency: "soon",
          });
        }
        if (
          flag.category === "mental_health" &&
          flag.title.toLowerCase().includes("suicidal")
        ) {
          suggestedReferrals.push({
            type: "Psychiatrist",
            reason: "Suicidal ideation flagged in GHQ-28",
            urgency: "urgent",
          });
        }
        if (flag.category === "bloodwork" && flag.title.toLowerCase().includes("vitamin d")) {
          suggestedSupplements.push({
            name: "Vitamin D3",
            dosage: "60,000 IU/week for 8 weeks, then 1,000 IU/day",
            timing: "With a fat-containing meal",
            reason: "Low Vitamin D",
          });
        }
        if (flag.category === "gut" && flag.severity === "warning") {
          suggestedReferrals.push({
            type: "Gastroenterologist",
            reason: flag.detail,
            urgency: "routine",
          });
        }
        if (
          flag.category === "medical" &&
          flag.title.toLowerCase().includes("menstrual")
        ) {
          suggestedReferrals.push({
            type: "Endocrinologist / Gynecologist",
            reason: flag.detail,
            urgency: "routine",
          });
        }
        if (
          flag.category === "behavioral" &&
          flag.title.toLowerCase().includes("binge")
        ) {
          suggestedReferrals.push({
            type: "Therapist / Counselor",
            reason: flag.detail,
            urgency: flag.severity === "critical" ? "urgent" : "soon",
          });
        }
        if (
          flag.category === "mental_health" &&
          flag.severity === "warning" &&
          flag.title.toLowerCase().includes("anxiety")
        ) {
          suggestedReferrals.push({
            type: "Therapist / Counselor",
            reason: flag.detail,
            urgency: "routine",
          });
        }
        if (
          flag.category === "medical" &&
          flag.title.toLowerCase().includes("bmi indicates obesity")
        ) {
          suggestedReferrals.push({
            type: "General Physician",
            reason: "Medical clearance recommended before starting exercise program. " + flag.detail,
            urgency: "soon",
          });
        }
      }

      // Deduplicate referrals by type (merge reasons if same specialist)
      const deduped: typeof suggestedReferrals = [];
      for (const ref of suggestedReferrals) {
        const existing = deduped.find((r) => r.type === ref.type);
        if (existing) {
          existing.reason += "; " + ref.reason;
          // Keep the more urgent level
          const urgencyOrder = { urgent: 3, soon: 2, routine: 1 };
          if (urgencyOrder[ref.urgency as keyof typeof urgencyOrder] > urgencyOrder[existing.urgency as keyof typeof urgencyOrder]) {
            existing.urgency = ref.urgency;
          }
        } else {
          deduped.push({ ...ref });
        }
      }

      // Only prefill if empty (don't overwrite manual entries)
      setDecisions((prev) => ({
        ...prev,
        referrals:
          prev.referrals.length === 0 ? deduped : prev.referrals,
        supplements:
          prev.supplements.length === 0
            ? suggestedSupplements
            : prev.supplements,
      }));
    },
    []
  );

  // Load client data, existing decisions, and summary
  useEffect(() => {
    async function load() {
      try {
        // Fetch client info + intake
        const clientRes = await fetch(`/api/coach/client?id=${clientId}`);
        if (!clientRes.ok) throw new Error("Failed to load client");
        const clientData = await clientRes.json();
        setClientName(clientData.name || "Client");
        setSubmissionId(clientData.submissionId || null);

        if (clientData.summary) {
          setSummary(
            typeof clientData.summary === "object"
              ? clientData.summary.text
              : clientData.summary
          );
        }
        if (clientData.redFlags && clientData.redFlags.length > 0) {
          setRedFlags(clientData.redFlags);
        }
        if (clientData.bmi)
          setComputedMetrics((m) => ({ ...m, bmi: clientData.bmi }));
        if (clientData.whr)
          setComputedMetrics((m) => ({ ...m, whr: clientData.whr }));

        // Fetch existing plan decisions
        const planRes = await fetch(
          `/api/plan/decisions?clientId=${clientId}`
        );
        let hasExistingDecisions = false;
        if (planRes.ok) {
          const planData = await planRes.json();
          if (planData.decisions) {
            setDecisions({ ...defaultCoachDecisions, ...planData.decisions });
            hasExistingDecisions = true;
          }
          if (planData.planId) {
            setPlanId(planData.planId);
          }
        }

        // If no existing decisions saved, prefill from red flags
        if (
          !hasExistingDecisions &&
          clientData.redFlags &&
          clientData.redFlags.length > 0
        ) {
          prefillFromFlags(clientData.redFlags);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clientId, prefillFromFlags]);

  const generateSummary = useCallback(async () => {
    if (!submissionId) {
      setError(
        "No completed intake found. The client must submit their intake before a summary can be generated."
      );
      return;
    }
    setSummaryLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/intake/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Server returned ${res.status}`
        );
      }
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.redFlags && data.redFlags.length > 0) {
        setRedFlags(data.redFlags);
        prefillFromFlags(data.redFlags);
      }
      if (data.bmi)
        setComputedMetrics((m) => ({ ...m, bmi: data.bmi }));
      if (data.whr)
        setComputedMetrics((m) => ({ ...m, whr: data.whr }));

      // If no AI summary, show a note about using Claude Code
      if (!data.summary) {
        setSummary(
          "Metrics and red flags computed. To generate a full AI summary, run in your terminal:\n\nclaude \"Run: node scripts/generate-summary.mjs --client " +
            clientId +
            '"'
        );
      }
    } catch (err) {
      setError(`Summary generation failed: ${err}`);
    } finally {
      setSummaryLoading(false);
    }
  }, [submissionId, clientId, prefillFromFlags]);

  const saveDecisions = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/plan/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, decisions }),
      });
      const data = await res.json();
      if (data.planId) setPlanId(data.planId);
    } catch {
      setError("Failed to save decisions");
    } finally {
      setSaving(false);
    }
  }, [clientId, decisions]);

  const [showPlanCommand, setShowPlanCommand] = useState(false);

  const generatePlan = useCallback(async () => {
    // Save decisions first
    setGenerating(true);
    try {
      const saveRes = await fetch("/api/plan/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, decisions }),
      });
      const saveData = await saveRes.json();
      const currentPlanId = saveData.planId || planId;
      if (currentPlanId) setPlanId(currentPlanId);

      if (!currentPlanId) {
        setError("No plan created. Try saving draft first.");
        return;
      }

      // Show the Claude Code command for plan generation
      setShowPlanCommand(true);
      setError(null);
    } catch (err) {
      setError(String(err));
    } finally {
      setGenerating(false);
    }
  }, [clientId, decisions, planId]);

  const updateField = (field: string, value: unknown) => {
    setDecisions((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/coach/clients/${clientId}`}
              className="text-stone-400 hover:text-stone-600 text-sm"
            >
              ← {clientName}
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">
              Plan Builder
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveDecisions}
              disabled={saving}
              className="px-4 py-2 text-sm border border-stone-300 rounded-lg hover:bg-stone-100 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Plan"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              dismiss
            </button>
          </div>
        )}

        {/* Plan Generation Command */}
        {showPlanCommand && planId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-2">
              Decisions saved. Ready to generate plan.
            </h3>
            <p className="text-xs text-green-800 mb-3">
              Run this command in your terminal (Claude Code session) to generate the plan:
            </p>
            <pre className="bg-green-900 text-green-100 p-3 rounded text-xs overflow-x-auto">
              {`claude "Run: node scripts/generate-plan.mjs --client ${clientId}"`}
            </pre>
            <p className="text-xs text-green-700 mt-3">
              After the plan is generated and saved, go to{" "}
              <Link
                href={`/coach/clients/${clientId}/plan/review`}
                className="underline font-medium"
              >
                Review Plan
              </Link>{" "}
              to review and approve it.
            </p>
          </div>
        )}

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-stone-900">
              Red Flags ({redFlags.length})
            </h2>
            {redFlags.map((flag, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-sm ${
                  flag.severity === "critical"
                    ? "bg-red-50 border-red-200 text-red-900"
                    : flag.severity === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-blue-50 border-blue-200 text-blue-900"
                }`}
              >
                <p className="font-medium">{flag.title}</p>
                <p className="mt-0.5 text-xs opacity-80">{flag.detail}</p>
              </div>
            ))}
          </div>
        )}

        {/* Computed Metrics */}
        {(computedMetrics.bmi || computedMetrics.whr) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {computedMetrics.bmi && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">BMI</p>
                <p className="text-lg font-semibold text-stone-900">
                  {computedMetrics.bmi}
                </p>
              </div>
            )}
            {computedMetrics.whr && (
              <div className="bg-white rounded-lg border border-stone-200 p-4">
                <p className="text-xs text-stone-500">WHR</p>
                <p className="text-lg font-semibold text-stone-900">
                  {computedMetrics.whr}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Intake Summary */}
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">
              Intake Summary
            </h2>
            <button
              onClick={generateSummary}
              disabled={summaryLoading || !submissionId}
              className="text-xs px-3 py-1.5 border border-stone-300 rounded-lg hover:bg-stone-100 disabled:opacity-50"
            >
              {summaryLoading
                ? "Generating..."
                : summary
                  ? "Regenerate"
                  : "Generate Summary"}
            </button>
          </div>
          {summary ? (
            <div className="prose prose-sm prose-stone max-w-none whitespace-pre-wrap text-sm text-stone-700">
              {summary}
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              Click &quot;Generate Summary&quot; to create an AI-powered intake
              summary, or review the raw intake data on the client page.
            </p>
          )}
        </div>

        {/* Coach Decision Form */}
        {decisionSections.map((section) => (
          <div
            key={section.key}
            className="bg-white border border-stone-200 rounded-lg p-6"
          >
            <h2 className="text-sm font-semibold text-stone-900 mb-1">
              {section.title}
            </h2>
            <p className="text-xs text-stone-500 mb-4">
              {section.description}
            </p>

            <div className="space-y-4">
              {section.fields.map((field) => {
                // Special handling for array fields
                if (field === "supplements") {
                  return (
                    <SupplementEditor
                      key={field}
                      supplements={decisions.supplements}
                      onChange={(s) => updateField("supplements", s)}
                    />
                  );
                }
                if (field === "referrals") {
                  return (
                    <ReferralEditor
                      key={field}
                      referrals={decisions.referrals}
                      onChange={(r) => updateField("referrals", r)}
                    />
                  );
                }
                if (field === "startingHabits") {
                  return (
                    <HabitEditor
                      key={field}
                      habits={decisions.startingHabits}
                      onChange={(h) => updateField("startingHabits", h)}
                    />
                  );
                }

                const meta = fieldMeta[field];
                if (!meta) return null;

                return (
                  <div key={field}>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {meta.label}
                      {meta.unit && (
                        <span className="text-stone-400 ml-1">
                          ({meta.unit})
                        </span>
                      )}
                    </label>
                    {meta.helperText && (
                      <p className="text-xs text-stone-400 mb-1">
                        {meta.helperText}
                      </p>
                    )}
                    {meta.type === "select" ? (
                      <select
                        value={String(
                          decisions[field as keyof CoachDecisions] || ""
                        )}
                        onChange={(e) => updateField(field, e.target.value)}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      >
                        {meta.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : meta.type === "textarea" ? (
                      <textarea
                        value={String(
                          decisions[field as keyof CoachDecisions] || ""
                        )}
                        onChange={(e) => updateField(field, e.target.value)}
                        placeholder={meta.placeholder}
                        rows={3}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    ) : meta.type === "number" ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={String(
                          decisions[field as keyof CoachDecisions] || ""
                        )}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "" || /^\d*\.?\d*$/.test(v))
                            updateField(field, v === "" ? 0 : Number(v));
                        }}
                        placeholder={meta.placeholder}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(
                          decisions[field as keyof CoachDecisions] || ""
                        )}
                        onChange={(e) => updateField(field, e.target.value)}
                        placeholder={meta.placeholder}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Bottom action bar */}
        <div className="flex justify-end gap-3 pt-4 pb-8">
          <button
            onClick={saveDecisions}
            disabled={saving}
            className="px-6 py-2.5 text-sm border border-stone-300 rounded-lg hover:bg-stone-100 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="px-6 py-2.5 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
          >
            {generating ? "Generating Plan..." : "Generate Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Supplement Editor ──────────────────────────────────────

function SupplementEditor({
  supplements,
  onChange,
}: {
  supplements: CoachDecisions["supplements"];
  onChange: (s: CoachDecisions["supplements"]) => void;
}) {
  const add = () =>
    onChange([...supplements, { name: "", dosage: "", timing: "", reason: "" }]);
  const remove = (i: number) =>
    onChange(supplements.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) =>
    onChange(
      supplements.map((s, idx) => (idx === i ? { ...s, [field]: value } : s))
    );

  return (
    <div>
      <label className="block text-xs font-medium text-stone-700 mb-2">
        Supplements
      </label>
      {supplements.map((s, i) => (
        <div
          key={i}
          className="grid grid-cols-4 gap-2 mb-2 items-start"
        >
          <input
            value={s.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Name"
            className="border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <input
            value={s.dosage}
            onChange={(e) => update(i, "dosage", e.target.value)}
            placeholder="Dosage"
            className="border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <input
            value={s.timing}
            onChange={(e) => update(i, "timing", e.target.value)}
            placeholder="Timing"
            className="border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <div className="flex gap-1">
            <input
              value={s.reason}
              onChange={(e) => update(i, "reason", e.target.value)}
              placeholder="Reason"
              className="flex-1 border border-stone-300 rounded px-2 py-1.5 text-sm"
            />
            <button
              onClick={() => remove(i)}
              className="text-stone-400 hover:text-red-500 px-1"
            >
              x
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="text-xs text-stone-500 hover:text-stone-700 mt-1"
      >
        + Add supplement
      </button>
    </div>
  );
}

// ─── Referral Editor ────────────────────────────────────────

function ReferralEditor({
  referrals,
  onChange,
}: {
  referrals: CoachDecisions["referrals"];
  onChange: (r: CoachDecisions["referrals"]) => void;
}) {
  const add = () =>
    onChange([...referrals, { type: "", reason: "", urgency: "routine" }]);
  const remove = (i: number) =>
    onChange(referrals.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) =>
    onChange(
      referrals.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    );

  return (
    <div>
      <label className="block text-xs font-medium text-stone-700 mb-2">
        Referrals
      </label>
      {referrals.map((r, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 mb-2 items-start">
          <input
            value={r.type}
            onChange={(e) => update(i, "type", e.target.value)}
            placeholder="Specialist type"
            className="border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <input
            value={r.reason}
            onChange={(e) => update(i, "reason", e.target.value)}
            placeholder="Reason"
            className="border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <div className="flex gap-1">
            <select
              value={r.urgency}
              onChange={(e) => update(i, "urgency", e.target.value)}
              className="flex-1 border border-stone-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="routine">Routine</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={() => remove(i)}
              className="text-stone-400 hover:text-red-500 px-1"
            >
              x
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="text-xs text-stone-500 hover:text-stone-700 mt-1"
      >
        + Add referral
      </button>
    </div>
  );
}

// ─── Starting Habit Editor ──────────────────────────────────

function HabitEditor({
  habits,
  onChange,
}: {
  habits: string[];
  onChange: (h: string[]) => void;
}) {
  const add = () => onChange([...habits, ""]);
  const remove = (i: number) => onChange(habits.filter((_, idx) => idx !== i));
  const update = (i: number, value: string) =>
    onChange(habits.map((h, idx) => (idx === i ? value : h)));

  return (
    <div>
      <label className="block text-xs font-medium text-stone-700 mb-2">
        Starting Habits (3-5 for weeks 1-2)
      </label>
      {habits.map((h, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <span className="text-xs text-stone-400 mt-2 w-4">{i + 1}.</span>
          <input
            value={h}
            onChange={(e) => update(i, e.target.value)}
            placeholder="e.g. Include protein at every meal"
            className="flex-1 border border-stone-300 rounded px-2 py-1.5 text-sm"
          />
          <button
            onClick={() => remove(i)}
            className="text-stone-400 hover:text-red-500 px-1"
          >
            x
          </button>
        </div>
      ))}
      {habits.length < 5 && (
        <button
          onClick={add}
          className="text-xs text-stone-500 hover:text-stone-700 mt-1"
        >
          + Add habit
        </button>
      )}
    </div>
  );
}
