import { cva, type VariantProps } from "class-variance-authority";

/**
 * `cardVariants` — surface style (`elevated` / `outlined` / `soft`) plus optional
 * hover-lift and interactive (focusable, pressable) behaviour. Framework-agnostic:
 * the same classes drive the React (`@bpdm/ui`) and Angular (`@bpdm/ng`) cards.
 */
export const cardVariants = cva(
  // one smooth transition for every card motion (lift, press, border) — a soft
  // easeOut so things float rather than snap; willChange keeps it buttery
  "group/card relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card text-card-foreground no-underline transition-[transform,box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform]",
  {
    variants: {
      variant: {
        // floats off the page: a hairline edge (so the top never dissolves into a
        // light page) + a layered soft shadow (tight contact + wide ambient) for depth
        elevated:
          "border border-border/60 shadow-[0_1px_2px_rgba(15,17,21,0.05),0_10px_26px_-6px_rgba(15,17,21,0.14),0_2px_6px_-2px_rgba(15,17,21,0.08)]",
        // border only — flat, no shadow
        outlined: "border border-border shadow-none",
        // filled muted surface — no border, no shadow
        soft: "border border-transparent bg-muted/60 shadow-none",
      },
      hoverable: {
        // stronger lift + a fuller shadow + a crisper edge on hover
        true: "hover:-translate-y-1.5 hover:border-border hover:shadow-[0_2px_6px_rgba(15,17,21,0.08),0_22px_48px_-10px_rgba(15,17,21,0.22),0_6px_14px_-6px_rgba(15,17,21,0.12)]",
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
