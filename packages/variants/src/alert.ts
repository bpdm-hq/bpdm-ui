/**
 * Alert colour + appearance — framework-agnostic styling shared by React
 * (`@bpdm/ui`) and Angular (`@bpdm/ng`) so both render identically. Icons are
 * supplied per framework; the colours live here. Two axes:
 *   • `variant`    — the severity / colour
 *   • `appearance` — `soft` (tinted, default), `solid` (filled), `outline` (border)
 */
export type AlertVariant =
  | "default"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "help"
  | "error"
  | "contrast";

export type AlertAppearance = "soft" | "solid" | "outline";

export interface AlertTone {
  /** Leading-icon foreground colour (soft / outline). */
  fg: string;
  /** Left accent bar colour (a `before:` utility) — shown in `soft`. */
  accent: string;
  /** Icon-container tint background (soft / outline). */
  tint: string;
  /** Whole-surface tint + border when `appearance="soft"` — the inline-message
   *  look (distinct from the white floating Toast card). */
  soft: string;
  /** Box classes when `appearance="solid"` (filled bg + readable text). */
  solid: string;
  /** Box border colour when `appearance="outline"`. */
  outline: string;
}

export const alertTones: Record<AlertVariant, AlertTone> = {
  default: {
    fg: "text-muted-foreground",
    accent: "before:bg-border",
    tint: "bg-muted",
    soft: "bg-muted/60 border-border text-foreground",
    solid: "border-transparent bg-muted text-foreground",
    outline: "border-border",
  },
  primary: {
    fg: "text-primary",
    accent: "before:bg-primary",
    tint: "bg-[color-mix(in_srgb,var(--primary)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border-[color-mix(in_srgb,var(--primary)_28%,transparent)] text-foreground",
    solid: "border-transparent bg-primary text-primary-foreground",
    outline: "border-primary/50",
  },
  success: {
    fg: "text-success",
    accent: "before:bg-success",
    tint: "bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] border-[color-mix(in_srgb,var(--success)_28%,transparent)] text-foreground",
    solid: "border-transparent bg-success text-success-foreground",
    outline: "border-success/50",
  },
  info: {
    fg: "text-info",
    accent: "before:bg-info",
    tint: "bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--info)_10%,transparent)] border-[color-mix(in_srgb,var(--info)_28%,transparent)] text-foreground",
    solid: "border-transparent bg-info text-info-foreground",
    outline: "border-info/50",
  },
  warning: {
    fg: "text-warning",
    accent: "before:bg-warning",
    tint: "bg-[color-mix(in_srgb,var(--warning)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] border-[color-mix(in_srgb,var(--warning)_32%,transparent)] text-foreground",
    solid: "border-transparent bg-warning text-warning-foreground",
    outline: "border-warning/50",
  },
  help: {
    fg: "text-help",
    accent: "before:bg-help",
    tint: "bg-[color-mix(in_srgb,var(--help)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--help)_10%,transparent)] border-[color-mix(in_srgb,var(--help)_28%,transparent)] text-foreground",
    solid: "border-transparent bg-help text-help-foreground",
    outline: "border-help/50",
  },
  error: {
    fg: "text-destructive",
    accent: "before:bg-destructive",
    tint: "bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] border-[color-mix(in_srgb,var(--destructive)_28%,transparent)] text-foreground",
    solid: "border-transparent bg-destructive text-destructive-foreground",
    outline: "border-destructive/50",
  },
  contrast: {
    fg: "text-foreground",
    accent: "before:bg-foreground",
    tint: "bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] border-[color-mix(in_srgb,var(--foreground)_24%,transparent)] text-foreground",
    solid: "border-transparent bg-foreground text-background",
    outline: "border-foreground/40",
  },
};
