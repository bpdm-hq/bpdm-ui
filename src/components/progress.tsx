import * as React from "react";
import { cn } from "@/lib/utils";

export type ProgressVariant = "primary" | "success" | "warning" | "destructive" | "info";
export type ProgressSize = "sm" | "md" | "lg";

const TRACK: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const FILL: Record<ProgressVariant, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

// readable text color on top of each fill color (for the inside-bar label)
const FILL_FG: Record<ProgressVariant, string> = {
  primary: "text-primary-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive-foreground",
  info: "text-info-foreground",
};

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current value (ignored when `indeterminate`). */
  value?: number;
  /** Max value. Default 100. */
  max?: number;
  /** No known value — an animated bar sweeps across. */
  indeterminate?: boolean;
  size?: ProgressSize;
  variant?: ProgressVariant;
  /** Show a label above the bar (defaults to the percentage). */
  showValue?: boolean;
  /** Where the value sits: "outside" (a row above) or "inside" the bar itself. */
  valuePosition?: "outside" | "inside";
  /** Custom label, e.g. `(v, max) => \`\${v}/\${max}\``. Implies `showValue`. */
  format?: (value: number, max: number) => React.ReactNode;
  /** Leading text shown opposite the value (e.g. "Uploading…"). */
  label?: React.ReactNode;
}

/**
 * Process indicator — determinate (drives `value`, the fill animates to width) or
 * `indeterminate` (a sweeping bar). Theme-aware, five colors, optional value/label
 * row, and accessible (`role="progressbar"` with aria-value*).
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value = 0,
      max = 100,
      indeterminate = false,
      size = "md",
      variant = "primary",
      showValue = false,
      valuePosition = "outside",
      format,
      label,
      className,
      ...props
    },
    ref,
  ) => {
    const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const inside = valuePosition === "inside" && !indeterminate;
    const hasHeader = !indeterminate && !inside && (showValue || !!format || !!label);
    const valueText = format ? format(value, max) : `${Math.round(pct)}%`;

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {hasHeader && (
          <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-muted-foreground">{label}</span>
            <span className="shrink-0 font-medium tabular-nums text-foreground">{valueText}</span>
          </div>
        )}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={indeterminate ? undefined : max}
          aria-valuenow={indeterminate ? undefined : Math.round(value)}
          aria-valuetext={indeterminate ? "Loading" : (typeof valueText === "string" ? valueText : `${Math.round(pct)}%`)}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-muted",
            inside ? "h-5" : TRACK[size],
          )}
        >
          {/* inside label, base layer — reads on the unfilled track */}
          {inside && (
            <span className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-[0.7rem] font-semibold tabular-nums text-muted-foreground">
              {valueText}
            </span>
          )}

          {indeterminate ? (
            <span
              className={cn(
                "absolute inset-y-0 left-0 w-2/5 overflow-hidden rounded-full animate-[bpdm-progress-indeterminate_1.4s_ease-in-out_infinite]",
                FILL[variant],
              )}
            >
              <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </span>
          ) : (
            <span
              className={cn(
                "relative z-[2] block h-full overflow-hidden rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.45,0,0.2,1)]",
                FILL[variant],
              )}
              style={{ width: `${pct}%` }}
            >
              {/* soft top gloss for a little depth */}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              {/* inside label, fill layer — clipped to the fill, sized to the whole
                  track so it stays centered; shows in the fill's foreground color */}
              {inside && pct > 0 && (
                <span
                  className={cn(
                    "pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center text-[0.7rem] font-semibold tabular-nums",
                    FILL_FG[variant],
                  )}
                  style={{ width: `${(100 / pct) * 100}%` }}
                >
                  {valueText}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";
