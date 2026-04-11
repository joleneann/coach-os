# Coach OS — Product Spec

## Summary

Coach OS is a workflow operating system for independent nutrition and lifestyle coaches. It replaces a fragile stack of spreadsheets, PDFs, and chat threads with a structured system for client intake, personalized plan generation, daily tracking, and weekly review — with AI assistance that never bypasses coach approval.

**Stage:** Phase 1 complete, Phase 2 (plan generation) in progress.

---

## Opportunity

Independent coaches and small practices manage client workflows manually. The typical stack is Excel for intake assessments, Word/Canva for plans, Google Sheets for tracking, and WhatsApp for communication. This creates three compounding problems:

1. **Intake abandonment.** A 10-sheet, 1000+ row Excel assessment is intimidating. Clients rush through it, skip sections, or abandon it entirely — leaving the coach with incomplete data to build a plan from.

2. **Plan creation bottleneck.** Synthesizing intake data (bloodwork, gut health scores, GHQ-28 mental health screening, food records, exercise history, stress patterns) into a personalized 35-page coaching plan takes 8–10+ hours per client. This is the single biggest operational bottleneck.

3. **Review fatigue.** Weekly tracking and personalized feedback are where coaching value compounds over time. But manually reviewing spreadsheet data and writing individualized feedback for each client becomes unsustainable beyond 5–10 active clients.

These are not technology problems. They are workflow problems that technology can reduce.

---

## Target Audience

**Primary:** Solo or small-practice clinical nutritionists and lifestyle coaches who:
- Conduct in-depth intake assessments (not just meal plans)
- Write personalized, narrative coaching plans (not cookie-cutter templates)
- Manage clients longitudinally (months, not one-off sessions)
- Work with behavioral complexity (emotional eating, addictive tendencies, stress, mental health referrals)
- Need to collaborate with other professionals (GPs, psychiatrists, diabetologists) without giving them system access

**Not for:** Large gym chains, generic wellness apps, calorie-counting tools, or coaches who use templated plans.

---

## Customer Insights

Drawn from real coaching experience at BioRhyme:

**Insight 1: Clients who fail often have unresolved behavioral patterns, not bad nutrition knowledge.**
A client may know exactly what to eat but still binge three times a week. The intake assessment screens for addictive behaviors, emotional eating patterns, and all-or-nothing thinking — because these are stronger predictors of program failure than diet knowledge. The system must surface these patterns to the coach, not just collect meal data.

**Insight 2: Haphazard eating is usually a logistics problem, not a motivation problem.**
Clients who eat inconsistently often lack access to prepared food — they don't meal prep, their home environment is full of junk food, and they default to whatever is available. The coaching plan addresses this with practical interventions (tiffin services, pre-made protein sources, kitchen equipment recommendations), not motivational speeches.

**Insight 3: Crash diet history predicts program resistance.**
Clients who have tried multiple crash diets develop a "motivation barrier" — initial enthusiasm followed by rapid dropout. The plan must set expectations for slow, sustainable progress and build in self-forgiveness for slip-ups. The system should reflect this in its tone: no aggressive deficit recommendations for these clients, no guilt-inducing tracker notifications.

**Insight 4: Multi-professional collaboration is essential but currently informal.**
Many clients need referrals to psychiatrists (for addictive behaviors, depression), gastroenterologists (gut health scores indicating disease likelihood), or physicians (bloodwork flags). Currently this is handled via WhatsApp and PDF exports. The system should make scoped data sharing easy without giving specialists system access.

---

## Competitive Landscape

We analyzed 15+ platforms. The key finding: **no platform in the market does all three of intake, plan generation, and evidence-backed weekly review.**

| Platform | Intake | Plan Generation | Tracking | Weekly Review | AI Features | Price |
|----------|--------|----------------|----------|--------------|-------------|-------|
| Practice Better | Forms | No | Journals | No | Session transcription | $25–89/mo |
| Healthie | Forms | No | Goals | No | AI charting scribe | $20–349/mo |
| Nutrium | No | Meal plans only | Food diary | No | Limited | $15–25/mo |
| That Clean Life | No | Meal plans only | No | No | AI meal plans | $30–60/mo |
| TrueCoach | No | No | Workouts | No | No | $20–107/mo |
| Coach OS | Adaptive flow | Full plan from intake | Plan-specific | RAG-cited synthesis | Draft + approve | $0 extra |

**Gaps Coach OS fills that nobody else does:**

1. **Voice-first client check-ins with AI synthesis.** No platform lets clients record voice notes that get structured into coach-readable data.
2. **AI-powered weekly review for coaches.** No platform generates a weekly briefing from client data with citations to source records.
3. **Full plan generation from intake.** Meal plan generators exist, but nobody generates a complete personalized coaching plan (nutrition + exercise + stress + behavioral + supplementation) from an intake assessment.
4. **Unified lifestyle coaching.** Most platforms are nutrition-only or fitness-only. Nobody integrates nutrition + movement + sleep + stress + habits + mindset with cross-domain insights.

---

## Design Philosophy

When self-improvement becomes a KPI dashboard, wellness stops feeling like care and starts feeling like surveillance. Coach OS is designed to avoid that trap.

1. **The client experience should feel human.** Daily check-ins should feel like texting your coach, not submitting a performance report.
2. **The coach stays in control.** AI drafts and summarizes. The coach makes every clinical decision and approves every client-facing output.
3. **Progress is broader than metrics.** Behavioral wins matter alongside weight and macros.
4. **The system knows when not to intervene.** Missed check-ins are signals for coach review, not triggers for automated guilt.
5. **Dashboard intensity is a clinical choice.** Minimal vs. data-heavy mode per client is a coaching decision about psychological safety.

---

## Success Metrics

| Metric | Current Baseline | Target |
|--------|-----------------|--------|
| Plan creation time per client | 8–10+ hours | < 3 hours |
| Intake completion rate | Unknown (many abandon Excel) | > 80% complete the full form |
| Weekly review time per client | 30–60 min manual work | < 15 min (review AI draft + approve) |
| Citation accuracy in weekly synthesis | N/A | 100% of claims traceable to source data |

---

## Scope

### In Scope (Building Now)

**System 1: Intake**
- One continuous form flow, 10 sections, 127 questions
- Conditional branching (~30–40% reduction for healthy clients)
- Progress bar, save and resume, voice input on narrative sections
- GHQ-28 validated instrument preserved exactly as-is

**System 2: Plan Generation**
- Auto-generated intake summary with red-flag detection
- Coach decision form (calorie target, macros, approach, referrals)
- AI-assisted section-by-section plan drafting
- Coach review/edit/approve workflow
- PDF export + specialist section export

**System 3: Tracker + Weekly Review**
- Flexible tracker templates generated from the plan
- Daily check-in micro-form (mobile-first, < 2 minutes)
- RAG-backed weekly synthesis with citations to source records
- Coach review and approval before client sees feedback

**Client Dashboard**
- Configurable per client: minimal | standard | data-heavy
- Plan access, progress views, weekly review timeline, check-in history

**System 4: Resource Library**
- Coach-authored educational articles backed by evidence-based sources (PMID citations, research papers)
- Resources are written once and live in a library the coach manages
- Coach assigns specific resources to specific clients based on their needs
- Coach controls delivery timing — which resource to send at what point in the coaching period
- Client sees assigned resources in their dashboard, delivered on the coach's schedule
- Example resources:
  - What are macronutrients: carbohydrates, proteins, and fats
  - Long-term weight loss expectations (research shows 3–5% body weight loss is what most people sustain without medical intervention)
  - How to find a culturally appropriate diet that is sustainable long-term
- Resources can be tagged by topic for easier assignment (e.g., "nutrition basics," "mindset," "exercise," "medical")
- The full resource list and assignment logic will be brainstormed with the coach before building

### In Scope (Later Phases)
- Voice input via Groq Whisper for intake and daily notes
- Proactive nudges (rule-based, coach-approved templates)
- Wearable integration (Fitbit, Google Fit)

### Out of Scope
- Photo-based food logging (adds coach workload — shelved)
- Sentiment analysis on check-ins (not reliable enough — shelved)
- Multi-coach / SaaS platform (this is for one practice)
- Specialist/doctor accounts (coach exports sections as PDF instead)
- Native mobile app (PWA web app is sufficient)

---

## User Experience

### Coach Flow

```
Log in → Client list with status indicators
  → Click client → Intake summary with red flags + quick stats
  → Make clinical decisions (calorie target, macros, approach, referrals)
  → Review AI-drafted plan section by section
  → Edit, accept, or rewrite each section
  → Approve → PDF generated → delivered to client
  → Weekly: review AI-drafted synthesis → edit → approve → client receives feedback
```

### Client Flow

```
Log in → "Start Intake" or "Continue Intake"
  → Multi-step form with progress bar
  → Conditional questions appear/disappear based on answers
  → Save and resume anytime
  → After intake: wait for coach to deliver plan
  → View plan on dashboard
  → Daily: quick check-in (< 2 minutes)
  → Weekly: receive coach feedback with citations
```

---

## AI Safety and Boundaries

Coach OS is a clinical support system, not an autonomous clinical actor.

- AI-generated plans are drafts, not final recommendations
- The coach approves all client-facing outputs
- The system does not make referral or diagnosis decisions independently
- Red flags are surfaced for coach review, not automatically acted upon
- Every claim in weekly synthesis is backed by citations to source data
- Client data is anonymized before AI processing (IDs, not names)
- Intake includes explicit consent for AI-assisted plan generation

---

## Tech Stack

| Layer | Choice | Cost |
|-------|--------|------|
| Framework | Next.js 15 (App Router) + PWA | Free |
| Database | PostgreSQL on Supabase | Free tier |
| Auth | NextAuth.js + row-level security | Free |
| AI (heavy) | Claude Code scripts | $0 (existing subscription) |
| AI (light) | Groq Llama 3.3 70B | Free tier |
| Voice | Groq Whisper Large v3 Turbo | Free tier |
| Hosting | Vercel + Supabase | Free tier |
| PDF | react-pdf or Puppeteer | Free |
| Email | Resend | Free tier |
| Wearables | Fitbit + Google Fit APIs | Free |
| Security scanning | Snyk + OWASP ZAP | Free |

**Total infrastructure cost: $0 beyond existing Claude subscription.**

---

## Implementation Status

| Phase | Status |
|-------|--------|
| 1. Foundation + Intake | Complete |
| 2. Plan Generation | In progress |
| 3. Tracker + Daily Check-Ins | Planned |
| 4. Weekly Review + RAG Citations | Planned |
| 5. Client Dashboard | Planned |
| 6. Resource Library | Planned |
| 7. Voice Input + Nudges | Planned |
| 8. Wearable Integration | Planned |
| 9. Security + Polish | Planned |

---

## Launch Plan

| Phase | Audience | Purpose |
|-------|----------|---------|
| Internal testing | Coach + 1 test client | Validate full intake → plan → tracker loop |
| Beta | Coach + 2–3 real clients | Test with real clinical data, gather feedback |
| Production | Full practice | Replace Excel/WhatsApp workflow entirely |

A manual security review (pen test) is recommended before moving real client data into the system.

---

## FAQ

**Why not use vector search for the weekly synthesis RAG system?**
Client data is structured (meals on specific dates, mood scores, workout completions). We need precise queries ("show me all days this week where sleep < 6 hours"), not semantic similarity. Every record has a timestamp, client ID, and field type. The RAG system is really a citation engine, not a search engine.

**Why Claude Code scripts instead of the Claude API?**
The Claude API costs extra ($15/M input tokens, $75/M output tokens). Claude Code is included in the existing $100/month subscription. For a small practice, this saves $5–15/month. The tradeoff: the coach triggers plan generation manually instead of it being automated. Acceptable for the current scale.

**Why no photo-based food logging?**
It adds review work for the coach — every photo needs manual interpretation. Shelved until AI food recognition is reliable and free enough to be practical.

**Why Groq instead of OpenAI for voice and light AI?**
Groq's free tier offers 2,000 Whisper requests/day and 1,000 Llama requests/day. For a small practice, this means $0 cost. OpenAI's Whisper API would cost ~$1–2/month — negligible, but Groq is genuinely free.

**Why is the configurable dashboard a clinical decision?**
Some clients benefit from seeing all their data. Others — especially those with addictive or obsessive tendencies — can be harmed by constant metric visibility. The intake explicitly screens for these patterns (Emotional Health section, GHQ-28). The coach uses that information to decide what the client should see.

**Why does the system not make referral decisions?**
The coach is a clinical nutritionist, not a doctor. Red flags (elevated HbA1c, high gut health scores, GHQ-28 depression indicators) are surfaced for coach review, and the coach decides whether and where to refer. The system never acts on these autonomously.
