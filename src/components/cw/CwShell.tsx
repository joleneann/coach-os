import type { ReactNode } from "react";
import CwTopNav from "./CwTopNav";

interface Props {
  children: ReactNode;
  activeOverride?: "today" | "plan" | "week" | "history";
}

/**
 * Page chrome for client web pages.
 * Renders the top nav and a scrollable content area on paper.
 */
export default function CwShell({ children, activeOverride }: Props) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <CwTopNav activeOverride={activeOverride} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
