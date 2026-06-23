import * as React from "react";
import { spinnerSize, type SpinnerSize, type SpinnerVariant } from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { SpinnerVariant, SpinnerSize };

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  /** Accessible label (visually hidden). Default "Loading". */
  label?: string;
}

/**
 * Loading indicator in three looks — `ring` (spinning arc), `dots` (bouncing),
 * and `bars` (equalizer). Inherits the current text color (set `text-*` to
 * recolor), sizes xs–xl, and announces itself to screen readers.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ variant = "ring", size = "md", label = "Loading", className, ...props }, ref) => {
    const s = spinnerSize[size];
    return (
      <span
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn("inline-flex items-center justify-center text-primary", className)}
        {...props}
      >
        {variant === "ring" && (
          <span
            className={cn(
              "inline-block animate-spin rounded-full border-current/25 border-t-current",
              s.ring,
              s.border,
            )}
          />
        )}

        {variant === "gradient" && (
          // a conic-gradient "comet" ring with a fading tail, masked to a ring
          <span
            className={cn("inline-block animate-spin rounded-full", s.ring)}
            style={{
              background: "conic-gradient(from 90deg, transparent 5%, currentColor)",
              WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${s.thickness}), #000 calc(100% - ${s.thickness}))`,
              mask: `radial-gradient(farthest-side, transparent calc(100% - ${s.thickness}), #000 calc(100% - ${s.thickness}))`,
            }}
          />
        )}

        {variant === "square" && (
          // rotating gradient border on a rounded square (gradient shows only on
          // the border via mask-composite)
          <span
            className={cn("inline-block animate-spin rounded-[28%]", s.ring)}
            style={{
              padding: s.thickness,
              background: "conic-gradient(from 90deg, transparent 5%, currentColor)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        )}

        {variant === "dots" && (
          <span className={cn("inline-flex items-center", s.gap)}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "inline-block rounded-full bg-current animate-[bpdm-dot-bounce_1.1s_ease-in-out_infinite]",
                  s.dot,
                )}
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        )}

        {variant === "flip" && (
          // a glossy squircle flipping on X then Y (3D) — the sheen gradient makes
          // it catch the light as it turns
          <span
            className={cn(
              "inline-block rounded-[32%] shadow-sm animate-[bpdm-flip_1.2s_ease-in-out_infinite]",
              s.ring,
            )}
            style={{
              background:
                "linear-gradient(135deg, currentColor, color-mix(in srgb, currentColor 45%, transparent))",
            }}
          />
        )}

        {variant === "bars" && (
          <span className={cn("inline-flex items-end", s.gap)}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "inline-block origin-bottom rounded-full bg-current animate-[bpdm-bar_1s_ease-in-out_infinite]",
                  s.bar,
                )}
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        )}

        <span className="sr-only">{label}</span>
      </span>
    );
  },
);
Spinner.displayName = "Spinner";

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the overlay. Default true. */
  show?: boolean;
  /** Visible message under the spinner. */
  label?: string;
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  /** Cover the whole viewport instead of the nearest positioned ancestor. */
  fullPage?: boolean;
  /** Blur the content behind the overlay. Default true. */
  blur?: boolean;
}

/**
 * Covers its nearest positioned ancestor (give that ancestor `relative`) — or the
 * whole viewport with `fullPage` — with a soft, blurred scrim and a centered
 * spinner. Use it page-level or scoped to a single card/section while it loads.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { show = true, label, variant = "ring", size, fullPage = false, blur = true, className, children, ...props },
    ref,
  ) => {
    if (!show) return null;
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          "z-50 flex flex-col items-center justify-center gap-3 bg-background/60 animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
          fullPage ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
          blur && "backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        <Spinner variant={variant} size={size ?? (fullPage ? "lg" : "md")} label={label ?? "Loading"} />
        {label && <p className="text-sm font-medium text-muted-foreground">{label}</p>}
        {children}
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";
