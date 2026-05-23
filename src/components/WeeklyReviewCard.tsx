"use client";

import { useState } from "react";

/**
 * WeeklyReviewCard
 *
 * Shared renderer for the three-part weekly review synthesis.
 * Used by both coach (edit mode) and client (read-only mode).
 *
 * Stone/amber palette. No red/green. No guilt language.
 */

interface SynthesisSection {
  title: string;
  content: string;
}

interface ReviewData {
  id: string;
  weekStartDate: string;
  status: "GENERATING" | "COACH_REVIEW" | "APPROVED" | "DELIVERED";
  synthesisData: {
    sections?: SynthesisSection[];
    generationNote?: string;
    generationError?: string;
  } | null;
  coachFeedback: string | null;
  approvedAt?: string | null;
  deliveredAt?: string | null;
}

interface Props {
  review: ReviewData;
  weekLabel: string;
  mode: "coach" | "client";
  onApprove?: (reviewId: string, feedback: string, editedSections: SynthesisSection[]) => Promise<void>;
  onDeliver?: (reviewId: string) => Promise<void>;
}

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  GENERATING: { label: "Generating", bg: "bg-stone-100", text: "text-stone-500" },
  COACH_REVIEW: { label: "Ready for review", bg: "bg-amber-50", text: "text-amber-700" },
  APPROVED: { label: "Approved", bg: "bg-amber-100", text: "text-amber-800" },
  DELIVERED: { label: "Delivered", bg: "bg-emerald-50", text: "text-emerald-700" },
};

const sectionIcons: Record<string, string> = {
  "Your week": "\u{1F4C5}",
  "What stood out": "\u{2728}",
  "For next week": "\u{1F3AF}",
};

export default function WeeklyReviewCard({
  review,
  weekLabel,
  mode,
  onApprove,
  onDeliver,
}: Props) {
  const sections = review.synthesisData?.sections || [];
  const [editableSections, setEditableSections] = useState<SynthesisSection[]>(
    sections.map((s) => ({ ...s }))
  );
  const [feedback, setFeedback] = useState(review.coachFeedback || "");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const isEditable = mode === "coach" && review.status === "COACH_REVIEW";
  const canApprove = mode === "coach" && review.status === "COACH_REVIEW";
  const canDeliver = mode === "coach" && review.status === "APPROVED";

  const status = statusLabels[review.status] || statusLabels.GENERATING;

  function handleSectionEdit(index: number, content: string) {
    setEditableSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], content };
      return next;
    });
  }

  async function handleApprove() {
    if (!onApprove) return;
    setLoading(true);
    try {
      await onApprove(review.id, feedback, editableSections);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeliver() {
    if (!onDeliver) return;
    setLoading(true);
    try {
      await onDeliver(review.id);
    } finally {
      setLoading(false);
    }
  }

  const displaySections = editing ? editableSections : sections;

  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-900">
            Week of {weekLabel}
          </h3>
          {review.synthesisData?.generationNote && mode === "coach" && (
            <p className="text-xs text-amber-600 mt-1">
              {review.synthesisData.generationNote}
            </p>
          )}
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      {/* Sections */}
      <div className="px-6 py-5 space-y-5">
        {displaySections.map((section, i) => (
          <div key={section.title}>
            <h4 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
              <span>{sectionIcons[section.title] || "\u{1F4DD}"}</span>
              {section.title}
            </h4>
            {editing && isEditable ? (
              <textarea
                value={editableSections[i]?.content || ""}
                onChange={(e) => handleSectionEdit(i, e.target.value)}
                className="w-full text-sm text-stone-600 leading-relaxed border border-stone-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y min-h-[80px]"
                rows={4}
              />
            ) : (
              <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                {section.content || (
                  <span className="text-stone-400 italic">
                    No content yet.
                  </span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Coach feedback section */}
      {(mode === "coach" || (mode === "client" && review.coachFeedback)) && (
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50">
          <h4 className="text-sm font-semibold text-stone-700 mb-2">
            {mode === "client" ? "From your coach" : "Your note to the client"}
          </h4>
          {mode === "coach" && isEditable ? (
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add a personal note (optional). This shows below the review."
              className="w-full text-sm text-stone-600 border border-stone-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
              rows={3}
            />
          ) : (
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
              {review.coachFeedback || (
                <span className="text-stone-400 italic">No note added.</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Actions (coach only) */}
      {mode === "coach" && (canApprove || canDeliver) && (
        <div className="px-6 py-4 border-t border-stone-200 flex items-center gap-3">
          {canApprove && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Edit before approving
            </button>
          )}
          {canApprove && editing && (
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm font-medium text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel edit
            </button>
          )}
          {canApprove && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Approving..." : "Approve"}
            </button>
          )}
          {canDeliver && (
            <button
              onClick={handleDeliver}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Delivering..." : "Deliver to Client"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
