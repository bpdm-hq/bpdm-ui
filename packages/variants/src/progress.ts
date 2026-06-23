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
