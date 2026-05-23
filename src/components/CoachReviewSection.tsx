"use client";

import { useState, useCallback, useEffect } from "react";
import WeeklyReviewCard from "./WeeklyReviewCard";
import { formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * CoachReviewSection
 *
 * Interactive component on the coach's client detail page.
 * Handles: generate review, view/edit review, approve, deliver.
 */

interface ReviewData {
  id: string;
  weekStartDate: string;
  status: "GENERATING" | "COACH_REVIEW" | "APPROVED" | "DELIVERED";
  synthesisData: {
    sections?: { title: string; content: string }[];
    generationNote?: string;
    generationError?: string;
  } | null;
  coachFeedback: string | null;
  approvedAt?: string | null;
  deliveredAt?: string | null;
}

interface Props {
  clientId: string;
  currentWeekStart: string;
  hasCheckInsThisWeek: boolean;
  initialReview: ReviewData | null;
  pastReviews: {
    id: string;
    weekStartDate: string;
    status: string;
  }[];
}

export default function CoachReviewSection({
  clientId,
  currentWeekStart,
  hasCheckInsThisWeek,
  initialReview,
  pastReviews: initialPastReviews,
}: Props) {
  const [review, setReview] = useState<ReviewData | null>(initialReview);
  const [pastReviews] = useState(initialPastReviews);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracker suggestions
  interface Suggestion {
    type: "graduate" | "demote" | "add_habit" | "remove_habit";
    fieldKey?: string;
    newFrequency?: "daily" | "twice_weekly" | "weekly";
    reason: string;
    source: string;
  }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  const [applyingIdx, setApplyingIdx] = useState<number | null>(null);

  // Fetch suggestions when review exists
  useEffect(() => {
    if (!review) return;
    fetch(`/api/review/suggestions?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.suggestions) setSuggestions(data.suggestions);
      })
      .catch(() => {});
  }, [clientId, review]);

  const handleApproveSuggestion = useCallback(
    async (idx: number, suggestion: Suggestion) => {
      setApplyingIdx(idx);
      try {
        const res = await fetch("/api/tracker/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            changes: [suggestion],
          }),
        });
        if (res.ok) {
          setAppliedSuggestions((prev) => new Set([...prev, idx]));
        }
      } finally {
        setApplyingIdx(null);
      }
    },
    [clientId]
  );

  const weekEnd = getWeekEndDate(currentWeekStart);
  const weekLabel = formatWeekRange(currentWeekStart, weekEnd);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, weekStart: currentWeekStart }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate review");
        return;
      }
      setReview({
        id: data.review.id,
        weekStartDate: data.review.weekStartDate,
        status: data.review.status,
        synthesisData: data.review.synthesisData,
        coachFeedback: null,
      });
    } catch {
      setError("Failed to generate review. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [clientId, currentWeekStart]);

  const handleApprove = useCallback(
    async (
      reviewId: string,
      feedback: string,
      editedSections: { title: string; content: string }[]
    ) => {
      const res = await fetch("/api/review/approve?action=approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          coachFeedback: feedback || undefined,
          synthesisData: { sections: editedSections },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve");
      }
      setReview((prev) =>
        prev
          ? {
              ...prev,
              status: "APPROVED",
              coachFeedback: feedback || null,
              synthesisData: { sections: editedSections },
            }
          : null
      );
    },
    []
  );

  const handleDeliver = useCallback(async (reviewId: string) => {
    const res = await fetch("/api/review/approve?action=deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to deliver");
    }
    setReview((prev) => (prev ? { ...prev, status: "DELIVERED" } : null));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-700">Weekly Review</h2>
        {!review && hasCheckInsThisWeek && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate This Week's Review"}
          </button>
        )}
        {!review && !hasCheckInsThisWeek && (
          <p className="text-xs text-stone-400">
            No check-ins this week yet. Review can be generated once the client
            checks in.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {review && (
        <WeeklyReviewCard
          review={review}
          weekLabel={weekLabel}
          mode="coach"
          onApprove={handleApprove}
          onDeliver={handleDeliver}
        />
      )}

      {/* Tracker suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide">
            Suggested tracker changes
          </h3>
          {suggestions.map((s, idx) => {
            const isApplied = appliedSuggestions.has(idx);
            const isApplying = applyingIdx === idx;
            const isGraduation = s.type === "graduate";
            const isDemotion = s.type === "demote";

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isApplied
                    ? "bg-stone-50 border-stone-200 opacity-60"
                    : isGraduation
                      ? "bg-amber-50 border-amber-200"
                      : "bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-700">
                      {isGraduation ? "\u2B06" : isDemotion ? "\u2B07" : "\u2795"}{" "}
                      {s.type === "graduate"
                        ? "Graduate"
                        : s.type === "demote"
                          ? "Resume daily"
                          : s.type === "add_habit"
                            ? "Add habit"
                            : "Remove habit"}
                    </span>
                    {s.newFrequency && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        {s.newFrequency.replace("_", "-")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{s.reason}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  {isApplied ? (
                    <span className="text-xs text-stone-400 font-medium">
                      Applied
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveSuggestion(idx, s)}
                        disabled={isApplying}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 disabled:opacity-50"
                      >
                        {isApplying ? "..." : "Apply"}
                      </button>
                      <button
                        onClick={() =>
                          setSuggestions((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="px-3 py-1.5 text-xs font-medium text-stone-400 border border-stone-200 rounded-lg hover:bg-stone-50"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
            Past reviews
          </h3>
          <div className="space-y-2">
            {pastReviews.map((pr) => {
              const prEnd = getWeekEndDate(pr.weekStartDate);
              const prLabel = formatWeekRange(pr.weekStartDate, prEnd);
              const statusStyle =
                pr.status === "DELIVERED"
                  ? "bg-emerald-50 text-emerald-700"
                  : pr.status === "APPROVED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-500";
              return (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg"
                >
                  <span className="text-sm text-stone-600">
                    Week of {prLabel}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle}`}
                  >
                    {pr.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
