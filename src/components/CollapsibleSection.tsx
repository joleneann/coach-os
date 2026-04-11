"use client";

import { useState } from "react";

export default function CollapsibleSection({
  title,
  hasData,
  children,
}: {
  title: string;
  hasData: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-stone-200">
      <button
        onClick={() => hasData && setOpen(!open)}
        className={`w-full p-6 text-left flex items-center justify-between ${
          hasData ? "cursor-pointer hover:bg-stone-50" : "cursor-default"
        } transition-colors`}
      >
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            {title}
          </h2>
          {!hasData && (
            <p className="text-sm text-stone-400 mt-1">Not yet completed</p>
          )}
        </div>
        {hasData && (
          <span className="text-stone-400 text-sm">
            {open ? "▲" : "▼"}
          </span>
        )}
      </button>
      {open && hasData && (
        <div className="px-6 pb-6 border-t border-stone-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}
