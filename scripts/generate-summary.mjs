/**
 * Generate an intake summary for a client.
 *
 * Usage (via Claude Code):
 *   claude "Run: node scripts/generate-summary.mjs --client <clientId>"
 *
 * What it does:
 *   1. Reads the client's completed intake from the database
 *   2. Computes BMI, WHR, GHQ-28 scores
 *   3. Runs rule-based red flag detection
 *   4. Prints a structured transcript for Claude to summarize
 *   5. Saves Claude's summary back to the database
 *
 * This script is designed to be run BY Claude Code. It prints the intake
 * data as a prompt, and Claude Code generates the summary in conversation.
 * The summary is then passed back via --save mode.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Parse args
const args = process.argv.slice(2);
const clientIdIdx = args.indexOf("--client");
const clientId = clientIdIdx !== -1 ? args[clientIdIdx + 1] : null;
const saveMode = args.includes("--save");
const summaryIdx = args.indexOf("--summary-file");
const summaryFile = summaryIdx !== -1 ? args[summaryIdx + 1] : null;

async function main() {
  if (!clientId) {
    console.error("Usage: node scripts/generate-summary.mjs --client <clientId>");
    console.error("       node scripts/generate-summary.mjs --client <clientId> --save --summary-file <path>");
    process.exit(1);
  }

  // Fetch client and intake
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true },
  });

  if (!client) {
    console.error(`Client not found: ${clientId}`);
    process.exit(1);
  }

  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientId, status: "COMPLETE" },
    include: { responses: true },
    orderBy: { createdAt: "desc" },
  });

  if (!submission) {
    console.error(`No completed intake for client: ${client.name} (${clientId})`);
    process.exit(1);
  }

  // Build response map
  const responseMap = {};
  for (const r of submission.responses) {
    if (!responseMap[r.sectionKey]) responseMap[r.sectionKey] = {};
    responseMap[r.sectionKey][r.questionKey] = r.value;
  }

  // Compute metrics
  const basic = responseMap["basic_info"] || {};
  const weight = parseFloat(String(basic["weight"] || ""));
  const height = parseFloat(String(basic["height"] || ""));
  const bmi = weight && height ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10 : null;

  const waist = parseFloat(String(basic["waist"] || ""));
  const hip = parseFloat(String(basic["hip"] || ""));
  const whr = waist && hip ? Math.round((waist / hip) * 100) / 100 : null;

  // GHQ-28 scoring
  const ghq = responseMap["ghq28"] || {};
  const scoreSubscale = (prefix, count) => {
    let total = 0;
    for (let i = 1; i <= count; i++) {
      const val = ghq[`ghq_${prefix}${i}`];
      if (val === "Worse than usual" || val === "Much worse than usual") total++;
    }
    return total;
  };
  const ghqScores = Object.keys(ghq).length > 0 ? {
    somatic: scoreSubscale("a", 7),
    anxiety: scoreSubscale("b", 7),
    socialDysfunction: scoreSubscale("c", 7),
    depression: scoreSubscale("d", 7),
  } : null;
  if (ghqScores) ghqScores.total = ghqScores.somatic + ghqScores.anxiety + ghqScores.socialDysfunction + ghqScores.depression;

  // Red flag detection (rule-based)
  const redFlags = detectRedFlags(responseMap, bmi, ghqScores);

  // Save red flags immediately (no AI needed)
  await prisma.intakeSubmission.update({
    where: { id: submission.id },
    data: { redFlags: redFlags },
  });

  if (saveMode && summaryFile) {
    // Read the summary from file and save to database
    const { readFileSync } = await import("fs");
    const summaryText = readFileSync(summaryFile, "utf-8").trim();

    await prisma.intakeSubmission.update({
      where: { id: submission.id },
      data: {
        summary: {
          text: summaryText,
          bmi,
          whr,
          ghqScores,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`Summary saved for ${client.name}.`);
    return;
  }

  // Print the data for Claude to summarize
  console.log("=== INTAKE SUMMARY REQUEST ===");
  console.log(`Client: ${client.name} (ID: ${clientId})`);
  console.log(`Submission: ${submission.id}`);
  console.log(`Red flags detected: ${redFlags.length}`);
  if (redFlags.length > 0) {
    console.log("\nRED FLAGS:");
    for (const flag of redFlags) {
      console.log(`  [${flag.severity.toUpperCase()}] ${flag.title}: ${flag.detail}`);
    }
  }
  console.log(`\nBMI: ${bmi || "N/A"}`);
  console.log(`WHR: ${whr || "N/A"}`);
  if (ghqScores) {
    console.log(`GHQ-28: Total ${ghqScores.total}/28 (Somatic ${ghqScores.somatic}, Anxiety ${ghqScores.anxiety}, Social ${ghqScores.socialDysfunction}, Depression ${ghqScores.depression})`);
  }

  console.log("\n=== FULL INTAKE TRANSCRIPT ===\n");

  // Print all responses in readable format
  const sectionOrder = [
    "basic_info", "goals", "current_habits", "eating_patterns",
    "history_genetics", "stress_sleep", "gut_health", "bloodwork",
    "ghq28", "emotional_health"
  ];
  const sectionNames = {
    basic_info: "Basic Information",
    goals: "Goals",
    current_habits: "Habits & Lifestyle",
    eating_patterns: "Eating Patterns",
    history_genetics: "Medical History & Genetics",
    stress_sleep: "Stress & Sleep",
    gut_health: "Gut Health",
    bloodwork: "Bloodwork",
    ghq28: "General Health Questionnaire",
    emotional_health: "Emotional Health",
  };

  for (const sectionKey of sectionOrder) {
    const data = responseMap[sectionKey];
    if (!data || Object.keys(data).length === 0) continue;

    console.log(`## ${sectionNames[sectionKey] || sectionKey}`);
    for (const [key, val] of Object.entries(data)) {
      if (val === undefined || val === null || val === "") continue;
      const display = typeof val === "boolean" ? (val ? "Yes" : "No") :
                      Array.isArray(val) ? val.join(", ") : String(val);
      console.log(`  ${key}: ${display}`);
    }
    console.log("");
  }

  console.log("=== END TRANSCRIPT ===");
  console.log(`\nTo save the summary, run:`);
  console.log(`  node scripts/generate-summary.mjs --client ${clientId} --save --summary-file <path-to-summary.txt>`);
}

function detectRedFlags(responses, bmi, ghqScores) {
  const flags = [];

  // ── GHQ-28 Flags ──
  if (ghqScores) {
    if (ghqScores.depression >= 2) {
      flags.push({
        category: "mental_health",
        severity: ghqScores.depression >= 4 ? "critical" : "warning",
        title: "Depression subscale elevated",
        detail: `GHQ-28 depression score: ${ghqScores.depression}/7. ${ghqScores.depression >= 4 ? "Consider psychiatrist/psychologist referral." : "Monitor closely."}`,
        source: "ghq28",
      });
    }
    if (ghqScores.anxiety >= 4) {
      flags.push({
        category: "mental_health",
        severity: "warning",
        title: "Anxiety & insomnia subscale elevated",
        detail: `GHQ-28 anxiety score: ${ghqScores.anxiety}/7. Sleep and stress management should be prioritized.`,
        source: "ghq28",
      });
    }
    if (ghqScores.total >= 12) {
      flags.push({
        category: "mental_health",
        severity: "warning",
        title: "Overall GHQ-28 score elevated",
        detail: `Total score: ${ghqScores.total}/28. Consider whether the client needs mental health support alongside coaching.`,
        source: "ghq28",
      });
    }
  }

  // ── Suicidal ideation (GHQ-28 D4, D6, D7) ──
  const ghq = responses["ghq28"] || {};
  for (const key of ["ghq_d4", "ghq_d6", "ghq_d7"]) {
    const val = ghq[key];
    if (val === "Worse than usual" || val === "Much worse than usual") {
      flags.push({
        category: "mental_health",
        severity: "critical",
        title: "Suicidal ideation flagged",
        detail: `Client answered "${val}" on ${key === "ghq_d4" ? "thoughts of suicide" : key === "ghq_d6" ? "wishing they were dead" : "idea of taking their life"}. Immediate clinical assessment recommended.`,
        source: key,
      });
      break;
    }
  }

  // ── BMI Flags ──
  if (bmi !== null) {
    if (bmi >= 35) {
      flags.push({
        category: "medical",
        severity: "warning",
        title: "BMI indicates obesity (Class II+)",
        detail: `BMI: ${bmi}. Consider gradual exercise progression. Medical clearance may be needed for high-intensity training.`,
        source: "basic_info",
      });
    }
    if (bmi < 18.5) {
      flags.push({
        category: "medical",
        severity: "warning",
        title: "BMI indicates underweight",
        detail: `BMI: ${bmi}. Screen for disordered eating. Calorie targets should be at or above maintenance.`,
        source: "basic_info",
      });
    }
  }

  // ── Emotional Eating / Binge Patterns ──
  const emotional = responses["emotional_health"] || {};
  if (
    emotional["binge_episodes"] === "Often (multiple times a week)" ||
    emotional["binge_episodes"] === "Sometimes (weekly)"
  ) {
    flags.push({
      category: "behavioral",
      severity: emotional["binge_episodes"] === "Often (multiple times a week)" ? "critical" : "warning",
      title: "Binge eating pattern reported",
      detail: `Client reports ${String(emotional["binge_episodes"]).toLowerCase()} binge episodes. Consider whether a restrictive calorie target is appropriate. May benefit from therapist referral.`,
      source: "emotional_health.binge_episodes",
    });
  }
  if (
    emotional["emotional_eating"] === "Very often" ||
    emotional["emotional_eating"] === "Often"
  ) {
    flags.push({
      category: "behavioral",
      severity: "info",
      title: "Emotional eating pattern",
      detail: `Client eats more when stressed, bored, or emotional: "${emotional["emotional_eating"]}". Address in behavior ecosystem and stress management.`,
      source: "emotional_health.emotional_eating",
    });
  }

  // ── Bloodwork Flags ──
  const blood = responses["bloodwork"] || {};
  if (blood["has_bloodwork"] === true) {
    const checks = [
      { key: "hba1c", label: "HbA1c", high: 5.7, msg: "Pre-diabetic range. Carbohydrate management and exercise critical." },
      { key: "vitamin_d", label: "Vitamin D", low: 30, msg: "Deficient. Supplementation recommended." },
      { key: "hdl", label: "HDL Cholesterol", low: 40, msg: "Low protective cholesterol. Cardiovascular risk factor." },
      { key: "triglycerides", label: "Triglycerides", high: 150, msg: "Elevated. Cardiovascular and metabolic risk." },
      { key: "uric_acid", label: "Uric Acid", high: 7, msg: "Elevated. Risk of gout and kidney issues." },
      { key: "tsh", label: "TSH", high: 4.5, msg: "Elevated. Possible hypothyroidism. Affects metabolism and energy." },
      { key: "fasting_glucose", label: "Fasting Glucose", high: 100, msg: "Above normal. Pre-diabetic range." },
    ];
    for (const c of checks) {
      const val = parseFloat(String(blood[c.key] || ""));
      if (isNaN(val)) continue;
      if (c.high !== undefined && val > c.high) {
        flags.push({ category: "bloodwork", severity: "warning", title: `${c.label} elevated (${val})`, detail: c.msg, source: `bloodwork.${c.key}` });
      }
      if (c.low !== undefined && val < c.low) {
        flags.push({ category: "bloodwork", severity: "warning", title: `${c.label} low (${val})`, detail: c.msg, source: `bloodwork.${c.key}` });
      }
    }
  }

  // ── Medication + Supplement Interaction Flags ──
  const medical = responses["history_genetics"] || {};
  if (medical["has_medications"] === true && medical["has_supplements"] === true) {
    flags.push({
      category: "medical",
      severity: "info",
      title: "Client on both medications and supplements",
      detail: "Review for interactions before adding new supplement recommendations.",
      source: "history_genetics",
    });
  }

  // ── Injury + Exercise Flags ──
  const habits = responses["current_habits"] || {};
  if (medical["has_injuries"] === true && habits["currently_exercise"] === true) {
    flags.push({
      category: "exercise",
      severity: "info",
      title: "Active with injuries",
      detail: "Client exercises despite injuries. Review injury details before prescribing workout plan. May need physio referral.",
      source: "history_genetics.injuries + current_habits.currently_exercise",
    });
  }

  // ── Reproductive Health Flags ──
  if (
    medical["menstrual_regularity"] === "Very irregular or absent" ||
    medical["menstrual_regularity"] === "Irregular"
  ) {
    flags.push({
      category: "medical",
      severity: medical["menstrual_regularity"] === "Very irregular or absent" ? "warning" : "info",
      title: "Irregular menstrual cycles",
      detail: "May indicate PCOS, thyroid issues, or hormonal imbalance. Check if already diagnosed. Consider endocrinologist referral if not investigated.",
      source: "history_genetics.menstrual_regularity",
    });
  }

  // ── Gut Health Severity ──
  const gut = responses["gut_health"] || {};
  const gutSevere = ["bloating", "constipation", "acid_reflux"].filter(
    k => gut[k] === "Often" || gut[k] === "Always"
  );
  if (gutSevere.length >= 2) {
    flags.push({
      category: "gut",
      severity: "warning",
      title: "Multiple frequent gut symptoms",
      detail: `Client reports frequent: ${gutSevere.join(", ")}. Consider gastroenterologist referral or detailed gut protocol.`,
      source: "gut_health",
    });
  }

  // ── Sleep Flags ──
  const stress = responses["stress_sleep"] || {};
  if (
    stress["sleep_hours"] === false &&
    stress["trouble_falling_asleep"] === true &&
    stress["night_waking"] === true
  ) {
    flags.push({
      category: "medical",
      severity: "warning",
      title: "Severe sleep disruption",
      detail: "Client is not getting 7-9 hours, has trouble falling asleep, AND wakes frequently. Sleep should be a primary intervention target.",
      source: "stress_sleep",
    });
  }

  return flags;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
