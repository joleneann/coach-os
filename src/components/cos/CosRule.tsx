import { cos } from "@/lib/tokens";

interface Props {
  inset?: number;
  color?: string;
  className?: string;
}

/**
 * Hairline divider with optional inset and color override.
 * Default color is the `line` token (stone-200).
 */
export default function CosRule({
  inset = 0,
  color = cos.line,
  className,
}: Props) {
  return (
    <div
      className={className}
      style={{
        height: 1,
        background: color,
        marginLeft: inset,
        marginRight: inset,
      }}
    />
  );
}
