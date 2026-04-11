export type QuestionType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "scale"
  | "yesno"
  | "textarea"
  | "date"
  | "voice";

export interface IntakeQuestion {
  key: string;
  label: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  voiceEnabled?: boolean;
  condition?: { questionKey: string; value: unknown };
  subQuestions?: IntakeQuestion[];
  helperText?: string;
}

export interface IntakeSection {
  key: string;
  title: string;
  description: string;
  questions: IntakeQuestion[];
}

// ─────────────────────────────────────────────────────────
// This file contains PLACEHOLDER questions only.
// The real clinical intake schema is in intake-schema.private.ts
// which is gitignored and never committed to the repository.
//
// If you're running Coach OS for development, create your own
// intake-schema.private.ts exporting `intakeSections` with
// the same structure as the placeholder below.
// ─────────────────────────────────────────────────────────

let _sections: IntakeSection[];

try {
  // Load private schema if it exists (real clinical questions)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _sections = require("./intake-schema.private").intakeSections;
} catch {
  // Fall back to placeholder schema for development/demo
  _sections = [
    {
      key: "basic_info",
      title: "Basic Information",
      description: "Basic demographic and body composition data.",
      questions: [
        { key: "name", label: "Full Name", type: "text", required: true },
        { key: "age", label: "Age", type: "number", required: true },
        {
          key: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female", "Non-binary", "Prefer not to say"],
          required: true,
        },
        { key: "height", label: "Height (cm)", type: "number", required: true },
        { key: "weight", label: "Current Weight (kg)", type: "number", required: true },
      ],
    },
    {
      key: "goals",
      title: "Your Goals",
      description: "What are you hoping to achieve?",
      questions: [
        {
          key: "main_goal",
          label: "What is your primary health goal?",
          type: "textarea",
          required: true,
          voiceEnabled: true,
        },
        {
          key: "timeline",
          label: "Do you have a specific timeline in mind?",
          type: "textarea",
        },
      ],
    },
    {
      key: "habits",
      title: "Current Habits",
      description: "Tell us about your daily routine.",
      questions: [
        {
          key: "exercise",
          label: "Do you currently exercise?",
          type: "yesno",
          required: true,
        },
        {
          key: "exercise_type",
          label: "What type of exercise?",
          type: "textarea",
          condition: { questionKey: "exercise", value: true },
        },
        {
          key: "sleep_hours",
          label: "How many hours of sleep do you get per night?",
          type: "number",
        },
        {
          key: "stress_level",
          label: "How would you rate your stress level?",
          type: "scale",
          helperText: "1 = very low, 10 = extremely stressed",
        },
      ],
    },
  ];
}

export const intakeSections: IntakeSection[] = _sections;
