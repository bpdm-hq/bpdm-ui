import { cva } from "class-variance-authority";

/**
 * Trigger styling shared by the multi-value dropdown fields (MultiSelect,
 * TreeSelect) — a `<div role="combobox">` that can grow to multiple lines of
 * chips, so it uses `min-h` + vertical padding and `data-[disabled]` /
 * `focus-visible` (single-value Select uses a native `<button>` and keeps its own
 * fixed-height variants).
 */
export const fieldTriggerVariants = cva(
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-input bg-background text-foreground shadow-sm transition-colors focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
  {
    variants: {
      size: {
        sm: "min-h-8 px-2 py-1 text-sm",
        md: "min-h-10 px-2.5 py-1.5 text-sm",
        lg: "min-h-12 px-3 py-2 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);
