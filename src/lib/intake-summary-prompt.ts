/**
 * Prompt template for generating intake summaries via Groq Llama 3.3.
 *
 * Takes the full intake response map and produces a structured summary
 * that the coach can quickly scan before making clinical decisions.
 */

import { intakeSections } from "./intake-schema";

// Build a human-readable intake transcript from responses
export function buildIntakeTranscript(
  responses: Record<string, Record<string, unknown>>
): string {
  const lines: string[] = [];

  for (const section of intakeSections) {
    const sectionResp = responses[section.key];
    if (!sectionResp || Object.keys(sectionResp).length === 0) continue;

    lines.push(`\n## ${section.title}`);

    for (const q of section.questions) {
      const val = sectionResp[q.key];
      if (val === undefined || val === null || val === "") continue;

      // Skip sub-questions that shouldn't be visible (condition not met)
      if (q.condition) {
        const depVal = sectionResp[q.condition.questionKey];
        if (depVal !== q.condition.value) continue;
      }

      const display =
        typeof val === "boolean"
          ? val
            ? "Yes"
            : "No"
          : Array.isArray(val)
            ? val.join(", ")
            : String(val);

      lines.push(`**${q.label}:** ${display}`);
    }
  }

  return lines.join("\n");
}

// GHQ-28 scoring helper
export function scoreGHQ28(
  responses: Record<string, unknown>
): {
  total: number;
  somatic: number;
  anxiety: number;
  socialDysfunction: number;
  depression: number;
} {
  const score = (prefix: string, count: number): number => {
    let total = 0;
    for (let i = 1; i <= count; i++) {
      const key = `ghq_${prefix}${i}`;
      const val = responses[key];
      if (typeof val === "string") {
        // GHQ binary scoring: 0-0-1-1
        if (val === "Worse than usual" || val === "Much worse than usual") {
          total += 1;
        }
      }
    }
    return total;
  };

  const somatic = score("a", 7);
  const anxiety = score("b", 7);
  const socialDysfunction = score("c", 7);
  const depression = score("d", 7);

  return {
    total: somatic + anxiety + socialDysfunction + depression,
    somatic,
    anxiety,
    socialDysfunction,
    depression,
  };
}

// Compute BMI from intake data
export function computeBMI(
  responses: Record<string, Record<string, unknown>>
): number | null {
  const basic = responses["basic_info"];
  if (!basic) return null;

  const weight = parseFloat(String(basic["weight"] || ""));
  const height = parseFloat(String(basic["height"] || ""));

  if (!weight || !height || height <= 0) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

// Compute waist-hip ratio
export function computeWHR(
  responses: Record<string, Record<string, unknown>>
): number | null {
  const basic = responses["basic_info"];
  if (!basic) return null;

  const waist = parseFloat(String(basic["waist"] || ""));
  const hip = parseFloat(String(basic["hip"] || ""));

  if (!waist || !hip || hip <= 0) return null;
  return Math.round((waist / hip) * 100) / 100;
}

export const SUMMARY_SYSTEM_PROMPT = `You are a clinical intake summarizer for a nutrition and lifestyle coaching practice.

You will receive a client's full intake responses. Produce a structured summary that helps the coach quickly understand the client and make plan decisions.

Rules:
- Be concise. The coach reads dozens of these.
- Use the client's own words where powerful (quote briefly).
- Do not diagnose. Flag, don't prescribe.
- Never use em dashes. Use periods or commas instead.
- Organize into the sections below.

Output format (use these exact headings):

### Client Snapshot
Name, age, gender, height, weight, BMI, WHR (if available), body fat % (if known), occupation, dietary preference, living situation.

### Goals & Motivation
Primary goals (physical, nutrition, wellbeing). What they've tried before and why it failed. What's motivating them now. Timeline if any.

### Current Habits
Exercise (type, frequency, effort, equipment access). Eating pattern (typical day, meals per day, cooking situation, eating out frequency). Sleep (hours, quality, issues). Substances (alcohol, caffeine, smoking).

### Medical Flags
Conditions, medications, injuries, surgeries, family history. Menstrual/reproductive health if reported. Anything that affects exercise selection or nutrition recommendations.

### Mental & Emotional Profile
Stress level and sources. GHQ-28 subscale scores (provided as numbers). Emotional eating patterns. Self-talk style. Body image. Support system. Therapy history.

### Bloodwork Summary
Only if bloodwork was submitted. List values with flags for out-of-range.

### Gut Health Summary
Only if gut symptoms were reported. Key symptoms and severity.

### Coach Attention Items
Bullet list of things the coach should specifically consider when writing this plan. Not generic advice. Specific to THIS client.`;

export function buildSummaryUserPrompt(
  transcript: string,
  bmi: number | null,
  whr: number | null,
  ghqScores: {
    total: number;
    somatic: number;
    anxiety: number;
    socialDysfunction: number;
    depression: number;
  } | null
): string {
  let prompt = `Here is the client's full intake:\n\n${transcript}\n\n`;

  if (bmi !== null) prompt += `Computed BMI: ${bmi}\n`;
  if (whr !== null) prompt += `Computed WHR: ${whr}\n`;
  if (ghqScores) {
    prompt += `\nGHQ-28 Scores (binary scoring, 0-7 per subscale):\n`;
    prompt += `- Somatic symptoms: ${ghqScores.somatic}/7\n`;
    prompt += `- Anxiety & insomnia: ${ghqScores.anxiety}/7\n`;
    prompt += `- Social dysfunction: ${ghqScores.socialDysfunction}/7\n`;
    prompt += `- Severe depression: ${ghqScores.depression}/7\n`;
    prompt += `- Total: ${ghqScores.total}/28\n`;
  }

  prompt += `\nProduce the structured summary now.`;
  return prompt;
}
