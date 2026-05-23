/**
 * Seed 3 synthetic test clients with complete intake data for Phase 2 testing.
 *
 * Archetypes:
 *   1. Priya Sharma — young female, healthy weight, strength-focused, anxiety/migraines
 *   2. Rohan Kulkarni — young male, obese, complex medical, yo-yo dieter
 *   3. Lakshmi Iyer — older female, active vegetarian, perimenopause
 *
 * All data is synthetic. No real client information.
 *
 * Usage: node scripts/seed-test-clients.mjs
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find or create the coach
  let coach = await prisma.user.findUnique({ where: { email: "coach@test.dev" } });
  if (!coach) {
    const hash = await bcrypt.hash("coach123", 12);
    coach = await prisma.user.create({
      data: {
        email: "coach@test.dev",
        name: "Test Coach",
        passwordHash: hash,
        role: "COACH",
        credentials: "Clinical Nutritionist",
      },
    });
  }

  const password = await bcrypt.hash("client123", 12);

  // ─── Test Client 1: Priya Sharma ───────────────────────────
  const priya = await createClientWithIntake(coach.id, password, {
    email: "priya@test.dev",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    status: "INTAKE",
    intake: {
      basic_info: {
        name: "Priya Sharma",
        age: "28",
        gender: "Female",
        height: "162",
        weight: "56",
        waist: "70",
        hip: "92",
        body_fat: "",
        ethnicity: "Indian",
        occupation: "Designer at a tech company",
        living_situation: "Lives with family and partner. Household tends toward ordering in frequently.",
        dietary_preference: "Non-vegetarian",
      },
      goals: {
        goal_physical: "Build upper body strength. Would like to be able to do unassisted pull-ups within a year.",
        goal_nutrition: "Eat more regularly. Currently skips meals when busy and overeats later. Wants a sustainable pattern.",
        goal_wellbeing: "Reduce work-related stress and anxiety. Improve sleep. Fewer migraines.",
        past_efforts: "Has tried various workout routines but tends to lose interest in repetitive strength training. Sticks well with yoga and cycling. Has never tracked nutrition properly.",
        willing_compromises: "Open to cooking more and reducing ordering in. Committed to 4-5 workouts per week. Willing to reduce but not eliminate social drinking.",
        motivation: "Wants to feel strong and capable. Notices anxiety is worse during periods of physical inactivity.",
        timeline: "",
      },
      current_habits: {
        weight_history: "Has been stable around mid-50s for several years, with a gradual gain of a few kilograms in the past year.",
        played_sports: false,
        gym_member: false,
        currently_exercise: true,
        exercise_type: "Yoga several times a week, cardio and bodyweight workouts, weekend cycling, occasional swimming",
        exercise_frequency: "4-5 times per week",
        exercise_effort: "Moderate",
        exercise_duration: "Consistent for about two years",
        gym_access: "Yes, home setup with light equipment",
        equipment_details: "Yoga mat, resistance bands, light dumbbells, foam roller",
        steps_daily: "6000",
        sitting_hours: "8",
        cooking_ability: "Sometimes",
        meal_frequency: "2",
        foods_i_like: "Chicken, eggs, dal, rice, roti, paneer, fruits, yogurt, nuts, dark chocolate, pasta, vegetables, smoothies",
        foods_i_dislike: "Bitter gourd, raw onions, very spicy food",
        water_intake: "1-2 liters",
        alcohol: "Socially",
        smoking: "Never",
        caffeine: "2 cups coffee",
      },
      eating_patterns: {
        typical_day: "Often skips breakfast due to early work focus. First meal mid-afternoon, typically home-cooked dal and rice. Evening snack of fruit or biscuits. Late dinner, sometimes ordered in.",
        weekend_differences: "More meals out, brunch with friends, increased alcohol consumption.",
        snacking: "Sometimes",
        eating_out: "3-5 times a week",
      },
      history_genetics: {
        family_conditions: ["Heart disease", "Diabetes"],
        has_conditions: false,
        has_medications: false,
        has_supplements: true,
        supplements_current: "Vitamin D, taken irregularly",
        has_injuries: false,
        has_surgeries: false,
        menstrual_regularity: "Regular (every 21-35 days)",
        reproductive_conditions: "",
      },
      stress_sleep: {
        dark_circles: true,
        sleep_hours: false,
        sleep_quality: false,
        night_waking: false,
        trouble_falling_asleep: true,
        sleep_time: "12:30 AM",
        wake_time: "8:00 AM",
        screen_before_bed: true,
        stress_level: "7",
        stress_sources: "Work deadlines, creative blocks, household tensions around food, productivity anxiety",
        stress_coping: "Yoga, cycling, friends, sometimes unproductive scrolling",
        hrv: "8",
        headaches: true,
        energy_pattern: "Morning",
      },
      gut_health: {
        antacids: false,
        laxatives: false,
        antibiotics: false,
        bloating: "Sometimes",
        constipation: "Rarely",
        acid_reflux: "Rarely",
        bowel_regularity: "Mostly regular",
        has_food_sensitivities: false,
      },
      bloodwork: {
        has_bloodwork: false,
      },
      ghq28: {
        ghq_a1: "Same as usual", ghq_a2: "Same as usual", ghq_a3: "Worse than usual",
        ghq_a4: "Same as usual", ghq_a5: "Worse than usual", ghq_a6: "Same as usual",
        ghq_a7: "Same as usual",
        ghq_b1: "Worse than usual", ghq_b2: "Same as usual", ghq_b3: "Worse than usual",
        ghq_b4: "Same as usual", ghq_b5: "Same as usual", ghq_b6: "Worse than usual",
        ghq_b7: "Same as usual",
        ghq_c1: "Same as usual", ghq_c2: "Same as usual", ghq_c3: "Same as usual",
        ghq_c4: "Same as usual", ghq_c5: "Same as usual", ghq_c6: "Same as usual",
        ghq_c7: "Same as usual",
        ghq_d1: "Same as usual", ghq_d2: "Same as usual", ghq_d3: "Same as usual",
        ghq_d4: "Same as usual", ghq_d5: "Same as usual", ghq_d6: "Same as usual",
        ghq_d7: "Same as usual",
      },
      emotional_health: {
        miss_workout_feeling: "Brief frustration, then attempts to make up for it the next day.",
        unplanned_indulgence: "Mild guilt but actively working on not spiralling. Has improved over time.",
        wedding_eating: "Enjoys the food without restriction at celebrations.",
        body_image: "Generally okay with body but wants more visible strength. No body hatred, just a desire to feel stronger.",
        emotional_eating: "Sometimes",
        binge_episodes: "Rarely (once a month or less)",
        self_talk: "Mostly neutral, occasionally self-critical after stretches of missed workouts.",
        support_system: "Supportive family. Partner has different health priorities but is not unsupportive. Active friend group.",
        mental_health_support: "No, but open to it",
        anything_else: "Suspects migraines are stress and screen related, hopes nutrition can help.",
      },
    },
  });
  console.log(`Created: ${priya.name} (${priya.email})`);

  // ─── Test Client 2: Rohan Kulkarni ─────────────────────────
  const rohan = await createClientWithIntake(coach.id, password, {
    email: "rohan@test.dev",
    name: "Rohan Kulkarni",
    age: 27,
    gender: "Male",
    status: "INTAKE",
    intake: {
      basic_info: {
        name: "Rohan Kulkarni",
        age: "27",
        gender: "Male",
        height: "156",
        weight: "96",
        waist: "108",
        hip: "108",
        body_fat: "",
        ethnicity: "Indian",
        occupation: "Sales role with target pressure",
        living_situation: "Lives with parent. Meals are home-cooked.",
        dietary_preference: "Vegetarian",
      },
      goals: {
        goal_physical: "Reduce body fat. Has been overweight throughout adult life. Target a healthy weight range, roughly 70-75kg.",
        goal_nutrition: "Stop late-night snacking. Eat structured meals instead of skipping breakfast and overeating later. Learn nutrition basics.",
        goal_wellbeing: "Improve sleep. Reduce anxiety. Address stress eating. Restore energy levels.",
        past_efforts: "Has attempted a very low calorie diet that produced rapid weight loss followed by full regain. Tried keto briefly. Completed several months of high-intensity training before stopping due to injury.",
        willing_compromises: "Will commit to 4-5 workouts per week. Will reduce snack foods and stop late-night eating. Wants to retain social flexibility around food.",
        motivation: "Recent diagnosis of elevated blood pressure at a young age. Doctor's warning was a wake-up. Also wants to feel confident in his body.",
        timeline: "Hoping for meaningful progress within six months.",
      },
      current_habits: {
        weight_history: "Steady upward trend through adolescence and early adulthood. Most recent year has seen the steepest increase.",
        played_sports: true,
        sports_history: "Some martial arts as a child, school-level swimming",
        gym_member: true,
        gym_experience: "Has done several months of high-intensity training. Brief bodybuilding-style work. Stopped after shoulder injury.",
        currently_exercise: false,
        gym_access: "Yes, gym membership",
        steps_daily: "2000",
        sitting_hours: "10",
        cooking_ability: "Never, someone else cooks",
        meal_frequency: "2",
        foods_i_like: "Rice, dal, roti, paneer, rajma, chole, samosas, chips, ice cream, idli, dosa, pasta, pizza",
        foods_i_dislike: "Raw vegetables, salads, most bitter foods",
        water_intake: "Less than 1 liter",
        alcohol: "Rarely",
        smoking: "Never",
        caffeine: "3 cups chai",
      },
      eating_patterns: {
        typical_day: "Skips breakfast. First meal mid-afternoon (home-cooked). Evening tea with fried snacks. Dinner around 9pm. Late-night snacking on chips and sweets, sometimes leftover food.",
        weekend_differences: "Eats out once or twice. Pizza or biryani. More snacking due to inactivity.",
        snacking: "Often",
        eating_out: "1-2 times a week",
      },
      history_genetics: {
        family_conditions: ["Diabetes", "High blood pressure", "Heart disease", "Obesity"],
        has_conditions: true,
        personal_conditions: "Recently diagnosed hypertension. Hemorrhoids, doctor advised increased dietary fiber.",
        has_medications: true,
        medications: "Antihypertensive medication, daily",
        has_supplements: false,
        has_injuries: true,
        injuries: "Past shoulder injury from training, pain on overhead movements, not formally rehabilitated.",
        has_surgeries: false,
        menstrual_regularity: "Not applicable",
      },
      stress_sleep: {
        dark_circles: true,
        sleep_hours: false,
        sleep_quality: false,
        night_waking: true,
        trouble_falling_asleep: true,
        sleep_time: "1:00 AM",
        wake_time: "8:30 AM",
        screen_before_bed: true,
        stress_level: "8",
        stress_sources: "Work targets, body image, social comparison, family worry about health, loneliness",
        stress_coping: "Eating. Screen time. Occasionally talking to a close friend.",
        hrv: "",
        headaches: false,
        energy_pattern: "Inconsistent",
      },
      gut_health: {
        antacids: false,
        laxatives: false,
        antibiotics: false,
        bloating: "Often",
        constipation: "Sometimes",
        acid_reflux: "Sometimes",
        bowel_regularity: "Irregular",
        has_food_sensitivities: false,
        gut_additional: "Has hemorrhoids and was advised to increase fiber intake.",
      },
      bloodwork: {
        has_bloodwork: true,
        hba1c: "5.8",
        vitamin_d: "11",
        hdl: "30",
        triglycerides: "228",
        uric_acid: "10",
        fasting_glucose: "105",
        bloodwork_other: "Pre-diabetic range. Very low vitamin D. Weight loss recommended.",
      },
      ghq28: {
        ghq_a1: "Same as usual", ghq_a2: "Worse than usual", ghq_a3: "Worse than usual",
        ghq_a4: "Same as usual", ghq_a5: "Same as usual", ghq_a6: "Same as usual",
        ghq_a7: "Same as usual",
        ghq_b1: "Worse than usual", ghq_b2: "Worse than usual", ghq_b3: "Worse than usual",
        ghq_b4: "Worse than usual", ghq_b5: "Same as usual", ghq_b6: "Worse than usual",
        ghq_b7: "Worse than usual",
        ghq_c1: "Same as usual", ghq_c2: "Worse than usual", ghq_c3: "Worse than usual",
        ghq_c4: "Same as usual", ghq_c5: "Same as usual", ghq_c6: "Same as usual",
        ghq_c7: "Worse than usual",
        ghq_d1: "Same as usual", ghq_d2: "Same as usual", ghq_d3: "Same as usual",
        ghq_d4: "Same as usual", ghq_d5: "Same as usual", ghq_d6: "Same as usual",
        ghq_d7: "Same as usual",
      },
      emotional_health: {
        miss_workout_feeling: "Guilt and self-anger, often followed by stress eating.",
        unplanned_indulgence: "Significant guilt, rumination, sometimes compensating by skipping subsequent meals.",
        wedding_eating: "Overeats and feels regret afterward.",
        body_image: "Strong dislike of current appearance. Avoids mirrors and photographs.",
        emotional_eating: "Very often",
        binge_episodes: "Sometimes (weekly)",
        self_talk: "Harsh, self-critical language. Aware it is unhelpful but feels unable to stop.",
        support_system: "Concerned parent. One close friend. Otherwise socially isolated.",
        mental_health_support: "No, but open to it",
        anything_else: "Has never spoken openly about late-night eating. Feels shame around it but wants to change.",
      },
    },
  });
  console.log(`Created: ${rohan.name} (${rohan.email})`);

  // ─── Test Client 3: Lakshmi Iyer ──────────────────────────
  const lakshmi = await createClientWithIntake(coach.id, password, {
    email: "lakshmi@test.dev",
    name: "Lakshmi Iyer",
    age: 49,
    gender: "Female",
    status: "INTAKE",
    intake: {
      basic_info: {
        name: "Lakshmi Iyer",
        age: "49",
        gender: "Female",
        height: "156",
        weight: "90",
        waist: "96",
        hip: "112",
        body_fat: "52",
        ethnicity: "Indian",
        occupation: "Runs her own healthcare practice",
        living_situation: "Lives with spouse and a teenage child. Manages most of the household cooking.",
        dietary_preference: "Vegetarian",
      },
      goals: {
        goal_physical: "Health and longevity, not weight loss specifically. Wants to stay strong and mobile through later life. Already exercises consistently and wants to optimize, not start from zero.",
        goal_nutrition: "Improve protein intake within a vegetarian framework. Suspects current intake is low. Wants to learn how to meet targets using familiar Indian foods.",
        goal_wellbeing: "Improve sleep quality. Reduce baseline anxiety.",
        past_efforts: "Has been physically active for over a decade across yoga, dance, strength training, and pool-based work. Past episode of stomach ulcer years ago that resolved. Has never been on a restrictive diet.",
        willing_compromises: "Open to adjusting meals to add protein. Willing to track food temporarily if helpful. Will not adopt anything that feels punishing or that removes cooking joy.",
        motivation: "Wants to be strong and capable into her fifties and beyond. Has observed mobility decline in older relatives and peers and wants to avoid it.",
        timeline: "No fixed timeline. Sees this as a long-term project.",
      },
      current_habits: {
        weight_history: "Gradual increase over the past decade. Brief dip during a past health episode followed by regain.",
        played_sports: false,
        gym_member: false,
        currently_exercise: true,
        exercise_type: "Yoga, contemporary dance, strength training with a trainer, pool-based intervals, long walks",
        exercise_frequency: "4-6 times per week",
        exercise_effort: "High",
        exercise_duration: "Consistent for over a decade",
        gym_access: "No equipment or gym access",
        steps_daily: "8000",
        sitting_hours: "6",
        cooking_ability: "Yes, regularly",
        meal_frequency: "3",
        foods_i_like: "Idli, dosa, sambhar, rasam, dal, rice, roti, paneer, tofu, lentils, vegetables, curd, buttermilk, nuts, fruits, dhokla, sprouts",
        foods_i_dislike: "Nothing in particular within a vegetarian diet",
        water_intake: "2-3 liters",
        alcohol: "Rarely",
        smoking: "Never",
        caffeine: "1 cup filter coffee, 1 cup green tea",
      },
      eating_patterns: {
        typical_day: "Early coffee. Breakfast of South Indian items with chutney or sambhar. Lunch around 1pm with rice, dal, vegetables, curd. Mid-afternoon tea with nuts or fruit. Light dinner with roti and vegetables. Occasional small dessert.",
        weekend_differences: "Eats out occasionally, often South Indian. Cooks more elaborate meals at home on weekends.",
        snacking: "Rarely",
        eating_out: "1-2 times a week",
      },
      history_genetics: {
        family_conditions: ["Diabetes", "High blood pressure"],
        has_conditions: true,
        personal_conditions: "Past stomach ulcer (resolved). Mild anxiety, not medicated.",
        has_medications: false,
        has_supplements: true,
        supplements_current: "Calcium with vitamin D daily. B12 intermittently.",
        has_injuries: false,
        has_surgeries: false,
        menstrual_regularity: "Irregular",
        reproductive_conditions: "Early perimenopause symptoms including cycle irregularity and occasional hot flashes.",
      },
      stress_sleep: {
        dark_circles: false,
        sleep_hours: false,
        sleep_quality: false,
        night_waking: true,
        trouble_falling_asleep: false,
        sleep_time: "11:00 PM",
        wake_time: "6:30 AM",
        screen_before_bed: true,
        stress_level: "4",
        stress_sources: "Running a small practice, staff management, family demands, household coordination",
        stress_coping: "Yoga, dance, walking, cooking as meditation, conversation with spouse",
        hrv: "",
        headaches: false,
        energy_pattern: "Morning",
      },
      gut_health: {
        antacids: false,
        laxatives: false,
        antibiotics: false,
        bloating: "Rarely",
        constipation: "Never",
        acid_reflux: "Rarely",
        bowel_regularity: "Very regular (daily)",
        has_food_sensitivities: false,
        gut_additional: "Past stomach ulcer, fully resolved. No current digestive issues.",
      },
      bloodwork: {
        has_bloodwork: true,
        vitamin_d: "22",
        vitamin_b12: "280",
        hdl: "52",
        ldl: "128",
        triglycerides: "140",
        tsh: "3.2",
        hemoglobin: "11.8",
        fasting_glucose: "92",
        bloodwork_other: "Most markers within range but several could be optimized. Vitamin D still low despite supplementation.",
      },
      ghq28: {
        ghq_a1: "Same as usual", ghq_a2: "Same as usual", ghq_a3: "Same as usual",
        ghq_a4: "Same as usual", ghq_a5: "Same as usual", ghq_a6: "Same as usual",
        ghq_a7: "Same as usual",
        ghq_b1: "Same as usual", ghq_b2: "Same as usual", ghq_b3: "Same as usual",
        ghq_b4: "Same as usual", ghq_b5: "Same as usual", ghq_b6: "Same as usual",
        ghq_b7: "Same as usual",
        ghq_c1: "Better than usual", ghq_c2: "Same as usual", ghq_c3: "Better than usual",
        ghq_c4: "Same as usual", ghq_c5: "Better than usual", ghq_c6: "Same as usual",
        ghq_c7: "Same as usual",
        ghq_d1: "Same as usual", ghq_d2: "Same as usual", ghq_d3: "Same as usual",
        ghq_d4: "Same as usual", ghq_d5: "Same as usual", ghq_d6: "Same as usual",
        ghq_d7: "Same as usual",
      },
      emotional_health: {
        miss_workout_feeling: "Mild disappointment. Long-standing practice has reduced reactivity to single missed sessions.",
        unplanned_indulgence: "No guilt. Views food as nourishment and pleasure rather than something to police.",
        wedding_eating: "Eats freely at celebrations without later regret.",
        body_image: "Not thrilled about current weight but does not tie self-worth to it. Values capability over appearance.",
        emotional_eating: "Rarely",
        binge_episodes: "Never",
        self_talk: "Mostly kind and matter-of-fact. Has worked on this deliberately over years.",
        support_system: "Supportive spouse. Strong community in yoga and dance circles. Family neutral but not unsupportive.",
        mental_health_support: "Have in the past",
        anything_else: "Holds food as nourishment and connection. Wants a plan that adds rather than subtracts, and that does not generate fear around her own cooking.",
      },
    },
  });
  console.log(`Created: ${lakshmi.name} (${lakshmi.email})`);

  console.log("\nAll test clients created. Password: client123");
  console.log("Login at /auth/login with any of:");
  console.log("  priya@test.dev / client123");
  console.log("  rohan@test.dev / client123");
  console.log("  lakshmi@test.dev / client123");
}

async function createClientWithIntake(coachId, passwordHash, config) {
  // Upsert user
  const user = await prisma.user.upsert({
    where: { email: config.email },
    update: { name: config.name, age: config.age, gender: config.gender },
    create: {
      email: config.email,
      name: config.name,
      passwordHash,
      role: "CLIENT",
      coachId,
      age: config.age,
      gender: config.gender,
      status: config.status,
    },
  });

  // Delete existing submissions for clean re-seed
  const existingSubs = await prisma.intakeSubmission.findMany({
    where: { clientId: user.id },
    select: { id: true },
  });
  for (const sub of existingSubs) {
    await prisma.intakeResponse.deleteMany({ where: { submissionId: sub.id } });
    await prisma.intakeSubmission.delete({ where: { id: sub.id } });
  }

  // Create submission
  const submission = await prisma.intakeSubmission.create({
    data: {
      clientId: user.id,
      status: "COMPLETE",
      currentSection: 10,
      submittedAt: new Date(),
    },
  });

  // Create responses
  for (const [sectionKey, questions] of Object.entries(config.intake)) {
    for (const [questionKey, value] of Object.entries(questions)) {
      if (value === undefined || value === null) continue;
      await prisma.intakeResponse.create({
        data: {
          submissionId: submission.id,
          sectionKey,
          questionKey,
          value: value,
        },
      });
    }
  }

  return user;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
