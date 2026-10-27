import { cva, type VariantProps } from "class-variance-authority";

/**
 * `buttonVariants` — two independent axes, like a mature design system:
 *   • `variant`   — the colour / severity (primary, success, danger, …)
 *   • `appearance` — the visual style (solid fill, outline, ghost)
 * plus `size` and `shape`. Every colour combines with every appearance via
 * compound variants, so adding a colour is ~3 lines (not N×M). Framework-agnostic:
 * the same class strings drive the React (`@bpdm/ui`) and Angular (`@bpdm/ng`)
 * buttons, so they stay pixel-identical.
 */
export const buttonVariants = cva(
  // Click feedback (a bpdm signature): a springy tactile press (scale + push-down,
  // baseline scale-100/translate-y-0 so it interpolates). The `bpdm-btn` marker
  // class also gets an amber "pulse ring" on click via @bpdm/tokens CSS (an
  // ::after that expands + fades on release, so even a quick click registers).
  "bpdm-btn relative inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium no-underline scale-100 translate-y-0 transition-[color,background-color,border-color,box-shadow,transform,scale,translate] duration-[var(--bpdm-duration-fast)] ease-[var(--bpdm-ease-overshoot)] active:scale-[0.95] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bpdm-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bpdm-background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // colour / severity only — appearance is a separate axis
      variant: {
        primary: "",
        secondary: "",
        success: "",
        info: "",
        warning: "",
        help: "",
        destructive: "",
        contrast: "",
      },
      // visual style — combines with every colour
      appearance: {
        solid: "",
        outline: "border",
        ghost: "",
      },
      size: {
        // text sizes (horizontal padding for label)
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        // icon-only sizes (square: equal height/width, no horizontal padding)
        iconSm: "h-8 w-8",
        icon: "h-10 w-10",
        iconLg: "h-12 w-12",
        // opt out of preset sizing entirely — bring your own h/w/padding via className
        none: "",
      },
      // shape owns the full border-radius (only ONE radius class is ever applied,
      // so there is no tailwind-merge conflict). `round` makes a square icon
      // button a circle, or a text button a pill.
      shape: {
        default: "rounded-[var(--bpdm-radius)]",
        round: "rounded-full",
      },
    },
    compoundVariants: [
      // solid (filled)
      { variant: "primary", appearance: "solid", class: "bg-[var(--bpdm-primary)] text-[var(--bpdm-primary-foreground)] hover:bg-[var(--bpdm-primary)]/90" },
      { variant: "secondary", appearance: "solid", class: "bg-[var(--bpdm-secondary)] text-[var(--bpdm-secondary-foreground)] hover:bg-[var(--bpdm-secondary)]/80" },
      { variant: "success", appearance: "solid", class: "bg-[var(--bpdm-success)] text-[var(--bpdm-success-foreground)] hover:bg-[var(--bpdm-success)]/90" },
      { variant: "info", appearance: "solid", class: "bg-[var(--bpdm-info)] text-[var(--bpdm-info-foreground)] hover:bg-[var(--bpdm-info)]/90" },
      { variant: "warning", appearance: "solid", class: "bg-[var(--bpdm-warning)] text-[var(--bpdm-warning-foreground)] hover:bg-[var(--bpdm-warning)]/90" },
      { variant: "help", appearance: "solid", class: "bg-[var(--bpdm-help)] text-[var(--bpdm-help-foreground)] hover:bg-[var(--bpdm-help)]/90" },
      { variant: "destructive", appearance: "solid", class: "bg-[var(--bpdm-destructive)] text-[var(--bpdm-destructive-foreground)] hover:bg-[var(--bpdm-destructive)]/90" },
      // high-contrast: flips to the theme's foreground (black on light, white on dark)
      { variant: "contrast", appearance: "solid", class: "bg-[var(--bpdm-foreground)] text-[var(--bpdm-background)] hover:bg-[var(--bpdm-foreground)]/90" },

      // outline (border, transparent fill) — secondary/contrast read as a neutral outline
      { variant: "primary", appearance: "outline", class: "border-[var(--bpdm-primary-strong)] text-[var(--bpdm-primary-strong)] hover:bg-[var(--bpdm-primary)]/10" },
      { variant: "secondary", appearance: "outline", class: "border-[var(--bpdm-input)] text-[var(--bpdm-foreground)] hover:bg-[var(--bpdm-muted)]" },
      { variant: "success", appearance: "outline", class: "border-[var(--bpdm-success)] text-[var(--bpdm-success)] hover:bg-[var(--bpdm-success)]/10" },
      { variant: "info", appearance: "outline", class: "border-[var(--bpdm-info)] text-[var(--bpdm-info)] hover:bg-[var(--bpdm-info)]/10" },
      { variant: "warning", appearance: "outline", class: "border-[var(--bpdm-warning)] text-[var(--bpdm-warning)] hover:bg-[var(--bpdm-warning)]/10" },
      { variant: "help", appearance: "outline", class: "border-[var(--bpdm-help)] text-[var(--bpdm-help)] hover:bg-[var(--bpdm-help)]/10" },
      { variant: "destructive", appearance: "outline", class: "border-[var(--bpdm-destructive)] text-[var(--bpdm-destructive-strong)] hover:bg-[var(--bpdm-destructive)]/10" },
      { variant: "contrast", appearance: "outline", class: "border-[var(--bpdm-foreground)]/40 text-[var(--bpdm-foreground)] hover:bg-[var(--bpdm-muted)]" },

      // ghost (no border, transparent fill) — secondary/contrast read as a neutral ghost
      { variant: "primary", appearance: "ghost", class: "text-[var(--bpdm-primary-strong)] hover:bg-[var(--bpdm-primary)]/10" },
      { variant: "secondary", appearance: "ghost", class: "text-[var(--bpdm-foreground)] hover:bg-[var(--bpdm-muted)]" },
      { variant: "success", appearance: "ghost", class: "text-[var(--bpdm-success)] hover:bg-[var(--bpdm-success)]/10" },
      { variant: "info", appearance: "ghost", class: "text-[var(--bpdm-info)] hover:bg-[var(--bpdm-info)]/10" },
      { variant: "warning", appearance: "ghost", class: "text-[var(--bpdm-warning)] hover:bg-[var(--bpdm-warning)]/10" },
      { variant: "help", appearance: "ghost", class: "text-[var(--bpdm-help)] hover:bg-[var(--bpdm-help)]/10" },
      { variant: "destructive", appearance: "ghost", class: "text-[var(--bpdm-destructive-strong)] hover:bg-[var(--bpdm-destructive)]/10" },
      { variant: "contrast", appearance: "ghost", class: "text-[var(--bpdm-foreground)] hover:bg-[var(--bpdm-muted)]" },
    ],
    defaultVariants: { variant: "primary", appearance: "solid", size: "md", shape: "default" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
