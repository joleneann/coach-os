"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PlanContent from "@/components/PlanContent";

interface PlanSection {
  id: string;
  sectionType: string;
  content: string;
  order: number;
}

// Map section types to display titles
const sectionTitles: Record<string, string> = {
  summary_card: "Summary Card",
  coaching_cycle: "Your Coaching Cycle",
  starting_point: "Your Starting Point",
  behavior_ecosystem: "Your Behavior Ecosystem",
  nutrition: "Nutrition",
  exercise: "Exercise",
  lifestyle: "Lifestyle & Environment",
  mental_health: "Stress & Mental Health",
  blood_report: "Blood Report",
  gut_health: "Gut Health",
  supplementation: "Supplementation",
  referrals: "Referrals",
  what_happens_next: "What Happens Next",
};

export default function PlanReviewPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [sections, setSections] = useState<PlanSection[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/plan/view?clientId=${clientId}`);
        if (!res.ok) throw new Error("Failed to load plan");
        const data = await res.json();
        setSections(data.sections || []);
        setPlanId(data.planId);
        setPlanStatus(data.status);
        setClientName(data.clientName || "Client");
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clientId]);

  const startEditing = (section: PlanSection) => {
    setEditingSection(section.sectionType);
    setEditContent(section.content);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent("");
  };

  const saveEdit = useCallback(async () => {
    if (!planId || !editingSection) return;
    setSaving(true);
    try {
      const res = await fetch("/api/plan/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          sectionType: editingSection,
          content: editContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to save edit");

      // Update local state
      setSections((prev) =>
        prev.map((s) =>
          s.sectionType === editingSection
            ? { ...s, content: editContent }
            : s
        )
      );
      setEditingSection(null);
      setEditContent("");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [planId, editingSection, editContent]);

  const approvePlan = useCallback(async () => {
    if (!planId) return;
    setApproving(true);
    try {
      const res = await fetch("/api/plan/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) throw new Error("Failed to approve plan");
      setPlanStatus("APPROVED");
      router.push(`/coach/clients/${clientId}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setApproving(false);
    }
  }, [planId, clientId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500">Loading plan...</p>
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
              Plan Review
            </h1>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                planStatus === "APPROVED"
                  ? "bg-green-50 text-green-700"
                  : planStatus === "COACH_REVIEW"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700"
              }`}
            >
              {planStatus.replace("_", " ")}
            </span>
          </div>
          {planStatus !== "APPROVED" && planStatus !== "DELIVERED" && (
            <div className="flex items-center gap-3">
              <Link
                href={`/coach/clients/${clientId}/plan`}
                className="px-4 py-2 text-sm border border-stone-300 rounded-lg hover:bg-stone-100"
              >
                Edit Decisions
              </Link>
              <button
                onClick={approvePlan}
                disabled={approving}
                className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {approving ? "Approving..." : "Approve Plan"}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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

        {sections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500">
              No plan sections generated yet.
            </p>
            <Link
              href={`/coach/clients/${clientId}/plan`}
              className="text-sm text-stone-600 underline mt-2 block"
            >
              Go to plan builder
            </Link>
          </div>
        ) : (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.id}
                className="bg-white border border-stone-200 rounded-lg"
              >
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-stone-900">
                    {sectionTitles[section.sectionType] ||
                      section.sectionType}
                  </h2>
                  {planStatus !== "APPROVED" &&
                    planStatus !== "DELIVERED" &&
                    editingSection !== section.sectionType && (
                      <button
                        onClick={() => startEditing(section)}
                        className="text-xs text-stone-500 hover:text-stone-700"
                      >
                        Edit
                      </button>
                    )}
                </div>

                <div className="px-6 py-4">
                  {editingSection === section.sectionType ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={20}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-400"
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1.5 text-xs border border-stone-300 rounded hover:bg-stone-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="px-3 py-1.5 text-xs bg-stone-900 text-white rounded hover:bg-stone-800 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PlanContent content={section.content} />
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
