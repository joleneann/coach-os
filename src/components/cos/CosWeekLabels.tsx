import { cos } from "@/lib/tokens";

interface Props {
  labels?: string[];
  size?: number;
  gap?: number;
}

/**
 * Day-of-week strip · pairs above or below a CosWeekDots row.
 * Default labels are Monday-first.
 */
export default function CosWeekLabels({
  labels = ["M", "T", "W", "T", "F", "S", "S"],
  size = 8,
  gap = 7,
}: Props) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {labels.map((l, i) => (
        <div
          key={i}
          className="text-micro"
          style={{
            width: size,
            textAlign: "center",
            color: cos.hush,
            letterSpacing: "0.04em",
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
}
