// Coach OS · shared tokens + atoms
// Single source of truth for colors, type, spacing, and small reusable atoms.

const COS = {
  // Surfaces (warm)
  paper: '#fbfaf7',
  card: '#ffffff',
  sunk: '#f5f4f0',
  sunk2: '#efece6',
  // Text
  ink: '#1c1917', // stone-900
  ink2: '#44403c', // stone-700
  quiet: '#78716c', // stone-500
  hush: '#a8a29e', // stone-400
  // Lines
  line: '#e7e5e4', // stone-200
  lineStrong:'#d6d3d1', // stone-300
  // Accents
  amber: '#d97706', // amber-600 · primary action / focus / highlight
  amberInk: '#92400e', // amber-800 · accent text on soft bg
  amberSoft:'#fef3c7', // amber-100
  amberWash:'#fdf6e3', // tint between paper and soft
  // Used only for "needs attention" · never red. Sparingly.
  attention:'#b45309', // amber-700
  // For dark mode, kept warm (sepia, not slate)
  inkDark: '#1a1815',
  cardDark: '#26221d',
};

// Inter type scale. Sizes pair with line-heights tuned for reading.
const COS_TYPE = {
  display: { font: 'Inter', size: 32, weight: 500, lh: 1.15, ls: '-0.02em' },
  h1: { font: 'Inter', size: 24, weight: 500, lh: 1.2, ls: '-0.02em' },
  h2: { font: 'Inter', size: 19, weight: 500, lh: 1.3, ls: '-0.01em' },
  h3: { font: 'Inter', size: 16, weight: 600, lh: 1.4, ls: '-0.005em' },
  body: { font: 'Inter', size: 15, weight: 400, lh: 1.55, ls: '0' },
  body2: { font: 'Inter', size: 14, weight: 400, lh: 1.55, ls: '0' },
  meta: { font: 'Inter', size: 12, weight: 500, lh: 1.4, ls: '0' },
  micro: { font: 'Inter', size: 11, weight: 500, lh: 1.3, ls: '0.08em', uppercase: true },
  // Long-form (plan view)
  read: { font: 'Inter', size: 16, weight: 400, lh: 1.7, ls: '0' },
  readLead:{ font: 'Inter', size: 19, weight: 400, lh: 1.55, ls: '-0.005em' },
};

const cosT = (k, extra = {}) => {
  const t = COS_TYPE[k] || COS_TYPE.body;
  return {
    fontFamily: t.font + ', system-ui, sans-serif',
    fontSize: t.size,
    fontWeight: t.weight,
    lineHeight: t.lh,
    letterSpacing: t.ls,
    textTransform: t.uppercase ? 'uppercase' : 'none',
    ...extra,
  };
};

// ────────────────────────────────────────────────────────────
// Atoms
// ────────────────────────────────────────────────────────────

// Seven-dot adherence. Filled = present, hollow = absent.
// No color swap by state. Stays calm whether the week is 1/7 or 7/7.
function CosWeekDots({ data = [1,1,1,0,1,1,0], size = 8, gap = 7, color = COS.ink, dim = COS.hush, today = -1 }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {data.map((v, i) => {
        const isToday = i === today;
        return (
          <div key={i} style={{
            width: size, height: size, borderRadius: '50%',
            background: v ? color : 'transparent',
            border: v ? 'none' : `1px solid ${dim}`,
            boxShadow: isToday ? `0 0 0 3px ${COS.paper}, 0 0 0 4px ${COS.line}` : 'none',
          }} />
        );
      })}
    </div>
  );
}

// Day-of-week strip pairing with the dots
function CosWeekLabels({ labels = ['M','T','W','T','F','S','S'], size = 8, gap = 7 }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }}>
      {labels.map((l, i) => (
        <div key={i} style={{ width: size, textAlign: 'center', ...cosT('micro', { color: COS.hush, letterSpacing: '0.04em' }) }}>{l}</div>
      ))}
    </div>
  );
}

// Soft section divider. Hairline with breathing room.
function CosRule({ inset = 0, color = COS.line, style = {} }) {
  return <div style={{ height: 1, background: color, marginLeft: inset, marginRight: inset, ...style }} />;
}

// Meta label, used for tiny headings inside cards.
function CosMeta({ children, color = COS.quiet, style = {} }) {
  return <div style={{ ...cosT('micro', { color }), ...style }}>{children}</div>;
}

// Tag/pill for low-weight categorical labels.
function CosTag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: { bg: COS.sunk, fg: COS.ink2, bd: 'transparent' },
    soft: { bg: COS.amberSoft, fg: COS.amberInk, bd: 'transparent' },
    outline: { bg: 'transparent', fg: COS.ink2, bd: COS.line },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      borderRadius: 999, padding: '3px 9px',
      ...cosT('meta', { fontWeight: 500 }),
    }}>{children}</span>
  );
}

// Editorial sparkline. Thin line, no fill, no markers except optional last point.
function CosSparkline({ data = [], w = 200, h = 56, color = COS.ink, last = true, dashedFrom = null }) {
  if (!data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 10) - 5]);
  const path = points.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ');
  let solidPath = path, dashedPath = '';
  if (dashedFrom != null && dashedFrom < data.length - 1) {
    const solid = points.slice(0, dashedFrom + 1);
    const dashed = points.slice(dashedFrom);
    solidPath = solid.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ');
    dashedPath = dashed.map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ');
  }
  const [lx, ly] = points[points.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <path d={solidPath} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      {dashedPath && <path d={dashedPath} fill="none" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 3" opacity="0.55" />}
      {last && <circle cx={lx} cy={ly} r="2" fill={color} />}
    </svg>
  );
}

// Soft button · pill, neutral or accent
function CosButton({ children, tone = 'neutral', onClick, style = {}, size = 'md', leading, trailing }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 13 },
    md: { h: 40, px: 16, fs: 14 },
    lg: { h: 48, px: 20, fs: 15 },
  }[size];
  const tones = {
    neutral: { bg: COS.card, fg: COS.ink, bd: COS.line, sh: 'inset 0 0 0 1px ' + COS.line },
    quiet: { bg: 'transparent', fg: COS.ink2, bd: 'transparent', sh: 'none' },
    accent: { bg: COS.ink, fg: COS.card, bd: COS.ink, sh: 'none' },
    amber: { bg: COS.amber, fg: '#fff', bd: COS.amber,sh: 'none' },
    soft: { bg: COS.amberSoft, fg: COS.amberInk, bd: 'transparent', sh: 'none' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: 999,
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`, boxShadow: t.sh,
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: sizes.fs, fontWeight: 500,
      letterSpacing: '-0.005em', cursor: 'pointer', transition: 'background .15s, color .15s, transform .15s',
      ...style,
    }}>
      {leading}<span>{children}</span>{trailing}
    </button>
  );
}

// Small phosphor-ish icons (1.5 stroke). Only the icons we need.
const CosIcon = {
  Mic: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>),
  Edit: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4l11-11-4-4L4 16v4z"/></svg>),
  Check: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>),
  Plus: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>),
  Arrow: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  Back: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>),
  Dot: (p) => (<svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill={p.c||'currentColor'}><circle cx="12" cy="12" r="3"/></svg>),
  Pause: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill={p.c||'currentColor'}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>),
  Quote: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill={p.c||'currentColor'}><path d="M7 7h4v4H8a3 3 0 0 0-3 3v3h2v-3a1 1 0 0 1 1-1h3V7zm9 0h4v4h-3a3 3 0 0 0-3 3v3h2v-3a1 1 0 0 1 1-1h3V7z"/></svg>),
  Heart: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>),
  Cal: (p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>),
  Sparkle:(p) => (<svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke={p.c||'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/></svg>),
};

Object.assign(window, { COS, COS_TYPE, cosT, CosWeekDots, CosWeekLabels, CosRule, CosMeta, CosTag, CosSparkline, CosButton, CosIcon });
