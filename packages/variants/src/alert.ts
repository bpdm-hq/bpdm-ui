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
    fg: "text-[var(--bpdm-muted-foreground)]",
    accent: "before:bg-[var(--bpdm-border)]",
    tint: "bg-[var(--bpdm-muted)]",
    soft: "bg-[var(--bpdm-muted)]/60 border-[var(--bpdm-border)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-muted)] text-[var(--bpdm-foreground)]",
    outline: "border-[var(--bpdm-border)]",
  },
  primary: {
    fg: "text-[var(--bpdm-primary-strong)]",
    accent: "before:bg-[var(--bpdm-primary)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-primary)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-primary)_10%,transparent)] border-[color-mix(in_srgb,var(--bpdm-primary)_28%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-primary)] text-[var(--bpdm-primary-foreground)]",
    outline: "border-[var(--bpdm-primary)]/50",
  },
  success: {
    fg: "text-[var(--bpdm-success-strong)]",
    accent: "before:bg-[var(--bpdm-success)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-success)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-success)_10%,transparent)] border-[color-mix(in_srgb,var(--bpdm-success)_28%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-success)] text-[var(--bpdm-success-foreground)]",
    outline: "border-[var(--bpdm-success)]/50",
  },
  info: {
    fg: "text-[var(--bpdm-info-strong)]",
    accent: "before:bg-[var(--bpdm-info)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-info)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-info)_10%,transparent)] border-[color-mix(in_srgb,var(--bpdm-info)_28%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-info)] text-[var(--bpdm-info-foreground)]",
    outline: "border-[var(--bpdm-info)]/50",
  },
  warning: {
    fg: "text-[var(--bpdm-warning-strong)]",
    accent: "before:bg-[var(--bpdm-warning)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-warning)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-warning)_12%,transparent)] border-[color-mix(in_srgb,var(--bpdm-warning)_32%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-warning)] text-[var(--bpdm-warning-foreground)]",
    outline: "border-[var(--bpdm-warning)]/50",
  },
  help: {
    fg: "text-[var(--bpdm-help-strong)]",
    accent: "before:bg-[var(--bpdm-help)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-help)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-help)_10%,transparent)] border-[color-mix(in_srgb,var(--bpdm-help)_28%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-help)] text-[var(--bpdm-help-foreground)]",
    outline: "border-[var(--bpdm-help)]/50",
  },
  error: {
    fg: "text-[var(--bpdm-destructive-strong)]",
    accent: "before:bg-[var(--bpdm-destructive)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-destructive)_16%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-destructive)_10%,transparent)] border-[color-mix(in_srgb,var(--bpdm-destructive)_28%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-destructive)] text-[var(--bpdm-destructive-foreground)]",
    outline: "border-[var(--bpdm-destructive)]/50",
  },
  contrast: {
    fg: "text-[var(--bpdm-foreground)]",
    accent: "before:bg-[var(--bpdm-foreground)]",
    tint: "bg-[color-mix(in_srgb,var(--bpdm-foreground)_12%,transparent)]",
    soft: "bg-[color-mix(in_srgb,var(--bpdm-foreground)_8%,transparent)] border-[color-mix(in_srgb,var(--bpdm-foreground)_24%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-foreground)] text-[var(--bpdm-background)]",
    outline: "border-[var(--bpdm-foreground)]/40",
  },
};
