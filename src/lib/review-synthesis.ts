/**
 * Review Synthesis — Prompt Builder
 *
 * Builds the prompt for Groq Llama 3.3 70B to generate the three-part
 * weekly review narrative. Encodes all behavioral design rules.
 *
 * This file does NOT call any API. It only builds the prompt string.
 */

import type { WeeklyAggregation, Citation } from "./weekly-review";

interface PlanContext {
  startingHabits: string[];
  nutritionTargets?: Record<string, unknown>;
  exerciseTargets?: Record<string, unknown>;
}

interface PreviousReview {
  synthesisData: {
    sections?: { title: string; content: string }[];
  };
}

export interface SynthesisOutput {
  sections: {
    title: string;
    content: string;
  }[];
}

/**
 * Build the synthesis prompt.
 *
 * Returns a system prompt + user prompt pair for the LLM call.
 */
export function buildSynthesisPrompt(
  aggregation: WeeklyAggregation,
  citations: Citation[],
  clientFirstName: string,
  planContext: PlanContext,
  previousReview?: PreviousReview
): { system: string; user: string } {
  const system = `You are a warm, professional health and wellness coach writing a brief weekly review for your client. You write as if you are the coach talking directly to the client.

RULES (follow exactly):
- Write in second person ("you").
- Never use the words "missed", "failed", "skipped", or "compliance."
- Use "not today" or "took a break" if referring to days without check-ins.
- Never use em dashes (—). Use periods, commas, or short sentences instead.
- Lead with what went well, even in sparse weeks.
- Frame streaks positively: "5 of 7 days" not "missed 2 days."
- Name behavioral changes, not just numbers. "You're building a protein habit" not "71% adherence."
- Keep total length under 300 words across all three sections.
- Be specific. Reference actual days and actual habits by name.
- Sound like a real person, not a report generator.

OUTPUT FORMAT:
Return valid JSON with this exact structure:
{
  "sections": [
    { "title": "Your week", "content": "..." },
    { "title": "What stood out", "content": "..." },
    { "title": "For next week", "content": "..." }
  ]
}

Section 1 ("Your week"): Brief factual summary of check-in patterns. How many days, which habits were consistent, any metric highlights. Keep it under 80 words.

Section 2 ("What stood out"): Identify 1-2 behavioral wins. Connect tracker data to the client's plan goals. Name the behavior being formed, not the metric. If the client wrote reflections, acknowledge what they shared. Keep it under 120 words.

Section 3 ("For next week"): Suggest 1-2 specific, small, actionable things based on what you observed. Make them concrete and grounded in data. "Try X on Y day" not "keep it up." Keep it under 100 words.

SPARSE WEEK RULES:
If fewer than 3 check-ins: Keep the entire review under 100 words total. Be brief and curious, not disappointed. Example: "Quieter week, and that's okay. When you're ready, your check-in is here."`;

  // Build the user prompt with actual data
  const habitLines = aggregation.habits.map((h) => {
    const parts = [];
    if (h.yes > 0) parts.push(`yes: ${h.yes}`);
    if (h.partly > 0) parts.push(`partly: ${h.partly}`);
    if (h.notToday > 0) parts.push(`not today: ${h.notToday}`);
    return `- ${h.label}: ${parts.join(", ")} (out of ${aggregation.daysCheckedIn} check-in days)`;
  });

  const metricLines = aggregation.metrics.map((m) => {
    const vals = m.values.map((v) => `${v.date}: ${v.value}${m.unit ? " " + m.unit : ""}`).join(", ");
    const avg = m.average !== undefined ? ` (avg: ${m.average}${m.unit ? " " + m.unit : ""})` : "";
    return `- ${m.label}: ${vals}${avg}`;
  });

  const reflectionLines = aggregation.reflections.map(
    (r) => `- ${r.date}: "${r.text}"`
  );

  const mealLines =
    aggregation.meals.length > 0
      ? aggregation.meals.map((m) => `- ${m.date}: ${m.text}`)
      : [];

  let previousContext = "";
  if (previousReview?.synthesisData?.sections) {
    const prevContent = previousReview.synthesisData.sections
      .map((s) => `${s.title}: ${s.content}`)
      .join("\n");
    previousContext = `\nLAST WEEK'S REVIEW (for comparison/trends):\n${prevContent}\n`;
  }

  const user = `Write a weekly review for ${clientFirstName}.

WEEK: ${aggregation.weekStart} to ${aggregation.weekEnd}
DAYS CHECKED IN: ${aggregation.daysCheckedIn} of ${aggregation.totalDays}

PLAN CONTEXT:
Starting habits: ${planContext.startingHabits.join(", ")}
${planContext.nutritionTargets ? `Nutrition targets: ${JSON.stringify(planContext.nutritionTargets)}` : ""}
${planContext.exerciseTargets ? `Exercise targets: ${JSON.stringify(planContext.exerciseTargets)}` : ""}

HABIT DATA:
${habitLines.length > 0 ? habitLines.join("\n") : "No habit data recorded."}

METRIC DATA:
${metricLines.length > 0 ? metricLines.join("\n") : "No metric data recorded."}

REFLECTIONS:
${reflectionLines.length > 0 ? reflectionLines.join("\n") : "No reflections shared."}

${mealLines.length > 0 ? `MEALS:\n${mealLines.join("\n")}` : ""}
${previousContext}
Remember: Return valid JSON only. No markdown code fences. Under 300 words total.`;

  return { system, user };
}

/**
 * Parse the LLM response into structured synthesis data.
 * Handles common issues like markdown fences around JSON.
 */
export function parseSynthesisResponse(raw: string): SynthesisOutput | null {
  try {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (parsed.sections && Array.isArray(parsed.sections)) {
      return parsed as SynthesisOutput;
    }
    return null;
  } catch {
    return null;
  }
}
