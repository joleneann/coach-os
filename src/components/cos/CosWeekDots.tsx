import { cos } from "@/lib/tokens";

interface Props {
  /** 7-element array · 1 (or truthy) = present, 0 (or falsy) = absent */
  data?: (number | boolean)[];
  size?: number;
  gap?: number;
  /** Color of filled dots · defaults to ink */
  color?: string;
  /** Color of the hollow ring on absent days · defaults to hush */
  dim?: string;
  /** Index of "today" · gets a halo ring · pass -1 to disable */
  today?: number;
}

/**
 * Seven-dot adherence row.
 *
 * Filled = present, hollow = absent. **No color swap by state.**
 * The week reads calm whether it is 1/7 or 7/7. Today is marked
 * with a thin halo of `paper` over `line` so it carries no judgment.
 */
export default function CosWeekDots({
  data = [1, 1, 1, 0, 1, 1, 0],
  size = 8,
  gap = 7,
  color = cos.ink,
  dim = cos.hush,
  today = -1,
}: Props) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {data.map((v, i) => {
        const isToday = i === today;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: v ? color : "transparent",
              border: v ? "none" : `1px solid ${dim}`,
              boxShadow: isToday
                ? `0 0 0 3px ${cos.paper}, 0 0 0 4px ${cos.line}`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}
