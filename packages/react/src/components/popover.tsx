import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

/** Close the popover from inside its content (wrap a button with `asChild`). */
export const PopoverClose = PopoverPrimitive.Close;

export interface PopoverProps {
  /** The trigger — a single focusable element (button, etc.). */
  trigger: React.ReactNode;
  /** Panel content. */
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Gap from the trigger, in px. Default 8. */
  sideOffset?: number;
  /** Fixed panel width, e.g. 280 or "20rem". Defaults to fit-content. */
  width?: number | string;
  /** Trap focus + block outside interaction (like a mini-modal). Default false. */
  modal?: boolean;
  /** Show a little arrow pointing at the trigger. Default false. */
  showArrow?: boolean;
  /** Draw a border around the panel. Default true; set false for a borderless panel. */
  bordered?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes on the panel — override padding, width, etc. */
  className?: string;
}

/**
 * Click-triggered floating panel built on Radix — accessible, portaled (escapes
 * `overflow: hidden`), collision-aware, and theme-aware. Low-config: pass a
 * `trigger` and the panel content as children. Use `PopoverClose` inside the
 * content to add a close/confirm button.
 */
export function Popover({
  trigger,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  width,
  modal = false,
  showArrow = false,
  bordered = true,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: PopoverProps) {
  // portal into the nearest dialog (if any) so the panel stays interactive
  // inside a modal; outside a dialog this is null → defaults to <body>
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalContainer(triggerRef.current?.closest<HTMLElement>("[role='dialog']") ?? null);
  }, []);

  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <PopoverPrimitive.Trigger asChild ref={triggerRef}>
        {trigger}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={portalContainer ?? undefined}>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          style={width !== undefined ? { width } : undefined}
          className={cn(
            "z-50 rounded-[var(--radius)] bg-popover p-4 text-popover-foreground shadow-lg outline-none",
            bordered && "border border-border",
            "origin-[var(--radix-popover-content-transform-origin)] data-[state=open]:animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in]",
            className,
          )}
        >
          {children}
          {showArrow && (
            // borderless panel + matching fill → the notch is seamless in every
            // theme (same approach as Tooltip)
            <PopoverPrimitive.Arrow
              className="fill-popover"
              width={12}
              height={6}
            />
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
