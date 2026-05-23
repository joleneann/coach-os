/**
 * Schema for the coach decision form (Step 2 of plan generation).
 *
 * After reviewing the intake summary, the coach fills this form to set
 * clinical parameters that drive plan generation. These decisions cannot
 * be auto-generated because they require clinical judgment.
 */

export interface CoachDecisions {
  // ── Nutrition ──
  calorieTarget: number; // e.g. 1800
  proteinGrams: number; // e.g. 90
  carbGrams: number; // e.g. 250
  fatGrams: number; // e.g. 60
  mealCount: number; // e.g. 4
  mealSchedule: string; // e.g. "Breakfast 8am, Lunch 1pm, Snack 5pm, Dinner 8pm"

  // ── Exercise ──
  workoutFrequency: number; // e.g. 3
  workoutSplit: string; // e.g. "Full body A/B" or "Upper/Lower" or "Push/Pull/Legs"
  workoutStyle: string; // e.g. "Dumbbell resistance" or "Bodyweight + bands" or "Full gym"
  neatTarget: string; // e.g. "6,000-10,000 steps daily"
  exerciseNotes: string; // e.g. "Avoid overhead pressing (shoulder injury)"

  // ── Lifestyle ──
  sleepTarget: string; // e.g. "7-8 hours, screens off by 10:30pm"
  stressManagement: string; // e.g. "Journaling 5 min before bed, walk after lunch"

  // ── Supplementation ──
  supplements: {
    name: string;
    dosage: string;
    timing: string;
    reason: string;
  }[];

  // ── Referrals ──
  referrals: {
    type: string; // e.g. "Endocrinologist", "Psychologist", "Physiotherapist"
    reason: string;
    urgency: "routine" | "soon" | "urgent";
  }[];

  // ── Starting Habits (for tracker) ──
  startingHabits: string[]; // 3-5 micro-behaviors for weeks 1-2

  // ── Plan Settings ──
  dashboardMode: "MINIMAL" | "STANDARD" | "DATA_HEAVY";
  programDurationWeeks: number; // e.g. 12
  adherenceTarget: number; // typically 80 or 90

  // ── Coach Notes ──
  internalNotes: string; // private notes, not shown to client
  toneGuidance: string; // e.g. "Warm but direct. Client is experienced, don't over-explain basics."
}

// Default values for the coach decision form
export const defaultCoachDecisions: CoachDecisions = {
  calorieTarget: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  mealCount: 4,
  mealSchedule: "",

  workoutFrequency: 3,
  workoutSplit: "",
  workoutStyle: "",
  neatTarget: "6,000-10,000 steps daily",
  exerciseNotes: "",

  sleepTarget: "",
  stressManagement: "",

  supplements: [],
  referrals: [],
  startingHabits: [],

  dashboardMode: "STANDARD",
  programDurationWeeks: 12,
  adherenceTarget: 80,

  internalNotes: "",
  toneGuidance: "",
};

// Section groupings for the form UI
export const decisionSections = [
  {
    key: "nutrition",
    title: "Nutrition Targets",
    description: "Set calorie and macro targets based on the client's goals and current intake.",
    fields: [
      "calorieTarget",
      "proteinGrams",
      "carbGrams",
      "fatGrams",
      "mealCount",
      "mealSchedule",
    ],
  },
  {
    key: "exercise",
    title: "Exercise Plan",
    description: "Define the workout structure based on their equipment access, experience, and goals.",
    fields: [
      "workoutFrequency",
      "workoutSplit",
      "workoutStyle",
      "neatTarget",
      "exerciseNotes",
    ],
  },
  {
    key: "lifestyle",
    title: "Lifestyle Adjustments",
    description: "Sleep and stress management recommendations.",
    fields: ["sleepTarget", "stressManagement"],
  },
  {
    key: "supplements",
    title: "Supplementation",
    description: "Based on bloodwork deficiencies, conditions, and current medications.",
    fields: ["supplements"],
  },
  {
    key: "referrals",
    title: "Referrals",
    description: "Specialist referrals flagged from intake data. Add or remove as needed.",
    fields: ["referrals"],
  },
  {
    key: "tracker",
    title: "Starting Habits",
    description: "Pick 3-5 micro-behaviors for the client to focus on in weeks 1-2. These become the daily check-in prompts.",
    fields: ["startingHabits"],
  },
  {
    key: "settings",
    title: "Plan Settings",
    description: "Program duration, dashboard mode, and tone guidance for AI generation.",
    fields: [
      "dashboardMode",
      "programDurationWeeks",
      "adherenceTarget",
      "toneGuidance",
      "internalNotes",
    ],
  },
] as const;

// Field metadata for rendering the form
export const fieldMeta: Record<
  string,
  {
    label: string;
    type: "number" | "text" | "textarea" | "select" | "array";
    placeholder?: string;
    helperText?: string;
    options?: string[];
    unit?: string;
  }
> = {
  calorieTarget: {
    label: "Daily Calorie Target",
    type: "number",
    placeholder: "e.g. 1800",
    unit: "kcal",
  },
  proteinGrams: {
    label: "Protein",
    type: "number",
    placeholder: "e.g. 90",
    unit: "g",
  },
  carbGrams: {
    label: "Carbohydrates",
    type: "number",
    placeholder: "e.g. 250",
    unit: "g",
  },
  fatGrams: {
    label: "Fat",
    type: "number",
    placeholder: "e.g. 60",
    unit: "g",
  },
  mealCount: {
    label: "Meals per Day",
    type: "number",
    placeholder: "e.g. 4",
  },
  mealSchedule: {
    label: "Meal Schedule",
    type: "textarea",
    placeholder: "e.g. Breakfast 8am, Lunch 1pm, Snack 5pm, Dinner 8pm",
  },
  workoutFrequency: {
    label: "Workouts per Week",
    type: "number",
    placeholder: "e.g. 3",
  },
  workoutSplit: {
    label: "Workout Split",
    type: "text",
    placeholder: "e.g. Full Body A/B, Upper/Lower, Push/Pull/Legs",
  },
  workoutStyle: {
    label: "Workout Style / Equipment",
    type: "text",
    placeholder: "e.g. Dumbbell resistance, Bodyweight + bands, Full gym",
  },
  neatTarget: {
    label: "NEAT / Step Target",
    type: "text",
    placeholder: "e.g. 6,000-10,000 steps daily",
  },
  exerciseNotes: {
    label: "Exercise Restrictions / Notes",
    type: "textarea",
    placeholder: "e.g. Avoid overhead pressing (shoulder injury). No running (knee pain).",
  },
  sleepTarget: {
    label: "Sleep Recommendations",
    type: "textarea",
    placeholder: "e.g. 7-8 hours, screens off by 10:30pm, no caffeine after 2pm",
  },
  stressManagement: {
    label: "Stress Management Recommendations",
    type: "textarea",
    placeholder: "e.g. 5 min journaling before bed, walk after lunch, breathing exercises",
  },
  dashboardMode: {
    label: "Dashboard Mode",
    type: "select",
    options: ["MINIMAL", "STANDARD", "DATA_HEAVY"],
    helperText: "Controls how much data the client sees in their dashboard.",
  },
  programDurationWeeks: {
    label: "Program Duration",
    type: "number",
    placeholder: "e.g. 12",
    unit: "weeks",
  },
  adherenceTarget: {
    label: "Adherence Target",
    type: "number",
    placeholder: "e.g. 80",
    unit: "%",
    helperText: "Shown in the plan. Typically 80-90%.",
  },
  toneGuidance: {
    label: "Tone Guidance for AI",
    type: "textarea",
    placeholder: "e.g. Warm but direct. Client is experienced, don't over-explain basics.",
    helperText: "Guides how the AI writes this client's plan. Not shown to client.",
  },
  internalNotes: {
    label: "Internal Notes",
    type: "textarea",
    placeholder: "Private notes for your reference. Not shown to client or used in plan generation.",
  },
};
