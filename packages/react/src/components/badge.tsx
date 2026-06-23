import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  badgeDot,
  badgeTone,
  badgeVariants,
  type BadgeAppearance,
  type BadgeVariant,
  type VariantProps,
} from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { BadgeVariant, BadgeAppearance };

// local aliases so the component body below reads the same as before
const DOT = badgeDot;
const TONE = badgeTone;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  variant?: BadgeVariant;
  appearance?: BadgeAppearance;
  /** Leading status dot, tinted to the variant. */
  dot?: boolean;
  /** Animate the dot with a pulse ring — for "live" / in-progress status. */
  pulse?: boolean;
  /** Show a remove button; the badge collapses + fades out, then calls this. */
  onRemove?: () => void;
  /** Render as the child element (e.g. an <a>) instead of a <span>. */
  asChild?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "neutral",
      appearance = "soft",
      size,
      dot = false,
      pulse = false,
      onRemove,
      asChild = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [removing, setRemoving] = React.useState(false);
    const interactive = asChild || !!onClick;
    const ghost = appearance === "ghost";
    // ghost = no chrome (transparent, no border/padding); else the tinted/solid/outline tone
    const toneClass = ghost
      ? "border-transparent bg-transparent text-foreground"
      : TONE[variant][appearance];
    const ghostClass = ghost && "h-auto gap-1.5 px-0 text-sm font-normal";

    // asChild path: style the child only (no dot/remove affordances)
    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(
            badgeVariants({ size }),
            toneClass,
            ghostClass,
            "cursor-pointer active:scale-[0.96]",
            className,
          )}
          onClick={onClick}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    const badge = (
      <span
        ref={ref}
        onClick={onClick}
        className={cn(
          badgeVariants({ size }),
          toneClass,
          ghostClass,
          interactive && "cursor-pointer active:scale-[0.96]",
          // dynamic chips pop in on mount
          onRemove && "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
          className,
        )}
        {...props}
      >
        {dot && (
          <span className="relative flex size-2 shrink-0">
            {pulse && (
              <span
                className={cn(
                  "absolute inset-0 rounded-full animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite]",
                  DOT[variant],
                )}
                aria-hidden
              />
            )}
            <span className={cn("size-2 rounded-full", DOT[variant])} />
          </span>
        )}
        {children}
        {onRemove && (
          <button
            type="button"
            aria-label="Remove"
            onClick={(e) => {
              e.stopPropagation();
              setRemoving(true);
            }}
            className="-mr-1 ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-current opacity-60 transition-[color,background-color,opacity] hover:bg-foreground/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-2.5" aria-hidden>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );

    if (!onRemove) return badge;

    // removable → collapse width + fade on remove, then fire onRemove
    return (
      <span
        className={cn(
          "inline-grid transition-all duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]",
          removing ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100",
        )}
        onTransitionEnd={(e) => {
          if (removing && e.propertyName === "grid-template-columns") onRemove();
        }}
      >
        <span className="min-w-0 overflow-hidden">{badge}</span>
      </span>
    );
  },
);
Badge.displayName = "Badge";

export interface NotificationBadgeProps {
  /** The element to overlay onto (an icon, an icon button, an avatar…). */
  children: React.ReactNode;
  /** Numeric count. Omit (with `dot`) for a plain indicator. */
  count?: number;
  /** Cap the displayed number, e.g. max=99 shows "99+". Default 99. */
  max?: number;
  /** Show a small dot instead of a number. */
  dot?: boolean;
  /** Still render when count is 0. Default false (0 hides the badge). */
  showZero?: boolean;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Overlays a count or dot on the corner of its child — the notification-style
 * indicator (a bell, an avatar, a button). The badge pops in on mount and
 * re-pops whenever the count changes.
 */
export function NotificationBadge({
  children,
  count,
  max = 99,
  dot = false,
  showZero = false,
  variant = "destructive",
  className,
}: NotificationBadgeProps) {
  const show = dot || (count !== undefined && (count > 0 || (count === 0 && showZero)));
  const label = dot
    ? null
    : count !== undefined
      ? count > max
        ? `${max}+`
        : String(count)
      : null;

  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {show && (
        // outer span owns the placement (center sits on the icon's top-right
        // corner via translate) so it never fights the inner pop animation. A
        // small dot is nudged inward so it hugs the glyph instead of floating in
        // the icon's corner whitespace (a count badge is wide enough already).
        <span
          className={cn(
            "pointer-events-none absolute z-10 -translate-y-1/2 translate-x-1/2",
            dot ? "right-1 top-1" : "right-0 top-0",
          )}
        >
          <span
            // re-pops when the number changes
            key={label ?? "dot"}
            className={cn(
              "flex items-center justify-center rounded-full font-semibold leading-none ring-2 ring-background animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]",
              TONE[variant].solid,
              dot ? "size-2.5" : "h-[1.125rem] min-w-[1.125rem] px-1 text-[0.625rem]",
            )}
          >
            {label}
          </span>
        </span>
      )}
    </span>
  );
}

export { badgeVariants };
