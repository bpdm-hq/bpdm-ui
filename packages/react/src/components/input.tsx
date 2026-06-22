import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * `inputVariants` — size controls height/padding/font. Invalid styling is driven
 * by `aria-invalid="true"` (set it for error states), so it composes with native
 * validation and a11y. Disabled/file/placeholder states are in the base.
 */
const inputVariants = cva(
  "flex w-full text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:font-medium file:text-foreground",
  {
    variants: {
      variant: {
        // boxed field with a full border (default)
        outline:
          "rounded-[var(--radius)] border border-input bg-background shadow-sm focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
        // Material-style: only a bottom line, transparent background
        underline:
          "rounded-none border-0 border-b border-input bg-transparent focus-visible:border-b-ring aria-[invalid=true]:border-b-destructive",
      },
      size: {
        sm: "h-8 text-sm file:text-sm",
        md: "h-10 text-sm file:text-sm",
        lg: "h-12 text-base file:text-base",
      },
    },
    // horizontal padding only for the boxed (outline) variant
    compoundVariants: [
      { variant: "outline", size: "sm", class: "px-2.5" },
      { variant: "outline", size: "md", class: "px-3" },
      { variant: "outline", size: "lg", class: "px-4" },
    ],
    defaultVariants: { variant: "outline", size: "md" },
  },
);

export interface InputProps
  // omit the rarely-used native numeric `size` so we can expose our own
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  /** Icon/element rendered inside the field, leading edge. */
  startIcon?: React.ReactNode;
  /** Icon/element rendered inside the field, trailing edge. */
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, startIcon, endIcon, ...props }, ref) => {
    if (!startIcon && !endIcon) {
      return (
        <input
          ref={ref}
          className={cn(inputVariants({ variant, size }), className)}
          {...props}
        />
      );
    }

    // adornment layout: position icons absolutely, pad the input to clear them
    return (
      <div className="relative flex w-full items-center">
        {startIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-muted-foreground [&_svg]:size-4">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            inputVariants({ variant, size }),
            startIcon && "pl-9",
            endIcon && "pr-9",
            className,
          )}
          {...props}
        />
        {endIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-muted-foreground [&_svg]:size-4">
            {endIcon}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { inputVariants };
