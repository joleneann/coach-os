import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  padded?: boolean;
  className?: string;
}

/**
 * Coach OS primary card · white surface, hairline border, 18px radius.
 * Default padding is 24px. Pass `padded={false}` to remove inset padding.
 */
export default function CwCard({
  children,
  padded = true,
  className = "",
}: Props) {
  return (
    <div
      className={
        "bg-card border border-line rounded-[18px] " +
        (padded ? "p-6 " : "") +
        className
      }
    >
      {children}
    </div>
  );
}
