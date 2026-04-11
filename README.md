# Coach OS

A coaching workflow operating system for nutrition and lifestyle coaches. Intake assessments, personalized plan generation, flexible client trackers, RAG-backed weekly reviews with citations, and AI-assisted feedback with human approval.

## Context

Coach OS digitizes a nutrition/lifestyle coaching workflow that currently lives in Excel spreadsheets and WhatsApp. Three pain points drive this:

1. **Intake** (client-facing): 10-sheet, 1000+ row Excel assessment is intimidating and slow to fill. Clients drop off or rush through it.
2. **Plan** (coach-facing): Synthesizing intake into a 35-page personalized plan takes 8-10+ hours of manual work per client.
3. **Tracker + Weekly Review** (both): Weekly logging is friction-heavy in spreadsheets, and the coach must manually review and write feedback for each client every week.

The system preserves clinical depth (no shortcuts on intake thoroughness), keeps the coach in control of all clinical decisions, and provides RAG-backed citations for every claim in AI-generated outputs.

---

## Design Philosophy

When traditional ladders of self-improvement collapse, the body becomes the last investable asset — and wellness becomes a vice when it turns life into a KPI dashboard. Coach OS must not become the thing it's trying to heal.

### 1. The tracker should not feel like a management dashboard
Daily check-ins should be brief and human. "How was your day?" not "Log your macros to the gram." The tone should feel like texting your coach, not filling out a performance review. No red/green color coding on adherence. No guilt-inducing "you missed 3 days" banners. The system tracks data quietly in the background — the client-facing experience should feel warm, not clinical.

### 2. Coach OS should optimize for connection, not quantification
The system exists to make the coach-client relationship more effective, not to replace it with data. The coach's voice, judgment, and humanity should always be front and center. Weekly reviews are written by the coach (AI drafts, coach approves) — the client should always feel they're hearing from their coach, not from software.

### 3. Progress is not just numbers
The client dashboard should celebrate behavioral wins ("you've been consistent for 3 weeks," "you tried a new recipe this week") alongside metric changes. Weight, macros, and adherence percentages are tools for the coach — not the primary language the client sees.

### 4. The system should know when to back off
Proactive nudges must be encouraging, never guilt-inducing. A missed check-in is not a failure — it's a data point. If a client goes quiet for a week, the system flags it for the coach rather than bombarding the client with reminders. The coach decides how to re-engage, not the algorithm.

### 5. The configurable dashboard is a clinical decision
Some clients benefit from data-heavy views. Others would be harmed by it, especially clients with addictive or obsessive tendencies (which the intake screens for). The coach choosing minimal vs. standard vs. data-heavy mode per client is not a UX preference — it is a clinical judgment call about what is psychologically safe for that specific person.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) + PWA |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js (coach + client roles, row-level security) |
| AI (heavy) | Claude Code scripts (plan drafting, weekly synthesis) |
| AI (light) | Groq Llama 3.3 70B (intake summaries, red flag detection) |
| Voice | Groq Whisper Large v3 Turbo |
| Hosting | Vercel + Supabase (both free tier) |
| PDF Export | react-pdf or puppeteer |
| Email/Nudges | Resend (free tier) |
| Wearables | Fitbit + Google Fit APIs |

---

## Three Core Systems

### System 1: Intake
One continuous form flow (10 sections), conditional branching that reduces questions by ~30-40%, progress bar, save & resume, voice input for narrative sections. No gating — coach needs all data before formulating the plan.

### System 2: Plan Generation
1. Auto-generated intake summary with red flags
2. Coach makes clinical decisions (calorie target, macros, approach, referrals)
3. AI drafts full personalized plan from decisions + intake data
4. Coach reviews/edits each section
5. PDF generated and delivered to client

### System 3: Tracker + Weekly Review
- Flexible tracker templates generated from the plan (different clients track different things)
- Daily check-in micro-form (mobile-first, < 2 minutes)
- RAG-backed weekly synthesis where every claim is traceable to specific check-in records
- Coach reviews and approves before client sees feedback

---

## Build Phases

1. **Foundation + Intake** — Project scaffolding, data model, intake form, coach review view
2. **Plan Generation** — Intake summary, coach decision form, AI plan drafting, PDF export
3. **Tracker + Daily Check-Ins** — Flexible templates, mobile check-in form
4. **Weekly Review + RAG Citations** — Citation engine, weekly synthesis, coach approval workflow
5. **Client Dashboard** — Configurable (minimal/standard/data-heavy), progress views, weekly review timeline
6. **Voice Input + Proactive Nudges** — Groq Whisper transcription, rule-based nudges
7. **Wearable Integration** — Fitbit, Google Fit auto-sync
8. **Polish + Security** — Coach dashboard, mobile responsiveness, security scanning

---

## Getting Started

```bash
npm install
npx prisma generate
npm run dev
```

## License

MIT
