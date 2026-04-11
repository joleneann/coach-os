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

export const intakeSections: IntakeSection[] = [
  // ─── Section 1: Basic Info ────────────────────────────────
  {
    key: "basic_info",
    title: "Basic Information",
    description:
      "Let's start with some basics. This helps us understand your body composition and set appropriate targets.",
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
      {
        key: "height",
        label: "Height (cm)",
        type: "number",
        required: true,
      },
      {
        key: "weight",
        label: "Current Weight (kg)",
        type: "number",
        required: true,
      },
      {
        key: "waist",
        label: "Waist circumference (inches)",
        type: "number",
      },
      {
        key: "hip",
        label: "Hip circumference (inches)",
        type: "number",
      },
      { key: "ethnicity", label: "Ethnicity", type: "text" },
      {
        key: "occupation",
        label: "Occupation",
        type: "text",
        helperText: "This helps us understand your daily activity level and schedule",
      },
      {
        key: "dietary_preference",
        label: "Dietary Preference",
        type: "select",
        options: [
          "Vegetarian",
          "Non-vegetarian",
          "Vegan",
          "Eggetarian",
          "Pescatarian",
          "Other",
        ],
      },
    ],
  },

  // ─── Section 2: Goals ─────────────────────────────────────
  {
    key: "goals",
    title: "Your Goals",
    description:
      "Understanding what you want to achieve helps us design the right plan for you. Be as specific as you can.",
    questions: [
      {
        key: "goal_physical",
        label: "Physical Health Goal",
        type: "textarea",
        placeholder: "e.g., Lose weight, build muscle, improve energy...",
        required: true,
        voiceEnabled: true,
      },
      {
        key: "goal_nutrition",
        label: "Nutrition Goal",
        type: "textarea",
        placeholder:
          "e.g., Eat more consistently, learn to meal prep, reduce junk food...",
        required: true,
        voiceEnabled: true,
      },
      {
        key: "goal_wellbeing",
        label: "Mental Health / Overall Wellbeing Goal",
        type: "textarea",
        placeholder: "e.g., Better sleep, manage stress, build confidence...",
        voiceEnabled: true,
      },
      {
        key: "past_efforts",
        label: "What have you tried before?",
        type: "textarea",
        placeholder:
          "Describe any previous diets, programs, or approaches you've tried",
        voiceEnabled: true,
      },
      {
        key: "motivation",
        label: "What is motivating you to seek help now?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "timeline",
        label: "Do you have a specific timeline or event in mind?",
        type: "textarea",
        placeholder: "e.g., Wedding in 6 months, health scare, new year resolution...",
      },
    ],
  },

  // ─── Section 3: Habits & Lifestyle ────────────────────────
  {
    key: "current_habits",
    title: "Habits & Lifestyle",
    description:
      "Tell us about your exercise history, current habits, food preferences, and daily routine. This section flows from past to present so we can understand where you've been and where you are now.",
    questions: [
      // ── Exercise History (past) ──
      {
        key: "weight_history",
        label: "Approximate bodyweight at different life stages",
        type: "textarea",
        placeholder:
          "e.g., High school: 65kg, College: 75kg, Current: 92kg",
        voiceEnabled: true,
      },
      {
        key: "played_sports",
        label: "Have you played any sports?",
        type: "yesno",
      },
      {
        key: "sports_history",
        label: "Which sports, and for how long?",
        type: "textarea",
        condition: { questionKey: "played_sports", value: true },
      },
      {
        key: "gym_member",
        label: "Have you been a gym member before?",
        type: "yesno",
      },
      {
        key: "gym_experience",
        label: "What was your gym experience like?",
        type: "textarea",
        condition: { questionKey: "gym_member", value: true },
        voiceEnabled: true,
      },

      // ── Current Exercise (present) ──
      {
        key: "currently_exercise",
        label: "Do you currently exercise?",
        type: "yesno",
        required: true,
      },
      {
        key: "exercise_type",
        label: "What type of exercise?",
        type: "textarea",
        condition: { questionKey: "currently_exercise", value: true },
      },
      {
        key: "exercise_frequency",
        label: "How often do you exercise?",
        type: "text",
        condition: { questionKey: "currently_exercise", value: true },
      },
      {
        key: "exercise_effort",
        label: "How much effort do you put into each session?",
        type: "select",
        options: ["Low", "Moderate", "High", "Very high"],
        condition: { questionKey: "currently_exercise", value: true },
      },
      {
        key: "exercise_duration",
        label: "How long have you been following this routine?",
        type: "text",
        condition: { questionKey: "currently_exercise", value: true },
      },

      // ── Daily Activity ──
      {
        key: "steps_daily",
        label: "Approximate daily step count",
        type: "number",
        placeholder: "e.g., 5000",
      },
      {
        key: "sitting_hours",
        label: "Hours spent sitting per day",
        type: "number",
      },

      // ── Food & Kitchen ──
      {
        key: "cooking_ability",
        label: "Do you cook your own meals?",
        type: "select",
        options: [
          "Yes, regularly",
          "Sometimes",
          "Rarely",
          "Never — someone else cooks",
          "Never — I eat out / order in",
        ],
      },
      {
        key: "meal_frequency",
        label: "How many meals do you eat per day on average?",
        type: "number",
      },
      {
        key: "foods_i_like",
        label:
          "Foods, snacks, fruits, and recipes you enjoy and would eat regularly",
        type: "textarea",
        voiceEnabled: true,
        helperText:
          "This becomes your ready reckoner — a reference list for grocery shopping and meal ideas",
      },
      {
        key: "foods_i_dislike",
        label: "Foods you strongly dislike or won't eat",
        type: "textarea",
      },
      {
        key: "allergies",
        label: "Any food allergies or intolerances?",
        type: "textarea",
      },
      {
        key: "water_intake",
        label: "Approximate daily water intake",
        type: "select",
        options: [
          "Less than 1 liter",
          "1-2 liters",
          "2-3 liters",
          "More than 3 liters",
          "Not sure",
        ],
      },

      // ── Substances ──
      {
        key: "alcohol",
        label: "Do you consume alcohol?",
        type: "select",
        options: ["Never", "Rarely", "Socially", "Regularly", "Daily"],
      },
      {
        key: "smoking",
        label: "Do you smoke or use tobacco?",
        type: "select",
        options: ["Never", "Former smoker", "Occasionally", "Regularly"],
      },
      {
        key: "caffeine",
        label: "Daily caffeine intake",
        type: "text",
        placeholder: "e.g., 2 cups coffee, 1 cup tea",
      },
    ],
  },

  // ─── Section 4: Food Record ───────────────────────────────
  {
    key: "food_record",
    title: "4-Day Food Diary",
    description:
      "Tell us what you typically eat over 4 days (2 weekdays + Saturday + Sunday). For each meal, include approximate quantities, where you ate, who you were with, your mood, and how hungry you were. Voice input is available here.",
    questions: [
      {
        key: "day1_label",
        label: "Day 1 (Weekday) — Which day?",
        type: "text",
        placeholder: "e.g., Monday",
        required: true,
      },
      {
        key: "day1_meals",
        label: "Day 1 — What did you eat throughout the day?",
        type: "textarea",
        placeholder:
          "For each meal: time, food (with quantities), where, who with, mood, hunger level",
        required: true,
        voiceEnabled: true,
      },
      {
        key: "day2_label",
        label: "Day 2 (Weekday) — Which day?",
        type: "text",
        placeholder: "e.g., Wednesday",
        required: true,
      },
      {
        key: "day2_meals",
        label: "Day 2 — What did you eat throughout the day?",
        type: "textarea",
        required: true,
        voiceEnabled: true,
      },
      {
        key: "day3_label",
        label: "Day 3 (Saturday)",
        type: "text",
        placeholder: "Saturday",
      },
      {
        key: "day3_meals",
        label: "Saturday — What did you eat throughout the day?",
        type: "textarea",
        required: true,
        voiceEnabled: true,
      },
      {
        key: "day4_label",
        label: "Day 4 (Sunday)",
        type: "text",
        placeholder: "Sunday",
      },
      {
        key: "day4_meals",
        label: "Sunday — What did you eat throughout the day?",
        type: "textarea",
        required: true,
        voiceEnabled: true,
      },
    ],
  },

  // ─── Section 5: Medical History & Genetics ────────────────
  {
    key: "history_genetics",
    title: "Medical History & Genetics",
    description:
      "Family health history and your medical background help us identify risk factors and tailor recommendations safely.",
    questions: [
      {
        key: "family_conditions",
        label:
          "Do any of the following conditions run in your family?",
        type: "multiselect",
        options: [
          "Diabetes",
          "Heart disease",
          "High blood pressure",
          "Obesity",
          "Cancer",
          "Thyroid disorders",
          "Mental health conditions",
          "None of the above",
        ],
      },
      {
        key: "has_conditions",
        label: "Have you been diagnosed with any medical conditions?",
        type: "yesno",
      },
      {
        key: "personal_conditions",
        label: "Please describe your conditions",
        type: "textarea",
        condition: { questionKey: "has_conditions", value: true },
        voiceEnabled: true,
      },
      {
        key: "has_medications",
        label: "Are you currently taking any medications?",
        type: "yesno",
      },
      {
        key: "medications",
        label: "List medication names and dosages",
        type: "textarea",
        placeholder: "e.g., Metformin 500mg twice daily",
        condition: { questionKey: "has_medications", value: true },
      },
      {
        key: "has_supplements",
        label: "Are you currently taking any supplements?",
        type: "yesno",
      },
      {
        key: "supplements_current",
        label: "Which supplements and dosages?",
        type: "textarea",
        condition: { questionKey: "has_supplements", value: true },
      },
      {
        key: "has_injuries",
        label: "Any past or current injuries?",
        type: "yesno",
      },
      {
        key: "injuries",
        label: "Describe your injuries",
        type: "textarea",
        placeholder:
          "e.g., Shoulder ligament tear (2019), knee pain when squatting",
        condition: { questionKey: "has_injuries", value: true },
        voiceEnabled: true,
      },
      {
        key: "has_surgeries",
        label: "Any surgeries?",
        type: "yesno",
      },
      {
        key: "surgeries",
        label: "Describe your surgeries",
        type: "textarea",
        condition: { questionKey: "has_surgeries", value: true },
      },
    ],
  },

  // ─── Section 6: Stress & Sleep ────────────────────────────
  {
    key: "stress_sleep",
    title: "Stress & Sleep",
    description:
      "Stress and sleep profoundly affect fat loss, recovery, and overall health. Be honest — there are no wrong answers.",
    questions: [
      {
        key: "dark_circles",
        label: "Do you have dark circles under your eyes?",
        type: "yesno",
      },
      {
        key: "sleep_hours",
        label: "Are you getting 7-9 hours of restful sleep per night?",
        type: "yesno",
      },
      {
        key: "sleep_quality",
        label: "Do you wake up feeling well rested?",
        type: "yesno",
      },
      {
        key: "night_waking",
        label: "Do you wake during the night frequently?",
        type: "yesno",
      },
      {
        key: "sleep_time",
        label: "What time do you typically go to bed?",
        type: "text",
        placeholder: "e.g., 11:30 PM",
      },
      {
        key: "wake_time",
        label: "What time do you typically wake up?",
        type: "text",
        placeholder: "e.g., 7:00 AM",
      },
      {
        key: "screen_before_bed",
        label: "Do you use screens (phone/laptop) in bed?",
        type: "yesno",
      },
      {
        key: "stress_level",
        label: "How would you rate your current stress level?",
        type: "scale",
        helperText: "1 = very low stress, 10 = extremely stressed",
      },
      {
        key: "stress_sources",
        label: "Main sources of stress",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "stress_coping",
        label: "How do you currently cope with stress?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "hrv",
        label: "Heart Rate Variability (if you track it)",
        type: "number",
        helperText: "From a fitness tracker or smartwatch. Leave blank if unsure.",
      },
      {
        key: "headaches",
        label: "Do you experience frequent headaches?",
        type: "yesno",
      },
      {
        key: "energy_pattern",
        label: "When during the day do you feel most energetic?",
        type: "select",
        options: ["Morning", "Midday", "Afternoon", "Evening", "Inconsistent"],
      },
    ],
  },

  // ─── Section 7: Gut Health ────────────────────────────────
  {
    key: "gut_health",
    title: "Gut Health",
    description:
      "Gut health plays a major role in nutrition, mood, and overall wellbeing. These questions help us identify if a specialist referral might be helpful.",
    questions: [
      {
        key: "antacids",
        label: "Do you use antacids regularly?",
        type: "yesno",
      },
      {
        key: "antacids_freq",
        label: "How often do you use antacids?",
        type: "text",
        condition: { questionKey: "antacids", value: true },
      },
      {
        key: "laxatives",
        label: "Do you use laxatives regularly?",
        type: "yesno",
      },
      {
        key: "antibiotics",
        label: "Have you taken antibiotics frequently?",
        type: "yesno",
      },
      {
        key: "bloating",
        label: "Do you experience bloating after meals?",
        type: "select",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        key: "constipation",
        label: "Do you experience constipation?",
        type: "select",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        key: "acid_reflux",
        label: "Do you experience acid reflux or heartburn?",
        type: "select",
        options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
      },
      {
        key: "bowel_regularity",
        label: "How regular are your bowel movements?",
        type: "select",
        options: [
          "Very regular (daily)",
          "Mostly regular",
          "Irregular",
          "Very irregular",
        ],
      },
      {
        key: "has_food_sensitivities",
        label: "Are there specific foods that seem to upset your stomach?",
        type: "yesno",
      },
      {
        key: "food_sensitivities",
        label: "Which foods cause problems?",
        type: "textarea",
        condition: { questionKey: "has_food_sensitivities", value: true },
      },
      {
        key: "gut_additional",
        label: "Anything else about your digestion you'd like us to know?",
        type: "textarea",
        voiceEnabled: true,
      },
    ],
  },

  // ─── Section 8: Bloodwork ─────────────────────────────────
  {
    key: "bloodwork",
    title: "Bloodwork",
    description:
      "If you have recent blood test results, enter the key readings below. This helps us identify deficiencies and health risks. Leave blank if you don't have results.",
    questions: [
      {
        key: "has_bloodwork",
        label: "Do you have recent blood test results (within the last year)?",
        type: "yesno",
      },
      {
        key: "hba1c",
        label: "HbA1c (Glycated Hemoglobin)",
        type: "number",
        placeholder: "e.g., 5.8",
        condition: { questionKey: "has_bloodwork", value: true },
        helperText: "Normal: below 5.7%",
      },
      {
        key: "vitamin_d",
        label: "Vitamin D (ng/mL)",
        type: "number",
        placeholder: "e.g., 30",
        condition: { questionKey: "has_bloodwork", value: true },
        helperText: "Normal: 30-100 ng/mL",
      },
      {
        key: "vitamin_b12",
        label: "Vitamin B12 (pg/mL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "hdl",
        label: "HDL Cholesterol (mg/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
        helperText: "Higher is better. Target: >40 men, >50 women",
      },
      {
        key: "ldl",
        label: "LDL Cholesterol (mg/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "triglycerides",
        label: "Triglycerides (mg/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
        helperText: "Normal: below 150 mg/dL",
      },
      {
        key: "uric_acid",
        label: "Uric Acid (mg/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "tsh",
        label: "TSH (Thyroid)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "hemoglobin",
        label: "Hemoglobin (g/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "fasting_glucose",
        label: "Fasting Blood Glucose (mg/dL)",
        type: "number",
        condition: { questionKey: "has_bloodwork", value: true },
      },
      {
        key: "bloodwork_other",
        label: "Any other notable readings or doctor's comments?",
        type: "textarea",
        condition: { questionKey: "has_bloodwork", value: true },
      },
    ],
  },

  // ─── Section 9: GHQ-28 ───────────────────────────────────
  {
    key: "ghq28",
    title: "General Health Questionnaire (GHQ-28)",
    description:
      "This is a validated screening tool that helps us understand your overall physical and mental wellbeing. Answer based on how you've been feeling recently.",
    questions: [
      // Somatic Symptoms (A)
      {
        key: "ghq_a1",
        label: "Been feeling well and in good health?",
        type: "select",
        options: [
          "Better than usual",
          "Same as usual",
          "Worse than usual",
          "Much worse than usual",
        ],
        required: true,
      },
      {
        key: "ghq_a2",
        label: "Been feeling in need of a tonic?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_a3",
        label: "Been feeling run down or out of sorts?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_a4",
        label: "Felt that you are ill?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_a5",
        label: "Been getting any pains in your head?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_a6",
        label: "Been getting a feeling of tightness or pressure in your head?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_a7",
        label: "Been having hot or cold spells?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      // Anxiety & Insomnia (B)
      {
        key: "ghq_b1",
        label: "Lost much sleep over worry?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b2",
        label: "Had difficulty staying asleep once you are off?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b3",
        label: "Felt constantly under strain?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b4",
        label: "Been getting edgy and bad-tempered?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b5",
        label: "Been getting scared or panicky for no good reason?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b6",
        label: "Found everything getting on top of you?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_b7",
        label: "Been feeling nervous and strung out all the time?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      // Social Dysfunction (C)
      {
        key: "ghq_c1",
        label: "Been managing to keep yourself busy and occupied?",
        type: "select",
        options: [
          "More so than usual",
          "Same as usual",
          "Rather less than usual",
          "Much less than usual",
        ],
      },
      {
        key: "ghq_c2",
        label: "Been taking longer over the things you do?",
        type: "select",
        options: [
          "Quicker than usual",
          "Same as usual",
          "Longer than usual",
          "Much longer than usual",
        ],
      },
      {
        key: "ghq_c3",
        label: "Felt on the whole you were doing things well?",
        type: "select",
        options: [
          "Better than usual",
          "About the same",
          "Less well than usual",
          "Much less well",
        ],
      },
      {
        key: "ghq_c4",
        label: "Been satisfied with the way you've carried out your tasks?",
        type: "select",
        options: [
          "More satisfied",
          "About same as usual",
          "Less satisfied than usual",
          "Much less satisfied",
        ],
      },
      {
        key: "ghq_c5",
        label: "Felt that you are playing a useful part in things?",
        type: "select",
        options: [
          "More so than usual",
          "Same as usual",
          "Less useful than usual",
          "Much less useful",
        ],
      },
      {
        key: "ghq_c6",
        label: "Felt capable of making decisions about things?",
        type: "select",
        options: [
          "More so than usual",
          "Same as usual",
          "Less so than usual",
          "Much less capable",
        ],
      },
      {
        key: "ghq_c7",
        label: "Been able to enjoy your normal day-to-day activities?",
        type: "select",
        options: [
          "More so than usual",
          "Same as usual",
          "Less so than usual",
          "Much less than usual",
        ],
      },
      // Severe Depression (D)
      {
        key: "ghq_d1",
        label: "Been thinking of yourself as a worthless person?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_d2",
        label: "Felt that life is entirely hopeless?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_d3",
        label: "Felt that life isn't worth living?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_d4",
        label: "Thought of the possibility that you might end your life?",
        type: "select",
        options: [
          "Definitely not",
          "I don't think so",
          "Has crossed my mind",
          "Definitely have",
        ],
      },
      {
        key: "ghq_d5",
        label: "Found at times you couldn't do anything because your nerves were too bad?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_d6",
        label: "Found yourself wishing you were dead and away from it all?",
        type: "select",
        options: [
          "Not at all",
          "No more than usual",
          "Rather more than usual",
          "Much more than usual",
        ],
      },
      {
        key: "ghq_d7",
        label: "Found that the idea of taking your own life kept coming into your mind?",
        type: "select",
        options: [
          "Definitely not",
          "I don't think so",
          "Has crossed my mind",
          "Definitely has",
        ],
      },
    ],
  },

  // ─── Section 10: Emotional Health ─────────────────────────
  {
    key: "emotional_health",
    title: "Emotional Health",
    description:
      "Your relationship with food, exercise, and your body is deeply personal. These questions help us understand your emotional patterns so we can support you better. Take your time — voice input is available here.",
    questions: [
      {
        key: "miss_workout_feeling",
        label: "How do you feel when you miss a scheduled workout?",
        type: "textarea",
        voiceEnabled: true,
        required: true,
      },
      {
        key: "unplanned_indulgence",
        label:
          "How do you feel when you eat something indulgent that you hadn't planned on eating?",
        type: "textarea",
        voiceEnabled: true,
        required: true,
      },
      {
        key: "wedding_eating",
        label:
          "You go to a wedding and a delicious spread is laid out. How do you eat?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "body_image",
        label: "How do you feel about your body right now?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "emotional_eating",
        label: "Do you eat more when you're stressed, bored, or emotional?",
        type: "select",
        options: [
          "Never",
          "Rarely",
          "Sometimes",
          "Often",
          "Very often",
        ],
      },
      {
        key: "binge_episodes",
        label: "Do you experience episodes of overeating or binging?",
        type: "select",
        options: [
          "Never",
          "Rarely (once a month or less)",
          "Sometimes (weekly)",
          "Often (multiple times a week)",
        ],
      },
      {
        key: "self_talk",
        label:
          "How would you describe the way you talk to yourself about your health and body?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "support_system",
        label:
          "Do you have people in your life who support your health goals?",
        type: "textarea",
        voiceEnabled: true,
      },
      {
        key: "mental_health_support",
        label:
          "Are you currently seeing or have you seen a therapist or counselor?",
        type: "select",
        options: [
          "Currently seeing one",
          "Have in the past",
          "No, but open to it",
          "No, not interested",
        ],
      },
      {
        key: "anything_else",
        label:
          "Is there anything else you'd like your coach to know about you?",
        type: "textarea",
        voiceEnabled: true,
      },
    ],
  },
];
