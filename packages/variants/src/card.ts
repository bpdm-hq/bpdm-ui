import { cva, type VariantProps } from "class-variance-authority";

/**
 * `cardVariants` — surface style (`elevated` / `outlined` / `soft`) plus optional
 * hover-lift and interactive (focusable, pressable) behaviour. Framework-agnostic:
 * the same classes drive the React (`@bpdm/ui`) and Angular (`@bpdm/ng`) cards.
 */
export const cardVariants = cva(
  // one smooth transition for every card motion (lift, press, border) — a soft
  // easeOut so things float rather than snap; willChange keeps it buttery
  "group/card relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card text-card-foreground transition-[transform,box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform]",
  {
    variants: {
      variant: {
        // shadow only — floats off the page, no visible border
        elevated: "border border-transparent shadow-md",
        // border only — flat, no shadow
        outlined: "border border-border shadow-none",
        // filled muted surface — no border, no shadow
        soft: "border border-transparent bg-muted/60 shadow-none",
      },
      hoverable: {
        true: "hover:-translate-y-1.5 hover:shadow-xl hover:border-border",
        false: "",
      },
      interactive: {
        true: "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]",
        false: "",
      },
    },
    defaultVariants: { variant: "elevated", hoverable: false, interactive: false },
  },
);

export type CardVariants = VariantProps<typeof cardVariants>;
