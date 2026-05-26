// Coach OS · Client intake flow + onboarding (mobile, 390×844).

// ────────────────────────────────────────────────────────────
// INTAKE · OVERVIEW
// 10 sections at a glance. Pacing is the design. Resume where you left off.
// ────────────────────────────────────────────────────────────
function IntakeOverview() {
  const sections = [
    { n: 1, t: 'Welcome', d: 'A short letter from Jolene.', state: 'done' },
    { n: 2, t: 'History', d: 'Where you\'re coming from. Five questions.', state: 'done' },
    { n: 3, t: 'Goals', d: 'In your own words, no checklists.', state: 'done' },
    { n: 4, t: 'Sleep', d: 'Six questions. Voice if you prefer.', state: 'doing' },
    { n: 5, t: 'Movement', d: 'How you\'ve moved lately.', state: 'todo' },
    { n: 6, t: 'Food', d: 'Patterns, not diet rules.', state: 'todo' },
    { n: 7, t: 'Stress', d: 'How it shows up for you.', state: 'todo' },
    { n: 8, t: 'GHQ-28', d: 'A short clinical questionnaire.', state: 'todo' },
    { n: 9, t: 'Relationships', d: 'Who\'s around. Optional.', state: 'todo' },
    { n: 10, t: 'Constraints', d: 'Anything you want me to know.', state: 'todo' },
  ];
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>YOUR INTAKE</div>
        <div style={cosT('meta', { color: COS.hush })}>Save</div>
      </div>

      <div style={{ padding: '12px 28px 0' }}>
        <CosMeta>3 OF 10 COMPLETE</CosMeta>
        <div style={{ marginTop: 8, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>You're a third of the way in.</div>
        <div style={{ marginTop: 6, ...cosT('body2', { color: COS.quiet }) }}>About 25 minutes of writing left, less if you speak.</div>
        <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
          {sections.map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: s.state === 'done' ? COS.ink : s.state === 'doing' ? COS.amber : COS.line,
            }} />
          ))}
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '0 16px 12px', overflow: 'auto', height: 'calc(100% - 322px)' }}>
        {sections.map((s, i) => {
          const active = s.state === 'doing';
          return (
            <div key={i} style={{
              margin: '6px 0', padding: '14px 14px', borderRadius: 14,
              background: active ? COS.card : 'transparent',
              border: active ? `1px solid ${COS.amberSoft}` : '1px solid transparent',
              boxShadow: active ? `0 0 0 4px ${COS.amberSoft}40` : 'none',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: s.state === 'done' ? COS.ink : s.state === 'doing' ? COS.amberSoft : COS.sunk,
                color: s.state === 'done' ? '#fff' : s.state === 'doing' ? COS.amberInk : COS.hush,
                display: 'grid', placeItems: 'center',
                ...cosT('body2', { fontWeight: 600 }),
              }}>
                {s.state === 'done' ? <CosIcon.Check s={14} c="#fff" /> : s.n}
              </div>
              <div style={{ flex: 1 }}>
                <div style={cosT('body', { color: COS.ink, fontWeight: active ? 600 : 500 })}>{s.t}</div>
                <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>{s.d}</div>
              </div>
              {active && <CosIcon.Arrow s={16} c={COS.amber} />}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 16, paddingBottom: 32, background: `linear-gradient(to top, ${COS.paper} 70%, ${COS.paper}00)` }}>
        <div style={{ padding: '0 24px', display: 'flex', gap: 8 }}>
          <CosButton tone="neutral" size="lg" style={{ flex: 1 }}>Save and quit</CosButton>
          <CosButton tone="accent" size="lg" style={{ flex: 1.4 }} trailing={<CosIcon.Arrow s={14} c="#fff" />}>Continue Sleep</CosButton>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// INTAKE · GHQ-28 (PSYCHOMETRIC SECTION)
// 7-item slice. Four options visually equal-weighted. No "good" answer.
// ────────────────────────────────────────────────────────────
function IntakeGHQ() {
  const options = ['Better than usual', 'Same as usual', 'Less than usual', 'Much less than usual'];
  const questions = [
    { q: 'Been able to concentrate on what you\'re doing', a: 1 },
    { q: 'Lost much sleep over worry', a: 2 },
    { q: 'Felt that you are playing a useful part in things', a: 1 },
    { q: 'Felt capable of making decisions about things', a: null },
  ];
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>8 OF 10 · GHQ-28</div>
        <div style={cosT('meta', { color: COS.hush })}>Save</div>
      </div>

      <div style={{ padding: '4px 28px 0' }}>
        <CosMeta>A SHORT QUESTIONNAIRE</CosMeta>
        <div style={{ marginTop: 8, ...cosT('h2', { color: COS.ink, fontWeight: 500 }) }}>
          Over the last few weeks, have you...
        </div>
        <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet, lineHeight: 1.5 }) }}>
          Used in clinical practice to check in on how you're doing. There's no right or better answer. Skip any question you'd rather not answer.
        </div>
      </div>

      <div style={{ marginTop: 18, padding: '0 24px 12px', overflow: 'auto', height: 'calc(100% - 320px)' }}>
        {questions.map((Q, qi) => (
          <div key={qi} style={{ padding: '18px 0', borderBottom: qi < questions.length - 1 ? `1px solid ${COS.line}` : 'none' }}>
            <div style={cosT('body', { color: COS.ink, lineHeight: 1.5 })}>{Q.q}</div>
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {options.map((o, oi) => {
                const selected = Q.a === oi;
                return (
                  <div key={oi} style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: selected ? COS.amberSoft : COS.card,
                    border: `1px solid ${selected ? COS.amberSoft : COS.line}`,
                    color: selected ? COS.amberInk : COS.ink2,
                    ...cosT('body2', { fontWeight: selected ? 500 : 400 }),
                    textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: `1.5px solid ${selected ? COS.amberInk : COS.lineStrong}`,
                      background: selected ? COS.amberInk : 'transparent',
                      flexShrink: 0,
                    }} />
                    {o}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8, ...cosT('meta', { color: COS.hush }) }}>Question {qi + 1} of 28 in this section · prefer not to say</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 16, paddingBottom: 32, background: `linear-gradient(to top, ${COS.paper} 70%, ${COS.paper}00)` }}>
        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CosButton tone="quiet" size="md">Pause</CosButton>
          <CosButton tone="accent" size="md" trailing={<CosIcon.Arrow s={14} c="#fff" />}>Continue</CosButton>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// CLIENT ONBOARDING · first open after intake submitted.
// Three calm panels. No celebration. A handoff to the practice.
// ────────────────────────────────────────────────────────────
function ClientOnboardingA() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />
      <div style={{ padding: '16px 28px 0', display: 'flex', justifyContent: 'space-between' }}>
        <div style={cosT('micro', { color: COS.quiet })}>STEP 1 OF 3</div>
        <div style={cosT('micro', { color: COS.hush })}>SKIP</div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, top: 140 }}>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 34, lineHeight: 1.1 })}>
          Welcome, Rohan.
        </div>
        <div style={{ marginTop: 16, ...cosT('readLead', { color: COS.ink2 }) }}>
          Your intake is with me. I'll read it carefully this week and write you a plan.
        </div>
        <div style={{ marginTop: 14, ...cosT('read', { color: COS.ink2 }) }}>
          Nothing here is automatic. You'll never see something I haven't seen first.
        </div>
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('body2', { fontWeight: 600 }) }}>J</div>
          <div>
            <div style={cosT('body2', { color: COS.ink, fontWeight: 500 })}>Jolene</div>
            <div style={cosT('meta', { color: COS.quiet })}>your coach</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 64 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === 0 ? COS.ink : COS.line }} />)}
        </div>
        <CosButton tone="accent" size="lg" style={{ width: '100%' }} trailing={<CosIcon.Arrow s={14} c="#fff" />}>Continue</CosButton>
      </div>
    </div>
  );
}

function ClientOnboardingB() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />
      <div style={{ padding: '16px 28px 0', display: 'flex', justifyContent: 'space-between' }}>
        <div style={cosT('micro', { color: COS.quiet })}>STEP 2 OF 3</div>
        <div style={cosT('micro', { color: COS.hush })}>SKIP</div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, top: 100 }}>
        <CosMeta>WHAT TO EXPECT</CosMeta>
        <div style={{ marginTop: 10, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>
          A short check-in most days.
        </div>
        <div style={{ marginTop: 14, ...cosT('read', { color: COS.ink2 }) }}>
          Two minutes is plenty. Voice or writing. You can miss days. The system won't nag you.
        </div>
        <div style={{ marginTop: 24, display: 'grid', placeItems: 'center' }}>
          <CkBreathPulse size={140} />
          <div style={{ marginTop: 16, ...cosT('body2', { color: COS.ink2 }) }}>Tap to speak</div>
          <div style={{ marginTop: 4, ...cosT('meta', { color: COS.hush }) }}>or write a few sentences</div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ padding: 14, borderRadius: 12, background: COS.card, border: `1px solid ${COS.line}` }}>
            <CosMeta>EVERY FRIDAY</CosMeta>
            <div style={{ marginTop: 6, ...cosT('body2', { color: COS.ink, lineHeight: 1.5 }) }}>
              I'll write you a short review. We'll meet at 4pm.
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 64 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === 1 ? COS.ink : COS.line }} />)}
        </div>
        <CosButton tone="accent" size="lg" style={{ width: '100%' }} trailing={<CosIcon.Arrow s={14} c="#fff" />}>Continue</CosButton>
      </div>
    </div>
  );
}

function ClientOnboardingC() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />
      <div style={{ padding: '16px 28px 0', display: 'flex', justifyContent: 'space-between' }}>
        <div style={cosT('micro', { color: COS.quiet })}>STEP 3 OF 3</div>
        <div style={cosT('micro', { color: COS.hush })}>&nbsp;</div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, top: 100 }}>
        <CosMeta>WHILE YOU WAIT FOR YOUR PLAN</CosMeta>
        <div style={{ marginTop: 10, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>
          Nothing to do, on purpose.
        </div>
        <div style={{ marginTop: 14, ...cosT('read', { color: COS.ink2 }) }}>
          I'll have your plan to you within five days. In the meantime: rest. If you have a thought you want me to see before then, tap the mic on the next screen.
        </div>

        <div style={{ marginTop: 28, padding: 16, borderRadius: 14, background: COS.amberWash, border: `1px solid ${COS.amberSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('body2', { fontWeight: 600 }) }}>J</div>
            <div>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Jolene</div>
              <div style={cosT('micro', { color: COS.amberInk })}>BEFORE YOU GO</div>
            </div>
          </div>
          <div style={{ marginTop: 12, ...cosT('body', { color: COS.ink, fontStyle: 'italic', lineHeight: 1.55 }) }}>
            “I read every intake. I'll write back this week. There's nothing you need to fix before then.”
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 64 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 18 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: 999, background: i === 2 ? COS.ink : COS.line }} />)}
        </div>
        <CosButton tone="accent" size="lg" style={{ width: '100%' }} trailing={<CosIcon.Arrow s={14} c="#fff" />}>Open Coach OS</CosButton>
      </div>
    </div>
  );
}

Object.assign(window, { IntakeOverview, IntakeGHQ, ClientOnboardingA, ClientOnboardingB, ClientOnboardingC });
