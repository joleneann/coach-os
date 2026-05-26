import type { ReactNode } from "react";
import { cos } from "@/lib/tokens";

type Tone = "neutral" | "soft" | "outline";

interface Props {
  children: ReactNode;
  tone?: Tone;
}

const tones: Record<Tone, { bg: string; fg: string; bd: string }> = {
  neutral: { bg: cos.sunk, fg: cos.ink2, bd: "transparent" },
  soft: { bg: cos.amberSoft, fg: cos.amberInk, bd: "transparent" },
  outline: { bg: "transparent", fg: cos.ink2, bd: cos.line },
};

/**
 * Low-weight categorical pill · neutral, soft (amber), or outline.
 * Used for tags, status chips, and quiet labels inside cards.
 */
export default function CosTag({ children, tone = "neutral" }: Props) {
  const t = tones[tone];
  return (
    <span
      className="text-meta"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        borderRadius: 999,
        padding: "3px 9px",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
