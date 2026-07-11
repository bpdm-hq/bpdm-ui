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
  neutral: "bg-muted-foreground",
  secondary: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  help: "bg-help",
  destructive: "bg-destructive",
  contrast: "bg-foreground",
};

/** color × appearance — `soft` (tinted), `solid` (filled), `outline`. `ghost` is handled separately. */
export const badgeTone: Record<BadgeVariant, Record<"soft" | "solid" | "outline", string>> = {
  neutral: {
    soft: "border-transparent bg-muted text-foreground",
    solid: "border-transparent bg-foreground text-background",
    outline: "border-border text-foreground",
  },
  secondary: {
    soft: "border-transparent bg-secondary text-secondary-foreground",
    solid: "border-transparent bg-foreground text-background",
    outline: "border-border text-foreground",
  },
  help: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--help)_18%,transparent)] text-help",
    solid: "border-transparent bg-help text-help-foreground",
    outline: "border-help/40 text-help",
  },
  contrast: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)] text-foreground",
    solid: "border-transparent bg-foreground text-background",
    outline: "border-foreground/40 text-foreground",
  },
  primary: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-primary",
    solid: "border-transparent bg-primary text-primary-foreground",
    outline: "border-primary/40 text-primary",
  },
  success: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--success)_18%,transparent)] text-success",
    solid: "border-transparent bg-success text-success-foreground",
    outline: "border-success/40 text-success",
  },
  warning: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-warning",
    solid: "border-transparent bg-warning text-warning-foreground",
    outline: "border-warning/40 text-warning",
  },
  info: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--info)_18%,transparent)] text-info",
    solid: "border-transparent bg-info text-info-foreground",
    outline: "border-info/40 text-info",
  },
  destructive: {
    soft: "border-transparent bg-[color-mix(in_srgb,var(--destructive)_18%,transparent)] text-destructive",
    solid: "border-transparent bg-destructive text-destructive-foreground",
    outline: "border-destructive/40 text-destructive",
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
