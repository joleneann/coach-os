"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CheckInCard from "@/components/CheckInCard";
import PARCycleIndicator from "@/components/PARCycleIndicator";
import HabitProgressView from "@/components/HabitProgressView";
import MetricTrendChart from "@/components/charts/MetricTrendChart";
import HabitAdherenceChart from "@/components/charts/HabitAdherenceChart";
import WeekAtAGlance from "@/components/charts/WeekAtAGlance";
import WeeklyReviewCard from "@/components/WeeklyReviewCard";
import { getWeekStartDate, formatWeekRange, getWeekEndDate } from "@/lib/weekly-review";

/**
 * ClientDashboard
 *
 * Tabbed dashboard: Today / Progress / Reviews / Plan
 * Mode-aware (MINIMAL/STANDARD/DATA_HEAVY).
 */

interface DashboardData {
  dashboardMode: string;
  recentCheckInDates: string[];
  hasCheckedInToday: boolean;
  habitWeekly: Record<string, { week: string; rate: number; frequency: string }[]>;
  metricDaily: Record<string, { date: string; value: number }[]>;
  metricLabels?: Record<string, { label: string; unit?: string }>;
  weeklySummaries: { week: string; daysCheckedIn: number; habitAdherenceAvg: number }[];
  habitProgress: {
    key: string;
    label: string;
    frequency: "daily" | "twice_weekly" | "weekly";
    weeklyAdherence: { week: string; rate: number }[];
    graduatedAt?: string;
  }[];
  latestReview: { weekStart: string; snippet: string; status: string } | null;
  pastReviews?: { weekStart: string; status: string }[];
}

interface Props {
  initialCheckedInToday: boolean;
  initialCheckedInDates: string[];
  initialHasWeeklyReview: boolean;
}

const TABS = [
  { key: "today", label: "Today" },
  { key: "progress", label: "Progress" },
  { key: "reviews", label: "Reviews" },
  { key: "plan", label: "Plan" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ClientDashboard({
  initialCheckedInToday,
  initialCheckedInDates,
  initialHasWeeklyReview,
}: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("today");

  const hasCheckedInToday = data?.hasCheckedInToday ?? initialCheckedInToday;
  const checkedInDates = data?.recentCheckInDates ?? initialCheckedInDates;
  const mode = data?.dashboardMode || "STANDARD";

  useEffect(() => {
    fetch("/api/dashboard?range=8w")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // For MINIMAL mode, only show Today + Reviews tabs
  const visibleTabs =
    mode === "MINIMAL"
      ? TABS.filter((t) => t.key === "today" || t.key === "reviews" || t.key === "plan")
      : TABS;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-stone-200 mb-6">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-stone-900"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
            {/* Notification dot for reviews */}
            {tab.key === "reviews" && data?.latestReview && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ====== TODAY TAB ====== */}
      {activeTab === "today" && (
        <div className="space-y-6">
          <CheckInCard
            hasCheckedInToday={hasCheckedInToday}
            checkedInDates={checkedInDates}
          />
          {mode !== "MINIMAL" && (
            <PARCycleIndicator
              hasCheckedInToday={hasCheckedInToday}
              hasWeeklyReview={initialHasWeeklyReview || !!data?.latestReview}
            />
          )}

          {/* Quick week summary */}
          {data && (
            <WeekAtAGlanceSection data={data} mode={mode} />
          )}
        </div>
      )}

      {/* ====== PROGRESS TAB ====== */}
      {activeTab === "progress" && data && (
        <div className="space-y-8">
          {/* Habit progress */}
          {data.habitProgress.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mb-3">
                Your habits
              </h2>
              <HabitProgressView habits={data.habitProgress} />
            </div>
          )}

          {/* Metric trends */}
          {Object.keys(data.metricDaily).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-stone-700 mb-3">
                Trends
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.metricDaily).map(([key, values]) => {
                  if (values.length < 2) return null;
                  const meta = data.metricLabels?.[key];
                  const trimmed =
                    mode === "DATA_HEAVY" ? values : values.slice(-28);
                  return (
                    <MetricTrendChart
                      key={key}
                      title={meta?.label || key}
                      unit={meta?.unit}
                      data={trimmed}
                      showAxis={mode === "DATA_HEAVY"}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Habit adherence charts (DATA_HEAVY only) */}
          {mode === "DATA_HEAVY" &&
            Object.keys(data.habitWeekly).length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-stone-700 mb-3">
                  Habit adherence by week
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.habitProgress.map((habit) => {
                    const weekData = data.habitWeekly[habit.key];
                    if (!weekData || weekData.length < 2) return null;
                    return (
                      <HabitAdherenceChart
                        key={habit.key}
                        habitLabel={habit.label}
                        data={weekData}
                      />
                    );
                  })}
                </div>
              </div>
            )}

          {/* Not enough data message */}
          {data.habitProgress.length === 0 &&
            Object.keys(data.metricDaily).length === 0 && (
              <div className="text-center py-12">
                <p className="text-stone-500 text-sm">
                  Keep checking in. Your progress will appear here after a few
                  days.
                </p>
              </div>
            )}
        </div>
      )}

      {/* ====== REVIEWS TAB ====== */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          {data?.latestReview ? (
            <ReviewsTab data={data} />
          ) : (
            <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
              <p className="text-stone-600 text-sm">
                Your coach will share your first weekly review soon.
              </p>
              <p className="text-stone-400 text-xs mt-2">
                Keep checking in daily. Your review will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ====== PLAN TAB ====== */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h2 className="text-base font-semibold text-stone-900 mb-2">
              Your Plan
            </h2>
            <p className="text-stone-600 text-sm mb-4">
              Your coach has prepared a personalized plan based on your intake
              responses.
            </p>
            <Link
              href="/client/plan"
              className="inline-block px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              View Full Plan
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function WeekAtAGlanceSection({
  data,
  mode,
}: {
  data: DashboardData;
  mode: string;
}) {
  const today = new Date();
  const weekStart = getWeekStartDate(today);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + "T12:00:00");
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const checkedIn = data.recentCheckInDates.includes(dateStr);

    days.push({ date: dateStr, dayLabel, checkedIn });
  }

  return <WeekAtAGlance days={days} showNumbers={mode === "DATA_HEAVY"} />;
}

function ReviewsTab({ data }: { data: DashboardData }) {
  if (!data.latestReview) return null;

  const weekEnd = getWeekEndDate(data.latestReview.weekStart);
  const weekLabel = formatWeekRange(data.latestReview.weekStart, weekEnd);

  return (
    <div className="space-y-6">
      {/* Link to full review page */}
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">
          Latest review
        </h2>
        <p className="text-sm text-stone-500 mb-1">Week of {weekLabel}</p>
        {data.latestReview.snippet && (
          <p className="text-sm text-stone-600 mb-4 line-clamp-3">
            {data.latestReview.snippet}...
          </p>
        )}
        <Link
          href="/client/review"
          className="inline-block px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
        >
          Read Full Review
        </Link>
      </div>

      {/* Past reviews (DATA_HEAVY) */}
      {data.pastReviews && data.pastReviews.length > 1 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
            Previous reviews
          </h3>
          <div className="space-y-2">
            {data.pastReviews.slice(1).map((pr) => {
              const prEnd = getWeekEndDate(pr.weekStart);
              const prLabel = formatWeekRange(pr.weekStart, prEnd);
              return (
                <div
                  key={pr.weekStart}
                  className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg"
                >
                  <span className="text-sm text-stone-600">
                    Week of {prLabel}
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
