import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { switchVariants, thumbVariants, type VariantProps } from "@bpdm/variants";
import { cn } from "@/lib/utils";

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
            aria-hidden
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
            aria-hidden
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
