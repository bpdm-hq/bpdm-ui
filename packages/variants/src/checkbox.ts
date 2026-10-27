import { cva, type VariantProps } from "class-variance-authority";

/** Checkbox box styling (size + checked/indeterminate via data-state) — shared by React & Angular. */
export const checkboxVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-[var(--bpdm-muted-foreground)] bg-[var(--bpdm-background)] shadow-sm transition-[color,background-color,border-color,transform] duration-[var(--bpdm-duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bpdm-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bpdm-background)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--bpdm-primary)] data-[state=checked]:bg-[var(--bpdm-primary)] data-[state=checked]:text-[var(--bpdm-primary-foreground)] data-[state=indeterminate]:border-[var(--bpdm-primary)] data-[state=indeterminate]:bg-[var(--bpdm-primary)] data-[state=indeterminate]:text-[var(--bpdm-primary-foreground)] aria-[invalid=true]:border-[var(--bpdm-destructive)] aria-[invalid=true]:focus-visible:ring-[var(--bpdm-destructive)]",
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
