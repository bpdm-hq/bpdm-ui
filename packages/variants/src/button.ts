import { cva, type VariantProps } from "class-variance-authority";

/**
 * `buttonVariants` — maps the `variant` + `size` + `shape` options to
 * token-based Tailwind classes. Framework-agnostic: the same class strings
 * drive the React (`@bpdm/ui`) and Angular (`@bpdm/ng`) buttons, so they stay
 * pixel-identical. The first string is the shared base; `variants` are the
 * options; `defaultVariants` apply when an option is omitted.
 */
export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] ease-[var(--bpdm-ease-overshoot)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        // text sizes (horizontal padding for label)
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        // icon-only sizes (square: equal height/width, no horizontal padding)
        iconSm: "h-8 w-8",
        icon: "h-10 w-10",
        iconLg: "h-12 w-12",
        // opt out of preset sizing entirely — bring your own h/w/padding via
        // className when you need a custom-sized button
        none: "",
      },
      // shape owns the full border-radius (only ONE radius class is ever applied,
      // so there is no tailwind-merge conflict). `round` makes a square icon
      // button a circle, or a text button a pill.
      shape: {
        default: "rounded-[var(--radius)]",
        round: "rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md", shape: "default" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
