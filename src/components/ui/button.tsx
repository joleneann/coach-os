import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Coach OS Button · pill-shaped, five tones, three sizes.
 *
 * Tones (matching docs/design/design_files/tokens.jsx · CosButton):
 *   neutral · default. White card, ink text, line border.
 *   quiet · ghost. Transparent, ink-2 text. For tertiary actions.
 *   accent · primary commit. Ink bg, white text.
 *   amber · attention. Amber bg, white text. Used sparingly.
 *   soft · companion to coach-voice paper. Amber-soft bg, amber-ink text.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full whitespace-nowrap font-medium tracking-tight transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral:
          "bg-card text-ink border border-line shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-sunk",
        quiet:
          "bg-transparent text-ink-2 hover:bg-sunk",
        accent:
          "bg-ink text-white hover:bg-ink-2",
        amber:
          "bg-amber text-white hover:bg-amber-ink",
        soft:
          "bg-amber-soft text-amber-ink hover:bg-amber-wash",
      },
      size: {
        sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-5 text-[15px] [&_svg]:size-4",
        icon: "size-10 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

function Button({
  className,
  variant = "neutral",
  size = "md",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
