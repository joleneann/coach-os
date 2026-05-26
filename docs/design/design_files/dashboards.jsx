// Coach OS · Client dashboard, three modes.
// MINIMAL · STANDARD · DATA_HEAVY. All phone 390×844.
// Same content vocabulary, density and surfacing are what change.

function DbShell({ children, mode }) {
  return (
    <div style={{ width: 390, height: 844, background: COS.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif', color: COS.ink }}>
      <IOSStatusBar time="7:14" />
      <div style={{ padding: '4px 24px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={cosT('micro', { color: COS.hush })}>{mode}</div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: COS.sunk, display: 'grid', placeItems: 'center', color: COS.ink2, ...cosT('meta', { fontWeight: 600 }) }}>R</div>
      </div>
      {children}
      <CkTabBar active="me" />
    </div>
  );
}

// Card primitive
function DbCard({ children, padded = true, style = {} }) {
  return (
    <div style={{
      background: COS.card, border: `1px solid ${COS.line}`, borderRadius: 16,
      padding: padded ? 18 : 0, ...style,
    }}>{children}</div>
  );
}

// ────────────────────────────────────────────────────────────
// MINIMAL · one thing at a time. No metrics shown unprompted.
// ────────────────────────────────────────────────────────────
function DashboardMinimal() {
  return (
    <DbShell mode="MINIMAL">
      <div style={{ padding: '12px 24px 0' }}>
        <div style={cosT('h2', { color: COS.quiet, fontWeight: 400 })}>Good morning,</div>
        <div style={cosT('display', { color: COS.ink, fontWeight: 500 })}>Rohan.</div>
      </div>

      <div style={{ padding: '36px 24px 0' }}>
        <DbCard>
          <CosMeta>TODAY</CosMeta>
          <div style={{ marginTop: 10, ...cosT('h2', { color: COS.ink }) }}>
            One walk after dinner.
          </div>
          <div style={{ marginTop: 6, ...cosT('body2', { color: COS.quiet }) }}>
            Twenty minutes is plenty. No phone if you can.
          </div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CosWeekDots data={[1,1,1,0,1,0,0]} today={4} />
            </div>
            <div style={cosT('meta', { color: COS.hush })}>this week</div>
          </div>
        </DbCard>
      </div>

      <div style={{ padding: '14px 24px 0' }}>
        <DbCard>
          <CosMeta>NOTE FROM JOLENE</CosMeta>
          <div style={{ marginTop: 10, ...cosT('body', { color: COS.ink, lineHeight: 1.55 }) }}>
            You mentioned the walk feeling like yours. Keep that. We'll talk Friday.
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: COS.sunk, color: COS.ink2, display: 'grid', placeItems: 'center', ...cosT('micro', { fontWeight: 600 }) }}>J</div>
            <div style={cosT('meta', { color: COS.quiet })}>Yesterday, 4:12pm</div>
          </div>
        </DbCard>
      </div>

      {/* The one prompt of the day */}
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 110 }}>
        <CosButton tone="accent" size="lg" style={{ width: '100%' }} leading={<CosIcon.Mic s={16} c="#fff" />}>
          Today's check-in
        </CosButton>
      </div>
    </DbShell>
  );
}

// ────────────────────────────────────────────────────────────
// STANDARD · week at a glance + 2-3 habits + sparkline.
// ────────────────────────────────────────────────────────────
function DashboardStandard() {
  return (
    <DbShell mode="STANDARD">
      <div style={{ padding: '8px 24px 0' }}>
        <div style={cosT('h1', { color: COS.ink })}>This week</div>
        <div style={{ marginTop: 4, ...cosT('body2', { color: COS.quiet }) }}>Week 11 with Jolene · review Friday</div>
      </div>

      {/* Week at a glance · labels + dots */}
      <div style={{ padding: '20px 24px 0' }}>
        <DbCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CosMeta>WEEK AT A GLANCE</CosMeta>
            <div style={cosT('meta', { color: COS.hush })}>5 of 7 days</div>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 14 }}>
            {[
              { name: 'Walk after dinner', data: [1,1,1,0,1,0,0] },
              { name: 'Protein at breakfast', data: [1,0,1,1,0,0,0] },
              { name: 'Lights down by 10', data: [1,1,1,1,1,0,0] },
            ].map((h, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={cosT('body2', { color: COS.ink })}>{h.name}</div>
                  <CosWeekDots data={h.data} today={4} size={7} gap={6} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <CosWeekLabels />
            <div style={cosT('meta', { color: COS.hush })}>M-S</div>
          </div>
        </DbCard>
      </div>

      {/* Reflection trend · editorial sparkline */}
      <div style={{ padding: '14px 24px 0' }}>
        <DbCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <CosMeta>ENERGY · YOUR WORDS</CosMeta>
              <div style={{ marginTop: 8, ...cosT('h3', { color: COS.ink }) }}>Steadier than last week.</div>
            </div>
            <div style={cosT('meta', { color: COS.hush })}>3 wks</div>
          </div>
          <div style={{ marginTop: 14, marginLeft: -4 }}>
            <CosSparkline data={[3,4,3,4,5,4,5,6,5,6,7,6,7,7]} w={310} h={64} color={COS.amber} />
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', ...cosT('meta', { color: COS.hush }) }}>
            <span>3 weeks ago</span><span>today</span>
          </div>
        </DbCard>
      </div>

      {/* Check-in CTA */}
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 110 }}>
        <CosButton tone="accent" size="lg" style={{ width: '100%' }} leading={<CosIcon.Mic s={16} c="#fff" />}>
          Today's check-in
        </CosButton>
      </div>
    </DbShell>
  );
}

// ────────────────────────────────────────────────────────────
// DATA_HEAVY · trends, but read as journal, not telemetry.
// ────────────────────────────────────────────────────────────
function DashboardDataHeavy() {
  const sleepData = [6.2, 6.8, 7.1, 6.5, 7.4, 7.0, 7.3, 7.8, 7.1, 7.5, 7.9, 7.2, 7.6, 7.8];
  const energyData = [3,4,3,4,5,4,5,6,5,6,7,6,7,7];
  const moveData = [22, 0, 18, 20, 25, 0, 12, 28, 24, 30, 26, 32, 28, 35];
  return (
    <DbShell mode="DATA_HEAVY">
      <div style={{ padding: '4px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={cosT('h1', { color: COS.ink })}>Trends</div>
          <div style={cosT('meta', { color: COS.quiet })}>Last 14 days</div>
        </div>
      </div>

      {/* Multi-row editorial chart grid */}
      <div style={{ padding: '16px 24px 0', display: 'grid', gap: 12 }}>
        {[
          { label: 'SLEEP · HOURS', value: '7.5', delta: '+0.4 vs prev', data: sleepData, suffix: 'h' },
          { label: 'ENERGY · YOUR WORDS', value: '7', delta: 'steady this week', data: energyData, suffix: '/10' },
          { label: 'MOVEMENT · MINUTES', value: '28', delta: '4 active days last week', data: moveData, suffix: 'm' },
        ].map((m, i) => (
          <DbCard key={i} padded={false}>
            <div style={{ display: 'flex' }}>
              <div style={{ padding: '16px 0 16px 18px', flex: 1 }}>
                <CosMeta>{m.label}</CosMeta>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div style={cosT('h1', { color: COS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' })}>{m.value}</div>
                  <div style={cosT('meta', { color: COS.quiet })}>{m.suffix}</div>
                </div>
                <div style={{ marginTop: 4, ...cosT('meta', { color: COS.hush }) }}>{m.delta}</div>
              </div>
              <div style={{ padding: '16px 18px 16px 0', display: 'grid', placeItems: 'center' }}>
                <CosSparkline data={m.data} w={170} h={62} color={COS.ink} dashedFrom={null} last />
              </div>
            </div>
          </DbCard>
        ))}
      </div>

      {/* Habits compressed */}
      <div style={{ padding: '12px 24px 0' }}>
        <DbCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CosMeta>HABITS · 3 IN PLAN</CosMeta>
            <div style={cosT('meta', { color: COS.hush })}>5 / 7 days</div>
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              { name: 'Walk', data: [1,1,1,0,1,0,0] },
              { name: 'Protein AM', data: [1,0,1,1,0,0,0] },
              { name: 'Lights 10pm', data: [1,1,1,1,1,0,0] },
            ].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={cosT('body2', { color: COS.ink })}>{h.name}</div>
                <CosWeekDots data={h.data} today={4} size={6} gap={5} />
              </div>
            ))}
          </div>
        </DbCard>
      </div>
    </DbShell>
  );
}

Object.assign(window, { DashboardMinimal, DashboardStandard, DashboardDataHeavy, DbShell, DbCard });
