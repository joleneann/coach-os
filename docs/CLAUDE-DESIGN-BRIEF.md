# Coach OS — UI Improvement Brief

You are improving the visual design and interaction quality of Coach OS, a coaching workflow app for nutrition and lifestyle coaches and their clients. Read this entire brief before touching code.

## What Coach OS is

A web app (Next.js 16, Tailwind, TypeScript) with two user roles:

- **Coach** — sees a list of clients, reviews intake submissions, makes plan decisions, approves AI-drafted plans, reviews weekly check-ins, approves weekly reviews before clients see them.
- **Client** — completes a 10-section intake, sees their plan, logs daily check-ins (often by voice), reviews their progress on a dashboard, reads weekly reviews after the coach approves them.

The product is being built by a practicing coach (Jolene). The aesthetic must reflect a human, ethical coaching practice, not a quantified-self productivity app.

## Non-negotiables (do not change these)

1. **Font: Inter, always.** Set globally via `next/font/google` in `src/app/layout.tsx` and forced in `src/app/globals.css`. Never introduce system font stacks, Segoe UI, serif fonts, or display fonts for headings. Inter at varying weights only.
2. **No em dashes.** Anywhere. Not in UI copy, not in placeholders, not in tooltips. Use periods, commas, semicolons, or rewrite.
3. **No gamification.** No badges, points, streaks framed as achievements, leaderboards, confetti, celebratory animations, or "Level up!" copy. Adherence is "5 of 7 days," never "2 missed" and never "🎉 7 days strong!"
4. **No red/green adherence coding.** Avoid traffic-light semantics for habit completion. Use neutral stone tones with amber for emphasis. A missed day is not a failure state visually.
5. **No clinical or KPI-dashboard feel.** This is not a fitness tracker. Avoid large numeric readouts, gauges, ring charts, or anything that turns wellness into a score.
6. **Architecture is locked.** Do not restructure routes, rename API endpoints, change Prisma schema, or touch auth flow. UI/UX/CSS/component composition only.

## Responsive policy

- **Client surfaces** (`/auth/login`, `/intake`, `/client/*`): must work on desktop AND mobile. Mobile is the primary surface because clients log in from their phones for daily check-ins. Design for ~390px first, scale up.
- **Coach surfaces** (`/coach/*`): desktop only. Coaches work on laptops. Optimize for ~1280px+ readability and information density. Do not spend effort on mobile breakpoints for coach views.
- **Shared surfaces** (`/auth/login`): treat as client-priority — must be mobile-responsive.

## Design philosophy

- **No shame, no blame.** Microcopy should never imply the client failed. "Tell us about today" beats "Did you complete your habits?"
- **Coach is in control.** Clients never see ungated AI output. Visual hierarchy should make the coach's voice feel present even on automated surfaces.
- **Connection over data.** A check-in reflection (free text or voice) matters more than a number. Give qualitative input visual weight.
- **The system knows when to back off.** If a client misses days, the UI should not nag with red banners. Soften, don't escalate.
- **Dashboard mode is a clinical decision.** Each client has a mode (MINIMAL, STANDARD, DATA_HEAVY) set by the coach. Respect it. MINIMAL should feel calm and uncluttered; DATA_HEAVY can show trends but still must not feel like Strava.

## Palette and tokens (formalize this)

Current state: stone/amber is used inline across components. There is no token system in `globals.css` beyond `--background` and `--foreground`. Your first job is to introduce a small, disciplined token set in `globals.css` using Tailwind v4's `@theme` syntax, then refactor components to use it.

Suggested direction (you may refine):

- **Surface:** stone-50, stone-100 (cards), white
- **Text:** stone-900 (primary), stone-600 (secondary), stone-400 (tertiary/meta)
- **Accent:** amber-600 (primary action, focus, key highlights), amber-100 (subtle backgrounds)
- **Borders:** stone-200 (default), stone-300 (emphasis)
- **Semantic (use sparingly):** amber-700 for "needs attention" instead of red. No green.
- **Charts:** stone scale for axes/grid, amber-600 for primary series, stone-400 for secondary. Never red/green pairs.

Dark mode currently inverts to near-black. Decide whether to keep, refine, or drop dark mode. If keeping, the dark palette must hold the same warmth (warm grays, not cool slate).

## Surfaces to improve (in priority order)

### 1. Client daily check-in (`src/app/client/checkin/`)
This is the surface clients touch most often. It must feel like opening a journal, not filling a form. Voice input is the primary path. The text alternative should not feel like a fallback. Make the recording state feel alive without feeling like a Snapchat filter. See `src/components/VoiceRecorder.tsx`.

### 2. Client dashboard (`src/app/client/dashboard/`, `src/components/dashboard/`, `src/components/charts/`)
Three layouts: MINIMAL, STANDARD, DATA_HEAVY. Most current work is in `MetricTrendChart`, `HabitAdherenceChart`, `WeekAtAGlance`. Charts use Recharts. Re-skin them to match the palette: no default Recharts blues/reds. Habit adherence should read as a calm progress indicator, not a scoreboard.

### 3. Coach client list and detail view (`src/app/coach/`)
This is where the coach spends the most time. Information density is acceptable here, but density should not equal noise. The coach needs to scan many clients quickly. Consider a compact list with subtle status affordances over a card grid.

### 4. Intake form (`src/app/intake/`)
Ten sections, 120+ questions, conditional branching. Currently a long multi-step flow. Pacing, progress indication, and the ability to feel calm rather than overwhelmed is the design challenge. Voice input is enabled on narrative questions. GHQ-28 section is a validated psychological instrument and must not be visually styled in a way that makes any answer feel "right" or "wrong."

### 5. Weekly review (`src/app/client/review/`, `src/components/WeeklyReviewCard.tsx`, `CoachReviewSection.tsx`)
Three-part review: client's week, coach's synthesis, suggested adjustments. The coach's voice should be visually prominent. Suggested habit graduations (e.g., daily to twice-weekly) should feel like a recommendation, not an alert.

### 6. Plan view (`src/app/client/plan/`, `src/components/PlanContent.tsx`)
The plan is a strategy document, not a checklist. It should read like something written for the client, not generated. Long-form readable typography matters here: line length, line height, section spacing.

## Interaction principles

- **Motion is subtle.** Fades and slight transforms only. No bounces, no springs that overshoot, no parallax. Reduced-motion preference must be respected.
- **Loading states do not say "Loading..."** Use skeleton shapes that match the eventual layout. Voice transcription needs its own visual language (waveform or pulse, not a spinner).
- **Empty states are kind.** First-time clients with no check-ins should see an invitation, not "No data."
- **Focus rings are visible.** Accessibility is not optional. Amber-600 ring at 2px offset.

## What to deliver

A pull request (or branch) with:

1. A formal token system in `src/app/globals.css` using Tailwind v4 `@theme` directive.
2. Refactored components using tokens instead of inline stone-XXX / amber-XXX classes where possible.
3. Re-skinned charts in `src/components/charts/` matching the palette.
4. Improved layouts for the six surfaces above, in priority order. You do not need to ship all six in one pass. Ship one well rather than six poorly.
5. A short `docs/DESIGN-SYSTEM.md` documenting the tokens, spacing scale, type scale, and any component patterns you introduced. This becomes the source of truth for future work.

## How to see the current UI

You must look at the running app before proposing changes. Reading components is not a substitute. Pick whichever path fits your tooling.

### Path A: run the app yourself (preferred)

From the repo root:

```bash
cd coach-os
npm install
npm run dev
```

The app runs at `http://localhost:3000`. If `.env` is missing, copy `.env.example` and ask the user to populate `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and `GROQ_API_KEY` — the app will not boot without them.

Then walk through these surfaces in order, capturing screenshots. Log in fresh for each role. **Capture mobile (~390px) for every client and shared surface; coach surfaces desktop only (~1280px+).**

**As coach (coach@test.dev / coach123) — desktop only:**
1. `/coach` — client list
2. `/coach/clients/<rohan-id>` — client detail with intake summary
3. `/coach/clients/<rohan-id>/plan` — plan decisions and draft review
4. Weekly review approval surface (linked from the client detail)

**As client (rohan@test.dev / client123 — only ACTIVE client with real data) — desktop + mobile:**
5. `/client` — landing / Today
6. `/client/dashboard` — tabbed Today/Progress/Reviews/Plan
7. `/client/checkin` — daily check-in with voice recorder
8. `/client/plan` — plan view
9. `/client/review` — most recent weekly review

**Unauthenticated — desktop + mobile:**
10. `/auth/login`
11. `/intake` (use a fresh INTAKE client: priya@test.dev / client123) — at minimum capture section 1, the GHQ-28 section, and a narrative section with voice input visible

The other clients (Priya, Lakshmi, Arjun) are in INTAKE state with no check-in data — use them to see empty states.

### Path B: ask the user for screenshots

If you cannot run a dev server, ask the user to capture the 11 surfaces above, both desktop and mobile, and to include any state variants you specifically need (e.g., empty dashboard, dashboard with a missed day, voice recorder mid-recording). Do not begin proposing redesigns until you have them.

### What to do with what you see

Before writing any code, produce a short audit: for each surface, one paragraph on what is working, what is not, and which design philosophy violations you observed (gamification leak, red/green coding, clinical readout, em dash in copy, font drift, etc.). Share this with the user and get agreement on priority before refactoring. Do not redesign everything at once.

## Reference

Full product context: `coach-os/CLAUDE.md`. Read it. Architecture: `docs/architecture-diagram-v2.html`. Open in a browser.
