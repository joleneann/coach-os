/**
 * Tracker template generation.
 *
 * When a coach approves a plan, this module converts their clinical decisions
 * (startingHabits, nutrition targets, dashboard mode, etc.) into a structured
 * list of fields that power the client's daily check-in form.
 *
 * The template defines WHAT the client sees. The dashboardMode on the User
 * record controls WHICH fields are visible (MINIMAL, STANDARD, DATA_HEAVY).
 */

import type { CoachDecisions } from "./coach-decision-schema";

// ── Types ──────────────────────────────────────────────────────

export interface TrackerField {
  key: string;
  type: "habit" | "metric" | "reflection" | "meal";
  label: string;
  inputType: "yes_partial_no" | "number" | "text" | "select";
  unit?: string;
  options?: string[];
  dashboardModes: ("MINIMAL" | "STANDARD" | "DATA_HEAVY")[];
  order: number;
  // Habit graduation fields
  frequency?: "daily" | "twice_weekly" | "weekly"; // defaults to "daily"
  graduatedAt?: string;    // ISO date when last graduated
  trackOnDays?: number[];  // 0=Sun..6=Sat — which days to show this field
}

// ── Reflection prompts (rotate by day of week) ─────────────────

export const reflectionPrompts = [
  "Anything you want to share with your coach?",
  "What felt good today?",
  "How are you feeling about things?",
  "Anything on your mind?",
  "What was the highlight of your day?",
  "How is your energy today?",
  "Anything your coach should know?",
];

/**
 * Get today's reflection prompt based on day of week.
 * Rotates through the list so it feels varied, not repetitive.
 */
export function getReflectionPrompt(date?: Date): string {
  const d = date || new Date();
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return reflectionPrompts[dayOfYear % reflectionPrompts.length];
}

// ── Slugify helper ─────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

// ── Template generation ────────────────────────────────────────

/**
 * Generate tracker template fields from coach decisions.
 *
 * Returns a flat array of TrackerField objects. The check-in UI filters
 * this list by the client's dashboardMode to decide which fields to show.
 */
export function generateTrackerTemplate(
  decisions: CoachDecisions
): TrackerField[] {
  const fields: TrackerField[] = [];
  let order = 0;

  // ── Habits (from startingHabits) ──
  // These are the core of every check-in, visible in ALL modes.
  for (const habit of decisions.startingHabits || []) {
    if (!habit.trim()) continue;
    fields.push({
      key: `habit_${slugify(habit)}`,
      type: "habit",
      label: habit.trim(),
      inputType: "yes_partial_no",
      dashboardModes: ["MINIMAL", "STANDARD", "DATA_HEAVY"],
      order: order++,
      frequency: "daily",
    });
  }

  // ── Movement / Steps ──
  // MINIMAL gets a simple habit question. STANDARD+ gets a number input.
  if (decisions.neatTarget) {
    // Parse step numbers from target like "6,000-10,000 steps daily"
    const stepMatch = decisions.neatTarget.match(
      /(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)/
    );

    fields.push({
      key: "metric_movement",
      type: "habit",
      label: "Did you move your body today?",
      inputType: "yes_partial_no",
      dashboardModes: ["MINIMAL"],
      order: order++,
    });

    fields.push({
      key: "metric_steps",
      type: "metric",
      label: stepMatch
        ? `Steps (target: ${decisions.neatTarget})`
        : "Steps today",
      inputType: "number",
      unit: "steps",
      dashboardModes: ["STANDARD", "DATA_HEAVY"],
      order: order++,
    });
  }

  // ── Water intake ──
  fields.push({
    key: "metric_water",
    type: "metric",
    label: "Glasses of water today",
    inputType: "number",
    unit: "glasses",
    dashboardModes: ["STANDARD", "DATA_HEAVY"],
    order: order++,
  });

  // ── Sleep quality ──
  fields.push({
    key: "metric_sleep",
    type: "metric",
    label: "How did you sleep last night?",
    inputType: "select",
    options: ["Restful", "Okay", "Rough"],
    dashboardModes: ["STANDARD", "DATA_HEAVY"],
    order: order++,
  });

  // ── Meal logging (DATA_HEAVY only) ──
  const mealCount = decisions.mealCount || 0;
  if (mealCount > 0) {
    const mealLabels = ["breakfast", "lunch", "snack", "dinner", "snack 2"];
    for (let i = 0; i < mealCount; i++) {
      const mealName = mealLabels[i] || `meal ${i + 1}`;
      fields.push({
        key: `meal_${i + 1}`,
        type: "meal",
        label: `What did you have for ${mealName}?`,
        inputType: "text",
        dashboardModes: ["DATA_HEAVY"],
        order: order++,
      });
    }
  }

  // ── Reflection (always present, always last) ──
  fields.push({
    key: "reflection",
    type: "reflection",
    label: "Anything you want to share with your coach?",
    inputType: "text",
    dashboardModes: ["MINIMAL", "STANDARD", "DATA_HEAVY"],
    order: order++,
  });

  return fields;
}
