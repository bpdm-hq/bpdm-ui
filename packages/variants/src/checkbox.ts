import { cva, type VariantProps } from "class-variance-authority";

/** Checkbox box styling (size + checked/indeterminate via data-state) — shared by React & Angular. */
export const checkboxVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-muted-foreground/60 bg-background shadow-sm transition-[color,background-color,border-color,transform] duration-[var(--bpdm-duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
  {
    variants: {
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type CheckboxVariants = VariantProps<typeof checkboxVariants>;
