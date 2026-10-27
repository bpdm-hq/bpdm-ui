import { cva, type VariantProps } from "class-variance-authority";

/** Textarea size + resize classes — framework-agnostic, shared by React and Angular. */
export const textareaVariants = cva(
  "flex w-full rounded-[var(--bpdm-radius)] border border-[var(--bpdm-input)] bg-[var(--bpdm-background)] text-[var(--bpdm-foreground)] shadow-sm transition-colors placeholder:text-[var(--bpdm-muted-foreground)] focus-visible:border-[var(--bpdm-ring)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bpdm-ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--bpdm-destructive)] aria-[invalid=true]:focus-visible:ring-[var(--bpdm-destructive)]",
  {
    variants: {
      size: {
        sm: "min-h-16 px-2.5 py-1.5 text-sm",
        md: "min-h-20 px-3 py-2 text-sm",
        lg: "min-h-24 px-4 py-2.5 text-base",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: { size: "md", resize: "vertical" },
  },
);

export type TextareaVariants = VariantProps<typeof textareaVariants>;
