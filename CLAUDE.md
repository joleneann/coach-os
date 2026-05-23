# Coach OS

## CRITICAL: Font Rule
**ALL client-facing and coach-facing UI MUST use the Inter font.** This is set globally via `next/font/google` in `layout.tsx` and enforced in `globals.css`. Never use system font stacks, Segoe UI, or any other font in components. If you add a standalone HTML page (like the architecture diagram), import Inter from Google Fonts.

## What is this?
A coaching workflow OS for nutrition and lifestyle coaches. Five core systems: Intake, Plan Generation, Tracker + Daily Check-ins, Weekly Reviews (RAG-backed synthesis), and Client Dashboard.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL on Supabase (free tier), accessed via Prisma ORM (v6)
- **Auth**: NextAuth.js v5 (beta) with credentials provider, JWT sessions, role-based access (COACH/CLIENT)
- **AI (heavy)**: Claude Code scripts for plan drafting and weekly review synthesis (uses existing subscription, no API costs)
- **AI (light)**: Groq Llama 3.3 70B free tier for intake summaries, red flag detection
- **Voice**: Groq Whisper Large v3 Turbo free tier for voice-to-text transcription
- **Charts**: Recharts for metric trends and habit adherence visualization
- **PWA**: Service worker + web app manifest for installable mobile experience
- **Hosting**: Vercel + Supabase (both free tier)
- **Total cost**: $0 beyond existing Claude subscription

## Project Structure
```
src/
  app/
    auth/login/              # Login page
    intake/                  # Client intake form (multi-step, voice-enabled)
    coach/                   # Coach dashboard + client detail views
    client/                  # Client dashboard (tabbed: Today/Progress/Reviews/Plan)
    client/checkin/          # Daily check-in page (voice-enabled reflection)
    client/plan/             # Client plan view
    client/review/           # Client weekly review view
    api/
      auth/                  # NextAuth routes + registration
      intake/                # Save/load intake responses
      plan/                  # Plan decisions, generate, approve, view
      checkin/               # POST + GET daily check-ins
      review/                # Generate, approve, deliver, view weekly reviews
      review/suggestions/    # Habit graduation suggestions
      tracker/               # Template read + update (graduation, new habits)
      dashboard/             # Pre-aggregated dashboard data
      voice/transcribe/      # Groq Whisper transcription endpoint
      wearables/             # Connect, callback, sync, disconnect (scaffolded)
  lib/
    auth.ts                  # NextAuth config
    auth-types.ts            # Session type extensions
    db.ts                    # Prisma client singleton
    intake-schema.ts         # 10 intake sections, 120+ questions
    coach-decision-schema.ts # 7 coach decision areas
    tracker-template.ts      # TrackerField type + template generation
    habit-graduation.ts      # Frequency-based habit graduation logic
    weekly-review.ts         # Check-in aggregation + citations
    review-synthesis.ts      # Synthesis prompt builder
    wearables/               # Fitbit + Google Fit adapters (scaffolded)
  components/
    SessionProvider.tsx      # Client-side session wrapper
    CheckInCard.tsx          # Dashboard check-in entry point
    PARCycleIndicator.tsx    # Plan > Act > Record > Reassess visual
    CheckInWeekView.tsx      # Coach-side 7-day check-in grid
    WeeklyReviewCard.tsx     # Three-part review renderer
    CoachReviewSection.tsx   # Coach review + suggestions UI
    VoiceRecorder.tsx        # Mic button + recording + transcription
    HabitProgressView.tsx    # Habit frequency badges + adherence bars
    LogoutButton.tsx         # Logout action
    CollapsibleSection.tsx   # Expandable/collapsible sections
    charts/                  # MetricTrendChart, HabitAdherenceChart, WeekAtAGlance
    dashboard/               # ClientDashboard, DashboardSection
  middleware.ts              # Route protection (auth + role checks)
prisma/
  schema.prisma              # Database schema (14 tables)
scripts/
  seed.mjs                   # Seeds coach + test client accounts
  generate-plan.mjs          # Claude Code script: generate plan sections
  generate-review.mjs        # Claude Code script: generate weekly review
docs/
  architecture-diagram.html  # Interactive text-based architecture doc
  architecture-diagram-v2.html # Visual SVG flow diagram
```

## 8 Build Phases (all complete)
1. **Foundation + Intake** — Auth, 10-section intake form, coach view
2. **Plan Generation** — 5-step workflow: summarize, decide, draft, review, approve
3. **Tracker + Daily Check-ins** — Template from decisions, mobile micro-form, journal UX
4. **Weekly Review + RAG** — Aggregation, citation engine, Claude synthesis, coach approval gate
5. **Client Dashboard** — Tabbed (Today/Progress/Reviews/Plan), Recharts, mode-specific layouts
6. **Voice Input** — Groq Whisper transcription on check-in reflections and intake narratives
7. **Wearable Integration** — Scaffolded: Fitbit + Google Fit OAuth + sync (needs API credentials)
8. **Polish + Security** — PWA manifest, service worker, security headers, HSTS

## Key Design Decisions
- **Intake is one continuous flow**, not staged. Coach needs all data before formulating the plan.
- **Conditional branching** hides irrelevant questions.
- **GHQ-28 is untouched** — it's a validated psychological instrument.
- **Row-level security**: every query filters by clientId/coachId. Clients never see other clients' data.
- **Coach approval gate**: weekly reviews are never shown to clients until coach approves.
- **Habit graduation**: daily → twice-weekly → weekly based on adherence. Automatic suggestions, coach approves.
- **Dashboard mode** (MINIMAL/STANDARD/DATA_HEAVY) is a clinical decision the coach makes per client.
- **No gamification**: no badges, points, leaderboards. "5 of 7 days" not "2 missed."

## Design Philosophy
Coach OS must not turn wellness into a KPI dashboard. The tracker should feel human, not clinical. Progress includes behavioral wins, not just numbers. The system knows when to back off. "No shame, no blame" microcopy everywhere.

## Copy Rules
- **No em dashes** in any client-facing text. Use periods, commas, or rewrite.
- **Inter font** on all UI (enforced in globals.css).
- **Stone/amber palette** for all charts and indicators. No red/green adherence coding.

## Commands
```bash
npm run dev                                    # Start dev server
npx prisma studio                              # Database GUI
npx prisma migrate dev --name <name>           # New migration
node scripts/seed.mjs                          # Seed test accounts
node scripts/generate-plan.mjs --client <id>   # Generate plan via Claude Code
node scripts/generate-review.mjs --client <id> # Generate weekly review via Claude Code
```

## Test Accounts
- Coach: coach@test.dev / coach123
- Client (Rohan, ACTIVE): rohan@test.dev / client123
- Client (Priya, INTAKE): priya@test.dev / client123
- Client (Lakshmi, INTAKE): lakshmi@test.dev / client123
- Client (Arjun, INTAKE): client@test.dev / client123

## Environment Variables
```
DATABASE_URL          # Supabase PostgreSQL connection string
AUTH_SECRET           # NextAuth secret
NEXTAUTH_URL          # Base URL (http://localhost:3000)
GROQ_API_KEY          # Groq free tier (voice transcription + intake summaries)
# Future:
FITBIT_CLIENT_ID      # Fitbit OAuth (Phase 7)
FITBIT_CLIENT_SECRET
GOOGLE_FIT_CLIENT_ID  # Google Fit OAuth (Phase 7)
GOOGLE_FIT_CLIENT_SECRET
RESEND_API_KEY        # Email nudges (when implemented)
```

## Database Tables
User, Account, Session, VerificationToken, IntakeSubmission, IntakeResponse, Plan, PlanSection, TrackerTemplate, DailyCheckIn, WeeklyReview, WearableConnection, WearableData
