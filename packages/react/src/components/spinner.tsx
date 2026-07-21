import * as React from "react";
import { spinnerSize, type SpinnerSize, type SpinnerVariant } from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { SpinnerVariant, SpinnerSize };

// --- i18n ---
export interface SpinnerMessages {
  /** Visually-hidden accessible label announced to screen readers. */
  loading: string;
}

export const DEFAULT_SPINNER_MESSAGES: SpinnerMessages = { loading: "Loading" };

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  /** Accessible label (visually hidden). Overrides `messages.loading`. */
  label?: string;
  /** Override the translatable strings (currently just the loading label). */
  messages?: Partial<SpinnerMessages>;
  /**
   * Own a live region (`role="status"` + a visually-hidden label). Default true.
   * Set `false` when the spinner sits inside another live region (e.g. a
   * `LoadingOverlay`) so screen readers announce once, not twice.
   */
  announce?: boolean;
}

/**
 * Loading indicator in three looks — `ring` (spinning arc), `dots` (bouncing),
 * and `bars` (equalizer). Inherits the current text color (set `text-*` to
 * recolor), sizes xs–xl, and announces itself to screen readers.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ variant = "ring", size = "md", label, messages, announce = true, className, ...props }, ref) => {
    const s = spinnerSize[size];
    const t = React.useMemo(() => ({ ...DEFAULT_SPINNER_MESSAGES, ...messages }), [messages]);
    return (
      <span
        ref={ref}
        role={announce ? "status" : undefined}
        aria-live={announce ? "polite" : undefined}
        data-bpdm="" data-bpdm-slot="spinner"
        className={cn("inline-flex items-center justify-center text-primary", className)}
        {...props}
      >
        {variant === "ring" && (
          <span
            aria-hidden="true"
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
            aria-hidden="true"
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
            aria-hidden="true"
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
          <span aria-hidden="true" className={cn("inline-flex items-center", s.gap)}>
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
            aria-hidden="true"
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
          <span aria-hidden="true" className={cn("inline-flex items-end", s.gap)}>
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

        {announce && <span className="sr-only">{label ?? t.loading}</span>}
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
  /** Override the translatable strings (currently just the loading label). */
  messages?: Partial<SpinnerMessages>;
}

/**
 * Covers its nearest positioned ancestor (give that ancestor `relative`) — or the
 * whole viewport with `fullPage` — with a soft, blurred scrim and a centered
 * spinner. Use it page-level or scoped to a single card/section while it loads.
 */
export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { show = true, label, variant = "ring", size, fullPage = false, blur = true, messages, className, children, ...props },
    ref,
  ) => {
    const t = React.useMemo(() => ({ ...DEFAULT_SPINNER_MESSAGES, ...messages }), [messages]);
    if (!show) return null;
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        data-bpdm="" data-bpdm-slot="loading-overlay"
        className={cn(
          "z-50 flex flex-col items-center justify-center gap-3 bg-background/60 animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
          fullPage ? "fixed inset-0" : "absolute inset-0 rounded-[inherit]",
          blur && "backdrop-blur-sm",
          className,
        )}
        {...props}
      >
        {/* The overlay itself is the single live region, so the spinner doesn't
            announce (avoids a nested `role="status"` double-announce). The
            overlay owns the accessible text: the visible label, or an sr-only
            fallback when there's no visible message. */}
        <Spinner variant={variant} size={size ?? (fullPage ? "lg" : "md")} announce={false} />
        {label ? (
          <p data-bpdm-slot="loading-overlay-label" className="m-0 text-sm font-medium text-muted-foreground">{label}</p>
        ) : (
          <span className="sr-only">{t.loading}</span>
        )}
        {children}
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";
