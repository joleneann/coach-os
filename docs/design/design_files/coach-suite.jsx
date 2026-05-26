// Coach OS · Coach desktop suite (shell, detail, inbox, mode picker, intake reader).
// All 1280×800 unless noted. Inter only. Warm neutrals. No traffic-light cues.

// Shared shell: left rail + page header. Body is yielded.
function CoachShell({ active = 'clients', children, headerCrumbs, headerActions }) {
  const nav = [
    { id: 'today', l: 'Today', n: '3' },
    { id: 'clients', l: 'Clients', n: '7' },
    { id: 'intakes', l: 'Intakes', n: '2' },
    { id: 'reviews', l: 'Reviews', n: '1' },
    { id: 'library', l: 'Library', n: '' },
  ];
  return (
    <div style={{ width: 1280, height: 800, background: COS.paper, display: 'flex', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink, overflow: 'hidden' }}>
      <div style={{ width: 220, padding: '24px 16px', borderRight: `1px solid ${COS.line}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ padding: '0 8px 18px' }}>
          <div style={cosT('h3', { color: COS.ink, fontWeight: 600 })}>Coach OS</div>
          <div style={cosT('meta', { color: COS.quiet })}>Jolene · practice</div>
        </div>
        {nav.map((i, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: 8,
            background: active === i.id ? COS.sunk : 'transparent',
            color: active === i.id ? COS.ink : COS.ink2,
            ...cosT('body2', { fontWeight: active === i.id ? 600 : 400 }),
          }}>
            <span>{i.l}</span>
            <span style={cosT('meta', { color: active === i.id ? COS.ink2 : COS.hush })}>{i.n}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${COS.line}` }}>
          <div style={cosT('meta', { color: COS.quiet })}>JOLENE</div>
          <div style={{ marginTop: 2, ...cosT('body2', { color: COS.ink }) }}>Practicing coach</div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 32px 16px', borderBottom: `1px solid ${COS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...cosT('meta', { color: COS.quiet }) }}>
            {headerCrumbs}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>{headerActions}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// COACH · INBOX / TODAY
// "3 need you this morning" · the triage view.
// ────────────────────────────────────────────────────────────
function CoachInbox() {
  const items = [
    { who: 'Rohan Mehta', kind: 'CHECK-IN', age: '32m', preview: 'Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that\'s mine.', mode: 'voice · 1:14', priority: 1 },
    { who: 'Mira Saito', kind: 'PLAN READY', age: '2h', preview: 'AI-drafted plan for Week 17. Three habits, one removed. Ready for your eyes.', mode: 'awaits approval', priority: 1 },
    { who: 'Daniel Okonkwo',kind: 'REVIEW DUE', age: 'today', preview: 'Friday review for Week 4. Synthesis written, your paragraph empty.', mode: 'publish by 6pm', priority: 1 },
    { who: 'Priya Anand', kind: 'NOTE', age: 'yesterday', preview: 'Wrote a long entry about her sister. Nothing urgent, worth reading when you have a moment.', mode: 'voice · 3:02', priority: 2 },
    { who: 'Hannah Voss', kind: 'INTAKE 70%', age: '2 days', preview: 'Paused on the sleep section. Last activity Tuesday.', mode: ' ', priority: 3 },
  ];
  return (
    <CoachShell active="today" headerCrumbs={<span>TODAY · TUESDAY 23 MAY</span>} headerActions={<><CosButton tone="neutral" size="sm">All caught up</CosButton><CosButton tone="accent" size="sm" leading={<CosIcon.Mic s={14} c="#fff" />}>Start session</CosButton></>}>
      <div style={{ padding: '28px 32px 0' }}>
        <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Good morning, Jolene.</div>
        <div style={{ marginTop: 6, ...cosT('body', { color: COS.quiet }) }}>Three need you. Two can wait. Practice is calmer than last week.</div>
      </div>

      <div style={{ padding: '28px 32px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { l: 'CHECK-INS TO READ', v: '3', sub: 'two voice, one written' },
          { l: 'AWAITING YOU', v: '2', sub: '1 plan · 1 review draft' },
          { l: 'ACTIVE CLIENTS', v: '7', sub: '+ 2 in intake' },
        ].map((s, i) => (
          <div key={i} style={{ padding: 16, borderRadius: 14, background: COS.card, border: `1px solid ${COS.line}` }}>
            <CosMeta>{s.l}</CosMeta>
            <div style={{ marginTop: 6, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 28 }) }}>{s.v}</div>
            <div style={cosT('meta', { color: COS.quiet, marginTop: 2 })}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 32px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <CosMeta>QUEUE · IN THE ORDER I'D OPEN THEM</CosMeta>
        <div style={cosT('meta', { color: COS.hush })}>5 items</div>
      </div>

      <div style={{ padding: '12px 32px 32px', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '36px 200px 1fr 160px 100px',
            alignItems: 'flex-start', gap: 16, padding: '16px 18px',
            background: COS.card, border: `1px solid ${COS.line}`, borderRadius: 14,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }) }}>
              {it.who.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div style={cosT('body', { color: COS.ink, fontWeight: 600 })}>{it.who}</div>
              <div style={cosT('micro', { color: it.priority === 1 ? COS.amberInk : COS.quiet, marginTop: 4 })}>{it.kind}</div>
            </div>
            <div style={{ ...cosT('body2', { color: COS.ink2, lineHeight: 1.5 }), display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {it.preview}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={cosT('meta', { color: COS.quiet })}>{it.mode}</div>
              <div style={cosT('meta', { color: COS.hush })}>{it.age} ago</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <CosButton tone="neutral" size="sm" trailing={<CosIcon.Arrow s={12} c={COS.ink2} />}>Open</CosButton>
            </div>
          </div>
        ))}
      </div>
    </CoachShell>
  );
}

// ────────────────────────────────────────────────────────────
// COACH · CLIENT DETAIL (FULL PAGE)
// Tabs: Today · Plan · Reviews · Intake · History
// ────────────────────────────────────────────────────────────
function CoachClientDetail() {
  const tabs = ['Today', 'Plan', 'Reviews', 'Intake', 'History'];
  return (
    <CoachShell
      active="clients"
      headerCrumbs={<><span>CLIENTS</span><span style={{ color: COS.hush }}>·</span><span style={{ color: COS.ink2 }}>ROHAN MEHTA</span></>}
      headerActions={<><CosButton tone="neutral" size="sm">Send a note</CosButton><CosButton tone="neutral" size="sm">Schedule</CosButton></>}
    >
      {/* Client header */}
      <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${COS.line}` }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('h3', { fontWeight: 600 }) }}>RM</div>
        <div style={{ flex: 1 }}>
          <div style={cosT('h1', { color: COS.ink, fontWeight: 500 })}>Rohan Mehta</div>
          <div style={{ marginTop: 4, display: 'flex', gap: 14, alignItems: 'center', ...cosT('body2', { color: COS.quiet }) }}>
            <span>Week 11 with you</span>
            <span style={{ color: COS.hush }}>·</span>
            <span>STANDARD dashboard</span>
            <span style={{ color: COS.hush }}>·</span>
            <span>Friday reviews at 4pm</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <CosMeta>THIS WEEK</CosMeta>
          <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} size={10} gap={9} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 32px', display: 'flex', gap: 24, borderBottom: `1px solid ${COS.line}` }}>
        {tabs.map((t, i) => (
          <div key={t} style={{
            padding: '12px 0', position: 'relative',
            ...cosT('body2', { color: i === 0 ? COS.ink : COS.quiet, fontWeight: i === 0 ? 600 : 400 }),
            borderBottom: i === 0 ? `2px solid ${COS.ink}` : '2px solid transparent', marginBottom: -1,
          }}>{t}</div>
        ))}
      </div>

      {/* Body · Today tab */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', overflow: 'hidden' }}>
        {/* Left: latest check-in + history */}
        <div style={{ padding: '24px 32px', overflow: 'auto', borderRight: `1px solid ${COS.line}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <CosMeta>THIS MORNING · 7:14AM</CosMeta>
            <div style={cosT('meta', { color: COS.hush })}>voice · 1:14 · 52 words</div>
          </div>
          <div style={{ marginTop: 12, padding: 20, borderRadius: 14, background: COS.amberWash, border: `1px solid ${COS.amberSoft}` }}>
            <div style={cosT('readLead', { color: COS.ink, fontWeight: 400 })}>
              “Slept ok, woke up around six. The walk after dinner is starting to feel like the part of the day that's mine.”
            </div>
            <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
              I think the morning protein is the one I keep forgetting. Energy was steady, no afternoon dip today.
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CosButton tone="neutral" size="sm" leading={<CosIcon.Quote s={13} c={COS.ink2} />}>Reply privately</CosButton>
              <CosButton tone="neutral" size="sm">Add to Friday review</CosButton>
              <CosButton tone="quiet" size="sm">Listen to original</CosButton>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <CosMeta>RECENT</CosMeta>
            <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {[
                { d: 'Yesterday', t: 'Walked after dinner. The protein piece felt forced this morning.' },
                { d: 'Sunday', t: 'Quiet weekend. Cooked, read. Skipped the walk on purpose.' },
                { d: 'Saturday', t: 'Long one. The walk got me through a hard afternoon with my mom.' },
                { d: 'Friday', t: 'Acknowledged Week 10 review. No reply.' },
              ].map((r, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 12, background: COS.card, border: `1px solid ${COS.line}` }}>
                  <div style={cosT('meta', { color: COS.quiet })}>{r.d.toUpperCase()}</div>
                  <div style={{ marginTop: 6, ...cosT('body2', { color: COS.ink2, lineHeight: 1.55 }) }}>{r.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: plan summary + adherence + private notes */}
        <div style={{ padding: '24px 28px', overflow: 'auto', background: COS.card }}>
          <CosMeta>CURRENT PLAN · WEEK 11</CosMeta>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {[
              { name: 'Walk after dinner', data: [1,1,1,0,1,0,0], cad: 'most days, by feel' },
              { name: 'Protein at breakfast', data: [1,0,1,1,0,0,0], cad: 'when easy' },
              { name: 'Lights down by 10', data: [1,1,1,1,1,0,0], cad: 'nightly' },
            ].map((h, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? `1px solid ${COS.line}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={cosT('body2', { color: COS.ink, fontWeight: 500 })}>{h.name}</div>
                  <CosWeekDots data={h.data} today={4} size={7} gap={6} />
                </div>
                <div style={cosT('meta', { color: COS.quiet, marginTop: 4 })}>{h.cad}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <CosMeta>YOUR PRIVATE NOTES</CosMeta>
            <div style={{
              marginTop: 8, padding: 14, borderRadius: 12,
              background: COS.sunk, border: `1px solid ${COS.line}`,
              ...cosT('body2', { color: COS.ink2, lineHeight: 1.55 }),
              fontStyle: 'italic',
            }}>
              He's softening into the work. Watch for the protein habit becoming a wedge. Don't push it before the walk fully settles.
            </div>
            <div style={{ marginTop: 8, ...cosT('meta', { color: COS.hush }) }}>
              Only you see this. Never goes to Rohan.
            </div>
          </div>

          <div style={{ marginTop: 22, padding: 14, borderRadius: 12, background: COS.amberWash, border: `1px solid ${COS.amberSoft}` }}>
            <CosMeta style={{ color: COS.amberInk }}>FRIDAY REVIEW · DRAFT READY</CosMeta>
            <div style={{ marginTop: 8, ...cosT('body2', { color: COS.ink2 }) }}>
              AI synthesis written. Your paragraph empty.
            </div>
            <div style={{ marginTop: 10 }}>
              <CosButton tone="accent" size="sm" trailing={<CosIcon.Arrow s={12} c="#fff" />}>Open composer</CosButton>
            </div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

// ────────────────────────────────────────────────────────────
// COACH · MODE PICKER (modal over client detail)
// Choosing MINIMAL / STANDARD / DATA_HEAVY for a client.
// ────────────────────────────────────────────────────────────
function CoachModePicker() {
  const modes = [
    { id: 'MINIMAL', h: 'Minimal', d: 'One habit at a time. No metrics shown unprompted. For clients who feel watched by data, or who are starting fresh.', best: 'New intakes · clients in a hard season · those with disordered patterns.' },
    { id: 'STANDARD', h: 'Standard', d: 'Week at a glance, three habits, one qualitative trend. Reads as a journal, not a scoreboard.', best: 'Most active clients. The default unless there\'s a reason to dial in either direction.' },
    { id: 'DATA_HEAVY', h: 'Data heavy', d: 'Sleep, energy, movement as editorial trends. Habit grid compressed. Useful when a client asks to see more, not when you want them to see more.', best: 'Clients who ask. Clients tracking specific changes (sleep work, post-injury return).' },
  ];
  return (
    <div style={{ width: 1280, height: 800, background: 'rgba(28, 25, 23, 0.45)', display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ width: 880, background: COS.paper, borderRadius: 20, boxShadow: '0 30px 60px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '28px 32px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <CosMeta>DASHBOARD MODE · ROHAN MEHTA</CosMeta>
            <div style={{ marginTop: 8, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>What should Rohan see when he opens the app?</div>
            <div style={{ marginTop: 6, ...cosT('body2', { color: COS.quiet, maxWidth: 560 }) }}>
              A clinical decision. The mode changes only the client's view, not your tools.
            </div>
          </div>
          <CosIcon.Plus s={20} c={COS.hush} />
        </div>

        <div style={{ padding: '20px 32px 28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {modes.map((m, i) => {
            const selected = i === 1;
            return (
              <div key={m.id} style={{
                padding: 18, borderRadius: 14,
                background: selected ? COS.card : COS.card,
                border: `1.5px solid ${selected ? COS.ink : COS.line}`,
                boxShadow: selected ? `0 0 0 4px ${COS.amberSoft}80` : 'none',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <CosMeta>{m.id}</CosMeta>
                <div style={cosT('h3', { color: COS.ink })}>{m.h}</div>
                {/* tiny preview */}
                <div style={{ height: 72, borderRadius: 8, background: COS.sunk, border: `1px solid ${COS.line}`, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.id === 'MINIMAL' && (<>
                    <div style={{ width: 60, height: 4, borderRadius: 2, background: COS.hush }} />
                    <div style={{ width: 96, height: 6, borderRadius: 2, background: COS.ink }} />
                    <div style={{ marginTop: 'auto', display: 'flex', gap: 4 }}>
                      <CosWeekDots data={[1,1,1,0,1,0,0]} size={6} gap={4} />
                    </div>
                  </>)}
                  {m.id === 'STANDARD' && (<>
                    <div style={{ width: 40, height: 3, borderRadius: 2, background: COS.hush }} />
                    {[0,1,2].map(j => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: 50, height: 3, background: COS.line }} />
                        <CosWeekDots data={[1,1,1,0,1,0,0]} size={4} gap={3} />
                      </div>
                    ))}
                  </>)}
                  {m.id === 'DATA_HEAVY' && (<>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ width: 30, height: 3, background: COS.hush }} />
                      <div style={{ width: 20, height: 3, background: COS.ink }} />
                    </div>
                    <CosSparkline data={[3,4,3,4,5,4,5,6,5,6,7,6,7,7]} w={120} h={32} color={COS.ink} />
                  </>)}
                </div>
                <div style={cosT('body2', { color: COS.ink2, lineHeight: 1.5 })}>{m.d}</div>
                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: `1px solid ${COS.line}` }}>
                  <CosMeta>BEST FOR</CosMeta>
                  <div style={{ marginTop: 4, ...cosT('meta', { color: COS.quiet }) }}>{m.best}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 32px', borderTop: `1px solid ${COS.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COS.card }}>
          <div style={cosT('meta', { color: COS.quiet })}>Currently: STANDARD · changing won't lose any data.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CosButton tone="quiet" size="md">Cancel</CosButton>
            <CosButton tone="accent" size="md">Keep STANDARD</CosButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// COACH · INTAKE READER
// 10-section intake, calmly presented. GHQ-28 styled neutrally below.
// ────────────────────────────────────────────────────────────
function CoachIntakeReader() {
  const sections = ['Welcome', 'History', 'Goals', 'Sleep', 'Movement', 'Food', 'Stress', 'GHQ-28', 'Relationships', 'Constraints'];
  return (
    <CoachShell
      active="intakes"
      headerCrumbs={<><span>INTAKES</span><span style={{ color: COS.hush }}>·</span><span style={{ color: COS.ink2 }}>HANNAH VOSS</span></>}
      headerActions={<><CosButton tone="neutral" size="sm">Save as draft</CosButton><CosButton tone="accent" size="sm" trailing={<CosIcon.Arrow s={12} c="#fff" />}>Draft her plan</CosButton></>}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
        {/* Section nav */}
        <div style={{ borderRight: `1px solid ${COS.line}`, padding: '20px 0', overflow: 'auto' }}>
          <div style={{ padding: '0 18px 12px' }}>
            <CosMeta>SECTIONS</CosMeta>
            <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
              {sections.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < 8 ? COS.ink : i === 8 ? COS.amber : COS.line }} />
              ))}
            </div>
            <div style={{ marginTop: 6, ...cosT('meta', { color: COS.hush }) }}>9 of 10 complete</div>
          </div>
          {sections.map((s, i) => (
            <div key={s} style={{
              padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: i === 3 ? COS.sunk : 'transparent',
              ...cosT('body2', { color: i === 3 ? COS.ink : COS.ink2, fontWeight: i === 3 ? 600 : 400 }),
              borderLeft: i === 3 ? `2px solid ${COS.ink}` : '2px solid transparent',
            }}>
              <span>{i + 1}. {s}</span>
              <span style={cosT('meta', { color: i < 9 ? COS.hush : COS.amberInk })}>{i < 9 ? '✓' : ' '}</span>
            </div>
          ))}
        </div>

        {/* Reader body */}
        <div style={{ padding: '28px 56px', overflow: 'auto', maxWidth: 820 }}>
          <CosMeta>SECTION 4 · SLEEP</CosMeta>
          <div style={{ marginTop: 6, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>Sleep</div>
          <div style={{ marginTop: 6, ...cosT('body2', { color: COS.quiet }) }}>Six questions. Hannah answered four in writing, two by voice.</div>

          <div style={{ marginTop: 28, display: 'grid', gap: 24 }}>
            {[
              { q: 'What does a good night of sleep look like for you, lately?', a: 'Honestly, rare. When it happens, I notice it. I wake up before the alarm, the room feels warmer somehow, and I don\'t reach for my phone for the first hour.', kind: 'voice · 0:48' },
              { q: 'On a typical weeknight, what time are you in bed?', a: 'Between 11:30 and 12:30. Earlier on Sundays.', kind: 'written' },
              { q: 'What pulls you toward staying up?', a: 'The honest answer is that it\'s the only part of the day my time feels like mine. Even when I\'m tired.', kind: 'voice · 1:12', flagged: true },
              { q: 'Anything you\'ve tried for sleep that did or didn\'t work?', a: 'Magnesium. Helped for two weeks then stopped. Stopped caffeine after 2pm · that\'s been steady.', kind: 'written' },
            ].map((qa, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
                  <div style={cosT('body', { color: COS.quiet, fontWeight: 500 })}>{qa.q}</div>
                  <div style={cosT('meta', { color: COS.hush, whiteSpace: 'nowrap' })}>{qa.kind}</div>
                </div>
                <div style={{
                  marginTop: 10, padding: 16, borderRadius: 12,
                  background: qa.flagged ? COS.amberWash : COS.card,
                  border: `1px solid ${qa.flagged ? COS.amberSoft : COS.line}`,
                  ...cosT('read', { color: COS.ink }),
                }}>
                  {qa.a}
                </div>
                {qa.flagged && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, ...cosT('meta', { color: COS.amberInk }) }}>
                    <CosIcon.Heart s={12} c={COS.amberInk} /> Marked to revisit when you draft her plan.
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* GHQ-28 · neutral styling note */}
          <div style={{ marginTop: 36, padding: 20, borderRadius: 14, background: COS.card, border: `1px solid ${COS.line}` }}>
            <CosMeta>GHQ-28 · SECTION 8 · PREVIEW</CosMeta>
            <div style={{ marginTop: 10, ...cosT('body2', { color: COS.ink2 }) }}>
              Validated instrument. Answers are not styled as right or wrong. The four options are visually equal-weighted.
            </div>
            <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: COS.sunk }}>
              <div style={cosT('body2', { color: COS.ink })}>Have you recently been able to concentrate on what you're doing?</div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {['Better than usual', 'Same as usual', 'Less than usual', 'Much less than usual'].map((o, i) => (
                  <div key={o} style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: i === 1 ? COS.amberSoft : COS.card,
                    border: `1px solid ${i === 1 ? COS.amberSoft : COS.line}`,
                    color: COS.ink2, ...cosT('meta'),
                    textAlign: 'center',
                  }}>{o}</div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12, ...cosT('meta', { color: COS.quiet }) }}>
              Score is computed but not visually emphasized. You see the pattern, not the number first.
            </div>
          </div>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </CoachShell>
  );
}

Object.assign(window, { CoachShell, CoachInbox, CoachClientDetail, CoachModePicker, CoachIntakeReader });
