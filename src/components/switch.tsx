import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  // `group` lets the thumb icons react to checked state; unchecked border keeps
  // the off-state visible on dark backgrounds too.
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

const thumbVariants = cva(
  "pointer-events-none flex items-center justify-center bg-white shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-4 data-[state=checked]:translate-x-4",
        md: "size-5 data-[state=checked]:translate-x-5",
        lg: "size-6 data-[state=checked]:translate-x-[1.375rem]",
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

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  /** Show a ✓ / ✗ glyph inside the thumb. */
  icon?: boolean;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size, shape, icon = false, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(switchVariants({ size, shape }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={cn(thumbVariants({ size, shape }))}>
      {icon && (
        <>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="hidden size-[62%] text-primary group-data-[state=checked]:block"
          >
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="hidden size-[62%] text-muted-foreground group-data-[state=unchecked]:block"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </>
      )}
    </SwitchPrimitive.Thumb>
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { switchVariants };
