"use client";

import { cos } from "@/lib/tokens";
import { MicIcon } from "./CosIcon";

interface Props {
  size?: number;
  color?: string;
  soft?: string;
  listening?: boolean;
  onTap?: () => void;
}

/**
 * Coach OS breath pulse · the voice metaphor.
 *
 * Three nested ellipses (halo, mid, core) breathing on a 4-4.2s loop.
 * Use as the daily check-in entry point. The core houses a mic icon.
 * Honors prefers-reduced-motion via the global animation override.
 */
export default function CkBreathPulse({
  size = 168,
  color = cos.amber,
  soft = cos.amberSoft,
  listening = false,
  onTap,
}: Props) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={listening ? "Listening" : "Tap to begin check-in"}
      className="relative grid place-items-center bg-transparent border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-paper rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Outer breath halo */}
      <div
        className="animate-breath-halo absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${soft} 0%, ${soft}00 70%)`,
        }}
      />

      {/* Mid ring */}
      <div
        className="animate-breath-mid absolute rounded-full pointer-events-none"
        style={{
          width: size * 0.62,
          height: size * 0.62,
          background: soft,
        }}
      />

      {/* Core with mic */}
      <div
        className="animate-breath-core grid place-items-center rounded-full text-white"
        style={{
          width: size * 0.34,
          height: size * 0.34,
          background: color,
          boxShadow: `0 4px 18px ${color}40`,
        }}
      >
        <MicIcon size={Math.round(size * 0.13)} />
      </div>

      {listening && (
        <div
          className="text-meta absolute"
          style={{ bottom: -28, color: cos.quiet }}
        >
          listening
        </div>
      )}
    </button>
  );
}
