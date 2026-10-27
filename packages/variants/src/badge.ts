import { cva, type VariantProps } from "class-variance-authority";

/** Badge color + appearance — framework-agnostic, shared by React and Angular. */
export type BadgeVariant =
  | "neutral"
  | "secondary"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "help"
  | "destructive"
  | "contrast";

export type BadgeAppearance = "soft" | "solid" | "outline" | "ghost";

/** The status-dot color per variant (independent of the label color). */
export const badgeDot: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--bpdm-muted-foreground)]",
  secondary: "bg-[var(--bpdm-muted-foreground)]",
  primary: "bg-[var(--bpdm-primary)]",
  success: "bg-[var(--bpdm-success)]",
  warning: "bg-[var(--bpdm-warning)]",
  info: "bg-[var(--bpdm-info)]",
  help: "bg-[var(--bpdm-help)]",
  destructive: "bg-[var(--bpdm-destructive)]",
  contrast: "bg-[var(--bpdm-foreground)]",
};

/** color × appearance — `soft` (tinted), `solid` (filled), `outline`. `ghost` is handled separately. */
export const badgeTone: Record<BadgeVariant, Record<"soft" | "solid" | "outline", string>> = {
  neutral: {
    soft: "border-transparent bg-[var(--bpdm-muted)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-foreground)] text-[var(--bpdm-background)]",
    outline: "border-[var(--bpdm-border)] text-[var(--bpdm-foreground)]",
  },
  secondary: {
    soft: "border-transparent bg-[var(--bpdm-secondary)] text-[var(--bpdm-secondary-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-foreground)] text-[var(--bpdm-background)]",
    outline: "border-[var(--bpdm-border)] text-[var(--bpdm-foreground)]",
  },
  help: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-help)_18%,transparent)] text-[var(--bpdm-help-strong)]",
    solid: "border-transparent bg-[var(--bpdm-help)] text-[var(--bpdm-help-foreground)]",
    outline: "border-[var(--bpdm-help)]/40 text-[var(--bpdm-help-strong)]",
  },
  contrast: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-foreground)_12%,transparent)] text-[var(--bpdm-foreground)]",
    solid: "border-transparent bg-[var(--bpdm-foreground)] text-[var(--bpdm-background)]",
    outline: "border-[var(--bpdm-foreground)]/40 text-[var(--bpdm-foreground)]",
  },
  primary: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-primary)_18%,transparent)] text-[var(--bpdm-primary-strong)]",
    solid: "border-transparent bg-[var(--bpdm-primary)] text-[var(--bpdm-primary-foreground)]",
    outline: "border-[var(--bpdm-primary)]/40 text-[var(--bpdm-primary-strong)]",
  },
  success: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-success)_18%,transparent)] text-[var(--bpdm-success-strong)]",
    solid: "border-transparent bg-[var(--bpdm-success)] text-[var(--bpdm-success-foreground)]",
    outline: "border-[var(--bpdm-success)]/40 text-[var(--bpdm-success-strong)]",
  },
  warning: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-warning)_18%,transparent)] text-[var(--bpdm-warning-strong)]",
    solid: "border-transparent bg-[var(--bpdm-warning)] text-[var(--bpdm-warning-foreground)]",
    outline: "border-[var(--bpdm-warning)]/40 text-[var(--bpdm-warning-strong)]",
  },
  info: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-info)_18%,transparent)] text-[var(--bpdm-info-strong)]",
    solid: "border-transparent bg-[var(--bpdm-info)] text-[var(--bpdm-info-foreground)]",
    outline: "border-[var(--bpdm-info)]/40 text-[var(--bpdm-info-strong)]",
  },
  destructive: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--bpdm-destructive)_18%,transparent)] text-[var(--bpdm-destructive-strong)]",
    solid: "border-transparent bg-[var(--bpdm-destructive)] text-[var(--bpdm-destructive-foreground)]",
    outline: "border-[var(--bpdm-destructive)]/40 text-[var(--bpdm-destructive-strong)]",
  },
};

/** Base shape + size (the tone is composed on top per variant × appearance). */
export const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border font-medium no-underline transition-[color,background-color,border-color,transform] duration-[var(--bpdm-duration-fast)] [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      size: {
        sm: "h-5 px-2 text-[0.6875rem]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;
