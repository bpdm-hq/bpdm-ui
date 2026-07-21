import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cardVariants, type VariantProps } from "@bpdm/variants";
import { cn } from "@/lib/utils";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Render as the child element (e.g. an <a> for a fully-clickable card). */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant, hoverable, interactive, asChild = false, role, tabIndex, onKeyDown, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "div";
    // An `interactive` card renders hover/press affordances, so it must be a real,
    // keyboard-operable control — focusable (tabIndex=0), `role="button"`, and
    // Enter/Space activation. When `asChild`, the consumer's own <a>/<button> child
    // already carries the semantics, so we leave those untouched.
    const keyboardable = interactive && !asChild;
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!keyboardable || e.defaultPrevented) return;
      // only self-activate — never hijack Enter/Space aimed at a nested control
      if (e.target !== e.currentTarget) return;
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        e.currentTarget.click();
      }
    };
    return (
      <Comp
        ref={ref}
        role={keyboardable ? (role ?? "button") : role}
        tabIndex={keyboardable ? (tabIndex ?? 0) : tabIndex}
        onKeyDown={handleKeyDown}
        data-bpdm="" data-bpdm-slot="card"
        className={cn(cardVariants({ variant, hoverable, interactive }), className)}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

const ASPECT: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  auto: "",
};

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  /** Aspect ratio of the media band. Default "video" (16:9). */
  aspect?: keyof typeof ASPECT;
  /** Dark gradient scrim at the bottom (for text/badges placed over the media). */
  overlay?: boolean;
}

/** Edge-to-edge media band at the top of a card; the image zooms on card hover. */
export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt, aspect = "video", overlay = false, children, ...props }, ref) => (
    <div ref={ref} data-bpdm-slot="card-media" className={cn("relative overflow-hidden bg-muted", ASPECT[aspect], className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          className="size-full object-cover transition-transform duration-[500ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]"
        />
      ) : (
        children
      )}
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
      )}
    </div>
  ),
);
CardMedia.displayName = "CardMedia";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Right-aligned slot (icon button, badge, menu…). */
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, action, children, ...props }, ref) => (
    <div
      ref={ref}
      data-bpdm-slot="card-header"
      className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
      {action && <div data-bpdm-slot="card-action" className="shrink-0">{action}</div>}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level for the card title, for a correct document outline. Default `"h3"`. */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Tag = "h3", ...props }, ref) => (
    // `m-0` keeps the heading self-contained (no inherited host-page heading margin);
    // `as` lets you set the level so the card sits correctly in the document outline.
    <Tag
      ref={ref}
      data-bpdm-slot="card-title"
      className={cn("m-0 text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} data-bpdm-slot="card-description" className={cn("m-0 text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-bpdm-slot="card-content"
    className={cn("px-5 py-4 text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add a hairline divider above the footer. */
  divider?: boolean;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, divider = false, ...props }, ref) => (
    <div
      ref={ref}
      data-bpdm-slot="card-footer"
      className={cn(
        "mt-auto flex items-center gap-3 px-5 pb-5 pt-1",
        divider && "border-t border-border pt-4",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { cardVariants };
