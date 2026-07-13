import { cva, type VariantProps } from "class-variance-authority";

/** Radio item (the circle) styling — size + checked via data-state. Shared by React & Angular. */
export const radioItemVariants = cva(
  "aspect-square shrink-0 cursor-pointer rounded-full border border-muted-foreground bg-background text-primary shadow-sm transition-[color,background-color,border-color,transform] duration-[var(--bpdm-duration-fast)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
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

export type RadioVariants = VariantProps<typeof radioItemVariants>;
