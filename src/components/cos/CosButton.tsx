import type { ReactNode, CSSProperties, MouseEventHandler } from "react";
import { cos } from "@/lib/tokens";

type Tone = "neutral" | "quiet" | "accent" | "amber" | "soft";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  leading?: ReactNode;
  trailing?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
  className?: string;
  ariaLabel?: string;
}

const sizes: Record<Size, { h: number; px: number; fs: number }> = {
  sm: { h: 32, px: 12, fs: 13 },
  md: { h: 40, px: 16, fs: 14 },
  lg: { h: 48, px: 20, fs: 15 },
};

const tones: Record<Tone, { bg: string; fg: string; bd: string; sh: string }> = {
  neutral: {
    bg: cos.card,
    fg: cos.ink,
    bd: cos.line,
    sh: `inset 0 0 0 1px ${cos.line}`,
  },
  quiet: {
    bg: "transparent",
    fg: cos.ink2,
    bd: "transparent",
    sh: "none",
  },
  accent: {
    bg: cos.ink,
    fg: cos.card,
    bd: cos.ink,
    sh: "none",
  },
  amber: {
    bg: cos.amber,
    fg: "#ffffff",
    bd: cos.amber,
    sh: "none",
  },
  soft: {
    bg: cos.amberSoft,
    fg: cos.amberInk,
    bd: "transparent",
    sh: "none",
  },
};

/**
 * Pill button · five tones, three sizes.
 *
 * Tone guidance:
 * - neutral · default secondary action
 * - quiet · ghost / minimal
 * - accent · primary commit (ink, used for "Acknowledge" etc.)
 * - amber · attention action (rare, never alarm)
 * - soft · companion to coach-voice paper
 */
export default function CosButton({
  children,
  tone = "neutral",
  size = "md",
  onClick,
  leading,
  trailing,
  disabled,
  type = "button",
  style,
  className,
  ariaLabel,
}: Props) {
  const t = tones[tone];
  const s = sizes[size];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: 999,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        boxShadow: t.sh,
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: s.fs,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background .15s, color .15s, transform .15s",
        ...style,
      }}
    >
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}
