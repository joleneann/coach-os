"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const items = [
  { id: "today", label: "Today", href: "/client" },
  { id: "plan", label: "Plan", href: "/client/plan" },
  { id: "week", label: "Week", href: "/client/review" },
  { id: "history", label: "History", href: "/client/history" },
];

interface Props {
  activeOverride?: "today" | "plan" | "week" | "history";
  coachName?: string;
}

/**
 * Coach OS client web top navigation.
 * Ports docs/design/design_files/client-web.jsx · CwTopNav.
 *
 * 64px tall, hairline bottom border, paper background.
 * Left: small ink-dot mark and the coach's name (defaults to "Jolene").
 * Middle: four tabs with underline indicator on the active route.
 * Right: today's date and the client's avatar initial.
 */
export default function CwTopNav({ activeOverride, coachName = "Jolene" }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const active =
    activeOverride ??
    (pathname.startsWith("/client/plan")
      ? "plan"
      : pathname.startsWith("/client/review")
      ? "week"
      : pathname.startsWith("/client/history")
      ? "history"
      : "today");

  const initial =
    session?.user?.name?.trim().charAt(0).toUpperCase() ?? "·";
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="h-16 shrink-0 px-6 md:px-10 border-b border-line bg-paper flex items-center justify-between">
      <div className="flex items-center gap-5 md:gap-9">
        <Link href="/client" className="flex items-center gap-2.5">
          <span className="w-[22px] h-[22px] rounded-full bg-ink inline-block" />
          <span className="text-body-2 font-semibold tracking-tight text-ink">
            {coachName}
          </span>
        </Link>

        <nav className="flex items-center gap-5 md:gap-7 self-stretch">
          {items.map((i) => {
            const isActive = i.id === active;
            return (
              <Link
                key={i.id}
                href={i.href}
                className="relative inline-flex items-center h-full group"
              >
                <span
                  className={
                    "text-body-2 transition-colors " +
                    (isActive
                      ? "text-ink font-semibold"
                      : "text-quiet font-medium group-hover:text-ink-2")
                  }
                >
                  {i.label}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    "absolute left-1/2 -translate-x-1/2 bottom-3 h-[2px] w-[18px] rounded-sm pointer-events-none " +
                    (isActive ? "bg-ink" : "bg-transparent")
                  }
                />
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3.5">
        <span className="text-meta text-quiet hidden sm:inline">
          {dateLabel}
        </span>
        <span className="w-8 h-8 rounded-full bg-sunk text-ink-2 grid place-items-center text-meta font-semibold">
          {initial}
        </span>
      </div>
    </header>
  );
}
