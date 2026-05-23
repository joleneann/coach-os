/**
 * Weekly Review — Aggregation Logic
 *
 * Pure functions for aggregating check-in data into structured insights.
 * No API dependencies. Used by the review generation route.
 */

import type { TrackerField } from "./tracker-template";

// ---- Types ----

export interface HabitSummary {
  key: string;
  label: string;
  yes: number;
  partly: number;
  notToday: number;
  total: number;
}

export interface MetricSummary {
  key: string;
  label: string;
  unit?: string;
  values: { date: string; value: number | string }[];
  average?: number;
}

export interface WeeklyAggregation {
  weekStart: string;
  weekEnd: string;
  daysCheckedIn: number;
  totalDays: number;
  habits: HabitSummary[];
  metrics: MetricSummary[];
  reflections: { date: string; text: string }[];
  meals: { date: string; text: string }[];
}

export interface Citation {
  type: "checkin" | "plan";
  date?: string;
  fieldKey?: string;
  fieldLabel?: string;
  value?: string | number;
  planSection?: string;
  planText?: string;
}

// ---- Date helpers (Monday-based weeks) ----

/** Returns YYYY-MM-DD of the Monday for the given date's week. */
export function getWeekStartDate(date?: Date): string {
  const d = new Date(date || new Date());
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // How many days back to Monday
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

/** Returns YYYY-MM-DD of the Sunday for a given Monday week start. */
export function getWeekEndDate(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00.000Z");
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

/** Format a week range for display: "April 7 - April 13" */
export function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart + "T00:00:00.000Z");
  const end = new Date(weekEnd + "T00:00:00.000Z");
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = end.toLocaleDateString("en-US", opts);
  return `${startStr} - ${endStr}`;
}

// ---- Aggregation ----

interface CheckInRecord {
  date: Date;
  responses: Record<string, unknown>;
}

/**
 * Aggregate a week of check-ins against the tracker template.
 * Returns structured summaries for habits, metrics, reflections, and meals.
 */
export function aggregateWeeklyCheckIns(
  checkIns: CheckInRecord[],
  templateFields: TrackerField[]
): WeeklyAggregation {
  // Determine week range from check-ins or default to current week
  const dates = checkIns.map((c) => c.date.toISOString().split("T")[0]).sort();
  const weekStart =
    dates.length > 0 ? getWeekStartDate(new Date(dates[0])) : getWeekStartDate();
  const weekEnd = getWeekEndDate(weekStart);

  const habitFields = templateFields.filter((f) => f.type === "habit");
  const metricFields = templateFields.filter((f) => f.type === "metric");
  const reflectionFields = templateFields.filter((f) => f.type === "reflection");
  const mealFields = templateFields.filter((f) => f.type === "meal");

  // Habits: count yes/partly/notToday per field
  const habits: HabitSummary[] = habitFields.map((field) => {
    const summary: HabitSummary = {
      key: field.key,
      label: field.label,
      yes: 0,
      partly: 0,
      notToday: 0,
      total: 0,
    };
    for (const checkIn of checkIns) {
      const val = checkIn.responses[field.key];
      if (val === "yes") {
        summary.yes++;
        summary.total++;
      } else if (val === "partly") {
        summary.partly++;
        summary.total++;
      } else if (val === "not_today") {
        summary.notToday++;
        summary.total++;
      }
      // If undefined/null, field wasn't answered — don't count
    }
    return summary;
  });

  // Metrics: collect values, compute average for numeric
  const metrics: MetricSummary[] = metricFields.map((field) => {
    const values: { date: string; value: number | string }[] = [];
    for (const checkIn of checkIns) {
      const val = checkIn.responses[field.key];
      if (val !== undefined && val !== null && val !== "") {
        values.push({
          date: checkIn.date.toISOString().split("T")[0],
          value: val as number | string,
        });
      }
    }
    const numericValues = values
      .map((v) => Number(v.value))
      .filter((n) => !isNaN(n));
    const average =
      numericValues.length > 0
        ? Math.round(
            (numericValues.reduce((a, b) => a + b, 0) / numericValues.length) *
              10
          ) / 10
        : undefined;

    return {
      key: field.key,
      label: field.label,
      unit: field.unit,
      values,
      average,
    };
  });

  // Reflections: collect non-empty text entries
  const reflections: { date: string; text: string }[] = [];
  for (const checkIn of checkIns) {
    for (const field of reflectionFields) {
      const val = checkIn.responses[field.key];
      if (val && typeof val === "string" && val.trim().length > 0) {
        reflections.push({
          date: checkIn.date.toISOString().split("T")[0],
          text: val.trim(),
        });
      }
    }
  }

  // Meals: collect non-empty meal entries
  const meals: { date: string; text: string }[] = [];
  for (const checkIn of checkIns) {
    for (const field of mealFields) {
      const val = checkIn.responses[field.key];
      if (val && typeof val === "string" && val.trim().length > 0) {
        meals.push({
          date: checkIn.date.toISOString().split("T")[0],
          text: `${field.label}: ${val.trim()}`,
        });
      }
    }
  }

  return {
    weekStart,
    weekEnd,
    daysCheckedIn: checkIns.length,
    totalDays: 7,
    habits,
    metrics,
    reflections,
    meals,
  };
}

// ---- Citation builder ----

/**
 * Build citations linking aggregated data back to specific check-in entries.
 * Used to ground every claim in the synthesis with source data.
 */
export function buildCitations(
  checkIns: CheckInRecord[],
  templateFields: TrackerField[],
  planContext?: { startingHabits?: string[]; planSections?: { sectionType: string; content: string }[] }
): Citation[] {
  const citations: Citation[] = [];

  // Cite each non-empty check-in response
  for (const checkIn of checkIns) {
    const dateStr = checkIn.date.toISOString().split("T")[0];
    for (const field of templateFields) {
      const val = checkIn.responses[field.key];
      if (val !== undefined && val !== null && val !== "") {
        citations.push({
          type: "checkin",
          date: dateStr,
          fieldKey: field.key,
          fieldLabel: field.label,
          value: val as string | number,
        });
      }
    }
  }

  // Cite relevant plan sections if available
  if (planContext?.planSections) {
    const relevantTypes = [
      "NUTRITION_GUIDANCE",
      "EXERCISE_PLAN",
      "BEHAVIOR_ECOSYSTEM",
      "STRESS_MENTAL_HEALTH",
      "LIFESTYLE_ENVIRONMENT",
    ];
    for (const section of planContext.planSections) {
      if (relevantTypes.includes(section.sectionType) && section.content) {
        citations.push({
          type: "plan",
          planSection: section.sectionType,
          planText: section.content.slice(0, 200), // Truncate for prompt size
        });
      }
    }
  }

  return citations;
}
