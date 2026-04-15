# Coach OS

A workflow operating system for nutrition and lifestyle coaching.

Coach OS replaces a fragile stack of Excel sheets, PDFs, WhatsApp threads, and manual weekly reviews with a structured coaching system built for high-trust, longitudinal care. It combines adaptive intake, coach-led plan generation, flexible client tracking, evidence-backed weekly reviews, and AI assistance with mandatory human approval.

**Core principle:** the system should increase clinical leverage without making the client experience feel cold, obsessive, or over-quantified.

---

## Current Status

**All 8 build phases are complete.** The system is functional end-to-end: a client can complete intake, receive a personalized plan, check in daily, get weekly reviews from their coach, and track habit progress over time on a configurable dashboard.

| Phase | Status | What |
|-------|--------|------|
| 1. Foundation + Intake | Complete | Auth, 10-section intake form, conditional branching, save/resume, coach review view |
| 2. Plan Generation | Complete | 5-step workflow: summarize, coach decisions, Claude draft, review/edit, approve/deliver |
| 3. Tracker + Check-ins | Complete | Template from decisions, mobile micro-form, habit graduation, journal-style UX |
| 4. Weekly Review + RAG | Complete | Aggregation, citation engine, Claude synthesis, three-part structure, coach approval gate |
| 5. Client Dashboard | Complete | Tabbed (Today/Progress/Reviews/Plan), Recharts charts, mode-specific layouts, collapsible sections |
| 6. Voice Input | Complete | Groq Whisper transcription on check-in reflections and intake narrative questions |
| 7. Wearable Integration | Scaffolded | Fitbit + Google Fit OAuth + data sync adapters (needs API credentials to activate) |
| 8. Polish + Security | Complete | PWA manifest + service worker, security headers (HSTS, XFO, nosniff), Inter font enforcement |

---

## Why This Exists

Most independent coaches and small practices run their workflow across spreadsheets, PDFs, chat threads, and memory. That creates three problems:

1. **Client drop-off at intake.** Long, spreadsheet-based assessments are intimidating and easy to abandon.
2. **High manual effort for plan creation.** Translating intake data into a personalized coaching plan takes 8-10+ hours per client.
3. **Review fatigue at scale.** Weekly tracking and feedback are valuable, but become operationally expensive as the client base grows.

Coach OS preserves clinical depth while reducing administrative drag. It does not replace the coach. It gives the coach better infrastructure.

---

## System Overview

```
Client Intake (10 sections, voice-enabled)
    |
    v
Coach Reviews Intake Summary (auto-computed BMI, WHR, GHQ-28, red flags)
    |
    v
Coach Makes Clinical Decisions (7 areas: nutrition, exercise, lifestyle, supplements, referrals, habits, dashboard mode)
    |
    v
Claude Code Drafts Personalized Plan (15 sections, grounded in intake data)
    |
    v
Coach Edits and Approves Plan --> TrackerTemplate auto-generated from decisions
    |
    v
Client Daily Check-ins (habits, metrics, reflection, voice notes)
    |
    v
Weekly Aggregation + Citation Engine (structured SQL, not vector search)
    |
    v
Claude Code Generates Review Synthesis (three-part: Your week / What stood out / For next week)
    |
    v
Coach Reviews, Edits, Approves --> Delivered to Client
    |
    v
Habit Graduation System (daily --> twice-weekly --> weekly based on adherence)
    |
    v
[Cycle repeats: Plan > Act > Record > Reassess]
```

---

## User Roles

### Coach

- Reviews intake data and clinical summary
- Makes all clinical decisions (calorie targets, macros, exercise plan, referrals, starting habits)
- Selects dashboard mode per client (MINIMAL / STANDARD / DATA_HEAVY) based on clinical judgment
- Edits AI-drafted plans before delivery
- Approves weekly reviews before clients see them
- Approves habit graduation suggestions (daily to twice-weekly to weekly)
- Triggers weekly review generation via Claude Code scripts

### Client

- Completes adaptive intake assessment (voice input supported on narrative sections)
- Logs daily check-ins in under 2 minutes (habits, metrics, reflection with voice option)
- Views personalized plan
- Reads coach-approved weekly reviews
- Sees progress on a tabbed dashboard (Today / Progress / Reviews / Plan)
- Habits automatically reduce frequency as they become established

---

## Design Philosophy

When self-improvement becomes a KPI dashboard, wellness stops feeling like care and starts feeling like surveillance. Coach OS is designed to avoid that trap.

### The client experience should feel human

Daily check-ins feel like opening a journal, not submitting a performance report. No red/green adherence coding. No guilt language. "Not today" instead of "missed." Stone and amber palette only.

### The coach stays in control

AI can summarize, draft, and organize. The coach makes clinical decisions and approves every client-facing output. The client should always feel they're hearing from their coach, not from software.

### Progress is broader than metrics

Behavioral wins, consistency, and emotional context matter alongside numbers. Weekly reviews lead with "You cooked at home 4 times" not "57% meal compliance." The system names behaviors being formed, not just metrics.

### The system knows when not to intervene

A missed check-in is not a failure. Gentle streaks show "5 of 7 days" not "2 days missed." Maximum 3 loss signals at once. If a client goes quiet, the system flags it for the coach rather than bombarding the client.

### Dashboard intensity is a clinical choice

Some clients benefit from data-heavy views. Others would be harmed by them, especially clients with addictive or obsessive tendencies (which the intake explicitly screens for). The coach choosing MINIMAL vs. STANDARD vs. DATA_HEAVY mode per client is not a UX preference. It is a clinical judgment call about what is psychologically safe for that specific person.

### No gamification

No badges, leaderboards, points, or streak records. The check-in is a journal, not a game. Habit graduation happens quietly in the background based on adherence, not as a reward mechanism.

---

## Product Architecture

### 1. Intake System

A continuous, 10-section intake flow with conditional branching, save-and-resume, and voice input for narrative responses. Sections: Basic Info, Goals, Habits and Lifestyle, Eating Patterns, Medical History, Stress and Sleep, Gut Health, Bloodwork, GHQ-28, Emotional Health. Branching reduces visible questions by 30-40% for clients without certain conditions.

Auto-computes BMI, waist-hip ratio, and GHQ-28 subscale scores. Red flag detection via Groq Llama 3.3 70B identifies potential referral needs.

### 2. Plan Generation System

Five-step workflow combining structured intake data, coach decisions, and AI-assisted drafting:

1. **Intake summary** with auto-computed metrics and red flag extraction
2. **Coach decision form** across 7 clinical areas (nutrition targets, exercise plan, lifestyle, supplements, referrals, starting habits, dashboard mode)
3. **Claude Code draft generation** producing up to 15 plan sections, each grounded in specific intake data
4. **Coach review and editing** before any client sees the content
5. **Approval and delivery** which auto-generates the tracker template

The intake-to-plan data map ensures every plan section pulls from the right intake questions. 10 intake sections feed 15 plan sections through documented mappings.

### 3. Tracker and Daily Check-ins

Each client gets a plan-specific tracker template auto-generated from coach decisions. The template defines what the client sees each day, filtered by their dashboard mode:

- **Habits** (all modes): yes / partly / not today. From the coach's starting habits.
- **Metrics** (STANDARD + DATA_HEAVY): steps, water, sleep quality.
- **Meal logging** (DATA_HEAVY only): text input per meal slot.
- **Reflection** (all modes): rotating prompts with voice input option. Always last.

Check-ins are under 2 minutes for MINIMAL mode. Responses stored as JSON with upsert (re-submissions update, don't fail).

### 4. Habit Graduation System

Habits start as daily. Based on adherence, they graduate through tracking frequencies:

- **Daily to twice-weekly**: 80%+ adherence each week for 3 consecutive weeks
- **Twice-weekly to weekly**: 100% on twice-weekly checks for 3 consecutive weeks
- **Demotion**: drops below threshold in any week, back to previous frequency

The system auto-suggests graduation or demotion. The coach approves before the client's tracker changes. On non-tracking days, graduated habits are hidden from the check-in form, keeping it short.

### 5. Weekly Review (RAG-backed)

Weekly reviews are the "Reassess" step of the PAR cycle (Plan, Act, Record, Reassess). The system uses Retrieval-Augmented Generation with structured SQL (not vector search):

1. **Retrieval**: 7 days of check-in data, tracker template fields, plan sections, previous review
2. **Augmentation**: all retrieved context organized as structured prompts with citations
3. **Generation**: Claude Code produces a three-part narrative:
   - "Your week" (factual summary with dates)
   - "What stood out" (behavioral wins, not just metrics)
   - "For next week" (1-2 specific micro-actions)

Every claim in the synthesis is grounded in specific check-in dates and tracker fields. Coach reviews, optionally edits, approves, and delivers. Client never sees an unreviewed synthesis.

### 6. Client Dashboard

Tabbed interface (Today / Progress / Reviews / Plan) with mode-specific content:

- **MINIMAL**: check-in card, latest review link, plan link. Nothing else.
- **STANDARD**: adds PAR cycle indicator, habit progress view, metric trend charts (Recharts), week-at-a-glance grid.
- **DATA_HEAVY**: adds 8-week trends, per-habit adherence bar charts, past reviews list, graduation timeline.

Sections are collapsible with state persisted in localStorage. Charts use stone/amber palette. Trends show direction, not raw numbers prominently.

### 7. Voice Input

Groq Whisper Large v3 Turbo (free tier, 2000 requests/day) provides voice-to-text transcription. A mic button appears next to:

- Check-in reflection textarea (most common use)
- Intake narrative questions (goals, stress coping, emotional health)

Client taps mic, speaks, transcript appears in the text field. Client can edit before saving. Audio stored as base64 alongside transcript.

### 8. Wearable Integration (Scaffolded)

Full OAuth 2.0 integration layer for Fitbit and Google Fit. Adapters handle auth flow, token refresh, and data sync (steps, sleep, heart rate, active minutes). Data stored in WearableData model with unique constraint per client/provider/date/dataType.

Requires Fitbit Developer and Google Fit API credentials to activate. Apple Health deferred (requires native app).

---

## AI Safety and Boundaries

Coach OS is a clinical support system, not an autonomous clinical actor.

- AI-generated plans are drafts, not final recommendations
- The coach approves all client-facing outputs (plans and weekly reviews)
- The system does not make referral or diagnosis decisions independently
- Red flags are surfaced for coach review, not automatically acted upon
- Every claim in weekly synthesis is backed by citations to source data
- Client data is anonymized before AI processing
- Intake includes explicit consent for AI-assisted plan generation
- No automated emails or messages sent to clients without coach action

---

## Tech Stack

| Layer | Choice | Cost |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript + Tailwind CSS | Free |
| Database | PostgreSQL on Supabase (free tier) + Prisma ORM v6 | Free |
| Auth | NextAuth.js v5 (JWT sessions, role-based access) | Free |
| AI (heavy) | Claude Code scripts for plan drafting + weekly synthesis | Existing subscription |
| AI (light) | Groq Llama 3.3 70B for intake summaries, red flags | Free tier |
| Voice | Groq Whisper Large v3 Turbo for transcription | Free tier |
| Charts | Recharts for metric trends and habit adherence | Free |
| PWA | Service worker + web app manifest | Free |
| Hosting | Vercel + Supabase | Free tier |
| Wearables | Fitbit + Google Fit APIs (scaffolded) | Free |
| **Total** | | **$0 beyond Claude subscription** |

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (copy from .env.example or create .env)
# Required: DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL
# Optional: GROQ_API_KEY (for voice transcription)

# Run database migrations
npx prisma migrate dev

# Seed test accounts
node scripts/seed.mjs

# Start dev server
npm run dev
```

### Test Accounts

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Coach | coach@test.dev | coach123 | Active |
| Client (Rohan) | rohan@test.dev | client123 | ACTIVE (has plan + tracker) |
| Client (Priya) | priya@test.dev | client123 | INTAKE |
| Client (Lakshmi) | lakshmi@test.dev | client123 | INTAKE |
| Client (Arjun) | client@test.dev | client123 | INTAKE |

### Key Commands

```bash
npm run dev                                      # Dev server (localhost:3000)
npx prisma studio                                # Database GUI
npx prisma migrate dev --name <name>             # New migration
node scripts/generate-plan.mjs --client <id>     # Generate plan via Claude Code
node scripts/generate-review.mjs --client <id>   # Generate weekly review via Claude Code
```

---

## Database Schema

14 tables across 5 domains:

**Auth**: User, Account, Session, VerificationToken

**Intake**: IntakeSubmission (status, currentSection, summary, redFlags), IntakeResponse (sectionKey, questionKey, value, inputMethod, rawVoiceTranscript)

**Plan**: Plan (version, status, coachDecisions, generatedContent, coachEdits), PlanSection (sectionType, content, order)

**Tracker**: TrackerTemplate (fields JSON with habit graduation metadata), DailyCheckIn (date, responses JSON, voiceNoteUrl, voiceTranscript), WeeklyReview (status, synthesisData, citations, coachFeedback)

**Wearables**: WearableConnection (provider, tokens, sync status), WearableData (date, dataType, value)

---

## Copy and Design Rules

- **Font**: Inter everywhere. No exceptions. Enforced in globals.css.
- **Palette**: Stone (neutral) + Amber (accent). No red/green adherence coding.
- **No em dashes** in any client-facing text. Use periods, commas, or rewrite.
- **No gamification**: no badges, leaderboards, points, or streak records.
- **Gentle framing**: "5 of 7 days" not "2 days missed." "Not today" not "skipped."
- **Under 2 minutes**: daily check-in must be completable in under 2 minutes for MINIMAL mode.

---

## Architecture Diagram

An interactive HTML architecture diagram showing all 8 phases, data flows, and connections is available at:

```
docs/architecture-diagram-v2.html
```

Open in any browser. Hover blocks to trace data flow connections between intake sections, plan sections, tracker fields, and weekly reviews.

---

## License

MIT
