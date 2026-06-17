import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * `buttonVariants` — cva maps the `variant` + `size` props to token-based
 * Tailwind classes. The first string is the shared base; `variants` are the
 * options; `defaultVariants` apply when a prop is omitted.
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. an <a>) instead of a <button>. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
