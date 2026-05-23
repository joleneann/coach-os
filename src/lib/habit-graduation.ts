/**
 * Habit Graduation System
 *
 * Evaluates habit adherence over time and recommends frequency changes.
 *
 * Lifecycle:
 *   daily → twice_weekly → weekly
 *
 * Graduation criteria:
 *   daily → twice_weekly:  80%+ adherence each week for 3 consecutive weeks
 *   twice_weekly → weekly: 100% on twice-weekly checks for 3 consecutive weeks
 *
 * Demotion criteria:
 *   twice_weekly → daily:  <100% on twice-weekly checks in any week
 *   weekly → twice_weekly: <100% on the weekly check in any week
 *
 * "Adherence" counts "yes" and "partly" as adherent. "not_today" and missing = not adherent.
 * We only count days the client actually checked in, not all 7 days.
 */

import type { TrackerField } from "./tracker-template";

// ── Types ──

export interface GraduationRecommendation {
  fieldKey: string;
  fieldLabel: string;
  currentFrequency: "daily" | "twice_weekly" | "weekly";
  recommendedFrequency: "daily" | "twice_weekly" | "weekly";
  reason: string;
  adherenceData: { week: string; rate: number }[];
}

interface CheckInRecord {
  date: Date;
  responses: Record<string, unknown>;
}

// ── Default tracking days ──

/** Monday=1, Thursday=4 (0-indexed: Sun=0) */
export const DEFAULT_TWICE_WEEKLY_DAYS = [1, 4];
/** Wednesday=3 */
export const DEFAULT_WEEKLY_DAYS = [3];

// ── Helpers ──

function getWeekKey(date: Date): string {
  // Week key = the Monday of that week (YYYY-MM-DD)
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

function isAdherent(value: unknown): boolean {
  return value === "yes" || value === "partly";
}

// ── Core evaluation ──

/**
 * Evaluate all habit fields and return graduation/demotion recommendations.
 *
 * @param habits - Habit-type TrackerFields (with frequency info)
 * @param checkIns - Last 4+ weeks of check-in data, sorted by date ascending
 * @returns Array of recommendations (only includes habits that should change)
 */
export function evaluateHabitGraduation(
  habits: TrackerField[],
  checkIns: CheckInRecord[]
): GraduationRecommendation[] {
  const recommendations: GraduationRecommendation[] = [];

  for (const habit of habits) {
    if (habit.type !== "habit") continue;

    const frequency = habit.frequency || "daily";
    const trackOnDays = habit.trackOnDays;

    // Group check-ins by week
    const weekMap = new Map<string, { checked: number; adherent: number }>();

    for (const ci of checkIns) {
      const weekKey = getWeekKey(ci.date);
      const dayOfWeek = ci.date.getDay(); // 0=Sun..6=Sat

      // For graduated habits, only count tracking days
      if (frequency !== "daily" && trackOnDays && trackOnDays.length > 0) {
        if (!trackOnDays.includes(dayOfWeek)) continue;
      }

      const val = ci.responses[habit.key];
      if (val === undefined || val === null) continue; // Field not answered

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, { checked: 0, adherent: 0 });
      }
      const week = weekMap.get(weekKey)!;
      week.checked++;
      if (isAdherent(val)) week.adherent++;
    }

    // Convert to sorted array (most recent last)
    const weeks = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([weekKey, data]) => ({
        week: weekKey,
        rate: data.checked > 0 ? Math.round((data.adherent / data.checked) * 100) : 0,
        checked: data.checked,
        adherent: data.adherent,
      }));

    if (weeks.length === 0) continue;

    const adherenceData = weeks.map((w) => ({ week: w.week, rate: w.rate }));

    if (frequency === "daily") {
      // Check for graduation to twice_weekly
      // Need 3+ weeks of data, each with 80%+ adherence
      if (weeks.length >= 3) {
        const lastThree = weeks.slice(-3);
        const allAbove80 = lastThree.every((w) => w.rate >= 80);
        if (allAbove80) {
          const avgRate = Math.round(
            lastThree.reduce((s, w) => s + w.rate, 0) / 3
          );
          recommendations.push({
            fieldKey: habit.key,
            fieldLabel: habit.label,
            currentFrequency: "daily",
            recommendedFrequency: "twice_weekly",
            reason: `${avgRate}% average adherence over last 3 weeks (${lastThree.map((w) => w.rate + "%").join(", ")})`,
            adherenceData,
          });
        }
      }
    } else if (frequency === "twice_weekly") {
      // Check for demotion back to daily
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek && lastWeek.rate < 100) {
        recommendations.push({
          fieldKey: habit.key,
          fieldLabel: habit.label,
          currentFrequency: "twice_weekly",
          recommendedFrequency: "daily",
          reason: `${lastWeek.rate}% on twice-weekly checks this week. Needs more daily practice.`,
          adherenceData,
        });
      } else if (weeks.length >= 3) {
        // Check for graduation to weekly
        const lastThree = weeks.slice(-3);
        const allPerfect = lastThree.every((w) => w.rate === 100);
        if (allPerfect) {
          recommendations.push({
            fieldKey: habit.key,
            fieldLabel: habit.label,
            currentFrequency: "twice_weekly",
            recommendedFrequency: "weekly",
            reason: `100% on twice-weekly checks for 3 consecutive weeks`,
            adherenceData,
          });
        }
      }
    } else if (frequency === "weekly") {
      // Check for demotion back to twice_weekly
      const lastWeek = weeks[weeks.length - 1];
      if (lastWeek && lastWeek.rate < 100) {
        recommendations.push({
          fieldKey: habit.key,
          fieldLabel: habit.label,
          currentFrequency: "weekly",
          recommendedFrequency: "twice_weekly",
          reason: `Not maintained on weekly check. Needs more frequent tracking.`,
          adherenceData,
        });
      }
    }
  }

  return recommendations;
}

/**
 * Apply a graduation/demotion to a TrackerField.
 * Returns a new field object with updated frequency and trackOnDays.
 */
export function applyGraduation(
  field: TrackerField,
  newFrequency: "daily" | "twice_weekly" | "weekly"
): TrackerField {
  const updated = { ...field, frequency: newFrequency };

  if (newFrequency === "daily") {
    delete updated.trackOnDays;
    delete updated.graduatedAt;
  } else if (newFrequency === "twice_weekly") {
    updated.trackOnDays = field.trackOnDays?.length === 2
      ? field.trackOnDays // Keep existing days if already set
      : DEFAULT_TWICE_WEEKLY_DAYS;
    updated.graduatedAt = new Date().toISOString().split("T")[0];
  } else if (newFrequency === "weekly") {
    updated.trackOnDays = field.trackOnDays?.length === 1
      ? field.trackOnDays
      : DEFAULT_WEEKLY_DAYS;
    updated.graduatedAt = new Date().toISOString().split("T")[0];
  }

  return updated;
}

/**
 * Check if a habit field should be shown today based on its frequency and trackOnDays.
 */
export function shouldShowHabitToday(
  field: TrackerField,
  date?: Date
): boolean {
  const frequency = field.frequency || "daily";
  if (frequency === "daily") return true;

  const dayOfWeek = (date || new Date()).getDay(); // 0=Sun..6=Sat
  const trackOnDays = field.trackOnDays || [];

  return trackOnDays.includes(dayOfWeek);
}
