/**
 * Plan section prompts for AI generation.
 *
 * Each section has a system prompt and a function that builds the user prompt
 * from intake data + coach decisions. The AI generates one section at a time,
 * each as plain text (no markdown, no formatting).
 *
 * Section order matches the 13-section plan structure.
 */

import type { CoachDecisions } from "../coach-decision-schema";

export interface PlanSectionDef {
  type: string;
  title: string;
  order: number;
  conditional?: (
    responses: Record<string, Record<string, unknown>>,
    decisions: CoachDecisions
  ) => boolean;
  systemPrompt: string;
  buildUserPrompt: (
    responses: Record<string, Record<string, unknown>>,
    decisions: CoachDecisions,
    clientName: string,
    computed: { bmi: number | null; whr: number | null }
  ) => string;
}

const GLOBAL_RULES = `Rules for all plan sections:
- Write in a warm, conversational tone. Address the client by first name.
- Start each section by acknowledging what they're already doing right before suggesting changes.
- Never use em dashes. Use periods, commas, or rewrite the sentence.
- Frame everything around 80-90% adherence. Never expect perfection.
- Be specific and practical. Generic advice is useless.
- Use Indian food examples where the client eats Indian food.
- Keep the language simple and encouraging. This is not a medical textbook.
- Do not diagnose. You are a coach, not a doctor.`;

function getVal(
  responses: Record<string, Record<string, unknown>>,
  section: string,
  key: string
): string {
  const val = responses[section]?.[key];
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

export const planSections: PlanSectionDef[] = [
  // ── 1. Summary Card ──
  {
    type: "summary_card",
    title: "Summary Card",
    order: 1,
    systemPrompt: `You are writing the summary card for a client's coaching plan. This is the quick-reference page they'll come back to most often.

${GLOBAL_RULES}

Format it as a clear, scannable reference card with these fields:
- Name, Age, Gender
- Starting metrics (weight, height, BMI, WHR if available, body fat % if known)
- Primary goals (1-2 sentences)
- Key numbers: daily calories, protein/carbs/fat targets, meal count
- Workout schedule: frequency, style
- Step target
- Program duration
- Coach contact info (placeholder for now)`,
    buildUserPrompt: (responses, decisions, clientName, computed) => {
      const basic = responses["basic_info"] || {};
      const goals = responses["goals"] || {};
      return `Client: ${clientName}
Age: ${getVal(responses, "basic_info", "age")}
Gender: ${getVal(responses, "basic_info", "gender")}
Weight: ${getVal(responses, "basic_info", "weight")} kg
Height: ${getVal(responses, "basic_info", "height")} cm
BMI: ${computed.bmi || "N/A"}
WHR: ${computed.whr || "N/A"}
Body fat: ${basic["body_fat"] || "Not provided"}
Dietary preference: ${getVal(responses, "basic_info", "dietary_preference")}

Goals:
- Physical: ${getVal(responses, "goals", "goal_physical")}
- Nutrition: ${getVal(responses, "goals", "goal_nutrition")}
- Wellbeing: ${getVal(responses, "goals", "goal_wellbeing")}
Motivation: ${getVal(responses, "goals", "motivation")}
Timeline: ${getVal(responses, "goals", "timeline") || "None specified"}

Coach Decisions:
- Calories: ${decisions.calorieTarget} kcal
- Protein: ${decisions.proteinGrams}g / Carbs: ${decisions.carbGrams}g / Fat: ${decisions.fatGrams}g
- Meals/day: ${decisions.mealCount}
- Workouts/week: ${decisions.workoutFrequency} (${decisions.workoutSplit})
- NEAT: ${decisions.neatTarget}
- Program: ${decisions.programDurationWeeks} weeks
- Adherence target: ${decisions.adherenceTarget}%

Write the summary card now.`;
    },
  },

  // ── 2. Your Coaching Cycle ──
  {
    type: "coaching_cycle",
    title: "Your Coaching Cycle",
    order: 2,
    systemPrompt: `You are writing the "Your Coaching Cycle" section. This explains how the coaching process works: Plan, Act, Review.

${GLOBAL_RULES}

This section should be brief (3-4 paragraphs). Explain:
1. "We plan together" - the coach has reviewed their intake and designed this plan for them
2. "You act and record" - they follow the plan day-to-day and check in via the tracker
3. "We review and adjust" - each week, the coach reviews their data and adjusts the plan
4. This is a living document, not a fixed prescription. Things will change as they progress.`,
    buildUserPrompt: (_responses, decisions, clientName) => {
      return `Client name: ${clientName}
Program duration: ${decisions.programDurationWeeks} weeks
Adherence target: ${decisions.adherenceTarget}%
Starting habits: ${decisions.startingHabits.join(", ") || "Not yet defined"}

Write the coaching cycle explanation. Keep it warm, brief, and reassuring.`;
    },
  },

  // ── 3. Your Starting Point ──
  {
    type: "starting_point",
    title: "Your Starting Point",
    order: 3,
    systemPrompt: `You are writing the "Your Starting Point" section. This replaces "Introductory Remarks" from older plans.

${GLOBAL_RULES}

Start with what they're already doing well (from their intake data). Then outline where they're starting from (current metrics, habits, strengths). Frame current weight/BMI as a starting point, never as a problem. If they have specific goals with timelines, acknowledge them realistically.`,
    buildUserPrompt: (responses, decisions, clientName, computed) => {
      return `Client: ${clientName}
Weight: ${getVal(responses, "basic_info", "weight")} kg, Height: ${getVal(responses, "basic_info", "height")} cm
BMI: ${computed.bmi || "N/A"}, WHR: ${computed.whr || "N/A"}
Body fat: ${getVal(responses, "basic_info", "body_fat") || "Not provided"}
Occupation: ${getVal(responses, "basic_info", "occupation")}
Living situation: ${getVal(responses, "basic_info", "living_situation")}

Current exercise: ${getVal(responses, "current_habits", "currently_exercise")}
Exercise type: ${getVal(responses, "current_habits", "exercise_type")}
Steps/day: ${getVal(responses, "current_habits", "steps_daily")}
Cooking: ${getVal(responses, "current_habits", "cooking_ability")}
Water: ${getVal(responses, "current_habits", "water_intake")}

Goals: ${getVal(responses, "goals", "goal_physical")}
Past efforts: ${getVal(responses, "goals", "past_efforts")}
Motivation: ${getVal(responses, "goals", "motivation")}
What they're willing to change: ${getVal(responses, "goals", "willing_compromises")}

Weight history: ${getVal(responses, "current_habits", "weight_history")}

Tone guidance: ${decisions.toneGuidance || "Default warm and encouraging"}

Write the starting point section. Lead with strengths.`;
    },
  },

  // ── 4. Behavior Ecosystem ──
  {
    type: "behavior_ecosystem",
    title: "Your Behavior Ecosystem",
    order: 4,
    systemPrompt: `You are writing the "Behavior Ecosystem" section. This is NEW and not in the client's previous plans. It maps the forces that shape their daily behaviors into four categories.

${GLOBAL_RULES}

Structure the section with these four subsections:

**Your Environment** - physical spaces, people, schedules, routines that support or undermine their goals. Tag each as "working for you" or "something to work around."

**Your Stories** - the narratives they tell themselves about food, exercise, their body. Use their actual self-talk from the intake. Provide a gentle reframe for each limiting story.

**Your Emotions** - how stress, boredom, and mood influence their eating and exercise. Not clinical. Acknowledging and practical.

**Your Current Habits** - what they're already doing (exercise, cooking, sleep patterns). Identify which to keep, which to adjust, which to add.

This section should feel like holding up a mirror, not passing judgment.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}

ENVIRONMENT DATA:
- Occupation: ${getVal(responses, "basic_info", "occupation")}
- Living situation: ${getVal(responses, "basic_info", "living_situation")}
- Cooking ability: ${getVal(responses, "current_habits", "cooking_ability")}
- Eating out: ${getVal(responses, "eating_patterns", "eating_out")}
- Sitting hours: ${getVal(responses, "current_habits", "sitting_hours")}
- Steps daily: ${getVal(responses, "current_habits", "steps_daily")}
- Screen before bed: ${getVal(responses, "stress_sleep", "screen_before_bed")}
- Sleep time: ${getVal(responses, "stress_sleep", "sleep_time")}

STORIES DATA:
- Self-talk: ${getVal(responses, "emotional_health", "self_talk")}
- Miss workout feeling: ${getVal(responses, "emotional_health", "miss_workout_feeling")}
- Unplanned indulgence: ${getVal(responses, "emotional_health", "unplanned_indulgence")}
- Body image: ${getVal(responses, "emotional_health", "body_image")}
- Past efforts: ${getVal(responses, "goals", "past_efforts")}

EMOTIONS DATA:
- Emotional eating: ${getVal(responses, "emotional_health", "emotional_eating")}
- Binge episodes: ${getVal(responses, "emotional_health", "binge_episodes")}
- Stress level: ${getVal(responses, "stress_sleep", "stress_level")}/10
- Stress sources: ${getVal(responses, "stress_sleep", "stress_sources")}
- Stress coping: ${getVal(responses, "stress_sleep", "stress_coping")}

CURRENT HABITS DATA:
- Exercise: ${getVal(responses, "current_habits", "currently_exercise")} - ${getVal(responses, "current_habits", "exercise_type")} (${getVal(responses, "current_habits", "exercise_frequency")})
- Typical eating day: ${getVal(responses, "eating_patterns", "typical_day")}
- Weekend eating: ${getVal(responses, "eating_patterns", "weekend_differences")}
- Water: ${getVal(responses, "current_habits", "water_intake")}
- Caffeine: ${getVal(responses, "current_habits", "caffeine")}
- Alcohol: ${getVal(responses, "current_habits", "alcohol")}
- Support system: ${getVal(responses, "emotional_health", "support_system")}

Tone guidance: ${decisions.toneGuidance || "Default warm and encouraging"}

Write the behavior ecosystem. Use their own words where powerful.`;
    },
  },

  // ── 5. Nutrition ──
  {
    type: "nutrition",
    title: "Nutrition",
    order: 5,
    systemPrompt: `You are writing the "Nutrition" section. This combines nutrition principles, calorie/macro targets, meal schedule, and sample meals into one cohesive section.

${GLOBAL_RULES}

Structure:
1. Brief nutrition philosophy (2-3 paragraphs: why these targets, how to think about food)
2. Daily targets: calories, protein, carbs, fat (with percentages)
3. Meal schedule with per-meal macro targets
4. 4-6 sample meals using foods the client actually likes
5. Practical notes (how to count roughly, what to do when eating out, how to handle cravings)

For sample meals: use the client's preferred foods. If they eat Indian food, give Indian food examples. Include approximate macros per meal. Keep meals simple and realistic for their cooking ability.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}
Dietary preference: ${getVal(responses, "basic_info", "dietary_preference")}
Foods they like: ${getVal(responses, "current_habits", "foods_i_like")}
Foods they dislike: ${getVal(responses, "current_habits", "foods_i_dislike")}
Cooking ability: ${getVal(responses, "current_habits", "cooking_ability")}
Meals per day currently: ${getVal(responses, "current_habits", "meal_frequency")}
Typical eating day: ${getVal(responses, "eating_patterns", "typical_day")}
Weekend differences: ${getVal(responses, "eating_patterns", "weekend_differences")}
Snacking: ${getVal(responses, "eating_patterns", "snacking")}
Eating out frequency: ${getVal(responses, "eating_patterns", "eating_out")}
Food sensitivities: ${getVal(responses, "gut_health", "food_sensitivities") || "None reported"}
Living situation: ${getVal(responses, "basic_info", "living_situation")}

COACH DECISIONS:
- Daily calories: ${decisions.calorieTarget} kcal
- Protein: ${decisions.proteinGrams}g (${Math.round((decisions.proteinGrams * 4 / decisions.calorieTarget) * 100)}%)
- Carbs: ${decisions.carbGrams}g (${Math.round((decisions.carbGrams * 4 / decisions.calorieTarget) * 100)}%)
- Fat: ${decisions.fatGrams}g (${Math.round((decisions.fatGrams * 9 / decisions.calorieTarget) * 100)}%)
- Meals per day: ${decisions.mealCount}
- Meal schedule: ${decisions.mealSchedule}
- Adherence target: ${decisions.adherenceTarget}%

Tone guidance: ${decisions.toneGuidance || "Default warm and encouraging"}

Write the full nutrition section now.`;
    },
  },

  // ── 6. Exercise ──
  {
    type: "exercise",
    title: "Exercise",
    order: 6,
    systemPrompt: `You are writing the "Exercise" section. This combines exercise principles, NEAT guidance, and the full workout plan into one section.

${GLOBAL_RULES}

Structure:
1. Exercise philosophy (2-3 paragraphs: why this approach, NEAT importance, progressive overload basics)
2. NEAT / step targets
3. Workout plan: specific exercises, sets, reps, rest periods
4. Warm-up protocol
5. Notes on form, modifications for injuries, when to progress

Tailor the workout completely to their equipment access, experience, and injuries. A client with resistance bands gets a totally different plan than someone with gym access.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}

EXERCISE BACKGROUND:
- Currently exercises: ${getVal(responses, "current_habits", "currently_exercise")}
- Exercise type: ${getVal(responses, "current_habits", "exercise_type")}
- Frequency: ${getVal(responses, "current_habits", "exercise_frequency")}
- Effort level: ${getVal(responses, "current_habits", "exercise_effort")}
- Duration on routine: ${getVal(responses, "current_habits", "exercise_duration")}
- Gym access: ${getVal(responses, "current_habits", "gym_access")}
- Equipment: ${getVal(responses, "current_habits", "equipment_details") || getVal(responses, "current_habits", "equipment_details_both") || "Not specified"}
- Sports history: ${getVal(responses, "current_habits", "sports_history")}
- Gym experience: ${getVal(responses, "current_habits", "gym_experience")}
- Steps daily: ${getVal(responses, "current_habits", "steps_daily")}
- Sitting hours: ${getVal(responses, "current_habits", "sitting_hours")}

INJURIES / RESTRICTIONS:
- Has injuries: ${getVal(responses, "history_genetics", "has_injuries")}
- Injury details: ${getVal(responses, "history_genetics", "injuries")}

COACH DECISIONS:
- Workouts/week: ${decisions.workoutFrequency}
- Split: ${decisions.workoutSplit}
- Style: ${decisions.workoutStyle}
- NEAT target: ${decisions.neatTarget}
- Exercise notes: ${decisions.exerciseNotes}
- Adherence target: ${decisions.adherenceTarget}%

Tone guidance: ${decisions.toneGuidance || "Default warm and encouraging"}

Write the full exercise section with specific workout plans.`;
    },
  },

  // ── 7. Lifestyle & Environment ──
  {
    type: "lifestyle",
    title: "Lifestyle & Environment",
    order: 7,
    systemPrompt: `You are writing the "Lifestyle & Environment" section covering sleep hygiene, stress management, screen habits, and occupation-related adjustments.

${GLOBAL_RULES}

Keep it practical and specific to their situation. If they work a desk job, address that. If they have poor sleep, prioritize sleep fixes. Don't give generic advice like "get more sleep." Give specific, actionable steps based on their data.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}
Occupation: ${getVal(responses, "basic_info", "occupation")}
Living situation: ${getVal(responses, "basic_info", "living_situation")}

SLEEP DATA:
- Getting 7-9 hours: ${getVal(responses, "stress_sleep", "sleep_hours")}
- Wakes rested: ${getVal(responses, "stress_sleep", "sleep_quality")}
- Night waking: ${getVal(responses, "stress_sleep", "night_waking")}
- Trouble falling asleep: ${getVal(responses, "stress_sleep", "trouble_falling_asleep")}
- Bed time: ${getVal(responses, "stress_sleep", "sleep_time")}
- Wake time: ${getVal(responses, "stress_sleep", "wake_time")}
- Screens in bed: ${getVal(responses, "stress_sleep", "screen_before_bed")}
- Dark circles: ${getVal(responses, "stress_sleep", "dark_circles")}

STRESS DATA:
- Level: ${getVal(responses, "stress_sleep", "stress_level")}/10
- Sources: ${getVal(responses, "stress_sleep", "stress_sources")}
- Current coping: ${getVal(responses, "stress_sleep", "stress_coping")}
- Energy pattern: ${getVal(responses, "stress_sleep", "energy_pattern")}
- Headaches: ${getVal(responses, "stress_sleep", "headaches")}

DAILY ACTIVITY:
- Steps: ${getVal(responses, "current_habits", "steps_daily")}
- Sitting hours: ${getVal(responses, "current_habits", "sitting_hours")}

COACH DECISIONS:
- Sleep target: ${decisions.sleepTarget}
- Stress management: ${decisions.stressManagement}

Write the lifestyle section. Be specific, not generic.`;
    },
  },

  // ── 8. Stress & Mental Health ──
  {
    type: "mental_health",
    title: "Stress & Mental Health",
    order: 8,
    systemPrompt: `You are writing the "Stress & Mental Health" section. Calibrate the depth to the client's data. A client with minimal stress gets a brief section. A client with depression, medication, or high anxiety gets a more comprehensive, careful section.

${GLOBAL_RULES}

Additional rules for this section:
- Never minimize their experience. "I understand" is empty. Be specific about what you understand.
- If they're on psychiatric medication, acknowledge it matter-of-factly. Don't comment on whether they should be on it.
- If they see a therapist, frame it positively.
- If GHQ-28 scores are elevated, acknowledge without alarming.
- If there are referral recommendations, mention them gently.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}

STRESS & MENTAL HEALTH DATA:
- Stress level: ${getVal(responses, "stress_sleep", "stress_level")}/10
- Stress sources: ${getVal(responses, "stress_sleep", "stress_sources")}
- Current coping: ${getVal(responses, "stress_sleep", "stress_coping")}
- HRV: ${getVal(responses, "stress_sleep", "hrv") || "Not tracked"}

EMOTIONAL HEALTH DATA:
- Emotional eating: ${getVal(responses, "emotional_health", "emotional_eating")}
- Binge episodes: ${getVal(responses, "emotional_health", "binge_episodes")}
- Self-talk: ${getVal(responses, "emotional_health", "self_talk")}
- Body image: ${getVal(responses, "emotional_health", "body_image")}
- Miss workout feeling: ${getVal(responses, "emotional_health", "miss_workout_feeling")}
- Unplanned indulgence: ${getVal(responses, "emotional_health", "unplanned_indulgence")}
- Support system: ${getVal(responses, "emotional_health", "support_system")}
- Therapy: ${getVal(responses, "emotional_health", "mental_health_support")}

MEDICAL CONTEXT:
- Conditions: ${getVal(responses, "history_genetics", "personal_conditions") || "None reported"}
- Medications: ${getVal(responses, "history_genetics", "medications") || "None"}

REFERRALS (if any): ${decisions.referrals.filter((r) => r.type.toLowerCase().includes("psych") || r.type.toLowerCase().includes("counsel")).map((r) => r.type + ": " + r.reason).join("; ") || "None"}

Tone guidance: ${decisions.toneGuidance || "Default warm and encouraging"}

Write the mental health section. Calibrate depth to what this client actually needs.`;
    },
  },

  // ── 9. Blood Report (conditional) ──
  {
    type: "blood_report",
    title: "Blood Report",
    order: 9,
    conditional: (responses, _decisions) =>
      responses["bloodwork"]?.["has_bloodwork"] === true,
    systemPrompt: `You are writing the "Blood Report" section. Only generated if the client submitted bloodwork.

${GLOBAL_RULES}

For each marker provided:
- State the value and reference range
- Explain what it means in plain language
- Note any disease risk associations
- If out of range, recommend follow-up testing or monitoring

End with testing recommendations (what to retest and when).`,
    buildUserPrompt: (responses, _decisions, clientName) => {
      const blood = responses["bloodwork"] || {};
      const fields = [
        "hba1c",
        "vitamin_d",
        "vitamin_b12",
        "hdl",
        "ldl",
        "triglycerides",
        "uric_acid",
        "tsh",
        "hemoglobin",
        "fasting_glucose",
        "bloodwork_other",
      ];
      const data = fields
        .filter((f) => blood[f] !== undefined && blood[f] !== "")
        .map((f) => `- ${f}: ${blood[f]}`)
        .join("\n");

      return `Client: ${clientName}
Gender: ${getVal(responses, "basic_info", "gender")}

Bloodwork values:
${data || "No specific values provided"}

Additional notes: ${getVal(responses, "bloodwork", "bloodwork_other") || "None"}

Write the blood report analysis.`;
    },
  },

  // ── 10. Gut Health (conditional) ──
  {
    type: "gut_health",
    title: "Gut Health",
    order: 10,
    conditional: (responses, _decisions): boolean => {
      const gut = responses["gut_health"] || {};
      const symptoms = ["bloating", "constipation", "acid_reflux"];
      const hasSymptoms = symptoms.some(
        (s) =>
          gut[s] === "Sometimes" || gut[s] === "Often" || gut[s] === "Always"
      );
      const hasOtherIssues =
        gut["antacids"] === true ||
        gut["laxatives"] === true ||
        gut["has_food_sensitivities"] === true ||
        Boolean(gut["gut_additional"] && String(gut["gut_additional"]).trim());
      return hasSymptoms || hasOtherIssues;
    },
    systemPrompt: `You are writing the "Gut Health" section. Only generated if the client reported gut symptoms.

${GLOBAL_RULES}

Summarize their gut symptoms, identify patterns, and provide practical recommendations. If symptoms are severe or multiple, recommend gastroenterologist assessment.`,
    buildUserPrompt: (responses, _decisions, clientName) => {
      const gut = responses["gut_health"] || {};
      return `Client: ${clientName}

Gut Health Data:
- Antacids: ${gut["antacids"] || "No"} ${gut["antacids_freq"] ? `(${gut["antacids_freq"]})` : ""}
- Laxatives: ${gut["laxatives"] || "No"}
- Antibiotics frequently: ${gut["antibiotics"] || "No"}
- Bloating after meals: ${gut["bloating"] || "Not reported"}
- Constipation: ${gut["constipation"] || "Not reported"}
- Acid reflux: ${gut["acid_reflux"] || "Not reported"}
- Bowel regularity: ${gut["bowel_regularity"] || "Not reported"}
- Food sensitivities: ${gut["has_food_sensitivities"] || "No"} ${gut["food_sensitivities"] ? `- ${gut["food_sensitivities"]}` : ""}
- Additional notes: ${gut["gut_additional"] || "None"}

Write the gut health section.`;
    },
  },

  // ── 11. Supplementation ──
  {
    type: "supplementation",
    title: "Supplementation",
    order: 11,
    systemPrompt: `You are writing the "Supplementation" section. Present supplements as a simple table/list with name, dosage, timing, and reason.

${GLOBAL_RULES}

Note any interactions with current medications. If the client already takes supplements, acknowledge them and explain any changes.`,
    buildUserPrompt: (responses, decisions, clientName) => {
      return `Client: ${clientName}

Current medications: ${getVal(responses, "history_genetics", "medications") || "None"}
Current supplements: ${getVal(responses, "history_genetics", "supplements_current") || "None"}

COACH-PRESCRIBED SUPPLEMENTS:
${decisions.supplements.length > 0 ? decisions.supplements.map((s) => `- ${s.name}: ${s.dosage}, ${s.timing} (${s.reason})`).join("\n") : "None prescribed"}

Write the supplementation section as a clear reference.`;
    },
  },

  // ── 12. Referrals (conditional) ──
  {
    type: "referrals",
    title: "Referrals",
    order: 12,
    conditional: (_responses, decisions) => decisions.referrals.length > 0,
    systemPrompt: `You are writing the "Referrals" section. Only generated if the coach has flagged specialist referrals.

${GLOBAL_RULES}

Frame referrals positively. Not "you have a problem" but "to get the most complete picture" or "to make sure we're covering all bases." Explain why each referral is recommended and what the client can expect.`,
    buildUserPrompt: (_responses, decisions, clientName) => {
      return `Client: ${clientName}

Referrals:
${decisions.referrals.map((r) => `- ${r.type}: ${r.reason} (urgency: ${r.urgency})`).join("\n")}

Write the referrals section. Frame positively and explain what to expect.`;
    },
  },

  // ── 13. What Happens Next ──
  {
    type: "what_happens_next",
    title: "What Happens Next",
    order: 13,
    systemPrompt: `You are writing the closing section "What Happens Next." This replaces the old "Tracker & Communications" section.

${GLOBAL_RULES}

Cover:
1. The daily check-in: what it is, how long it takes (~2 min), what they'll track
2. The weekly review: what happens, when to expect it
3. How to reach their coach (placeholder for actual contact details)
4. Their first 3-5 starting habits to focus on this week
5. A warm, encouraging close. They've just read a lot. End with confidence.`,
    buildUserPrompt: (_responses, decisions, clientName) => {
      return `Client: ${clientName}

Starting habits for weeks 1-2:
${decisions.startingHabits.length > 0 ? decisions.startingHabits.map((h, i) => `${i + 1}. ${h}`).join("\n") : "Not yet defined"}

Program duration: ${decisions.programDurationWeeks} weeks
Adherence target: ${decisions.adherenceTarget}%

Write the closing section. End with warmth and confidence.`;
    },
  },
];
