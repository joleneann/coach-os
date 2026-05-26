// Coach OS · Coach editors: plan approval + weekly review composer.

// ────────────────────────────────────────────────────────────
// COACH · PLAN EDITOR / AI DRAFT APPROVAL
// AI-drafted plan on the left in editable long-form. Coach sees what
// changed, can rewrite anything, then sends.
// ────────────────────────────────────────────────────────────
function CoachPlanEditor() {
  return (
    <CoachShell
      active="clients"
      headerCrumbs={<><span>CLIENTS</span><span style={{ color: COS.hush }}>·</span><span style={{ color: COS.ink2 }}>MIRA SAITO</span><span style={{ color: COS.hush }}>·</span><span style={{ color: COS.ink2 }}>WEEK 17 PLAN</span></>}
      headerActions={<>
        <CosButton tone="quiet" size="sm">Discard</CosButton>
        <CosButton tone="neutral" size="sm">Save draft</CosButton>
        <CosButton tone="accent" size="sm" trailing={<CosIcon.Arrow s={12} c="#fff" />}>Send to Mira</CosButton>
      </>}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 1fr', overflow: 'hidden' }}>
        {/* Plan paper */}
        <div style={{ padding: '32px 64px 40px', overflow: 'auto', background: COS.paper }}>
          <CosMeta>DRAFT · WEEK 17 · BASED ON WK15-16 PATTERN</CosMeta>
          <div style={{ marginTop: 8, ...cosT('display', { color: COS.ink, fontWeight: 500, fontSize: 30, lineHeight: 1.15 }) }}>
            Holding what's working.
          </div>

          <div style={{ marginTop: 22, ...cosT('readLead', { color: COS.ink2 }) }}>
            <span>The morning ritual is doing what we hoped. We'll keep it and remove the </span>
            <span style={{ background: COS.amberSoft, padding: '0 4px', borderRadius: 3, color: COS.amberInk }}>nighttime stretch you've been skipping</span>
            <span>. Trying to keep all three was making the easy two feel like a chore.</span>
          </div>

          <CosRule style={{ marginTop: 28 }} />

          <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>What we're keeping</div>
          <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
            Morning ten minutes. Window light, water, no phone. You've described this as the part of the day where your shoulders drop.
          </div>
          <div style={{ marginTop: 16, ...cosT('read', { color: COS.ink2 }) }}>
            Wednesday walk with your sister. It's worth keeping as a fixed point even on bad weeks.
          </div>

          <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>
            <span style={{ background: COS.amberSoft, padding: '0 4px', borderRadius: 3, color: COS.amberInk }}>What we're letting go</span>
          </div>
          <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
            Evening stretch. Two weeks of skipping it isn't a failure, it's information. Your body is asking for the wind-down to be reading instead of motion. We'll try that.
          </div>

          <div style={{ marginTop: 24, ...cosT('h3', { color: COS.ink }) }}>How we'll know this is working</div>
          <div style={{ marginTop: 12, ...cosT('read', { color: COS.ink2 }) }}>
            You'll start describing Tuesdays differently. That's the day the old plan was breaking down.
          </div>

          <div style={{ marginTop: 28, padding: 16, borderRadius: 12, background: COS.sunk, border: `1px solid ${COS.line}` }}>
            <CosMeta>NEXT REVIEW</CosMeta>
            <div style={{ marginTop: 6, ...cosT('body', { color: COS.ink }) }}>Friday, May 26 · together at 4pm</div>
          </div>
        </div>

        {/* AI sidebar */}
        <div style={{ background: COS.card, borderLeft: `1px solid ${COS.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COS.line}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CosIcon.Sparkle s={14} c={COS.amber} />
              <CosMeta style={{ color: COS.amberInk }}>AI DRAFT · YOUR EDITS PERSISTED</CosMeta>
            </div>
            <div style={{ marginTop: 8, ...cosT('body2', { color: COS.quiet }) }}>
              Drafted from Mira's last two weeks. You decide whether and how it goes to her.
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COS.line}` }}>
            <CosMeta>CHANGES FROM WEEK 16</CosMeta>
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {[
                { type: 'KEEP', label: 'Morning ten minutes', meta: '12 / 14 days' },
                { type: 'KEEP', label: 'Wednesday walk', meta: '2 / 2 weeks' },
                { type: 'REMOVE', label: 'Evening stretch', meta: '1 / 14 days' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: c.type === 'REMOVE' ? COS.amberWash : COS.sunk }}>
                  <CosMeta style={{ color: c.type === 'REMOVE' ? COS.amberInk : COS.quiet, width: 60 }}>{c.type}</CosMeta>
                  <div style={{ flex: 1, ...cosT('body2', { color: COS.ink }) }}>{c.label}</div>
                  <div style={cosT('meta', { color: COS.hush })}>{c.meta}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COS.line}` }}>
            <CosMeta>WHY THE AI SUGGESTED THIS</CosMeta>
            <div style={{ marginTop: 10, ...cosT('body2', { color: COS.ink2, lineHeight: 1.55 }) }}>
              Mira mentioned the stretch felt like a chore in 3 of 4 recent check-ins. Sleep quality (her words) improved on nights she read instead.
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
              <CosTag tone="outline">3 mentions</CosTag>
              <CosTag tone="soft">pattern · 14 days</CosTag>
            </div>
          </div>

          <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto' }}>
            <CosMeta>WHAT MIRA WILL SEE</CosMeta>
            <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: COS.paper, border: `1px solid ${COS.line}` }}>
              <div style={cosT('meta', { color: COS.quiet })}>YOUR PLAN · APRIL 23</div>
              <div style={{ marginTop: 6, ...cosT('h3', { color: COS.ink }) }}>Holding what's working.</div>
              <div style={{ marginTop: 8, ...cosT('body2', { color: COS.ink2, lineHeight: 1.5 }) }}>
                The morning ritual is doing what we hoped. We'll keep it and remove the nighttime stretch you've been skipping...
              </div>
              <div style={cosT('meta', { color: COS.amberInk, marginTop: 10 })}>Reads on Mira's phone in your voice, not the AI's.</div>
            </div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

// ────────────────────────────────────────────────────────────
// COACH · WEEKLY REVIEW COMPOSER
// Three columns: client's week (auto) · AI synthesis (editable) ·
// Jolene's own paragraph (her writing). Publish at top.
// ────────────────────────────────────────────────────────────
function CoachReviewComposer() {
  return (
    <CoachShell
      active="reviews"
      headerCrumbs={<><span>REVIEWS</span><span style={{ color: COS.hush }}>·</span><span style={{ color: COS.ink2 }}>ROHAN MEHTA · WEEK 10</span></>}
      headerActions={<>
        <CosButton tone="quiet" size="sm">Save draft</CosButton>
        <CosButton tone="neutral" size="sm">Preview as Rohan</CosButton>
        <CosButton tone="accent" size="sm" trailing={<CosIcon.Check s={12} c="#fff" />}>Publish to Rohan</CosButton>
      </>}
    >
      <div style={{ padding: '20px 32px 12px', borderBottom: `1px solid ${COS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <CosMeta>FRIDAY REVIEW · WEEK 10 · DUE TODAY 6PM</CosMeta>
            <div style={{ marginTop: 6, ...cosT('h1', { color: COS.ink, fontWeight: 500 }) }}>Friday's reflection</div>
          </div>
          <div style={cosT('meta', { color: COS.hush })}>Autosaving · 2s ago</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', overflow: 'hidden' }}>
        {/* Column 1 · client's week, evidence */}
        <div style={{ padding: '24px 24px', borderRight: `1px solid ${COS.line}`, overflow: 'auto' }}>
          <CosMeta>HIS WEEK · WHAT YOU'RE WORKING FROM</CosMeta>
          <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: COS.card, border: `1px solid ${COS.line}` }}>
            <div style={cosT('meta', { color: COS.quiet })}>HABITS</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
              {[
                { name: 'Walk after dinner', data: [1,1,1,0,1,1,0], n: '5/7' },
                { name: 'Protein AM', data: [1,0,1,1,0,0,0], n: '3/7' },
                { name: 'Lights 10', data: [1,1,1,1,1,0,0], n: '5/7' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={cosT('body2', { color: COS.ink })}>{h.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CosWeekDots data={h.data} size={6} gap={5} />
                    <div style={cosT('meta', { color: COS.hush, width: 26 })}>{h.n}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <CosMeta>IN HIS WORDS · 4 ENTRIES</CosMeta>
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {[
                { d: 'Tue', t: 'The walk after dinner is starting to feel like the part of the day that\'s mine.', pin: true },
                { d: 'Mon', t: 'Walked. The protein piece felt forced this morning.' },
                { d: 'Sun', t: 'Quiet weekend. Cooked, read. Skipped the walk on purpose.', pin: true },
                { d: 'Sat', t: 'Long one. The walk got me through a hard afternoon with my mom.' },
              ].map((q, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, background: q.pin ? COS.amberWash : COS.card, border: `1px solid ${q.pin ? COS.amberSoft : COS.line}`, position: 'relative' }}>
                  <div style={cosT('meta', { color: q.pin ? COS.amberInk : COS.quiet })}>{q.d.toUpperCase()}{q.pin ? ' · PINNED' : ''}</div>
                  <div style={{ marginTop: 6, ...cosT('body2', { color: COS.ink, lineHeight: 1.5, fontStyle: q.pin ? 'italic' : 'normal' }) }}>{q.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 · AI synthesis (editable, marked as AI) */}
        <div style={{ padding: '24px 24px', borderRight: `1px solid ${COS.line}`, overflow: 'auto', background: COS.sunk2 + '40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CosIcon.Sparkle s={14} c={COS.amber} />
            <CosMeta style={{ color: COS.amberInk }}>AI SYNTHESIS · INPUT FOR YOU</CosMeta>
          </div>
          <div style={{ marginTop: 8, ...cosT('meta', { color: COS.quiet }) }}>
            Rohan does not see this column. Use it, ignore it, or paste what you want.
          </div>

          <div style={{
            marginTop: 14, padding: 16, borderRadius: 12, background: COS.card,
            border: `1px dashed ${COS.lineStrong}`,
            ...cosT('read', { color: COS.ink2 }),
          }}>
            The dominant pattern this week is the after-dinner walk becoming an anchor he describes in his own language as “mine.” It's mentioned in 3 of 4 entries. The Saturday note is the strongest signal: he used the walk as a regulating tool during a hard afternoon, which is the first time he's described it that way.
            <br /><br />
            The protein habit has not landed. Two completions, both in a row mid-week. He uses the word “forced” once. Suggest pausing or reframing, not pushing.
            <br /><br />
            <span style={{ color: COS.amberInk }}>Suggested adjustment:</span> graduate walk-after-dinner from “daily” to “most days, by feel.” Hold protein. Add nothing new.
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <CosButton tone="neutral" size="sm">Use as outline</CosButton>
            <CosButton tone="neutral" size="sm">Pull this quote</CosButton>
            <CosButton tone="quiet" size="sm">Dismiss</CosButton>
          </div>
        </div>

        {/* Column 3 · Jolene's paragraph */}
        <div style={{ padding: '24px 28px', overflow: 'auto', background: COS.card }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: COS.amberSoft, color: COS.amberInk, display: 'grid', placeItems: 'center', ...cosT('meta', { fontWeight: 600 }) }}>J</div>
            <CosMeta>WHAT ROHAN WILL READ · IN YOUR VOICE</CosMeta>
          </div>

          <div style={{ marginTop: 14 }}>
            <CosMeta>HEADLINE</CosMeta>
            <div style={{
              marginTop: 6, padding: '10px 12px', borderRadius: 8,
              background: COS.paper, border: `1px solid ${COS.line}`,
              ...cosT('h3', { color: COS.ink, fontWeight: 500 }),
            }}>
              The walk is becoming yours.
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <CosMeta>YOUR PARAGRAPH</CosMeta>
            <div style={{
              marginTop: 6, padding: 14, borderRadius: 10,
              background: COS.paper, border: `1px solid ${COS.line}`, minHeight: 180,
              ...cosT('read', { color: COS.ink, lineHeight: 1.65 }),
            }}>
              What I'm noticing this week is the after-dinner walk becoming a real anchor. You mentioned twice that it felt like the part of the day that was yours. That's the kind of habit that tends to hold.
              <br /><br />
              The protein piece isn't sticking yet, and I don't think it needs to this week. We can come back to it.
              <span style={{ color: COS.amber }}>▍</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <CosMeta>SUGGESTED ADJUSTMENT</CosMeta>
            <div style={{ marginTop: 6, padding: 12, borderRadius: 10, background: COS.paper, border: `1px solid ${COS.line}` }}>
              <div style={cosT('body2', { color: COS.ink, fontWeight: 500 })}>Walk after dinner</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CosTag tone="outline">daily</CosTag>
                <CosIcon.Arrow s={14} c={COS.hush} />
                <select style={{
                  background: COS.amberSoft, border: 'none', color: COS.amberInk,
                  padding: '4px 10px', borderRadius: 999, ...cosT('meta', { fontWeight: 500 }),
                }} defaultValue="b">
                  <option value="a">no change</option>
                  <option value="b">most days, by feel</option>
                  <option value="c">3 times a week</option>
                  <option value="d">paused</option>
                </select>
              </div>
              <div style={{ marginTop: 10, ...cosT('meta', { color: COS.quiet }) }}>
                Frames as a recommendation in his app, not an alert.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: COS.sunk, border: `1px solid ${COS.line}` }}>
            <CosMeta>PRIVATE NOTE TO YOURSELF</CosMeta>
            <div style={{ marginTop: 6, ...cosT('body2', { color: COS.ink2, fontStyle: 'italic' }) }}>
              Watch Saturday's note · first time he used the walk as a regulating tool, not exercise. Don't surface this yet.
            </div>
          </div>
        </div>
      </div>
    </CoachShell>
  );
}

Object.assign(window, { CoachPlanEditor, CoachReviewComposer });
