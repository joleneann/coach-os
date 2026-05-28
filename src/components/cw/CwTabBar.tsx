"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { id: "today", label: "Today", href: "/client" },
  { id: "plan", label: "Plan", href: "/client/plan" },
  { id: "progress", label: "Progress", href: "/client/progress" },
];

interface Props {
  activeOverride?: "today" | "plan" | "progress";
}

/**
 * Mobile bottom tab bar · ports the CkTabBar from checkin.jsx.
 *
 * Fixed to the bottom, paper gradient so content scrolls under it softly.
 * Active tab gets an ink dot above the label. Hidden on md+ where the
 * top nav takes over.
 */
export default function CwTabBar({ activeOverride }: Props) {
  const pathname = usePathname();

  const active =
    activeOverride ??
    (pathname.startsWith("/client/plan")
      ? "plan"
      : pathname.startsWith("/client/progress") ||
        pathname.startsWith("/client/review") ||
        pathname.startsWith("/client/history")
      ? "progress"
      : "today");

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 flex justify-around pt-3 px-2"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        background:
          "linear-gradient(to top, var(--color-paper) 65%, transparent)",
      }}
    >
      {items.map((i) => {
        const isActive = i.id === active;
        return (
          <Link
            key={i.id}
            href={i.href}
            className="flex flex-col items-center gap-1 py-1 px-4"
          >
            <span
              className={
                "w-1.5 h-1.5 rounded-full " +
                (isActive ? "bg-ink" : "bg-transparent")
              }
            />
            <span
              className={
                "text-meta " +
                (isActive ? "text-ink font-semibold" : "text-hush font-medium")
              }
            >
              {i.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
