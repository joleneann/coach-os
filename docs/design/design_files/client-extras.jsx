// Coach OS · Client extras: empty state, loading skeletons, reply thread,
// history archive, settings. All mobile 390×844.

// ────────────────────────────────────────────────────────────
// EMPTY · FIRST DASHBOARD (no check-ins, no plan yet)
// An invitation, not "No data".
// ────────────────────────────────────────────────────────────
function ClientEmptyDashboard() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '4px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={cosT('micro', { color: COS.hush })}>TUE · MAY 23</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }) }}>R</div>
      </div>

      <div style={{ padding: '20px 24px 0' }}>
        <div style={cosT('h2', { color: COS.quiet, fontWeight: 400 })}>Welcome, Rohan.</div>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500 })}>Day one.</div>
      </div>

      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ padding: 20, borderRadius: 16, background: COS.amberWash, border: `1px solid ${COS.amberSoft}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('body2', { fontWeight: 600 }) }}>J</div>
            <CosMeta style={{ color: COS.amberInk }}>NOTE FROM JOLENE</CosMeta>
          </div>
          <div style={{ marginTop: 12, ...cosT('body', { color: COS.ink, lineHeight: 1.55 }) }}>
            Your plan goes out Friday. Until then, there's nothing to track. If you want to tell me how this week feels, I'll read it.
          </div>
        </div>
      </div>

      <div style={{ padding: '36px 24px 0', display: 'grid', placeItems: 'center' }}>
        <CkBreathPulse size={140} />
        <div style={{ marginTop: 18, ...cosT('h3', { color: COS.ink, fontWeight: 500 }) }}>Say something, if you want</div>
        <div style={{ marginTop: 4, ...cosT('body2', { color: COS.quiet }) }}>or write a few sentences</div>
      </div>

      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 110 }}>
        <div style={cosT('meta', { color: COS.hush, textAlign: 'center', marginBottom: 12 })}>
          This week
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14 }}>
          <CosWeekDots data={[0,0,0,0,0,0,0]} today={4} size={10} gap={10} />
        </div>
        <div style={cosT('meta', { color: COS.hush, textAlign: 'center', marginTop: 8 })}>
          Empty by design.
        </div>
      </div>

      <CkTabBar active="me" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// LOADING · SKELETON
// Matches the eventual STANDARD dashboard layout. No spinner.
// ────────────────────────────────────────────────────────────
function ClientSkeleton() {
  const sk = { background: 'linear-gradient(90deg, ' + COS.sunk + ' 0%, ' + COS.sunk2 + ' 50%, ' + COS.sunk + ' 100%)', backgroundSize: '200% 100%', animation: 'ckSkel 1.6s ease-in-out infinite' };
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '4px 24px 8px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 60, height: 11, borderRadius: 3, ...sk }} />
        <div style={{ width: 32, height: 32, borderRadius: '50%', ...sk }} />
      </div>

      <div style={{ padding: '16px 24px 0' }}>
        <div style={{ width: 160, height: 26, borderRadius: 6, ...sk }} />
        <div style={{ marginTop: 8, width: 240, height: 14, borderRadius: 4, ...sk }} />
      </div>

      <div style={{ padding: '22px 24px 0' }}>
        <div style={{ padding: 18, borderRadius: 16, border: `1px solid ${COS.line}`, background: COS.card }}>
          <div style={{ width: 130, height: 11, borderRadius: 3, ...sk }} />
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 150, height: 12, borderRadius: 3, ...sk }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0,1,2,3,4,5,6].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', ...sk }} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ padding: 18, borderRadius: 16, border: `1px solid ${COS.line}`, background: COS.card }}>
          <div style={{ width: 130, height: 11, borderRadius: 3, ...sk }} />
          <div style={{ marginTop: 10, width: 220, height: 18, borderRadius: 4, ...sk }} />
          <div style={{ marginTop: 14, width: '100%', height: 64, borderRadius: 6, ...sk }} />
        </div>
      </div>

      <div style={{ padding: '14px 24px 0' }}>
        <div style={{ padding: 18, borderRadius: 16, border: `1px solid ${COS.line}`, background: COS.card }}>
          <div style={{ width: 80, height: 11, borderRadius: 3, ...sk }} />
          <div style={{ marginTop: 10, width: '94%', height: 12, borderRadius: 3, ...sk }} />
          <div style={{ marginTop: 6, width: '70%', height: 12, borderRadius: 3, ...sk }} />
        </div>
      </div>

      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 110 }}>
        <div style={{ width: '100%', height: 48, borderRadius: 999, ...sk }} />
      </div>

      <CkTabBar active="me" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// REPLY THREAD
// Coach replies attach to a specific check-in or review.
// Threaded, but reads as a quiet exchange · not chat.
// ────────────────────────────────────────────────────────────
function ClientReplyThread() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>REPLIES · TUESDAY'S CHECK-IN</div>
        <div style={{ width: 20 }} />
      </div>

      <div style={{ padding: '8px 24px 12px', borderBottom: `1px solid ${COS.line}` }}>
        <CosMeta>YOUR ENTRY · 7:14AM</CosMeta>
        <div style={{ marginTop: 8, ...cosT('body2', { color: COS.ink2, fontStyle: 'italic', lineHeight: 1.55 }) }}>
          “Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that's mine.”
        </div>
      </div>

      <div style={{ padding: '12px 24px 110px', overflow: 'auto', height: 'calc(100% - 280px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Jolene */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }), flexShrink: 0 }}>J</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Jolene</div>
              <div style={cosT('meta', { color: COS.hush })}>10:12am</div>
            </div>
            <div style={{
              marginTop: 6, padding: 14, borderRadius: 14,
              background: COS.amberWash, border: `1px solid ${COS.amberSoft}`,
              ...cosT('body2', { color: COS.ink, lineHeight: 1.55 }),
            }}>
              I loved reading this. The phrase “part of the day that's mine” is the one I'd keep coming back to. We'll talk Friday.
            </div>
          </div>
        </div>

        {/* Rohan */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end' }}>
              <div style={cosT('meta', { color: COS.hush })}>10:34am</div>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>You</div>
            </div>
            <div style={{
              marginTop: 6, padding: 14, borderRadius: 14,
              background: COS.card, border: `1px solid ${COS.line}`,
              ...cosT('body2', { color: COS.ink, lineHeight: 1.55 }),
            }}>
              Thanks. I think it's the no-phone part that did it. Asking my partner to keep hers down too, which is harder.
            </div>
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }), flexShrink: 0 }}>R</div>
        </div>

        {/* Jolene short */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }), flexShrink: 0 }}>J</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 600 })}>Jolene</div>
              <div style={cosT('meta', { color: COS.hush })}>11:02am</div>
            </div>
            <div style={{
              marginTop: 6, padding: 14, borderRadius: 14,
              background: COS.amberWash, border: `1px solid ${COS.amberSoft}`,
              ...cosT('body2', { color: COS.ink, lineHeight: 1.55 }),
            }}>
              Noted. Don't make a project of it.
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: COS.paper, borderTop: `1px solid ${COS.line}`, padding: '12px 16px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: COS.amberSoft, color: COS.amber, display: 'grid', placeItems: 'center' }}>
            <CosIcon.Mic s={16} c={COS.amber} />
          </div>
          <div style={{ flex: 1, padding: '10px 14px', borderRadius: 999, background: COS.card, border: `1px solid ${COS.line}`, ...cosT('body2', { color: COS.hush }) }}>
            Reply to Jolene
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: COS.ink, color: '#fff', display: 'grid', placeItems: 'center' }}>
            <CosIcon.Arrow s={14} c="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// HISTORY ARCHIVE
// Past reviews and check-ins as a readable archive, organized by week.
// Reads as a journal, not a log.
// ────────────────────────────────────────────────────────────
function ClientHistory() {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>HISTORY</div>
        <CosIcon.Cal s={18} c={COS.quiet} />
      </div>

      <div style={{ padding: '4px 28px 0' }}>
        <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Your weeks</div>
        <div style={{ marginTop: 4, ...cosT('body2', { color: COS.quiet }) }}>11 weeks · 47 entries · 10 reviews</div>
      </div>

      <div style={{ padding: '20px 24px 110px', overflow: 'auto', height: 'calc(100% - 200px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { wk: 10, dots: [1,1,1,0,1,1,0], pull: 'The walk is becoming yours.', kind: 'review', date: 'May 13 – 19' },
          { wk: 10, dots: null, pull: 'Long one. The walk got me through a hard afternoon with my mom.', kind: 'entry', date: 'Sat May 18' },
          { wk: 10, dots: null, pull: 'Quiet weekend. Cooked, read. Skipped the walk on purpose.', kind: 'entry', date: 'Sun May 19' },
          { wk: 9, dots: [1,1,0,1,1,1,1], pull: 'Steadier. We can come back to the protein piece.', kind: 'review', date: 'May 6 – 12' },
          { wk: 9, dots: null, pull: 'Slept badly Thursday. Didn\'t walk Friday. Both feel fine.', kind: 'entry', date: 'Sat May 11' },
          { wk: 8, dots: [1,0,1,1,0,1,0], pull: 'You\'re building something quiet.', kind: 'review', date: 'Apr 29 – May 5' },
        ].map((h, i) => (
          <div key={i} style={{
            padding: 14, borderRadius: 12,
            background: h.kind === 'review' ? COS.amberWash : COS.card,
            border: `1px solid ${h.kind === 'review' ? COS.amberSoft : COS.line}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CosMeta style={{ color: h.kind === 'review' ? COS.amberInk : COS.quiet }}>
                {h.kind === 'review' ? `WEEK ${h.wk} · REVIEW` : `WEEK ${h.wk} · ENTRY`}
              </CosMeta>
              <div style={cosT('meta', { color: COS.hush })}>{h.date}</div>
            </div>
            <div style={{ marginTop: 8, ...cosT('body', { color: COS.ink, lineHeight: 1.5, fontStyle: h.kind === 'entry' ? 'italic' : 'normal', fontWeight: h.kind === 'review' ? 500 : 400 }) }}>
              {h.kind === 'entry' ? `“${h.pull}”` : h.pull}
            </div>
            {h.dots && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <CosWeekDots data={h.dots} size={8} gap={7} />
                <div style={cosT('meta', { color: COS.hush })}>{h.dots.filter(Boolean).length} of 7</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <CkTabBar active="week" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// SETTINGS · quiet, no flair.
// ────────────────────────────────────────────────────────────
function ClientSettings() {
  const groups = [
    { l: 'PROFILE', rows: [
      { t: 'Rohan Mehta', d: 'rohan@test.dev' },
      { t: 'Coach', d: 'Jolene Saito' },
      { t: 'Week 11', d: 'Started March 9' },
    ]},
    { l: 'CHECK-INS', rows: [
      { t: 'Reminder time', d: '7:00am', tail: 'change' },
      { t: 'Voice as default', d: 'on', toggle: true },
      { t: 'Transcript review', d: 'edit before sending', toggle: true },
    ]},
    { l: 'NOTIFICATIONS', rows: [
      { t: 'When Jolene replies', d: 'on', toggle: true },
      { t: 'Friday review is ready', d: 'on', toggle: true },
      { t: 'Daily nudges', d: 'off · by design', toggle: false },
    ]},
    { l: 'PRIVACY', rows: [
      { t: 'Who can see my entries', d: 'only Jolene' },
      { t: 'Export everything', d: 'as a PDF or JSON', tail: 'open' },
      { t: 'Delete my account', d: 'we\'ll keep nothing', tail: 'open' },
    ]},
  ];
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="9:02" />

      <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <CosIcon.Back s={20} c={COS.ink} />
        <div style={cosT('meta', { color: COS.quiet, fontWeight: 600 })}>SETTINGS</div>
        <div style={{ width: 20 }} />
      </div>

      <div style={{ padding: '4px 28px 0' }}>
        <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Your account</div>
      </div>

      <div style={{ padding: '20px 24px 110px', overflow: 'auto', height: 'calc(100% - 180px)' }}>
        {groups.map((g, gi) => (
          <div key={gi} style={{ marginTop: gi === 0 ? 0 : 24 }}>
            <CosMeta>{g.l}</CosMeta>
            <div style={{ marginTop: 8, background: COS.card, border: `1px solid ${COS.line}`, borderRadius: 14, overflow: 'hidden' }}>
              {g.rows.map((r, ri) => (
                <div key={ri} style={{
                  padding: '14px 16px',
                  borderBottom: ri < g.rows.length - 1 ? `1px solid ${COS.line}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={cosT('body', { color: COS.ink })}>{r.t}</div>
                    <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>{r.d}</div>
                  </div>
                  {r.toggle != null ? (
                    <div style={{
                      width: 38, height: 22, borderRadius: 999,
                      background: r.toggle ? COS.ink : COS.lineStrong,
                      position: 'relative', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 2, left: r.toggle ? 18 : 2,
                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  ) : r.tail ? (
                    <div style={cosT('meta', { color: COS.amberInk })}>{r.tail}</div>
                  ) : (
                    <CosIcon.Arrow s={14} c={COS.hush} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 28, textAlign: 'center', ...cosT('meta', { color: COS.hush }) }}>
          Coach OS · build 26.05<br />
          Made with Jolene, for the people she works with.
        </div>
      </div>

      <CkTabBar active="me" />
    </div>
  );
}

Object.assign(window, { ClientEmptyDashboard, ClientSkeleton, ClientReplyThread, ClientHistory, ClientSettings });
