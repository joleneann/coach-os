# Coach OS — Product Document

## Vision

Coach OS digitizes Jolene's nutrition/lifestyle coaching workflow, which currently lives in Excel spreadsheets with some client data also flowing through WhatsApp. Three pain points drive this:

1. **Intake** (client-facing): 10-sheet, 1000+ row Excel assessment is intimidating and slow to fill. Clients drop off or rush through it.
2. **Plan** (coach-facing): Synthesizing intake into a 35-page personalized plan takes 8-10+ hours of manual work per client.
3. **Tracker + Weekly Review** (both): Weekly logging is friction-heavy in spreadsheets, and the coach must manually review and write feedback for each client every week.

The system preserves clinical depth (no shortcuts on intake thoroughness), keeps the coach in control of all clinical decisions, and provides RAG-backed citations for every claim in AI-generated outputs.

---

## Design Philosophy

When traditional ladders of self-improvement collapse, the body becomes the last investable asset — and wellness becomes a vice when it turns life into a KPI dashboard. Coach OS must not become the thing it's trying to heal.

### 1. The tracker should not feel like a management dashboard
Daily check-ins should be brief and human. "How was your day?" not "Log your macros to the gram." No red/green color coding on adherence. No guilt-inducing "you missed 3 days" banners. The system tracks data quietly in the background — the client-facing experience should feel warm, not clinical.

### 2. Coach OS should optimize for connection, not quantification
The system exists to make the coach-client relationship more effective, not to replace it with data. Weekly reviews are written by the coach (AI drafts, coach approves) — the client should always feel they're hearing from their coach, not from software.

### 3. Progress is not just numbers
The client dashboard should celebrate behavioral wins ("you've been consistent for 3 weeks") alongside metric changes. Weight, macros, and adherence percentages are tools for the coach — not the primary language the client sees.

### 4. The system should know when to back off
Proactive nudges must be encouraging, never guilt-inducing. A missed check-in is not a failure — it's a data point. If a client goes quiet, the system flags it for the coach rather than bombarding the client. The coach decides how to re-engage, not the algorithm.

### 5. The configurable dashboard is a clinical decision
The coach choosing minimal vs. standard vs. data-heavy mode per client is not a UX preference — it is a clinical judgment call about what is psychologically safe for that specific person.

---

## System 1: Intake

### One Continuous Flow
All sections in a single intake form. Coach needs all data before formulating the plan, so no gating.

**Order:**
1. Basic Info
2. Goals
3. Current Habits (merged with exercise history — past → present flow)
4. Food Record (voice input enabled)
5. History & Genetics
6. Stress & Sleep
7. Gut Health
8. Bloodwork (conditional — skip if no recent results)
9. GHQ-28 (validated instrument — untouched)
10. Emotional Health (voice input enabled)

**UX features:**
- Conditional branching reduces questions by ~30-40% for clients without certain conditions
- Progress bar: "Section 4 of 10"
- Save and resume: stop mid-way, come back later
- Section-level context: "here's why we ask this" notes
- Voice input on narrative sections (Groq Whisper)

---

## System 2: Plan Generation

### Workflow
```
Step 1: Auto-generate Intake Summary (1-page clinical profile with red flags)
  ↓
Step 2: Coach reviews summary, makes clinical decisions
  ↓
Step 3: AI drafts full plan from decisions + intake data
  ↓
Step 4: Coach reviews/edits each section
  ↓
Step 5: Approve → PDF generated → delivered to client
```

### Coach Decision Form
- Calorie target and macro split
- Approach (aggressive deficit / moderate / maintenance / surplus)
- Pacing (phased weight targets)
- Meal structure
- Training approach
- Referrals needed (GP, psychiatrist, gastro, diabetologist, physio)
- Key behavioral concerns
- Special considerations

### Plan Sections (mirrors current 35-page format)
1. Overview
2. Lifestyle Recommendations
3. Introductory Remarks (BMI, phased targets, behavioral observations)
4. Nutrition narrative (personalized guidance)
5. Exercise narrative
6. Stress & Mental Health
7. Blood Report Indications
8. Special Considerations (gut health, skin)
9. Supplementation
10. Nutrition Overview (calorie/macro targets)
11. Nutrition Details (example meals from food preferences)
12. Exercise Programming (workouts)
13. Tracker & Communications

### Specialist Export
Coach can export specific sections (bloodwork, gut health, nutrition plan) as a standalone PDF for the client to share with their GP/psychiatrist/diabetologist.

---

## System 3: Tracker + Weekly Review

### Flexible Tracker Templates
Generated from the plan. If the plan prescribes 4 meals/day, tracker has 4 meal slots. Diabetic client gets glucose field. Coach customizes per client.

### Daily Check-In (< 2 minutes, mobile-first)
1. Meals: per-slot adherence (Followed / Modified / Skipped)
2. Workout: Done / Modified / Skipped
3. Steps (or synced from wearable)
4. Sleep hours (slider)
5. Energy: 1-5 scale
6. Mood: 1-5 scale
7. Water: adequate / not sure / inadequate
8. Anything else: optional text or voice note

### RAG-Backed Weekly Synthesis
Every claim is traceable to specific check-in records. No hallucinated summaries.

**How it works:**
1. System queries all check-ins for the week (structured SQL)
2. Computes aggregates (avg sleep, adherence %, mood trend)
3. Detects flags (sleep < 6hrs on 3+ days, mood declining, workouts skipped)
4. Claude generates synthesis with inline citation markers
5. System validates every citation maps to real data. Ungrounded claims flagged.
6. Coach reviews, edits, approves before client sees it

### Weekly Workflow
- Saturday evening: coach runs Claude Code script for all active clients
- Sunday morning: review drafts, edit, approve
- On approval: client receives feedback with citations

---

## Client Dashboard (Configurable)

**Minimal mode**: plan access, check-in button, weekly reviews
**Standard mode**: adds progress charts (weight, adherence, mood)
**Data-heavy mode**: adds macro tracking, sleep/HRV trends, historical comparisons

Coach sets the mode per client based on clinical judgment.

### Dashboard Features
- My Plan: view/download PDF, summary card, referrals list
- Weekly Reviews: timeline with citations, client can reply
- Check-In History: calendar view
- Progress: weight trend, adherence trend, behavioral wins

---

## Future Features (Shelved)

These are explicitly deferred. Do not include unless Jolene asks:
- **Photo-based food logging** — adds coach workload
- **Sentiment analysis on check-ins** — not exact science yet

---

## Tech Stack

| Component | Choice | Cost |
|-----------|--------|------|
| Framework | Next.js 15 + PWA | Free |
| Database | PostgreSQL on Supabase | Free tier |
| Auth | NextAuth.js + row-level security | Free |
| AI (heavy) | Claude Code scripts | Included in $100/mo subscription |
| AI (light) | Groq Llama 3.3 70B | Free tier |
| Voice | Groq Whisper | Free tier |
| Hosting | Vercel | Free tier |
| Email/Nudges | Resend | Free tier (3,000/month) |
| Wearables | Fitbit + Google Fit APIs | Free |
| Security | Snyk + OWASP ZAP | Free |

**Total extra cost: $0 beyond existing Claude subscription**

---

## Build Phases

1. **Foundation + Intake** — scaffolding, data model, intake form, coach review ✅
2. **Plan Generation** — intake summary, coach decisions, AI drafting, PDF export
3. **Tracker + Daily Check-Ins** — flexible templates, mobile check-in form
4. **Weekly Review + RAG Citations** — citation engine, synthesis, coach approval
5. **Client Dashboard** — configurable views, progress, timeline
6. **Voice Input + Proactive Nudges** — Groq Whisper, rule-based nudges
7. **Wearable Integration** — Fitbit, Google Fit
8. **Polish + Security** — coach dashboard, mobile, security scanning

---

## Privacy & Security

- Each client has own login with bcrypt-hashed password
- Row-level security: every DB query filters by clientId
- Client data anonymized before AI processing (IDs, not names)
- Intake includes explicit consent for AI-assisted plan generation
- Specialists never access Coach OS — coach exports relevant sections as PDF
- HTTPS everywhere (Vercel default)
- Manual pen test recommended before going live (~$500-2000 one-time)
