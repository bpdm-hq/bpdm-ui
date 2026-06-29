import * as React from "react";
import {
  CircleCheck,
  CircleHelp,
  CircleX,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import { type AlertAppearance, alertTones, type AlertVariant } from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { AlertVariant, AlertAppearance };

// per-variant leading icon — the colors (fg / accent / tint / solid / outline)
// come from the shared `alertTones` so the React and Angular alerts match.
const ICONS: Record<AlertVariant, React.ComponentType<{ className?: string }> | null> = {
  default: Info,
  primary: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  help: CircleHelp,
  error: CircleX,
  contrast: Info,
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  /** Visual style — `soft` (tinted, default), `solid` (filled), `outline` (border). */
  appearance?: AlertAppearance;
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
 * Inline, persistent alert — a severity-tinted surface, an inline icon, a title
 * and body, with optional actions and a dismiss button. Three appearances
 * (`soft` / `solid` / `outline`) × the full severity palette. Theme-aware.
 * For transient notifications use `toast` / `<Toaster>` instead.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { variant = "default", appearance = "soft", title, icon, onClose, action, className, children, ...props },
    ref,
  ) => {
    const tone = alertTones[variant];
    const Icon = ICONS[variant];
    const showIcon = icon !== null && (icon !== undefined || Icon);
    const [closing, setClosing] = React.useState(false);
    const solid = appearance === "solid";
    const soft = appearance === "soft";

    const box = (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4",
          // soft = tinted inline-message surface (distinct from the white floating Toast)
          soft && tone.soft,
          appearance === "outline" && cn("bg-card text-card-foreground shadow-sm", tone.outline),
          solid && tone.solid,
          className,
        )}
        {...props}
      >
        {showIcon &&
          (soft ? (
            // inline coloured icon (no tinted box) — the inline-message look; the
            // size-5 icon matches the title's line height, so it reads aligned.
            <span className={cn("flex shrink-0 items-center [&>svg]:size-5", tone.fg)}>
              {icon ?? (Icon ? <Icon className="size-5" /> : null)}
            </span>
          ) : (
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg animate-[bpdm-pop-in_220ms_ease-out]",
                solid ? "bg-white/15" : tone.tint,
              )}
            >
              {icon ?? (Icon ? <Icon className={cn("size-4", !solid && tone.fg)} /> : null)}
            </span>
          ))}
        <div className={cn("min-w-0 flex-1", onClose && "pr-6")}>
          {title && <p className="text-sm font-semibold">{title}</p>}
          {children != null && (
            <div className={cn("text-sm", solid ? "text-current/90" : "text-muted-foreground", title && "mt-1")}>
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
            className={cn(
              "absolute right-2.5 top-2.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              solid
                ? "text-current/70 hover:bg-white/15 hover:text-current"
                : "text-muted-foreground/70 hover:bg-muted hover:text-foreground",
            )}
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
