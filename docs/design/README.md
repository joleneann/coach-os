# Handoff: Coach OS

## Overview
Coach OS is a one-to-one health coaching app. Two surfaces:

- **Client app** (web and mobile responsive) where a client writes or speaks a daily check-in, reads a weekly review from their coach, and lives inside a written plan.
- **Coach app** (web only, desktop) where the coach (Jolene) triages a queue every morning, reads each client's intake and history, and composes weekly reviews on top of an AI synthesis.

The design's premise: a calm, editorial, voice-first surface for the client; a dense, decision-oriented workspace for the coach. No gamification, no streaks, no traffic-light cues. Adherence is shown as filled or hollow dots, never as red or green. The coach's voice has its own warmer paper so a written paragraph reads differently from a system message.

## About the Design Files
The files in `design_files/` are **design references created as an HTML prototype**. They are not production code to copy directly. They use inline JSX + Babel + React 18 loaded from a CDN, presented inside a design canvas wrapper (`design-canvas.jsx`) so the artboards can be panned and zoomed like Figma.

Your task is to **recreate these designs in the target codebase's existing environment** using its established patterns and libraries. If no codebase exists yet, React + TypeScript + CSS modules (or Tailwind) is the closest natural fit, since all design values are already extracted into a tokens module (`tokens.jsx`).

Keep in mind:
- The `design-canvas.jsx` wrapper, `ios-frame.jsx`, and `tweaks-panel.jsx` exist only so the prototype is presentable. Do not port them.
- The mobile artboards are framed at 390×844 (iPhone) and the desktop ones at 1280×800. Treat those as breakpoints to design against, not fixed canvas sizes.
- Voice recording, transcription, and AI synthesis are shown as states; the design does not specify the underlying APIs.

## Fidelity
**High-fidelity.** Every color, type ramp, spacing, and component is final. Recreate pixel-faithfully using the codebase's existing libraries and patterns. The `tokens.jsx` file is the single source of truth and can be ported directly into a tokens file (CSS variables, Tailwind theme extension, or a TS module).

## Platform Matrix

| Surface             | Web (desktop) | Mobile responsive | Native |
| ------------------- | ------------- | ----------------- | ------ |
| **Client app**      | Yes           | Yes               | No     |
| **Coach app**       | Yes           | No                | No     |

The coach app does not need to be responsive below desktop widths. The client app must work from ~360px up.

## Design Tokens

All tokens live in `design_files/tokens.jsx`. Key values:

### Colors
```
paper       #fbfaf7   page background, warm off-white
card        #ffffff   raised surfaces
sunk        #f5f4f0   recessed surfaces (light)
sunk2       #efece6   recessed surfaces (deeper)

ink         #1c1917   primary text (stone-900)
ink2        #44403c   secondary text (stone-700)
quiet       #78716c   tertiary text (stone-500)
hush        #a8a29e   disabled/captions (stone-400)

line        #e7e5e4   hairline divider (stone-200)
lineStrong  #d6d3d1   stronger divider (stone-300)

amber       #d97706   primary action / focus / coach voice
amberInk    #92400e   amber text on soft background
amberSoft   #fef3c7   amber-100, coach voice background
amberWash   #fdf6e3   warmer paper for coach voice cards
attention   #b45309   used only for "needs attention", never red, sparingly

inkDark     #1a1815   reserved for dark mode (sepia, not slate)
cardDark    #26221d
```

There is no red, green, or saturated success/error in the palette. "Needs attention" uses amber-700; everything else is the warm neutral ramp.

### Typography
Single family: **Inter** (300, 400, 500, 600, 700) with `system-ui, sans-serif` fallback.

Scale (px / weight / line-height / letter-spacing):

| Token       | Size | Weight | LH    | LS        | Use                       |
| ----------- | ---- | ------ | ----- | --------- | ------------------------- |
| display     | 32   | 500    | 1.15  | -0.02em   | Largest moment per screen |
| h1          | 24   | 500    | 1.2   | -0.02em   | Section title             |
| h2          | 19   | 500    | 1.3   | -0.01em   | Sub-section               |
| h3          | 16   | 600    | 1.4   | -0.005em  | Card title                |
| body        | 15   | 400    | 1.55  | 0         | Default body              |
| body2       | 14   | 400    | 1.55  | 0         | Dense body                |
| meta        | 12   | 500    | 1.4   | 0         | Captions, labels          |
| micro       | 11   | 500    | 1.3   | 0.08em    | UPPERCASE eyebrow         |
| read        | 16   | 400    | 1.7   | 0         | Long-form reading         |
| readLead    | 19   | 400    | 1.55  | -0.005em  | Long-form lead paragraph  |

Long-form reading (plan, weekly review) uses `read` / `readLead` with looser line-height. Display-size text on the web client steps up to ~38-48px.

### Spacing & radius
Spacing follows a 4/8/12/14/16/18/20/22/24/28/32/36/40/56 ladder used inline. There is no abstract scale; treat the values in the JSX as canonical. Common pad values:
- Card padding: 18px (mobile) / 24px (web)
- Page gutters: 24-28px (mobile) / 40px (web)
- Reading column max-width: 720-820px

Border radius:
- 6 (small chips, checkboxes)
- 14 (inline cards, inputs)
- 16-18 (primary cards)
- 20 (heavy paper cards, coach voice)
- 999 (pills, buttons, avatars)

Shadows are used sparingly. Most depth is achieved with hairline borders (`line`, `lineStrong`) on warm neutral fills. The breath pulse uses `0 4px 18px <color>40`.

### Motion
- Breath pulse on the voice idle/listening state: 4-4.2s ease-in-out, three nested ellipses (halo, mid, core). See `@keyframes ckBreathHalo/Mid/Core` in `Coach OS Design.html`.
- Dot pulse (transcribing): 1.4s stagger, three dots.
- Caret blink: 0.8s on/off.
- Skeleton shimmer: 1.6s background-position sweep.
- All animations respect `prefers-reduced-motion: reduce` (shortened to 0.001ms).

### Adherence shape
Seven small dots per week. Filled = present, hollow = absent. **No color swap between states**; a week stays calm whether it is 1/7 or 7/7. Today is marked with a thin halo ring (`box-shadow: 0 0 0 3px paper, 0 0 0 4px line`). See `CosWeekDots` in `tokens.jsx`.

## Screens / Views

The full canvas is composed in `app.jsx`. Sections, in order:

### 0 · Foundations
- `tokens` (720×1280) - reference doc, do not port verbatim.

### 1 · Client · Intake (mobile, 390×844)
Ten paced sections, one question at a time. The GHQ-28 clinical instrument lives inside section 8 and is styled neutrally so the user cannot tell "right" from "wrong" answers.
- `IntakeOverview` (`client-intake.jsx`)
- `IntakeStep` (`review-plan.jsx`)
- `IntakeGHQ` (`client-intake.jsx`)

### 2 · Client · Onboarding (mobile)
Three calm panels after intake submit. No celebration, no checklists.
- `ClientOnboardingA/B/C` (`client-intake.jsx`)

### 3 · Client · Daily check-in (mobile, 3 variants)
- `CheckinWarm` - lead direction. Big breath pulse, voice as gravity well.
- `CheckinAustere` - type-led, denser. Mic is a quiet button.
- `CheckinEditorial` - voice and writing as equals.

Pick **Warm** as the production direction unless overridden. The other two are reference tone.

### 4 · Client · Voice recorder (mobile, 4 states, 390×600)
- `VoiceIdle` - breath pulse at rest.
- `VoiceListening` - low-amplitude waveform (NOT a stadium visualizer).
- `VoiceTranscribing` - words appear in soft amber as if placed.
- `VoiceComposed` - final transcript with edit / retry / add a note.

### 5 · Client · Dashboard (mobile, 3 modes + states)
- `DashboardMinimal` - one thing at a time.
- `DashboardStandard` - week at a glance + 3 habits + sparkline.
- `DashboardDataHeavy` - editorial charts, must not feel like Strava.
- `ClientEmptyDashboard` (`client-extras.jsx`)
- `ClientSkeleton` - loading skeleton, not spinner.

### 6 · Client · Reading & writing (mobile)
- `WeeklyReview` - three-part: your week / Jolene's read / suggested adjustment. Jolene's paragraph sits on `amberWash`.
- `ClientReplyThread` (`client-extras.jsx`)
- `PlanView` - long-form, reads like something written for you.
- `ClientHistory` - past weeks as journal.
- `ClientSettings` - quiet, no flair.

### 7 · Client · Web (desktop, 1280×800)
The same vocabulary, restructured for wide viewports. **Top nav replaces the tab bar.** Reading column is capped (~720-820px) and centered. Data sits in a right rail when room allows.

- `ClientWebDashboard` - two-column: reading on left, quiet rail on right.
- `ClientWebCheckin` - writing primary on desktop, voice still equal weight.
- `ClientWebVoice` - listening state.
- `ClientWebReview` - long-form. Coach paragraph still on `amberWash`.
- `ClientWebPlan` - magazine-like reading.
- `ClientWebHistory` - journal index, 3-column grid (label / pull-quote / dots).

Top nav: `Jolene` mark on the left, four tabs (Today / Plan / Week / History), date and avatar on the right. 64px tall, hairline bottom border.

### 8 · Client · Responsive (tablet, 768×1024)
- `ClientWebDashboardTablet` - proves two-column collapses to one, top nav stays, type scale dials down a step.

### 9 · Coach · List & inbox (web only, 1280×800)
- `CoachInbox` - "Today" triage queue. 3 priority levels.
- `CoachDesktop` - client list + selected detail rail.

### 10 · Coach · Client detail
- `CoachClientDetail` - full page with tabs (Today / Plan / Reviews / Intake / History).
- `CoachModePicker` - clinical decision modal.

### 11 · Coach · Composing & approving
- `CoachIntakeReader` - sections + GHQ-28 preview, with private notes column.
- `CoachPlanEditor` - AI draft, coach in control. AI sections are marked.
- `CoachReviewComposer` - three-pane: client's week / AI synthesis (editable, marked AI) / Jolene's paragraph.

## Components (shared atoms)
Defined in `tokens.jsx`, exported globally:

- **CosWeekDots** - seven-dot adherence row.
- **CosWeekLabels** - M T W T F S S strip pairing with dots.
- **CosRule** - hairline divider.
- **CosMeta** - tiny UPPERCASE eyebrow.
- **CosTag** - low-weight pill, three tones (neutral / soft / outline).
- **CosSparkline** - thin line, no fill, no markers except optional last point. Supports `dashedFrom` for projection.
- **CosButton** - five tones (neutral / quiet / accent / amber / soft) at three sizes (sm / md / lg).
- **CosIcon** - 1.5-stroke line icons. Mic, Edit, Check, Plus, Arrow, Back, Dot, Pause, Quote, Heart, Cal, Sparkle.

Port these to the codebase's component primitives. Match stroke width, sizing, and the no-color-swap rule on `CosWeekDots`.

## Coach voice paper
The single most important visual rule. Any time the coach (Jolene) writes a paragraph that the client reads, the container uses:

```
background: amberWash    #fdf6e3
border:     amberSoft    #fef3c7
border-radius: 18-20
padding:    20-32
```

Inside, the avatar circle sits on `amberSoft` with `amberInk` text. The eyebrow above the paragraph (`YOUR COACH'S READ`) is `amberInk`, not the default `quiet`. This treatment is what makes Jolene's voice feel like a note rather than a notification. See `WeeklyReview`, `ClientWebReview`, the `NOTE FROM JOLENE` cards on the dashboards.

## Interactions & Behavior

### Daily check-in
- Tap or hold mic to start voice; release to stop. Recorder transitions through Idle → Listening → Transcribing → Composed.
- Edit the transcript inline before sending.
- Send delivers to the coach immediately; client sees a quiet confirmation, no celebratory screen.

### Reading the weekly review
- Two CTAs at the foot: "Reply to Jolene" (neutral) and "Acknowledge" (accent). Acknowledge dismisses the review banner from Today.

### Plan
- Read-only for the client. The `Edit` glyph in the top right is the coach view; on the client this either hides or routes to a "Discuss this with Jolene" composer.

### Coach inbox
- Items sorted by priority (1 highest). Priority is set per-item, not derived from time alone.
- Clicking a row opens the client detail page on the Today tab.

### Coach review composer
- Three columns. AI synthesis (column 2) is editable but visually marked as AI. Coach's paragraph (column 3) is the only thing the client sees as "Jolene's read".
- Private notes never publish.

## State Management

The prototype is stateless. Real implementation needs:

- `checkin` - draft per-day, autosaves on type. Voice transcript lives here until sent.
- `voice` - recorder state machine: `idle | listening | transcribing | composed`.
- `weekly_review` - per-week object: `your_week`, `ai_synthesis` (editable), `coach_paragraph` (required to publish), `suggested_adjustment`, `private_notes`.
- `plan` - markdown-ish document with sections. Versioned per draft.
- `intake` - 10 sections, resumable. Last touched timestamp drives "resume where you left off".
- `habits` - list, each with a 7-day boolean array for adherence.
- `inbox` - server-derived from client activity.

Data fetching is per-tab. Today's check-in must work offline (draft survives a refresh).

## Responsive behavior (client)

| Width            | Layout                                                  |
| ---------------- | ------------------------------------------------------- |
| ≥ 1024px         | Two-column where shown (Today, History). Top nav.       |
| 768-1023px       | One column, top nav, reduced type scale.                |
| ≤ 767px          | Mobile screens as drawn (390×844). Bottom tab bar.      |

At 767px the top nav collapses into the bottom tab bar; the page hero loses ~6-8px of font size; rails stack below reading content.

## Voice & copy

- Sentences are short and plain. No therapy jargon. No motivational copy.
- Never "great job", "you did it", "streak". The system does not congratulate.
- Em dashes are not used anywhere in UI copy or comments. Use the middle dot `·` as a separator and commas/periods inside sentences.
- The coach is named Jolene throughout the prototype; replace with the real coach's name at runtime.

## Assets
None. There are no images, no logos, no illustrations in this design. All marks are CSS shapes (circle for the Jolene avatar, dots for adherence, simple line icons). The iOS status bar and keyboard come from `ios-frame.jsx` and are reference only; do not port.

## Files
Inside `design_files/`:

| File                    | Purpose                                                       |
| ----------------------- | ------------------------------------------------------------- |
| Coach OS Design.html    | Entry point. Loads React + Babel from CDN, mounts `app.jsx`.  |
| app.jsx                 | Canvas composition. Map of every section and artboard.        |
| tokens.jsx              | **Port first.** Colors, type, atoms, icons.                   |
| checkin.jsx             | Mobile daily check-in, 3 variants.                            |
| voice.jsx               | Voice recorder states.                                        |
| dashboards.jsx          | Mobile dashboard, 3 modes.                                    |
| review-plan.jsx         | Mobile weekly review, plan view, intake step.                 |
| client-intake.jsx       | Mobile intake flow, onboarding.                               |
| client-extras.jsx       | Reply thread, history, settings, empty, skeleton.             |
| client-web.jsx          | **Desktop & tablet client screens.**                          |
| coach-foundations.jsx   | Tokens reference doc (skip).                                  |
| coach-suite.jsx         | Coach desktop: inbox, list, client detail, mode picker.       |
| coach-edit.jsx          | Coach editors: plan approval, review composer, intake reader. |
| design-canvas.jsx       | Prototype canvas wrapper. **Do not port.**                    |
| ios-frame.jsx           | Phone bezel and status bar for the prototype. **Do not port.**|
| tweaks-panel.jsx        | Prototype-only control panel. **Do not port.**                |
| tweaks.jsx              | Same. **Do not port.**                                        |

Open `Coach OS Design.html` in a browser to view the full canvas.

## Build order (suggested)
1. Port `tokens.jsx` to a tokens module (CSS vars or theme object).
2. Build the shared atoms: `CosWeekDots`, `CosButton`, `CosTag`, `CosSparkline`, `CosIcon`, `CosMeta`, `CosRule`.
3. Client mobile: daily check-in (Warm), then Today dashboard (Standard), then the voice state machine.
4. Client web: top nav, then Today, then Check-in, then Weekly review reader.
5. Plan, History, Settings on both surfaces.
6. Coach inbox → client detail → review composer.
7. Intake (longest, lowest priority since it's one-time per client).

Reading and writing on the client side is the surface clients touch every day. Build it first and build it well.
