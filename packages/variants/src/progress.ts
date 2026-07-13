/**
 * Progress bar tone/size classes — framework-agnostic, shared by the React and
 * Angular progress bars so both render identically.
 */
export type ProgressVariant = "primary" | "success" | "warning" | "destructive" | "info";
export type ProgressSize = "sm" | "md" | "lg";

/** Track height per size. */
export const progressTrack: Record<ProgressSize, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

/** Fill color per variant. */
export const progressFill: Record<ProgressVariant, string> = {
  // amber brand fill. The bar's VALUE is conveyed by fill length (a non-color
  // positional cue) + role="progressbar" aria-valuenow + the optional visible
  // value/label, so per 1.4.11 the amber-vs-track luminance boundary is redundant.
  // (A ≥3:1 fill/track edge is geometrically impossible with a bright amber fill on
  // any acceptably-light track — amber vs white caps at ~1.9:1 — so we keep the
  // brand fill rather than reintroduce a second gold or an off-brand grey rim.)
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

/** Readable text color on top of each fill (for the inside-bar label). */
export const progressFillFg: Record<ProgressVariant, string> = {
  primary: "text-primary-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive-foreground",
  info: "text-info-foreground",
};
