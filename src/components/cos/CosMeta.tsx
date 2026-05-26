import type { ReactNode, CSSProperties } from "react";
import { cos } from "@/lib/tokens";

interface Props {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

/**
 * Tiny UPPERCASE eyebrow label · used for "YOUR COACH'S READ" style
 * micro headings inside cards.
 */
export default function CosMeta({
  children,
  color = cos.quiet,
  style,
  className,
}: Props) {
  return (
    <div
      className={`text-micro ${className ?? ""}`}
      style={{ color, ...style }}
    >
      {children}
    </div>
  );
}
