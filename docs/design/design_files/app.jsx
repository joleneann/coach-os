// Coach OS · main canvas composition.

function App() {
  return (
    <>
      <CosTweaks />
      <DesignCanvas>

        <DCSection id="intro" title="Coach OS · design refresh" subtitle="Warm. Inter-only. No gamification. Voice-first. Adherence in shape, not color. The full system, one page.">
          <DCArtboard id="tokens" label="Foundations · tokens, type, motion" width={720} height={1280}>
            <FoundationsDoc />
          </DCArtboard>
        </DCSection>

        {/* ────────── CLIENT · entry, daily ────────── */}

        <DCSection id="intake-client" title="Client · intake (10 sections, paced)" subtitle="The first surface a new client touches. Overview lets you breathe. One question at a time inside. GHQ-28 is visually equal-weighted, never right-or-wrong.">
          <DCArtboard id="intake-over" label="Overview · 10 sections, resume where you left off" width={390} height={844}>
            <IntakeOverview />
          </DCArtboard>
          <DCArtboard id="intake-step" label="Inside a section · one question at a time" width={390} height={844}>
            <IntakeStep />
          </DCArtboard>
          <DCArtboard id="intake-ghq" label="GHQ-28 · neutral instrument styling" width={390} height={844}>
            <IntakeGHQ />
          </DCArtboard>
        </DCSection>

        <DCSection id="onboarding" title="Client · onboarding (after intake submit)" subtitle="A handoff to the practice. No celebration, no checklists. Three calm panels.">
          <DCArtboard id="ob-1" label="1 · Welcome from Jolene" width={390} height={844}>
            <ClientOnboardingA />
          </DCArtboard>
          <DCArtboard id="ob-2" label="2 · What to expect" width={390} height={844}>
            <ClientOnboardingB />
          </DCArtboard>
          <DCArtboard id="ob-3" label="3 · Nothing to do, on purpose" width={390} height={844}>
            <ClientOnboardingC />
          </DCArtboard>
        </DCSection>

        <DCSection id="checkin" title="Client · daily check-in · three tonal variants" subtitle="The surface clients touch most. Voice is the gravity well; only weight and density change.">
          <DCArtboard id="warm" label="A · Warm · lead direction" width={390} height={844}>
            <CheckinWarm />
          </DCArtboard>
          <DCArtboard id="austere" label="B · Austere · type-led, denser" width={390} height={844}>
            <CheckinAustere />
          </DCArtboard>
          <DCArtboard id="editorial" label="C · Editorial · voice and writing as equals" width={390} height={844}>
            <CheckinEditorial />
          </DCArtboard>
        </DCSection>

        <DCSection id="voice" title="Client · voice recorder · four states" subtitle="One shape language across all four. Breath at rest, low-amplitude wave on listen, placed-text on transcribe.">
          <DCArtboard id="v1" label="1 · Idle" width={390} height={600}>
            <VoiceIdle />
          </DCArtboard>
          <DCArtboard id="v2" label="2 · Listening" width={390} height={600}>
            <VoiceListening />
          </DCArtboard>
          <DCArtboard id="v3" label="3 · Transcribing" width={390} height={600}>
            <VoiceTranscribing />
          </DCArtboard>
          <DCArtboard id="v4" label="4 · Composed" width={390} height={600}>
            <VoiceComposed />
          </DCArtboard>
        </DCSection>

        <DCSection id="dashboards" title="Client · dashboard · three modes" subtitle="MINIMAL · STANDARD · DATA_HEAVY. Same vocabulary, density is the dial. DATA_HEAVY still must not feel like Strava.">
          <DCArtboard id="d-min" label="MINIMAL · one thing" width={390} height={844}>
            <DashboardMinimal />
          </DCArtboard>
          <DCArtboard id="d-std" label="STANDARD · week at a glance" width={390} height={844}>
            <DashboardStandard />
          </DCArtboard>
          <DCArtboard id="d-heavy" label="DATA_HEAVY · editorial charts" width={390} height={844}>
            <DashboardDataHeavy />
          </DCArtboard>
          <DCArtboard id="d-empty" label="Empty · day one, no entries yet" width={390} height={844}>
            <ClientEmptyDashboard />
          </DCArtboard>
          <DCArtboard id="d-skel" label="Loading · skeleton, not spinner" width={390} height={844}>
            <ClientSkeleton />
          </DCArtboard>
        </DCSection>

        {/* ────────── CLIENT · reading & writing ────────── */}

        <DCSection id="review-plan" title="Client · review · plan · reply · history" subtitle="Coach's voice has its own paper. Adjustments read as recommendations, not alerts.">
          <DCArtboard id="review" label="Weekly review · coach voice prominent" width={390} height={844}>
            <WeeklyReview />
          </DCArtboard>
          <DCArtboard id="reply" label="Reply thread · a quiet exchange" width={390} height={844}>
            <ClientReplyThread />
          </DCArtboard>
          <DCArtboard id="plan" label="Plan · written for the client" width={390} height={844}>
            <PlanView />
          </DCArtboard>
          <DCArtboard id="history" label="History · past weeks as journal" width={390} height={844}>
            <ClientHistory />
          </DCArtboard>
          <DCArtboard id="settings" label="Settings · quiet, no flair" width={390} height={844}>
            <ClientSettings />
          </DCArtboard>
        </DCSection>

        {/* ────────── CLIENT · web (desktop & tablet) ────────── */}

        <DCSection id="client-web" title="Client · web (desktop)" subtitle="The client app is web and mobile. Same vocabulary as the phone, restructured for wide viewports. Top nav, reading column centered, data sits in a quiet rail. Voice stays equal to writing.">
          <DCArtboard id="cw-today" label="Today · two-column reading + rail" width={1280} height={800}>
            <ClientWebDashboard />
          </DCArtboard>
          <DCArtboard id="cw-checkin" label="Check-in · writing primary, voice equal" width={1280} height={800}>
            <ClientWebCheckin />
          </DCArtboard>
          <DCArtboard id="cw-voice" label="Voice · listening state, desktop" width={1280} height={800}>
            <ClientWebVoice />
          </DCArtboard>
          <DCArtboard id="cw-review" label="Weekly review · long-form" width={1280} height={800}>
            <ClientWebReview />
          </DCArtboard>
          <DCArtboard id="cw-plan" label="Plan · magazine-like reading" width={1280} height={800}>
            <ClientWebPlan />
          </DCArtboard>
          <DCArtboard id="cw-history" label="History · journal index" width={1280} height={800}>
            <ClientWebHistory />
          </DCArtboard>
        </DCSection>

        <DCSection id="client-tablet" title="Client · responsive (tablet · 768)" subtitle="Same components reflow. Two columns collapse to one, top nav stays, type scale dials down a step.">
          <DCArtboard id="cw-tablet" label="Today · 768 wide" width={768} height={1024}>
            <ClientWebDashboardTablet />
          </DCArtboard>
        </DCSection>

        {/* ────────── COACH · web only (desktop) ────────── */}

        <DCSection id="coach-list" title="Coach · list & inbox (web only)" subtitle="Coach app is web only. Where Jolene starts her morning. Density welcomed; noise removed.">
          <DCArtboard id="coach-today" label="Today · triage queue" width={1280} height={800}>
            <CoachInbox />
          </DCArtboard>
          <DCArtboard id="coach-list-view" label="Clients · list + selected detail rail" width={1280} height={800}>
            <CoachDesktop />
          </DCArtboard>
        </DCSection>

        <DCSection id="coach-detail" title="Coach · client detail (full page)" subtitle="The page where Jolene actually works. Tabs for Today / Plan / Reviews / Intake / History.">
          <DCArtboard id="coach-detail-full" label="Client detail · Today tab" width={1280} height={800}>
            <CoachClientDetail />
          </DCArtboard>
          <DCArtboard id="coach-mode" label="Mode picker · clinical decision modal" width={1280} height={800}>
            <CoachModePicker />
          </DCArtboard>
        </DCSection>

        <DCSection id="coach-edit" title="Coach · composing & approving" subtitle="The two surfaces where coach voice and AI synthesis meet. Coach decides what the client sees.">
          <DCArtboard id="coach-intake" label="Intake reader · sections + GHQ-28 preview" width={1280} height={800}>
            <CoachIntakeReader />
          </DCArtboard>
          <DCArtboard id="coach-plan" label="Plan editor · AI draft, coach in control" width={1280} height={800}>
            <CoachPlanEditor />
          </DCArtboard>
          <DCArtboard id="coach-review" label="Weekly review composer · three-pane" width={1280} height={800}>
            <CoachReviewComposer />
          </DCArtboard>
        </DCSection>

      </DesignCanvas>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
