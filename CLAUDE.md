# Coach OS

## What is this?
A coaching workflow OS for nutrition and lifestyle coaches. Three systems: Intake (client assessment), Plan (personalized coaching plan generation), Tracker (daily check-ins + weekly reviews with AI-assisted synthesis).

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL on Supabase (free tier), accessed via Prisma ORM (v6)
- **Auth**: NextAuth.js v5 (beta) with credentials provider, JWT sessions, role-based access (COACH/CLIENT)
- **AI (heavy)**: Claude Code scripts for plan drafting and weekly synthesis (uses existing subscription, no API costs)
- **AI (light)**: Groq Llama 3.3 70B free tier for intake summaries, red flag detection
- **Voice**: Groq Whisper Large v3 Turbo free tier for transcription
- **Email**: Resend free tier for nudges (not yet implemented)

## Project Structure
```
src/
  app/
    auth/login/         # Login page
    intake/             # Client intake form (multi-step)
    coach/              # Coach dashboard + client detail views
    client/             # Client dashboard
    api/
      auth/             # NextAuth routes + registration endpoint
      intake/           # Save/load intake responses
  lib/
    auth.ts             # NextAuth config
    auth-types.ts       # Session type extensions
    db.ts               # Prisma client singleton
    intake-schema.ts    # All 10 intake sections, 120+ questions
  components/
    SessionProvider.tsx # Client-side session wrapper
  middleware.ts         # Route protection (auth + role checks)
prisma/
  schema.prisma         # Database schema (12 tables)
scripts/
  seed.mjs              # Seeds coach + test client accounts
```

## Key Design Decisions
- **Intake is one continuous flow**, not staged. Coach needs all data before formulating the plan.
- **Conditional branching** hides irrelevant questions (e.g., bloodwork fields hidden if client has no recent tests).
- **GHQ-28 is untouched** — it's a validated psychological instrument.
- **Row-level security**: every query filters by clientId. Clients can never see other clients' data.
- **AI prompts are anonymized**: client names stripped, use IDs only.
- **Client consent** for AI processing is built into the intake.

## Design Philosophy
Coach OS must not turn wellness into a KPI dashboard. The tracker should feel human, not clinical. Progress includes behavioral wins, not just numbers. The system knows when to back off. Dashboard mode (minimal/standard/data-heavy) is a clinical decision the coach makes per client.

## Commands
```bash
npm run dev          # Start dev server at localhost:3000
npx prisma studio   # Open database GUI
npx prisma migrate dev --name <name>  # Create new migration
node scripts/seed.mjs  # Seed coach + test client accounts
```

## Test Accounts
- Coach: coach@test.dev / coach123
- Client: client@test.dev / client123

## Database
Supabase project: Coach OS
Tables: User, Account, Session, VerificationToken, IntakeSubmission, IntakeResponse, Plan, PlanSection, TrackerTemplate, DailyCheckIn, WeeklyReview
