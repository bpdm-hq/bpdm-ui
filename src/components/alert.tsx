import * as React from "react";
import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

const VARIANTS: Record<
  AlertVariant,
  { Icon: React.ComponentType<{ className?: string }> | null; fg: string; accent: string; tint: string }
> = {
  default: { Icon: Info, fg: "text-muted-foreground", accent: "before:bg-border", tint: "bg-muted" },
  info: {
    Icon: Info,
    fg: "text-info",
    accent: "before:bg-info",
    tint: "bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
  },
  success: {
    Icon: CircleCheck,
    fg: "text-success",
    accent: "before:bg-success",
    tint: "bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
  },
  warning: {
    Icon: TriangleAlert,
    fg: "text-warning",
    accent: "before:bg-warning",
    tint: "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  },
  error: {
    Icon: CircleX,
    fg: "text-destructive",
    accent: "before:bg-destructive",
    tint: "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)]",
  },
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
    const v = VARIANTS[variant];
    const showIcon = icon !== null && (icon !== undefined || v.Icon);
    const [closing, setClosing] = React.useState(false);

    const box = (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex w-full gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
          "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
          v.accent,
          className,
        )}
        {...props}
      >
        {showIcon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg animate-[bpdm-pop-in_220ms_ease-out]",
              v.tint,
            )}
          >
            {icon ?? (v.Icon ? <v.Icon className={cn("size-4", v.fg)} /> : null)}
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
