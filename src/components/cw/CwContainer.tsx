import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Max width in pixels · default 1120 to match the dashboard frame */
  max?: number;
  className?: string;
}

/**
 * Centered max-width container with horizontal page gutters.
 * Page gutters scale: 24px on mobile, 40px from md up.
 */
export default function CwContainer({
  children,
  max = 1120,
  className = "",
}: Props) {
  return (
    <div
      className={"mx-auto px-6 md:px-10 " + className}
      style={{ maxWidth: max }}
    >
      {children}
    </div>
  );
}
