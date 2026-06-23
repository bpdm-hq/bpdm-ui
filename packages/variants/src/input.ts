import { cva, type VariantProps } from "class-variance-authority";

/**
 * `inputVariants` — size controls height/padding/font; `variant` is the chrome
 * (boxed `outline` or Material-style `underline`). Invalid styling is driven by
 * `aria-invalid="true"`. Framework-agnostic: shared by the React and Angular inputs.
 */
export const inputVariants = cva(
  "flex w-full text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium file:text-foreground",
  {
    variants: {
      variant: {
        outline:
          "rounded-[var(--radius)] border border-input bg-background shadow-sm focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
        underline:
          "rounded-none border-0 border-b border-input bg-transparent focus-visible:border-b-ring aria-[invalid=true]:border-b-destructive",
      },
      size: {
        sm: "h-8 text-sm file:text-sm",
        md: "h-10 text-sm file:text-sm",
        lg: "h-12 text-base file:text-base",
      },
    },
    compoundVariants: [
      { variant: "outline", size: "sm", class: "px-2.5" },
      { variant: "outline", size: "md", class: "px-3" },
      { variant: "outline", size: "lg", class: "px-4" },
    ],
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export type InputVariants = VariantProps<typeof inputVariants>;
