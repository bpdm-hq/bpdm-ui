import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  DialogOverlay,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { OverlayClose as XIcon } from "./internal/overlay-icons";

// --- i18n ---
export interface DrawerMessages {
  /** Close button aria-label. */
  close: string;
  /** Fallback screen-reader title when no `title` is set. */
  drawerLabel: string;
}

export const DEFAULT_DRAWER_MESSAGES: DrawerMessages = { close: "Close", drawerLabel: "Drawer" };

// re-export the shared pieces so a Drawer can be composed too
export const DrawerRoot = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;
export { DialogHeader as DrawerHeader, DialogFooter as DrawerFooter, DialogTitle as DrawerTitle, DialogDescription as DrawerDescription };

type Side = "left" | "right" | "top" | "bottom";
type Size = "sm" | "md" | "lg" | "xl" | "full";

const drawerVariants = cva(
  "fixed z-50 flex flex-col bg-popover text-popover-foreground shadow-xl outline-none",
  {
    variants: {
      side: {
        right:
          "right-0 top-0 h-full border-l border-border data-[state=open]:animate-[bpdm-slide-in-right_var(--bpdm-duration-slow)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-slide-out-right_var(--bpdm-duration-base)_ease-in]",
        left: "left-0 top-0 h-full border-r border-border data-[state=open]:animate-[bpdm-slide-in-left_var(--bpdm-duration-slow)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-slide-out-left_var(--bpdm-duration-base)_ease-in]",
        top: "left-0 top-0 w-full border-b border-border data-[state=open]:animate-[bpdm-slide-in-top_var(--bpdm-duration-slow)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-slide-out-top_var(--bpdm-duration-base)_ease-in]",
        bottom:
          "left-0 bottom-0 w-full border-t border-border data-[state=open]:animate-[bpdm-slide-in-bottom_var(--bpdm-duration-slow)_var(--bpdm-ease-out)] data-[state=closed]:animate-[bpdm-slide-out-bottom_var(--bpdm-duration-base)_ease-in]",
      },
    },
    defaultVariants: { side: "right" },
  },
);

function sizeClass(side: Side, size: Size) {
  if (side === "left" || side === "right") {
    return {
      sm: "w-80",
      md: "w-96",
      lg: "w-[32rem]",
      xl: "w-[40rem]",
      full: "w-screen",
    }[size];
  }
  return {
    sm: "h-1/3",
    md: "h-1/2",
    lg: "h-2/3",
    xl: "h-5/6",
    full: "h-screen",
  }[size];
}

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerVariants> {
  size?: Size;
  showClose?: boolean;
  /** aria-label for the close button. Default "Close". */
  closeLabel?: string;
}

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(
  (
    { className, side = "right", size = "md", showClose = true, closeLabel = "Close", children, ...props },
    ref,
  ) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-bpdm="" data-bpdm-slot="drawer-content"
      className={cn(drawerVariants({ side }), sizeClass(side ?? "right", size), className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          aria-label={closeLabel}
          data-bpdm-slot="drawer-close"
          className="absolute end-3 top-3 grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
  ),
);
DrawerContent.displayName = "DrawerContent";

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the drawer (omit when controlling `open`). */
  trigger?: React.ReactNode;
  /** Edge to slide in from. Default "right". */
  side?: Side;
  /** Panel size — width for left/right, height for top/bottom. Default "md". */
  size?: Size;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  showClose?: boolean;
  /** Screen-reader strings (close button label, fallback title). */
  messages?: Partial<DrawerMessages>;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Slide-in panel ("sheet") built on Radix Dialog — focus trap, scroll lock, ESC +
 * outside-click to close, full ARIA. Low-config: pass `trigger`, `side`, `title`,
 * body and `footer`. For full control compose `DrawerRoot` / `DrawerContent`.
 * Theme-aware, portaled, slide-animated per edge.
 */
export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  side = "right",
  size = "md",
  title,
  description,
  footer,
  showClose = true,
  messages,
  children,
  className,
}: DrawerProps) {
  const t = React.useMemo(() => ({ ...DEFAULT_DRAWER_MESSAGES, ...messages }), [messages]);
  return (
    <DrawerRoot open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger data-bpdm="" data-bpdm-slot="drawer-trigger" asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        side={side}
        size={size}
        showClose={showClose}
        closeLabel={t.close}
        className={className}
      >
        <DialogHeader>
          {title ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            // a11y: Radix requires a title — provide a hidden one if none given
            <DialogTitle className="sr-only">{t.drawerLabel}</DialogTitle>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">{children}</div>}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DrawerContent>
    </DrawerRoot>
  );
}
