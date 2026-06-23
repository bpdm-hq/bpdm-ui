/**
 * Alert tone classes per variant — the framework-agnostic styling (leading-icon
 * color, left accent bar, icon tint). Icons themselves are supplied per framework
 * (lucide-react in `@bpdm/ui`, inline SVG in `@bpdm/ng`), but the colors are
 * shared so both render identically.
 */
export type AlertVariant = "default" | "info" | "success" | "warning" | "error";

export interface AlertTone {
  /** Leading-icon foreground color class. */
  fg: string;
  /** Left accent bar color (a `before:` utility). */
  accent: string;
  /** Icon container tint background class. */
  tint: string;
}

export const alertTones: Record<AlertVariant, AlertTone> = {
  default: { fg: "text-muted-foreground", accent: "before:bg-border", tint: "bg-muted" },
  info: {
    fg: "text-info",
    accent: "before:bg-info",
    tint: "bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
  },
  success: {
    fg: "text-success",
    accent: "before:bg-success",
    tint: "bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
  },
  warning: {
    fg: "text-warning",
    accent: "before:bg-warning",
    tint: "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
  },
  error: {
    fg: "text-destructive",
    accent: "before:bg-destructive",
    tint: "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)]",
  },
};
