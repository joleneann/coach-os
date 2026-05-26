// Coach OS · Voice recorder states.
// Idle → Listening (breathing pulse) → Transcribing → Composed.
// All states keep one shape language. Reduced-motion friendly.

function VRFrame({ children, height = 600 }) {
  return (
    <div style={{
      width: 390, height, background: COS.paper, position: 'relative', overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink,
      padding: '24px 24px 28px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>
      {children}
    </div>
  );
}

// State 1 · Idle. Same as the Warm check-in centerpiece.
function VoiceIdle() {
  return (
    <VRFrame>
      <div style={cosT('micro', { color: COS.quiet })}>STATE · IDLE</div>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <CkBreathPulse size={172} />
          <div style={{ marginTop: 24, ...cosT('body', { color: COS.ink2 }) }}>Tap to begin</div>
          <div style={{ marginTop: 4, ...cosT('meta', { color: COS.hush }) }}>or hold for hands-free</div>
        </div>
      </div>
    </VRFrame>
  );
}

// State 2 · Listening. Slightly expanded pulse, soft waveform underneath
// (low amplitude, NOT a stadium visualizer), elapsed time, stop button.
function VoiceListening() {
  // pseudo-amplitudes
  const bars = [3, 6, 4, 9, 12, 8, 14, 18, 11, 15, 20, 16, 12, 9, 7, 11, 14, 10, 6, 4, 6, 9, 12, 8, 5];
  return (
    <VRFrame>
      <div style={cosT('micro', { color: COS.amberInk })}>STATE · LISTENING</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ position: 'relative', width: 200, height: 200, display: 'grid', placeItems: 'center' }}>
          {/* outer halo */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `radial-gradient(circle, ${COS.amberSoft} 0%, ${COS.amberSoft}00 65%)`,
            animation: 'ckBreathHalo 3.4s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 142, height: 142, borderRadius: '50%',
            background: COS.amberSoft,
            animation: 'ckBreathMid 3.4s ease-in-out infinite',
          }} />
          <div style={{
            width: 78, height: 78, borderRadius: '50%', background: COS.amber,
            animation: 'ckBreathCore 3.4s ease-in-out infinite',
            display: 'grid', placeItems: 'center', color: '#fff',
            boxShadow: '0 6px 22px ' + COS.amber + '50',
          }}>
            <CosIcon.Pause s={22} c="#fff" />
          </div>
        </div>

        {/* Soft waveform · thin, low amplitude, no axis */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
          {bars.map((b, i) => (
            <div key={i} style={{
              width: 2, height: b, borderRadius: 2,
              background: COS.ink2, opacity: 0.35 + (b / 30),
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <div style={cosT('h2', { color: COS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' })}>0:42</div>
          <div style={cosT('meta', { color: COS.hush })}>of 3:00 cap</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CosButton tone="quiet" size="sm">Cancel</CosButton>
        <CosButton tone="accent" size="md">Done</CosButton>
      </div>
    </VRFrame>
  );
}

// State 3 · Transcribing. The pulse stills. A thinking-typing rhythm
// replaces it. Words appear in soft amber as if being placed.
function VoiceTranscribing() {
  return (
    <VRFrame>
      <div style={cosT('micro', { color: COS.quiet })}>STATE · TRANSCRIBING</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* three breathing dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%', background: COS.amber,
              animation: `ckDot 1.2s ease-in-out ${i*0.15}s infinite`,
            }} />
          ))}
        </div>
        <div style={{
          ...cosT('body', { color: COS.ink, lineHeight: 1.6 }),
          padding: '0 4px',
        }}>
          Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that's mine.
          <span style={{ color: COS.hush }}> I think the morning protein is</span>
          <span style={{ color: COS.amber, animation: 'ckCaret 1s steps(1) infinite' }}>▍</span>
        </div>
        <div style={{ marginTop: 18, ...cosT('meta', { color: COS.hush }) }}>
          Placing what we heard. Edit anything that doesn't sound like you.
        </div>
      </div>
    </VRFrame>
  );
}

// State 4 · Composed. Final transcript with light affordances to edit,
// retry, or add a note. Coach gets it after submit. No score, no badge.
function VoiceComposed() {
  return (
    <VRFrame>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={cosT('micro', { color: COS.quiet })}>STATE · COMPOSED · 1:14</div>
        <div style={cosT('micro', { color: COS.hush })}>READY TO SEND</div>
      </div>

      <div style={{
        marginTop: 18, padding: 18, borderRadius: 14,
        background: COS.card, border: `1px solid ${COS.line}`,
        flex: 1, display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ ...cosT('body', { color: COS.ink, lineHeight: 1.65 }), flex: 1 }}>
          Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that's mine.
          I think the morning protein is the one I keep forgetting. Energy was steady, no afternoon dip today.
        </div>
        <div style={{
          marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COS.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', color: COS.ink2, ...cosT('meta'), display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <CosIcon.Edit s={13} c={COS.ink2} /> Edit
            </button>
            <button style={{ background: 'none', border: 'none', color: COS.ink2, ...cosT('meta'), display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <CosIcon.Mic s={13} c={COS.ink2} /> Re-record
            </button>
          </div>
          <div style={cosT('meta', { color: COS.hush })}>52 words</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <CosButton tone="neutral" size="md" style={{ flex: 1 }}>Save as draft</CosButton>
        <CosButton tone="accent" size="md" style={{ flex: 2 }} trailing={<CosIcon.Arrow s={14} c="#fff" />}>Send to Jolene</CosButton>
      </div>
    </VRFrame>
  );
}

Object.assign(window, { VoiceIdle, VoiceListening, VoiceTranscribing, VoiceComposed });
