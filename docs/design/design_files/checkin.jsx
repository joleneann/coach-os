// Coach OS · Daily check-in. Three tonal variants of the same surface.
// Phone-first, 390×844. Voice is primary, writing is equal.

// Shared bits ────────────────────────────────────────────────
function CkPhoneShell({ children, bg = COS.paper, statusDark = false }) {
  return (
    <div style={{ width: 390, height: 844, background: bg, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar dark={statusDark} time="7:14" />
      {children}
    </div>
  );
}

// Bottom nav, consistent across variants
function CkTabBar({ active = 'today', tone = 'warm' }) {
  const items = [
    { id: 'today', label: 'Today' },
    { id: 'plan', label: 'Plan' },
    { id: 'week', label: 'Week' },
    { id: 'me', label: 'Me' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 12,
      background: tone === 'editorial' ? 'transparent' : 'linear-gradient(to top, ' + COS.paper + ' 60%, ' + COS.paper + '00)',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {items.map(i => (
        <div key={i.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: active === i.id ? COS.ink : COS.hush,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: active === i.id ? COS.ink : 'transparent' }} />
          <div style={cosT('meta', { fontWeight: active === i.id ? 600 : 500 })}>{i.label}</div>
        </div>
      ))}
    </div>
  );
}

// Slow breathing pulse · the voice metaphor.
// Single soft shape, ~4s loop, halo softens with a second longer loop.
function CkBreathPulse({ size = 168, color = COS.amber, soft = COS.amberSoft, listening = false }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      {/* outer breath ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${soft} 0%, ${soft}00 70%)`,
        animation: 'ckBreathHalo 4.2s ease-in-out infinite',
      }} />
      {/* mid ring */}
      <div style={{
        position: 'absolute', width: size * 0.62, height: size * 0.62, borderRadius: '50%',
        background: soft,
        animation: 'ckBreathMid 4s ease-in-out infinite',
      }} />
      {/* core */}
      <div style={{
        width: size * 0.34, height: size * 0.34, borderRadius: '50%', background: color,
        animation: 'ckBreathCore 4s ease-in-out infinite',
        display: 'grid', placeItems: 'center', color: '#fff',
        boxShadow: '0 4px 18px ' + color + '40',
      }}>
        <CosIcon.Mic s={22} c="#fff" />
      </div>
      {listening && (
        <div style={{ position: 'absolute', bottom: -28, ...cosT('meta', { color: COS.quiet }) }}>listening</div>
      )}
    </div>
  );
}

// Past day card · a quoted first line, no scoring
function CkPastDay({ day, snippet, dotsBefore = 3, dotsAfter = 1, tone = 'warm' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 0',
      borderBottom: `1px solid ${COS.line}`,
    }}>
      <div style={{ width: 44, flexShrink: 0, paddingTop: 2 }}>
        <div style={cosT('micro', { color: COS.hush })}>{day.toUpperCase()}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          ...cosT('body2', { color: COS.ink2 }),
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {snippet}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Variant A · Warm (the lead direction)
// Big breathing pulse, generous space, voice is the gravity well.
// ────────────────────────────────────────────────────────────
function CheckinWarm() {
  return (
    <CkPhoneShell>
      {/* Header */}
      <div style={{ padding: '8px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={cosT('micro', { color: COS.quiet })}>TUE · MAY 23</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} />
          </div>
        </div>
      </div>

      {/* Composed question */}
      <div style={{ padding: '32px 28px 0' }}>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500 })}>
          Tell us<br/>about today.
        </div>
        <div style={{ marginTop: 12, ...cosT('body', { color: COS.quiet }) }}>
          Voice, writing, or both. Whatever lands.
        </div>
      </div>

      {/* Pulse */}
      <div style={{ display: 'grid', placeItems: 'center', marginTop: 56 }}>
        <CkBreathPulse size={184} />
        <div style={{ marginTop: 28, ...cosT('body2', { color: COS.ink2 }) }}>Tap to begin</div>
        <div style={{ marginTop: 4, ...cosT('meta', { color: COS.hush }) }}>or hold for hands-free</div>
      </div>

      {/* Alternative: write */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 124, display: 'grid', placeItems: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 999,
          background: COS.card, border: `1px solid ${COS.line}`,
          ...cosT('body2', { color: COS.ink2, fontWeight: 500 }),
        }}>
          <CosIcon.Edit s={15} c={COS.ink2} />
          Write instead
        </div>
      </div>

      <CkTabBar />
    </CkPhoneShell>
  );
}

// ────────────────────────────────────────────────────────────
// Variant B · Austere
// Type-led, denser, structural. Mic is a quiet button, not a centerpiece.
// ────────────────────────────────────────────────────────────
function CheckinAustere() {
  return (
    <CkPhoneShell bg={COS.paper}>
      <div style={{ padding: '8px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={cosT('h3', { color: COS.ink })}>Today</div>
          <div style={cosT('micro', { color: COS.hush })}>TUE · MAY 23</div>
        </div>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <CosRule />
      </div>

      {/* Prompt block */}
      <div style={{ padding: '20px 24px 0' }}>
        <CosMeta>PROMPT</CosMeta>
        <div style={{ marginTop: 8, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>
          What stood out today?
        </div>
        <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet }) }}>
          Not what you did. What you noticed.
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          background: COS.card, border: `1px solid ${COS.line}`, borderRadius: 14,
          padding: 16, minHeight: 200,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ flex: 1, ...cosT('body', { color: COS.hush }) }}>
            Start writing, or hold the mic to speak.
          </div>
          <div style={{
            marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COS.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={cosT('meta', { color: COS.hush })}>0 words</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 999, border: `1px solid ${COS.line}`,
                display: 'grid', placeItems: 'center', color: COS.ink2,
              }}><CosIcon.Mic s={16} c={COS.ink2} /></div>
              <div style={{
                width: 36, height: 36, borderRadius: 999, background: COS.ink,
                display: 'grid', placeItems: 'center',
              }}><CosIcon.Arrow s={16} c="#fff" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's planned habits · neutral list */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <CosMeta>TODAY'S HABITS</CosMeta>
          <div style={cosT('meta', { color: COS.hush })}>3 in plan</div>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {[
            { t: 'Walk after dinner', d: '20 minutes' },
            { t: 'Protein at breakfast', d: '25g target' },
            { t: 'Lights down by 10', d: 'wind-down' },
          ].map((h, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: i < 2 ? `1px solid ${COS.line}` : 'none',
            }}>
              <div>
                <div style={cosT('body', { color: COS.ink })}>{h.t}</div>
                <div style={cosT('meta', { color: COS.hush, marginTop: 2 })}>{h.d}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.25px solid ${COS.lineStrong}` }} />
            </div>
          ))}
        </div>
      </div>

      <CkTabBar tone="austere" />
    </CkPhoneShell>
  );
}

// ────────────────────────────────────────────────────────────
// Variant C · Editorial
// Type-led, calm, lots of air. Past days as quoted entries.
// ────────────────────────────────────────────────────────────
function CheckinEditorial() {
  return (
    <CkPhoneShell bg={COS.paper}>
      <div style={{ padding: '4px 28px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={cosT('micro', { color: COS.quiet })}>23 MAY · TUESDAY</div>
          <div style={cosT('micro', { color: COS.hush })}>WEEK 11 WITH JOLENE</div>
        </div>
      </div>

      <div style={{ padding: '36px 28px 0' }}>
        <div style={{ ...cosT('display', { color: COS.ink, fontSize: 36, lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.025em' }) }}>
          A few sentences,<br/>
          <span style={{ color: COS.quiet }}>when you're ready.</span>
        </div>
      </div>

      {/* Voice as a quiet equal */}
      <div style={{ margin: '32px 28px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: COS.card, border: `1px solid ${COS.line}`,
          display: 'grid', placeItems: 'center', color: COS.amber,
          boxShadow: '0 0 0 6px ' + COS.amberSoft + '60',
        }}>
          <CosIcon.Mic s={20} c={COS.amber} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={cosT('body', { color: COS.ink, fontWeight: 500 })}>Speak it</div>
          <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>Up to three minutes. I'll transcribe.</div>
        </div>
      </div>

      <div style={{ margin: '14px 28px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: COS.card, border: `1px solid ${COS.line}`,
          display: 'grid', placeItems: 'center', color: COS.ink2,
        }}>
          <CosIcon.Edit s={18} c={COS.ink2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={cosT('body', { color: COS.ink, fontWeight: 500 })}>Write it</div>
          <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>The page won't judge.</div>
        </div>
      </div>

      {/* This week so far · quiet seven dots and a quoted yesterday */}
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 120 }}>
        <CosRule />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <CosMeta>YESTERDAY, IN YOUR WORDS</CosMeta>
            <div style={{
              marginTop: 8,
              ...cosT('body', { color: COS.ink2, fontStyle: 'italic', lineHeight: 1.5 }),
            }}>
              “Slept ok. The walk after dinner is starting to feel like the part of the day that's mine.”
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CosMeta>THIS WEEK</CosMeta>
          <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} />
        </div>
      </div>

      <CkTabBar tone="editorial" />
    </CkPhoneShell>
  );
}

Object.assign(window, { CheckinWarm, CheckinAustere, CheckinEditorial, CkBreathPulse, CkPhoneShell, CkPastDay, CkTabBar });
