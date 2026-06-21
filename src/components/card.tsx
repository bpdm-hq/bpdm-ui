import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  // one smooth transition for every card motion (lift, press, border) — a soft
  // easeOut so things float rather than snap; willChange keeps it buttery
  "group/card relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card text-card-foreground transition-[transform,box-shadow,border-color] duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] [will-change:transform]",
  {
    variants: {
      variant: {
        // shadow only — floats off the page, no visible border
        elevated: "border border-transparent shadow-md",
        // border only — flat, no shadow
        outlined: "border border-border shadow-none",
        // filled muted surface — no border, no shadow
        soft: "border border-transparent bg-muted/60 shadow-none",
      },
      hoverable: {
        true: "hover:-translate-y-1.5 hover:shadow-xl hover:border-border",
        false: "",
      },
      interactive: {
        true: "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]",
        false: "",
      },
    },
    defaultVariants: { variant: "elevated", hoverable: false, interactive: false },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Render as the child element (e.g. an <a> for a fully-clickable card). */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
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
    <div ref={ref} className={cn("relative overflow-hidden bg-muted", ASPECT[aspect], className)} {...props}>
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
      className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
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
