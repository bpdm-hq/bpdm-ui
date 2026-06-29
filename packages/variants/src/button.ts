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
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] ease-[var(--bpdm-ease-overshoot)] active:scale-[0.95] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
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
        default: "rounded-[var(--radius)]",
        round: "rounded-full",
      },
    },
    compoundVariants: [
      // ── solid (filled) ──
      { variant: "primary", appearance: "solid", class: "bg-primary text-primary-foreground hover:bg-primary/90" },
      { variant: "secondary", appearance: "solid", class: "bg-secondary text-secondary-foreground hover:bg-secondary/80" },
      { variant: "success", appearance: "solid", class: "bg-success text-success-foreground hover:bg-success/90" },
      { variant: "info", appearance: "solid", class: "bg-info text-info-foreground hover:bg-info/90" },
      { variant: "warning", appearance: "solid", class: "bg-warning text-warning-foreground hover:bg-warning/90" },
      { variant: "help", appearance: "solid", class: "bg-help text-help-foreground hover:bg-help/90" },
      { variant: "destructive", appearance: "solid", class: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
      // high-contrast: flips to the theme's foreground (black on light, white on dark)
      { variant: "contrast", appearance: "solid", class: "bg-foreground text-background hover:bg-foreground/90" },

      // ── outline (border, transparent fill) — secondary/contrast read as a neutral outline ──
      { variant: "primary", appearance: "outline", class: "border-primary text-primary hover:bg-primary/10" },
      { variant: "secondary", appearance: "outline", class: "border-input text-foreground hover:bg-muted" },
      { variant: "success", appearance: "outline", class: "border-success text-success hover:bg-success/10" },
      { variant: "info", appearance: "outline", class: "border-info text-info hover:bg-info/10" },
      { variant: "warning", appearance: "outline", class: "border-warning text-warning hover:bg-warning/10" },
      { variant: "help", appearance: "outline", class: "border-help text-help hover:bg-help/10" },
      { variant: "destructive", appearance: "outline", class: "border-destructive text-destructive hover:bg-destructive/10" },
      { variant: "contrast", appearance: "outline", class: "border-foreground/40 text-foreground hover:bg-muted" },

      // ── ghost (no border, transparent fill) — secondary/contrast read as a neutral ghost ──
      { variant: "primary", appearance: "ghost", class: "text-primary hover:bg-primary/10" },
      { variant: "secondary", appearance: "ghost", class: "text-foreground hover:bg-muted" },
      { variant: "success", appearance: "ghost", class: "text-success hover:bg-success/10" },
      { variant: "info", appearance: "ghost", class: "text-info hover:bg-info/10" },
      { variant: "warning", appearance: "ghost", class: "text-warning hover:bg-warning/10" },
      { variant: "help", appearance: "ghost", class: "text-help hover:bg-help/10" },
      { variant: "destructive", appearance: "ghost", class: "text-destructive hover:bg-destructive/10" },
      { variant: "contrast", appearance: "ghost", class: "text-foreground hover:bg-muted" },
    ],
    defaultVariants: { variant: "primary", appearance: "solid", size: "md", shape: "default" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
