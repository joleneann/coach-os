/**
 * Coach OS line icons · 1.5-stroke, single-color, no fill.
 *
 * Ported from docs/design/design_files/tokens.jsx · CosIcon.
 * Each icon is a tiny SVG. Use `currentColor` so they inherit text color.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const base = (s: number): SVGProps<SVGSVGElement> => ({
  width: s,
  height: s,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const MicIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </svg>
);

export const EditIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 20h4l11-11-4-4L4 16v4z" />
  </svg>
);

export const CheckIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);

export const PlusIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ArrowIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const BackIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const DotIcon = ({ size = 14, ...p }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...p}
  >
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const PauseIcon = ({ size = 18, ...p }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...p}
  >
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
);

export const QuoteIcon = ({ size = 18, ...p }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...p}
  >
    <path d="M7 7h4v4H8a3 3 0 0 0-3 3v3h2v-3a1 1 0 0 1 1-1h3V7zm9 0h4v4h-3a3 3 0 0 0-3 3v3h2v-3a1 1 0 0 1 1-1h3V7z" />
  </svg>
);

export const HeartIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
  </svg>
);

export const CalIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);

export const SparkleIcon = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
  </svg>
);
