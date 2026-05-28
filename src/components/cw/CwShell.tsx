import type { ReactNode } from "react";
import CwTopNav from "./CwTopNav";
import CwTabBar from "./CwTabBar";

interface Props {
  children: ReactNode;
  activeOverride?: "today" | "plan" | "progress";
}

/**
 * Page chrome for client pages.
 * Desktop: top nav. Mobile: bottom tab bar (with content bottom-padding so
 * nothing hides behind it). Content area scrolls on paper.
 */
export default function CwShell({ children, activeOverride }: Props) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <CwTopNav activeOverride={activeOverride} />
      <main className="flex-1 overflow-auto pb-28 md:pb-0">{children}</main>
      <CwTabBar activeOverride={activeOverride} />
    </div>
  );
}
