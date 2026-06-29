import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

/**
 * Optional app-level provider — wrap your app to share one `delayDuration`
 * across every tooltip. Not required: a standalone `<Tooltip>` works on its own.
 */
export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  /** What the tooltip shows. If empty/nullish, the child renders with no tooltip. */
  content: React.ReactNode;
  /** The trigger — a single focusable element (button, icon, link…). */
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Delay before opening, in ms. Default 200. */
  delayDuration?: number;
  /** Gap between trigger and tooltip, in px. Default 6. */
  sideOffset?: number;
  /** Hide the little arrow. */
  hideArrow?: boolean;
  /**
   * Turn the tooltip OFF: the trigger renders untouched and stays fully
   * interactive — nothing appears on hover/focus. This disables the *tooltip*,
   * not the trigger element. (To explain a disabled control, keep the tooltip
   * enabled and disable the child, e.g. `<Button disabled>`.)
   */
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Classes on the tooltip bubble. */
  className?: string;
}

/**
 * Hover/focus tooltip built on Radix — accessible (keyboard + screen reader),
 * portaled, and theme-aware. Zero-config: `<Tooltip content="Copy"><button/></Tooltip>`.
 * Wrap the app in `<TooltipProvider>` only if you want a shared open delay.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delayDuration = 200,
  sideOffset = 6,
  hideArrow = false,
  disabled = false,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: TooltipProps) {
  // portal into the nearest dialog (if any) so it isn't hidden by a modal's
  // scroll-lock / aria-hidden; outside a dialog this is null → defaults to <body>
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    setPortalContainer(triggerRef.current?.closest<HTMLElement>("[role='dialog']") ?? null);
  }, []);

  // nothing to show → render the trigger untouched
  if (disabled || content == null || content === "") return <>{children}</>;

  // A disabled control doesn't emit pointer/focus events, so the tooltip would
  // never open on it. When the trigger is disabled, wrap it in a focusable span
  // that receives those events (the child keeps pointer-events off) — so the
  // common "explain why this is disabled" tooltip works and stays keyboard-reachable.
  const childEl = React.isValidElement(children)
    ? (children as React.ReactElement<{ disabled?: boolean; className?: string; tabIndex?: number }>)
    : null;
  const trigger = childEl?.props.disabled ? (
    <span tabIndex={0} className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {React.cloneElement(childEl, {
        tabIndex: -1,
        className: cn(childEl.props.className, "pointer-events-none"),
      })}
    </span>
  ) : (
    children
  );

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild ref={triggerRef}>
          {trigger}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={portalContainer ?? undefined}>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              "z-50 max-w-xs rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg",
              "origin-[var(--radix-tooltip-content-transform-origin)] animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-pop-out_100ms_ease-in]",
              className,
            )}
          >
            {content}
            {!hideArrow && (
              // the arrow is a separate SVG and doesn't inherit the bubble's
              // box-shadow, so on a light surface it's only visible on the side
              // where the bubble's shadow happens to fall. A tight all-around
              // drop-shadow gives it the same lift on every side.
              <TooltipPrimitive.Arrow
                className="fill-popover [filter:drop-shadow(0_0_1.5px_rgb(0_0_0/0.22))]"
                width={12}
                height={6}
              />
            )}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
