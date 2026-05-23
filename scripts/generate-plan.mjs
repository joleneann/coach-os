/**
 * Generate a coaching plan for a client.
 *
 * Usage (via Claude Code):
 *   claude "Run: node scripts/generate-plan.mjs --client <clientId>"
 *
 * What it does:
 *   1. Reads the client's intake data and coach decisions from the database
 *   2. Prints all the data organized by plan section
 *   3. Claude Code generates each section in conversation
 *   4. Save mode writes sections back to the database
 *
 * Workflow:
 *   1. Coach fills in decisions at /coach/clients/[id]/plan and clicks Save
 *   2. Coach runs: claude "Generate plan for client [name]"
 *   3. Claude Code runs this script, reads the data, generates sections
 *   4. Claude Code runs this script again in --save mode to persist
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const clientIdIdx = args.indexOf("--client");
const clientId = clientIdIdx !== -1 ? args[clientIdIdx + 1] : null;
const saveMode = args.includes("--save");
const sectionsFileIdx = args.indexOf("--sections-file");
const sectionsFile = sectionsFileIdx !== -1 ? args[sectionsFileIdx + 1] : null;

// Plan section definitions
const PLAN_SECTIONS = [
  { type: "summary_card", title: "Summary Card", order: 1, alwaysInclude: true },
  { type: "coaching_cycle", title: "Your Coaching Cycle", order: 2, alwaysInclude: true },
  { type: "starting_point", title: "Your Starting Point", order: 3, alwaysInclude: true },
  { type: "behavior_ecosystem", title: "Your Behavior Ecosystem", order: 4, alwaysInclude: true },
  { type: "nutrition", title: "Nutrition", order: 5, alwaysInclude: true },
  { type: "exercise", title: "Exercise", order: 6, alwaysInclude: true },
  { type: "lifestyle", title: "Lifestyle & Environment", order: 7, alwaysInclude: true },
  { type: "mental_health", title: "Stress & Mental Health", order: 8, alwaysInclude: true },
  { type: "blood_report", title: "Blood Report", order: 9, conditional: "has_bloodwork" },
  { type: "gut_health", title: "Gut Health", order: 10, conditional: "gut_symptoms" },
  { type: "supplementation", title: "Supplementation", order: 11, alwaysInclude: true },
  { type: "referrals", title: "Referrals", order: 12, conditional: "has_referrals" },
  { type: "what_happens_next", title: "What Happens Next", order: 13, alwaysInclude: true },
];

async function main() {
  if (!clientId) {
    console.error("Usage: node scripts/generate-plan.mjs --client <clientId>");
    console.error("       node scripts/generate-plan.mjs --client <clientId> --save --sections-file <path>");
    process.exit(1);
  }

  // Fetch client, plan, and intake
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true },
  });

  if (!client) {
    console.error(`Client not found: ${clientId}`);
    process.exit(1);
  }

  const plan = await prisma.plan.findFirst({
    where: { clientId, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });

  if (!plan) {
    console.error(`No draft plan for ${client.name}. Create one at /coach/clients/${clientId}/plan first.`);
    process.exit(1);
  }

  if (!plan.coachDecisions) {
    console.error(`Coach decisions not yet saved for ${client.name}'s plan.`);
    process.exit(1);
  }

  const decisions = plan.coachDecisions;

  const submission = await prisma.intakeSubmission.findFirst({
    where: { clientId, status: "COMPLETE" },
    include: { responses: true },
    orderBy: { createdAt: "desc" },
  });

  if (!submission) {
    console.error(`No completed intake for ${client.name}.`);
    process.exit(1);
  }

  // Build response map
  const responses = {};
  for (const r of submission.responses) {
    if (!responses[r.sectionKey]) responses[r.sectionKey] = {};
    responses[r.sectionKey][r.questionKey] = r.value;
  }

  // Compute metrics
  const basic = responses["basic_info"] || {};
  const weight = parseFloat(String(basic["weight"] || ""));
  const height = parseFloat(String(basic["height"] || ""));
  const bmi = weight && height ? Math.round((weight / ((height / 100) ** 2)) * 10) / 10 : null;
  const waist = parseFloat(String(basic["waist"] || ""));
  const hip = parseFloat(String(basic["hip"] || ""));
  const whr = waist && hip ? Math.round((waist / hip) * 100) / 100 : null;

  if (saveMode && sectionsFile) {
    // Parse and save sections from JSON file
    const content = readFileSync(sectionsFile, "utf-8");
    const sections = JSON.parse(content);

    // Delete existing sections
    await prisma.planSection.deleteMany({ where: { planId: plan.id } });

    for (const section of sections) {
      await prisma.planSection.create({
        data: {
          planId: plan.id,
          sectionType: section.type,
          content: section.content,
          order: section.order,
        },
      });
    }

    await prisma.plan.update({
      where: { id: plan.id },
      data: {
        status: "COACH_REVIEW",
        generatedContent: {
          generatedAt: new Date().toISOString(),
          sectionCount: sections.length,
          method: "claude-code",
        },
      },
    });

    console.log(`Plan saved with ${sections.length} sections. Status: COACH_REVIEW`);
    console.log(`Review at: /coach/clients/${clientId}/plan/review`);
    return;
  }

  // Determine which sections to include
  const gut = responses["gut_health"] || {};
  const hasGutSymptoms = ["bloating", "constipation", "acid_reflux"].some(
    s => gut[s] === "Sometimes" || gut[s] === "Often" || gut[s] === "Always"
  ) || gut["antacids"] === true || gut["laxatives"] === true || gut["has_food_sensitivities"] === true;

  const blood = responses["bloodwork"] || {};
  const hasBloodwork = blood["has_bloodwork"] === true;
  const hasReferrals = decisions.referrals && decisions.referrals.length > 0;

  const activeSections = PLAN_SECTIONS.filter(s => {
    if (s.alwaysInclude) return true;
    if (s.conditional === "has_bloodwork") return hasBloodwork;
    if (s.conditional === "gut_symptoms") return hasGutSymptoms;
    if (s.conditional === "has_referrals") return hasReferrals;
    return false;
  });

  // Print everything Claude needs to generate the plan
  console.log("=== PLAN GENERATION REQUEST ===");
  console.log(`Client: ${client.name}`);
  console.log(`Plan ID: ${plan.id}`);
  console.log(`Sections to generate: ${activeSections.length}`);
  console.log("");

  console.log("=== COACH DECISIONS ===");
  console.log(JSON.stringify(decisions, null, 2));
  console.log("");

  console.log("=== COMPUTED METRICS ===");
  console.log(`BMI: ${bmi || "N/A"}`);
  console.log(`WHR: ${whr || "N/A"}`);
  console.log("");

  console.log("=== CLIENT INTAKE DATA ===\n");

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
    ghq28: "General Health Questionnaire (GHQ-28)",
    emotional_health: "Emotional Health",
  };

  for (const sectionKey of sectionOrder) {
    const data = responses[sectionKey];
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

  console.log("=== SECTIONS TO GENERATE ===\n");
  for (const s of activeSections) {
    console.log(`${s.order}. ${s.title} (${s.type})`);
  }

  console.log("\n=== GENERATION INSTRUCTIONS ===");
  console.log(`
Generate each section as plain text. Write in a warm, conversational tone.
Address the client as "${client.name.split(" ")[0]}".
Start each section by acknowledging what they're already doing right.
Never use em dashes. Use periods, commas, or rewrite.
Frame everything around ${decisions.adherenceTarget || 80}-${(decisions.adherenceTarget || 80) + 10}% adherence.
Use Indian food examples where the client eats Indian food.
${decisions.toneGuidance ? `Tone guidance: ${decisions.toneGuidance}` : ""}

After generating all sections, save them by creating a JSON file with this structure:
[
  { "type": "summary_card", "order": 1, "content": "..." },
  { "type": "coaching_cycle", "order": 2, "content": "..." },
  ...
]

Then run:
  node scripts/generate-plan.mjs --client ${clientId} --save --sections-file <path>
`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
