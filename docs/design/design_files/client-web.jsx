// Coach OS · Client web (desktop). Same vocabulary as mobile, restructured
// for wide viewports. Top nav replaces tab bar. Reading column is centered
// and capped; data and habits sit in a side rail when room allows.

// ────────────────────────────────────────────────────────────
// Shared chrome
// ────────────────────────────────────────────────────────────
function CwShell({ children, active = 'today', width = 1280, height = 800, bg = COS.paper }) {
  return (
    <div style={{
      width, height, background: bg, position: 'relative',
      fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <CwTopNav active={active} compact={width < 900} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

function CwTopNav({ active = 'today', compact = false }) {
  const items = [
    { id: 'today', label: 'Today' },
    { id: 'plan', label: 'Plan' },
    { id: 'week', label: 'Week' },
    { id: 'history', label: 'History' },
  ];
  return (
    <div style={{
      height: 64, flexShrink: 0, paddingInline: compact ? 24 : 40,
      borderBottom: `1px solid ${COS.line}`, background: COS.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 18 : 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: COS.ink }} />
          <div style={cosT('body2', { color: COS.ink, fontWeight: 600, letterSpacing: '-0.005em' })}>Jolene</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 14 : 22 }}>
          {items.map(i => (
            <div key={i.id} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              color: active === i.id ? COS.ink : COS.quiet,
            }}>
              <div style={cosT('body2', { fontWeight: active === i.id ? 600 : 500 })}>{i.label}</div>
              <div style={{ width: 18, height: 2, borderRadius: 2, background: active === i.id ? COS.ink : 'transparent' }} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={cosT('meta', { color: COS.quiet })}>Tue, May 23</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.sunk, display: 'grid', placeItems: 'center', color: COS.ink2, ...cosT('meta', { fontWeight: 600 }) }}>R</div>
      </div>
    </div>
  );
}

// Card primitive (reused)
function CwCard({ children, padded = true, style = {} }) {
  return (
    <div style={{
      background: COS.card, border: `1px solid ${COS.line}`, borderRadius: 18,
      padding: padded ? 24 : 0, ...style,
    }}>{children}</div>
  );
}

// Responsive container · centered with max width
function CwContainer({ children, max = 1080, pad = 40, style = {} }) {
  return (
    <div style={{ maxWidth: max, margin: '0 auto', padding: `0 ${pad}px`, ...style }}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1 · Client web · Dashboard (Today)
// Two-column: reading column on left, quiet rail on right.
// ────────────────────────────────────────────────────────────
function ClientWebDashboard() {
  return (
    <CwShell active="today">
      <CwContainer max={1120} style={{ paddingBlock: 48 }}>
        <div style={cosT('h2', { color: COS.quiet, fontWeight: 400 })}>Good morning,</div>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 44, lineHeight: 1.1 })}>Rohan.</div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* Left · main reading */}
          <div style={{ display: 'grid', gap: 18 }}>
            <CwCard>
              <CosMeta>TODAY</CosMeta>
              <div style={{ marginTop: 12, ...cosT('h1', { color: COS.ink, fontWeight: 500, fontSize: 28 }) }}>
                One walk after dinner.
              </div>
              <div style={{ marginTop: 8, ...cosT('body', { color: COS.quiet }) }}>
                Twenty minutes is plenty. No phone if you can.
              </div>
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CosButton tone="accent" size="lg" leading={<CosIcon.Mic s={16} c="#fff" />}>Today's check-in</CosButton>
                <div style={cosT('meta', { color: COS.hush })}>or write at your desk</div>
              </div>
            </CwCard>

            <CwCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }) }}>J</div>
                <CosMeta color={COS.amberInk}>NOTE FROM JOLENE · YESTERDAY</CosMeta>
              </div>
              <div style={{ marginTop: 14, ...cosT('readLead', { color: COS.ink }) }}>
                You mentioned the walk feeling like yours. Keep that.
              </div>
              <div style={{ marginTop: 10, ...cosT('read', { color: COS.ink2 }) }}>
                We'll talk Friday. Nothing to change in the meantime. The protein piece can wait.
              </div>
            </CwCard>
          </div>

          {/* Right · quiet rail */}
          <div style={{ display: 'grid', gap: 18 }}>
            <CwCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CosMeta>THIS WEEK</CosMeta>
                <div style={cosT('meta', { color: COS.hush })}>5 of 7</div>
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
                {[
                  { name: 'Walk after dinner', data: [1,1,1,0,1,0,0] },
                  { name: 'Protein at breakfast', data: [1,0,1,1,0,0,0] },
                  { name: 'Lights down by 10', data: [1,1,1,1,1,0,0] },
                ].map((h, i) => (
                  <div key={i}>
                    <div style={cosT('body2', { color: COS.ink, marginBottom: 6 })}>{h.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <CosWeekLabels />
                      <CosWeekDots data={h.data} today={4} size={7} gap={7} />
                    </div>
                  </div>
                ))}
              </div>
            </CwCard>

            <CwCard>
              <CosMeta>NEXT REVIEW</CosMeta>
              <div style={{ marginTop: 8, ...cosT('body', { color: COS.ink, fontWeight: 500 }) }}>Friday, May 26</div>
              <div style={{ marginTop: 4, ...cosT('meta', { color: COS.quiet }) }}>Together at 4pm</div>
            </CwCard>
          </div>
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 2 · Client web · Check-in (writing primary on desktop, voice still equal)
// ────────────────────────────────────────────────────────────
function ClientWebCheckin() {
  return (
    <CwShell active="today">
      <CwContainer max={820} style={{ paddingBlock: 56 }}>
        <CosMeta>TUE · MAY 23</CosMeta>
        <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 42, lineHeight: 1.1 }) }}>
          Tell us about today.
        </div>
        <div style={{ marginTop: 10, ...cosT('body', { color: COS.quiet }) }}>
          Voice, writing, or both. Whatever lands.
        </div>

        <div style={{
          marginTop: 32, padding: 28, borderRadius: 18,
          background: COS.card, border: `1px solid ${COS.line}`,
          minHeight: 320, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flex: 1, ...cosT('readLead', { color: COS.hush }) }}>
            Start writing, or hold the mic to speak.
          </div>
          <div style={{
            marginTop: 18, paddingTop: 16, borderTop: `1px solid ${COS.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={cosT('meta', { color: COS.hush })}>0 words · saves as you type</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 40, padding: '0 14px', borderRadius: 999,
                background: COS.amberSoft, color: COS.amberInk,
                ...cosT('body2', { fontWeight: 500 }),
              }}>
                <CosIcon.Mic s={15} c={COS.amberInk} />
                Hold to speak
              </div>
              <CosButton tone="accent" size="md" trailing={<CosIcon.Arrow s={14} c="#fff" />}>Send to Jolene</CosButton>
            </div>
          </div>
        </div>

        {/* Yesterday, in your words */}
        <div style={{ marginTop: 40 }}>
          <CosRule />
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <CosMeta>YESTERDAY, IN YOUR WORDS</CosMeta>
              <div style={{ marginTop: 10, ...cosT('body', { color: COS.ink2, fontStyle: 'italic', lineHeight: 1.6 }) }}>
                “Slept ok. The walk after dinner is starting to feel like the part of the day that's mine.”
              </div>
            </div>
            <div>
              <CosMeta>THIS WEEK</CosMeta>
              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CosWeekLabels />
                <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} size={9} gap={8} />
              </div>
            </div>
          </div>
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 3 · Client web · Weekly review (long-form reading)
// ────────────────────────────────────────────────────────────
function ClientWebReview() {
  return (
    <CwShell active="week">
      <CwContainer max={760} style={{ paddingBlock: 56 }}>
        <CosMeta>WEEK 10 REVIEW</CosMeta>
        <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 42, lineHeight: 1.1 }) }}>
          Friday's reflection
        </div>
        <div style={{ marginTop: 6, ...cosT('meta', { color: COS.quiet }) }}>May 13 to May 19 · published 8:02am</div>

        <div style={{ marginTop: 32 }}>
          <CosMeta>YOUR WEEK</CosMeta>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 18 }}>
            <CosWeekDots data={[1,1,1,0,1,1,0]} size={11} gap={10} />
            <div style={cosT('body2', { color: COS.quiet })}>5 of 7 days with movement. Two reflections in your own words.</div>
          </div>
        </div>

        {/* Jolene's read · heavier paper */}
        <div style={{
          marginTop: 32, padding: 32, borderRadius: 20,
          background: COS.amberWash, border: `1px solid ${COS.amberSoft}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('body2', { fontWeight: 600 }) }}>J</div>
            <div>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Jolene</div>
              <div style={cosT('micro', { color: COS.amberInk })}>YOUR COACH'S READ</div>
            </div>
          </div>
          <div style={{ marginTop: 20, ...cosT('readLead', { color: COS.ink, fontSize: 22, lineHeight: 1.45 }) }}>
            What I'm noticing this week is the after-dinner walk becoming a real anchor.
          </div>
          <div style={{ marginTop: 14, ...cosT('read', { color: COS.ink2, fontSize: 17, lineHeight: 1.7 }) }}>
            You mentioned twice that it felt like the part of the day that was yours. That's the kind of habit that tends to hold. The protein piece isn't sticking yet, and I don't think it needs to this week. We can come back to it.
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <CosMeta>SUGGESTED ADJUSTMENT</CosMeta>
          <div style={{ marginTop: 12, padding: 20, borderRadius: 16, background: COS.card, border: `1px solid ${COS.line}` }}>
            <div style={cosT('body', { color: COS.ink, fontWeight: 500, fontSize: 16 })}>Walk after dinner</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <CosTag tone="outline">daily</CosTag>
              <CosIcon.Arrow s={14} c={COS.hush} />
              <CosTag tone="soft">most days, by feel</CosTag>
            </div>
            <div style={{ marginTop: 12, ...cosT('body2', { color: COS.quiet }) }}>
              You've earned the option to skip without it being a miss. We'll keep watching.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, marginBottom: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <CosButton tone="neutral" size="md" leading={<CosIcon.Quote s={14} c={COS.ink2} />}>Reply to Jolene</CosButton>
          <CosButton tone="accent" size="md" leading={<CosIcon.Check s={14} c="#fff" />}>Acknowledge</CosButton>
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 4 · Client web · Plan (long-form, magazine-like)
// ────────────────────────────────────────────────────────────
function ClientWebPlan() {
  const Section = ({ title, children }) => (
    <div style={{ marginTop: 32 }}>
      <CosRule />
      <div style={{ marginTop: 28, ...cosT('h2', { color: COS.ink, fontWeight: 500 }) }}>{title}</div>
      <div style={{ marginTop: 14, display: 'grid', gap: 16 }}>{children}</div>
    </div>
  );
  return (
    <CwShell active="plan">
      <CwContainer max={720} style={{ paddingBlock: 56 }}>
        <CosMeta>DRAFTED BY JOLENE · APRIL 14</CosMeta>
        <div style={{ marginTop: 10, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 48, lineHeight: 1.1 }) }}>
          A quieter spring.
        </div>
        <div style={{ marginTop: 18, ...cosT('readLead', { color: COS.ink2, fontSize: 21 }) }}>
          You came in with a pattern of doing too much, sleeping badly, then trying to fix it with caffeine and another late night. We're going to do less, on purpose.
        </div>

        <Section title="What we're working on">
          <div style={cosT('read', { color: COS.ink2, fontSize: 17 })}>
            One walk after dinner. Twenty minutes is plenty. The point isn't exercise, it's a marker that the work day is over. If it rains, the walk still counts as a stand at the window.
          </div>
          <div style={cosT('read', { color: COS.ink2, fontSize: 17 })}>
            Protein at breakfast, when it's easy. We'll come back to this when the walk feels automatic.
          </div>
          <div style={cosT('read', { color: COS.ink2, fontSize: 17 })}>
            Lights down by 10. Not lights out. Down. Lamp instead of overhead. Phone away from the bed if you can manage it.
          </div>
        </Section>

        <Section title="What we're not doing">
          <div style={cosT('read', { color: COS.ink2, fontSize: 17 })}>
            No tracking calories. No morning workouts before this all settles. No weigh-ins. You can ask me about any of these, but I'd like a few weeks first.
          </div>
        </Section>

        <Section title="How we'll know it's working">
          <div style={cosT('read', { color: COS.ink2, fontSize: 17 })}>
            You'll start describing your evenings differently. That's the signal I'm watching for. Numbers will follow.
          </div>
        </Section>

        <div style={{ marginTop: 36, marginBottom: 16, padding: 22, borderRadius: 16, background: COS.sunk, border: `1px solid ${COS.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <CosMeta>NEXT REVIEW</CosMeta>
            <div style={{ marginTop: 6, ...cosT('body', { color: COS.ink, fontWeight: 500 }) }}>Friday, May 26 · together at 4pm</div>
          </div>
          <CosButton tone="neutral" size="md" leading={<CosIcon.Cal s={14} c={COS.ink2} />}>Add to calendar</CosButton>
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 5 · Client web · History (past weeks as a journal index)
// ────────────────────────────────────────────────────────────
function ClientWebHistory() {
  const items = [
    { wk: 10, dots: [1,1,1,0,1,1,0], pull: 'The walk is becoming yours.',           kind: 'review', date: 'May 13 to May 19' },
    { wk: 10, dots: null, pull: 'Long one. The walk got me through a hard afternoon with my mom.', kind: 'entry', date: 'Sat May 18' },
    { wk: 10, dots: null, pull: 'Quiet weekend. Cooked, read. Skipped the walk on purpose.',       kind: 'entry', date: 'Sun May 19' },
    { wk: 9,  dots: [1,1,0,1,1,1,1], pull: 'Steadier. We can come back to the protein piece.',     kind: 'review', date: 'May 6 to May 12' },
    { wk: 9,  dots: null, pull: 'Slept badly Thursday. Didn\'t walk Friday. Both feel fine.',      kind: 'entry', date: 'Sat May 11' },
    { wk: 8,  dots: [1,0,1,1,0,1,0], pull: 'You\'re building something quiet.',                    kind: 'review', date: 'Apr 29 to May 5' },
  ];
  return (
    <CwShell active="history">
      <CwContainer max={920} style={{ paddingBlock: 56 }}>
        <CosMeta>HISTORY</CosMeta>
        <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 40, lineHeight: 1.1 }) }}>
          Eleven weeks, in your words.
        </div>

        <div style={{ marginTop: 36, display: 'grid', gap: 14 }}>
          {items.map((h, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '120px 1fr 200px',
              gap: 24, alignItems: 'center',
              padding: '22px 24px', borderRadius: 16,
              background: h.kind === 'review' ? COS.amberWash : COS.card,
              border: `1px solid ${h.kind === 'review' ? COS.amberSoft : COS.line}`,
            }}>
              <div>
                <CosMeta color={h.kind === 'review' ? COS.amberInk : COS.quiet}>{h.kind === 'review' ? 'WEEK ' + h.wk + ' REVIEW' : 'ENTRY'}</CosMeta>
                <div style={{ marginTop: 6, ...cosT('meta', { color: COS.hush }) }}>{h.date}</div>
              </div>
              <div style={cosT('readLead', { color: COS.ink, fontWeight: 400, fontStyle: h.kind === 'entry' ? 'italic' : 'normal' })}>
                {h.kind === 'entry' ? '“' + h.pull + '”' : h.pull}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {h.dots ? <CosWeekDots data={h.dots} size={8} gap={7} /> : <div style={cosT('meta', { color: COS.hush })}>read</div>}
              </div>
            </div>
          ))}
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 6 · Client web · Voice recording (desktop)
// ────────────────────────────────────────────────────────────
function ClientWebVoice() {
  const bars = [4, 7, 5, 9, 6, 11, 8, 13, 7, 10, 6, 9, 5, 8, 6, 11, 7, 9, 5, 8, 6, 10, 7, 12, 8, 9, 6, 8, 5, 7];
  return (
    <CwShell active="today">
      <CwContainer max={720} style={{ paddingBlock: 56 }}>
        <CosMeta>TUE · MAY 23 · CHECK-IN</CosMeta>
        <div style={{ marginTop: 10, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 38, lineHeight: 1.1 }) }}>
          Take your time.
        </div>

        <div style={{ marginTop: 56, display: 'grid', placeItems: 'center' }}>
          <CkBreathPulse size={220} listening />

          <div style={{ marginTop: 48, ...cosT('meta', { color: COS.quiet, fontVariantNumeric: 'tabular-nums' }) }}>00:42</div>

          {/* Waveform */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 4, height: 36 }}>
            {bars.map((b, i) => (
              <div key={i} style={{
                width: 3, height: `${b * 2.4}px`, borderRadius: 2,
                background: COS.amber, opacity: 0.85,
              }} />
            ))}
          </div>

          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
            <CosButton tone="neutral" size="md" leading={<CosIcon.Pause s={14} c={COS.ink2} />}>Pause</CosButton>
            <CosButton tone="accent" size="md" trailing={<CosIcon.Arrow s={14} c="#fff" />}>Finish</CosButton>
          </div>
        </div>
      </CwContainer>
    </CwShell>
  );
}

// ────────────────────────────────────────────────────────────
// 7 · Client web · Tablet width (768) · responsive proof
// ────────────────────────────────────────────────────────────
function ClientWebDashboardTablet() {
  return (
    <div style={{ width: 768, height: 1024, background: COS.paper, fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink, display: 'flex', flexDirection: 'column' }}>
      <CwTopNav active="today" compact />
      <div style={{ flex: 1, overflow: 'auto', padding: '36px 32px' }}>
        <div style={cosT('h2', { color: COS.quiet, fontWeight: 400 })}>Good morning,</div>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 38, lineHeight: 1.1 })}>Rohan.</div>

        <div style={{ marginTop: 28, display: 'grid', gap: 16 }}>
          <CwCard>
            <CosMeta>TODAY</CosMeta>
            <div style={{ marginTop: 10, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>
              One walk after dinner.
            </div>
            <div style={{ marginTop: 6, ...cosT('body', { color: COS.quiet }) }}>
              Twenty minutes is plenty. No phone if you can.
            </div>
            <div style={{ marginTop: 18 }}>
              <CosButton tone="accent" size="lg" leading={<CosIcon.Mic s={16} c="#fff" />}>Today's check-in</CosButton>
            </div>
          </CwCard>

          <CwCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CosMeta>THIS WEEK</CosMeta>
              <div style={cosT('meta', { color: COS.hush })}>5 of 7</div>
            </div>
            <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
              {[
                { name: 'Walk after dinner', data: [1,1,1,0,1,0,0] },
                { name: 'Protein at breakfast', data: [1,0,1,1,0,0,0] },
                { name: 'Lights down by 10', data: [1,1,1,1,1,0,0] },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={cosT('body2', { color: COS.ink })}>{h.name}</div>
                  <CosWeekDots data={h.data} today={4} size={8} gap={7} />
                </div>
              ))}
            </div>
          </CwCard>

          <CwCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }) }}>J</div>
              <CosMeta color={COS.amberInk}>NOTE FROM JOLENE · YESTERDAY</CosMeta>
            </div>
            <div style={{ marginTop: 14, ...cosT('readLead', { color: COS.ink }) }}>
              You mentioned the walk feeling like yours. Keep that.
            </div>
          </CwCard>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ClientWebDashboard, ClientWebCheckin, ClientWebReview, ClientWebPlan,
  ClientWebHistory, ClientWebVoice, ClientWebDashboardTablet,
  CwShell, CwTopNav, CwCard, CwContainer,
});
