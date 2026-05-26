// Coach OS · Weekly review (mobile) + Plan view (mobile).

// ────────────────────────────────────────────────────────────
// WEEKLY REVIEW
// Three-part: Your week · Jolene's read · Suggested adjustment.
// Coach's voice gets the heaviest paper.
// ────────────────────────────────────────────────────────────
function WeeklyReview() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>WEEK 10 REVIEW</div>
        <div style={{ width: 20 }} />
      </div>

      <div style={{ padding: '8px 24px 0', overflow: 'auto', height: 'calc(100% - 90px)' }}>
        {/* Title */}
        <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Friday's reflection</div>
        <div style={{ marginTop: 4, ...cosT('meta', { color: COS.quiet }) }}>May 13 – May 19 · published 8:02am</div>

        {/* Your week */}
        <div style={{ marginTop: 24 }}>
          <CosMeta>YOUR WEEK</CosMeta>
          <div style={{ marginTop: 10 }}>
            <CosWeekDots data={[1,1,1,0,1,1,0]} size={10} gap={9} />
          </div>
          <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet }) }}>
            5 of 7 days with movement. Two reflections in your own words.
          </div>
        </div>

        {/* Jolene's read · heavy paper */}
        <div style={{
          marginTop: 26, padding: 20,
          background: COS.amberWash, border: `1px solid ${COS.amberSoft}`, borderRadius: 16,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('body2', { fontWeight: 600 }) }}>J</div>
            <div>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Jolene</div>
              <div style={cosT('micro', { color: COS.amberInk })}>YOUR COACH'S READ</div>
            </div>
          </div>
          <div style={{ marginTop: 16, ...cosT('readLead', { color: COS.ink, fontWeight: 400 }) }}>
            What I'm noticing this week is the after-dinner walk becoming a real anchor.
          </div>
          <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
            You mentioned twice that it felt like the part of the day that was yours. That's the kind of habit that tends to hold. The protein piece isn't sticking yet, and I don't think it needs to this week. We can come back to it.
          </div>
        </div>

        {/* Suggested adjustment · recommendation, not alert */}
        <div style={{ marginTop: 22 }}>
          <CosMeta>SUGGESTED ADJUSTMENT</CosMeta>
          <div style={{
            marginTop: 10, padding: 16, borderRadius: 14,
            background: COS.card, border: `1px solid ${COS.line}`,
          }}>
            <div style={cosT('body', { color: COS.ink, fontWeight: 500 })}>Walk after dinner</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CosTag tone="outline">daily</CosTag>
              <CosIcon.Arrow s={14} c={COS.hush} />
              <CosTag tone="soft">most days, by feel</CosTag>
            </div>
            <div style={{ marginTop: 10, ...cosT('body2', { color: COS.quiet }) }}>
              You've earned the option to skip without it being a miss. We'll keep watching.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, marginBottom: 24, display: 'flex', gap: 8 }}>
          <CosButton tone="neutral" size="md" style={{ flex: 1 }} leading={<CosIcon.Quote s={14} c={COS.ink2} />}>Reply to Jolene</CosButton>
          <CosButton tone="accent" size="md" style={{ flex: 1 }} leading={<CosIcon.Check s={14} c="#fff" />}>Acknowledge</CosButton>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PLAN VIEW · long-form. Reads like something written for you.
// ────────────────────────────────────────────────────────────
function PlanView() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>YOUR PLAN</div>
        <CosIcon.Edit s={18} c={COS.quiet} />
      </div>

      <div style={{ padding: '8px 28px 0', overflow: 'auto', height: 'calc(100% - 90px)' }}>
        <div style={cosT('micro', { color: COS.quiet })}>DRAFTED BY JOLENE · APRIL 14</div>
        <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 30, lineHeight: 1.15 }) }}>
          A quieter spring.
        </div>

        <div style={{ marginTop: 22, ...cosT('readLead', { color: COS.ink2 }) }}>
          You came in with a pattern of doing too much, sleeping badly, then trying to fix it with caffeine and another late night. We're going to do less, on purpose.
        </div>

        <CosRule style={{ marginTop: 28 }} />

        <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>What we're working on</div>
        <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
          One walk after dinner. Twenty minutes is plenty. The point isn't exercise, it's a marker that the work day is over. If it rains, the walk still counts as a stand at the window.
        </div>
        <div style={{ marginTop: 16, ...cosT('read', { color: COS.ink2 }) }}>
          Protein at breakfast, when it's easy. We'll come back to this when the walk feels automatic.
        </div>
        <div style={{ marginTop: 16, ...cosT('read', { color: COS.ink2 }) }}>
          Lights down by 10. Not lights out. Down. Lamp instead of overhead. Phone away from the bed if you can manage it.
        </div>

        <CosRule style={{ marginTop: 28 }} />

        <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>What we're not doing</div>
        <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
          No tracking calories. No morning workouts before this all settles. No weigh-ins. You can ask me about any of these, but I'd like a few weeks first.
        </div>

        <CosRule style={{ marginTop: 28 }} />

        <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>How we'll know it's working</div>
        <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
          You'll start describing your evenings differently. That's the signal I'm watching for. Numbers will follow.
        </div>

        <div style={{ marginTop: 28, marginBottom: 32, padding: 16, borderRadius: 14, background: COS.sunk, border: `1px solid ${COS.line}` }}>
          <CosMeta>NEXT REVIEW</CosMeta>
          <div style={{ marginTop: 8, ...cosT('body', { color: COS.ink }) }}>Friday, May 26 · together at 4pm</div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// INTAKE · one screen of the 10-section flow. Pacing and calm.
// ────────────────────────────────────────────────────────────
function IntakeStep() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>4 OF 10 · SLEEP</div>
        <div style={cosT('meta', { color: COS.hush })}>Save</div>
      </div>

      {/* Progress · small dots, no percentage bar */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 6 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < 3 ? COS.ink : i === 3 ? COS.amber : COS.line,
          }} />
        ))}
      </div>

      <div style={{ padding: '28px 28px 0' }}>
        <CosMeta>SECTION 4</CosMeta>
        <div style={{ marginTop: 6, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>Sleep</div>
        <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet }) }}>Six questions. We can pause anywhere.</div>
      </div>

      <div style={{ padding: '28px 28px 0' }}>
        <div style={cosT('meta', { color: COS.quiet })}>QUESTION 2 OF 6</div>
        <div style={{ marginTop: 8, ...cosT('h2', { color: COS.ink, fontWeight: 500, letterSpacing: '-0.01em' }) }}>
          What does a good night of sleep look like for you, lately?
        </div>
        <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet }) }}>
          Speak or write. No right answer.
        </div>

        <div style={{
          marginTop: 18, padding: 16, borderRadius: 14,
          background: COS.card, border: `1px solid ${COS.line}`,
          minHeight: 180, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flex: 1, ...cosT('body', { color: COS.hush }) }}>
            A few sentences is plenty.
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COS.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.amberSoft, color: COS.amber, display: 'grid', placeItems: 'center' }}>
                <CosIcon.Mic s={14} c={COS.amber} />
              </div>
              <div style={cosT('meta', { color: COS.quiet })}>Hold to speak</div>
            </div>
            <div style={cosT('micro', { color: COS.hush })}>OPTIONAL</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CosButton tone="quiet" size="md">Skip</CosButton>
        <CosButton tone="accent" size="md" trailing={<CosIcon.Arrow s={14} c="#fff" />}>Continue</CosButton>
      </div>
    </div>
  );
}

Object.assign(window, { WeeklyReview, PlanView, IntakeStep });
