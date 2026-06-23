import * as React from "react";
import { inputVariants, type VariantProps } from "@bpdm/variants";
import { cn } from "@/lib/utils";

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
