import { cva, type VariantProps } from "class-variance-authority";

/** Switch track styling (size + shape, checked/unchecked via data-state). */
export const switchVariants = cva(
  "group peer inline-flex shrink-0 cursor-pointer items-center border-2 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:border-muted-foreground/40 data-[state=unchecked]:bg-input data-[state=checked]:border-primary data-[state=checked]:bg-primary",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-[3.25rem]",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-md",
        sharp: "rounded-none",
      },
    },
    defaultVariants: { size: "md", shape: "pill" },
  },
);

/** Switch thumb styling — the size's translate-x drives the on/off slide. */
export const thumbVariants = cva(
  "pointer-events-none flex items-center justify-center bg-white shadow-lg ring-0 transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-overshoot)] data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        // RTL: the thumb slides to the other side — a negative translate wins in a
        // [dir=rtl] context (higher specificity), so the switch mirrors correctly.
        sm: "size-4 data-[state=checked]:translate-x-4 rtl:data-[state=checked]:-translate-x-4",
        md: "size-5 data-[state=checked]:translate-x-5 rtl:data-[state=checked]:-translate-x-5",
        lg: "size-6 data-[state=checked]:translate-x-[1.375rem] rtl:data-[state=checked]:-translate-x-[1.375rem]",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-[3px]",
        sharp: "rounded-none",
      },
    },
    defaultVariants: { size: "md", shape: "pill" },
  },
);

export type SwitchVariants = VariantProps<typeof switchVariants>;
