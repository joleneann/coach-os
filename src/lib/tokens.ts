/**
 * Coach OS design tokens · TypeScript mirror of globals.css.
 *
 * In normal component code, prefer the CSS-variable utilities exposed via
 * Tailwind v4 @theme: bg-paper, text-ink, border-line, text-h1, etc.
 *
 * Import from this module only when you need raw color or numeric values
 * for inline styles, SVG attributes, Recharts props, or anywhere CSS
 * variables cannot reach. The single source of truth is still globals.css;
 * if you change a value, change it in both places.
 */

export const cos = {
  // Surfaces
  paper: "#fbfaf7",
  card: "#ffffff",
  sunk: "#f5f4f0",
  sunk2: "#efece6",

  // Text
  ink: "#1c1917",
  ink2: "#44403c",
  quiet: "#78716c",
  hush: "#a8a29e",

  // Lines
  line: "#e7e5e4",
  lineStrong: "#d6d3d1",

  // Accent
  amber: "#d97706",
  amberInk: "#92400e",
  amberSoft: "#fef3c7",
  amberWash: "#fdf6e3",
  attention: "#b45309",
} as const;

export type CosColor = keyof typeof cos;

/**
 * Type-scale specs. Mirror of the @theme text-* tokens in globals.css.
 * Most code should use Tailwind classes (text-display, text-body, etc.);
 * this is here for the rare case where you need to compose a style object
 * (chart labels, inline SVG text, dynamic font sizing).
 */
export const cosType = {
  display: { size: 32, weight: 500, lineHeight: 1.15, letterSpacing: "-0.02em" },
  h1: { size: 24, weight: 500, lineHeight: 1.2, letterSpacing: "-0.02em" },
  h2: { size: 19, weight: 500, lineHeight: 1.3, letterSpacing: "-0.01em" },
  h3: { size: 16, weight: 600, lineHeight: 1.4, letterSpacing: "-0.005em" },
  body: { size: 15, weight: 400, lineHeight: 1.55, letterSpacing: "0" },
  body2: { size: 14, weight: 400, lineHeight: 1.55, letterSpacing: "0" },
  meta: { size: 12, weight: 500, lineHeight: 1.4, letterSpacing: "0" },
  micro: { size: 11, weight: 500, lineHeight: 1.3, letterSpacing: "0.08em" },
  read: { size: 16, weight: 400, lineHeight: 1.7, letterSpacing: "0" },
  readLead: { size: 19, weight: 400, lineHeight: 1.55, letterSpacing: "-0.005em" },
} as const;

export type CosTypeKey = keyof typeof cosType;
