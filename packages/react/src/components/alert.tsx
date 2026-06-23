import * as React from "react";
import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { alertTones, type AlertVariant } from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { AlertVariant };

// per-variant leading icon — the colors (fg / accent / tint) come from the
// shared `alertTones` so the React and Angular alerts match.
const ICONS: Record<AlertVariant, React.ComponentType<{ className?: string }> | null> = {
  default: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleX,
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  /** Bold heading line. */
  title?: React.ReactNode;
  /** Override the leading icon; pass `null` to hide it. */
  icon?: React.ReactNode | null;
  /** Show a close button and call this when clicked. */
  onClose?: () => void;
  /** Action buttons/links shown under the body. */
  action?: React.ReactNode;
}

/**
 * Inline, persistent alert — a colored left accent, a tinted icon, a title and
 * body, with optional actions and a dismiss button. Theme-aware across all four
 * themes. For transient notifications use `toast` / `<Toaster>` instead.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = "default", title, icon, onClose, action, className, children, ...props }, ref) => {
    const tone = alertTones[variant];
    const Icon = ICONS[variant];
    const showIcon = icon !== null && (icon !== undefined || Icon);
    const [closing, setClosing] = React.useState(false);

    const box = (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex w-full gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
          "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
          tone.accent,
          className,
        )}
        {...props}
      >
        {showIcon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg animate-[bpdm-pop-in_220ms_ease-out]",
              tone.tint,
            )}
          >
            {icon ?? (Icon ? <Icon className={cn("size-4", tone.fg)} /> : null)}
          </span>
        )}
        <div className={cn("min-w-0 flex-1", onClose && "pr-6")}>
          {title && <p className="text-sm font-semibold">{title}</p>}
          {children != null && (
            <div className={cn("text-sm text-muted-foreground", title && "mt-1")}>
              {children}
            </div>
          )}
          {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => setClosing(true)}
            aria-label="Dismiss"
            className="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
    );

    // not dismissible → render the box directly
    if (!onClose) return box;

    // dismissible → wrap so closing collapses height + fades (no layout snap)
    return (
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          closing ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
        onTransitionEnd={(e) => {
          if (closing && e.propertyName === "grid-template-rows") onClose();
        }}
      >
        <div className="min-h-0 overflow-hidden">{box}</div>
      </div>
    );
  },
);
Alert.displayName = "Alert";
