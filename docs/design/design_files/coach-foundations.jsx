// Coach OS · Coach desktop. Client list + a quiet detail rail.
// 1280×800. Dense scanning, but not noisy.

function CoachDesktop() {
  const clients = [
    { name: 'Rohan Mehta', state: 'ACTIVE', weeks: 11, last: 'this morning', status: 'check-in to read', dots: [1,1,1,0,1,0,0], mode: 'STANDARD', active: true },
    { name: 'Priya Anand', state: 'ACTIVE', weeks: 7, last: 'yesterday', status: 'all caught up', dots: [1,1,1,1,1,0,0], mode: 'MINIMAL' },
    { name: 'Daniel Okonkwo', state: 'ACTIVE', weeks: 4, last: '2 days ago', status: 'weekly review due', dots: [1,1,0,1,0,0,0], mode: 'STANDARD' },
    { name: 'Mira Saito', state: 'ACTIVE', weeks: 16, last: 'this morning', status: 'plan ready to send', dots: [1,1,1,1,1,1,0], mode: 'DATA_HEAVY' },
    { name: 'Hannah Voss', state: 'INTAKE', weeks: 0, last: 'started Monday', status: 'intake at 70%', dots: null, mode: ' ' },
    { name: 'Lena Ferreira', state: 'INTAKE', weeks: 0, last: '4 days ago', status: 'intake paused', dots: null, mode: ' ' },
    { name: 'Theo Beaumont', state: 'ACTIVE', weeks: 22, last: '3 days ago', status: 'soft pause, ok', dots: [1,0,0,0,0,0,0], mode: 'MINIMAL' },
  ];

  return (
    <div style={{ width: 1280, height: 800, background: COS.paper, display: 'flex', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink, overflow: 'hidden' }}>
      {/* Left rail */}
      <div style={{ width: 220, padding: '24px 16px', borderRight: `1px solid ${COS.line}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '0 8px 18px' }}>
          <div style={{ ...cosT('h3', { color: COS.ink, fontWeight: 600 }) }}>Coach OS</div>
          <div style={cosT('meta', { color: COS.quiet })}>Jolene · practice</div>
        </div>
        {[
          { l: 'Today', n: '3' },
          { l: 'Clients', n: '7', active: true },
          { l: 'Intakes', n: '2' },
          { l: 'Reviews', n: '1' },
          { l: 'Library', n: '' },
        ].map((i, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: 8,
            background: i.active ? COS.sunk : 'transparent',
            color: i.active ? COS.ink : COS.ink2,
            ...cosT('body2', { fontWeight: i.active ? 600 : 400 }),
          }}>
            <span>{i.l}</span>
            <span style={cosT('meta', { color: i.active ? COS.ink2 : COS.hush })}>{i.n}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${COS.line}` }}>
          <div style={cosT('meta', { color: COS.quiet })}>JOLENE</div>
          <div style={{ marginTop: 2, ...cosT('body2', { color: COS.ink }) }}>Practicing coach</div>
        </div>
      </div>

      {/* List column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${COS.line}` }}>
        <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Clients</div>
            <div style={{ marginTop: 4, ...cosT('body2', { color: COS.quiet }) }}>7 active relationships · 3 need you this morning</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CosButton tone="neutral" size="sm">All</CosButton>
            <CosButton tone="neutral" size="sm" style={{ background: COS.sunk }}>Needs you · 3</CosButton>
            <CosButton tone="neutral" size="sm">Intake</CosButton>
          </div>
        </div>

        {/* Column header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 1.5fr 1.4fr 0.6fr', padding: '8px 32px', borderTop: `1px solid ${COS.line}`, borderBottom: `1px solid ${COS.line}`, background: COS.sunk + '40' }}>
          {['CLIENT','WEEK','LAST CHECK-IN','THIS WEEK','MODE'].map(h => (
            <div key={h} style={cosT('micro', { color: COS.hush })}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {clients.map((c, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 1.5fr 1.4fr 0.6fr',
              alignItems: 'center', padding: '14px 32px',
              borderBottom: `1px solid ${COS.line}`,
              background: c.active ? COS.sunk + '80' : 'transparent',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: COS.sunk, color: COS.ink2,
                  display: 'grid', placeItems: 'center',
                  ...cosT('body2', { fontWeight: 600 }),
                }}>{c.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                <div>
                  <div style={cosT('body', { color: COS.ink, fontWeight: c.active ? 600 : 500 })}>{c.name}</div>
                  <div style={cosT('meta', { color: c.state === 'INTAKE' ? COS.amberInk : COS.quiet })}>{c.state === 'INTAKE' ? 'In intake' : c.status}</div>
                </div>
              </div>
              <div style={cosT('body2', { color: COS.ink2 })}>{c.weeks ? `wk ${c.weeks}` : <span style={{ color: COS.hush }}> </span>}</div>
              <div style={cosT('body2', { color: COS.ink2 })}>{c.last}</div>
              <div>
                {c.dots
                  ? <CosWeekDots data={c.dots} size={8} gap={6} />
                  : <div style={{ width: 90, height: 3, background: COS.sunk, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: '70%', height: '100%', background: COS.amber }} />
                    </div>}
              </div>
              <div style={cosT('meta', { color: COS.quiet })}>{c.mode}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right rail · selected client detail */}
      <div style={{ width: 380, background: COS.card, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${COS.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('body', { fontWeight: 600 }) }}>RM</div>
            <div style={{ flex: 1 }}>
              <div style={cosT('h3', { color: COS.ink })}>Rohan Mehta</div>
              <div style={cosT('meta', { color: COS.quiet })}>Week 11 · STANDARD dashboard</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COS.line}` }}>
          <CosMeta>THIS MORNING</CosMeta>
          <div style={{ marginTop: 10, padding: 14, borderRadius: 12, background: COS.amberWash, border: `1px solid ${COS.amberSoft}` }}>
            <div style={cosT('meta', { color: COS.amberInk })}>VOICE · 1:14</div>
            <div style={{ marginTop: 8, ...cosT('body2', { color: COS.ink, lineHeight: 1.55, fontStyle: 'italic' }) }}>
              “Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that's mine. I think the morning protein is the one I keep forgetting.”
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <CosButton tone="neutral" size="sm" style={{ flex: 1 }}>Reply</CosButton>
            <CosButton tone="accent" size="sm" style={{ flex: 1 }}>Add to review</CosButton>
          </div>
        </div>

        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COS.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <CosMeta>WEEK 11</CosMeta>
            <div style={cosT('meta', { color: COS.hush })}>5 of 7</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              { name: 'Walk after dinner', data: [1,1,1,0,1,0,0] },
              { name: 'Protein at breakfast', data: [1,0,1,1,0,0,0] },
              { name: 'Lights down by 10', data: [1,1,1,1,1,0,0] },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={cosT('body2', { color: COS.ink })}>{h.name}</div>
                <CosWeekDots data={h.data} size={7} gap={6} today={4} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px', flex: 1 }}>
          <CosMeta>UP NEXT</CosMeta>
          <div style={{ marginTop: 10, ...cosT('body2', { color: COS.ink }) }}>
            Friday review draft
          </div>
          <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>AI synthesis ready · awaits your approval</div>

          <div style={{ marginTop: 14 }}>
            <CosButton tone="accent" size="md" trailing={<CosIcon.Arrow s={14} c="#fff" />}>Open draft</CosButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// FOUNDATIONS · token + type spec, presented as a paper doc.
// 720 wide.
// ────────────────────────────────────────────────────────────
function FoundationsDoc() {
  const swatches = [
    { name: 'paper', v: COS.paper, hex: '#fbfaf7' },
    { name: 'card', v: COS.card, hex: '#ffffff' },
    { name: 'sunk', v: COS.sunk, hex: '#f5f4f0' },
    { name: 'line', v: COS.line, hex: '#e7e5e4' },
    { name: 'ink', v: COS.ink, hex: '#1c1917' },
    { name: 'ink-2', v: COS.ink2, hex: '#44403c' },
    { name: 'quiet', v: COS.quiet, hex: '#78716c' },
    { name: 'hush', v: COS.hush, hex: '#a8a29e' },
    { name: 'amber', v: COS.amber, hex: '#d97706' },
    { name: 'amber-soft', v: COS.amberSoft, hex: '#fef3c7' },
  ];

  const typeRows = [
    { k: 'display', label: 'Display · 32 / 500 · -0.02em' },
    { k: 'h1', label: 'Heading 1 · 24 / 500 · -0.02em' },
    { k: 'h2', label: 'Heading 2 · 19 / 500 · -0.01em' },
    { k: 'h3', label: 'Heading 3 · 16 / 600' },
    { k: 'body', label: 'Body · 15 / 400 · 1.55' },
    { k: 'body2', label: 'Body sm · 14 / 400' },
    { k: 'meta', label: 'Meta · 12 / 500' },
    { k: 'micro', label: 'Micro · 11 / 500 · uppercase 0.08em' },
  ];

  return (
    <div style={{ width: 720, padding: '36px 40px', background: COS.card, fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink, boxSizing: 'border-box' }}>
      <CosMeta>COACH OS · DESIGN TOKENS</CosMeta>
      <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500 }) }}>The system, on one page.</div>
      <div style={{ marginTop: 8, ...cosT('body', { color: COS.quiet, maxWidth: 520 }) }}>
        Warm neutral surfaces. Inter, all weights. Amber for action and noticing, never for celebration. Adherence in shape, not color. Coach voice has its own paper.
      </div>

      <CosRule style={{ marginTop: 28 }} />

      <div style={{ marginTop: 24 }}>
        <CosMeta>SURFACES &amp; INK</CosMeta>
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {swatches.map(s => (
            <div key={s.name}>
              <div style={{ height: 64, borderRadius: 10, background: s.v, border: `1px solid ${COS.line}` }} />
              <div style={{ marginTop: 8, ...cosT('body2', { color: COS.ink }) }}>{s.name}</div>
              <div style={cosT('meta', { color: COS.quiet, fontFamily: 'ui-monospace, Menlo, monospace' })}>{s.hex}</div>
            </div>
          ))}
        </div>
      </div>

      <CosRule style={{ marginTop: 28 }} />

      <div style={{ marginTop: 24 }}>
        <CosMeta>TYPE · INTER</CosMeta>
        <div style={{ marginTop: 14, display: 'grid', gap: 14 }}>
          {typeRows.map(r => (
            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '1fr 220px', alignItems: 'baseline', gap: 24, paddingBottom: 12, borderBottom: `1px solid ${COS.line}` }}>
              <div style={cosT(r.k, { color: COS.ink })}>Tell us about today.</div>
              <div style={cosT('meta', { color: COS.quiet, fontFamily: 'ui-monospace, Menlo, monospace' })}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      <CosRule style={{ marginTop: 28 }} />

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <CosMeta>ADHERENCE</CosMeta>
          <div style={{ marginTop: 12, ...cosT('body2', { color: COS.quiet }) }}>
            Filled = present. Hollow = absent. No color shift, no traffic light, no failure state.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} size={10} gap={9} />
            <div style={cosT('meta', { color: COS.hush })}>· 4 of 7</div>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
            <CosWeekDots data={[1,0,0,0,0,0,0]} size={10} gap={9} />
            <div style={cosT('meta', { color: COS.hush })}>· 1 of 7 · same shape, no alarm</div>
          </div>
        </div>
        <div>
          <CosMeta>VOICE METAPHOR</CosMeta>
          <div style={{ marginTop: 12, ...cosT('body2', { color: COS.quiet }) }}>
            Slow breathing pulse. 4-second loop. Reduced motion stills the pulse, keeps the shape.
          </div>
          <div style={{ marginTop: 12, display: 'grid', placeItems: 'center' }}>
            <CkBreathPulse size={120} />
          </div>
        </div>
      </div>

      <CosRule style={{ marginTop: 28 }} />

      <div style={{ marginTop: 24 }}>
        <CosMeta>MOTION</CosMeta>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { t: 'Fade', d: '160ms ease-out · used for surfacing' },
            { t: 'Lift', d: '180ms ease-out · ≤ 4px translate' },
            { t: 'Pulse', d: '4s ease-in-out · breath only' },
          ].map((m, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, background: COS.sunk, border: `1px solid ${COS.line}` }}>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>{m.t}</div>
              <div style={{ marginTop: 4, ...cosT('meta', { color: COS.quiet }) }}>{m.d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, ...cosT('meta', { color: COS.hush }) }}>
          Reduced motion is respected globally. No bounces, no springs, no parallax.
        </div>
      </div>

      <CosRule style={{ marginTop: 28 }} />

      <div style={{ marginTop: 24 }}>
        <CosMeta>COPY RULES</CosMeta>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Yes</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, ...cosT('body2', { color: COS.ink2 }) }}>
              <li>Tell us about today.</li>
              <li>5 of 7 days with movement.</li>
              <li>Plan ready to send.</li>
              <li>Speak or write. No right answer.</li>
            </ul>
          </div>
          <div>
            <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>No</div>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, ...cosT('body2', { color: COS.ink2 }) }}>
              <li>Did you complete your habits?</li>
              <li>2 missed days. Streak broken.</li>
              <li>Level up! 7 days strong.</li>
              <li>No em dashes, anywhere.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CoachDesktop, FoundationsDoc });
