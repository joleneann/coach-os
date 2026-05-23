"use client";

import { useState, useEffect } from "react";

/**
 * DashboardSection
 *
 * Collapsible wrapper for dashboard sections.
 * Persists collapsed state in localStorage.
 */

interface Props {
  title: string;
  subtitle?: string;
  sectionKey: string; // used for localStorage key
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  subtitle,
  sectionKey,
  children,
}: Props) {
  const storageKey = `dashboard-section-${sectionKey}`;
  const [collapsed, setCollapsed] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "collapsed") setCollapsed(true);
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(storageKey, next ? "collapsed" : "expanded");
    } catch {
      // localStorage unavailable
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full text-left group"
      >
        <div>
          <h2 className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform ${
            collapsed ? "" : "rotate-180"
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          />
        </svg>
      </button>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}
