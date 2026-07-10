import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants, cn, type VariantProps } from "@bpdm/variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. an `<a>`) instead of a `<button>`. */
  asChild?: boolean;
  /** Show a spinner, mark the button `aria-busy`, and block interaction. */
  loading?: boolean;
  /** Screen-reader text announced while `loading` (i18n). Default "Loading". */
  loadingLabel?: string;
}

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      appearance,
      size,
      shape,
      asChild = false,
      loading = false,
      loadingLabel = "Loading",
      type,
      disabled,
      tabIndex,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLElement | null>(null);
    const setRef = React.useCallback(
      (node: HTMLElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node as HTMLButtonElement | null);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ref],
    );

    // catch icon-only buttons that ship without an accessible name (WCAG 4.1.2)
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      const iconOnly = typeof size === "string" && size.startsWith("icon");
      const named =
        el.getAttribute("aria-label") ||
        el.getAttribute("aria-labelledby") ||
        el.getAttribute("title") ||
        (el.textContent ?? "").trim();
      if (iconOnly && !named) {
        console.warn(
          "[bpdm/ui] Button: an icon-only size has no accessible name — pass `aria-label` describing the action.",
        );
      }
    }, [size]);

    const inactive = disabled || loading;
    const classes = cn(
      buttonVariants({ variant, appearance, size, shape }),
      loading && "pointer-events-none",
      className,
    );
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      onClick?.(e);
    };

    // asChild: Radix Slot requires a single child, so we can't inject a spinner —
    // convey busy/disabled via ARIA + pointer suppression and pass the child through.
    if (asChild) {
      return (
        <Slot
          ref={setRef}
          aria-busy={loading || undefined}
          aria-disabled={inactive || undefined}
          tabIndex={inactive ? -1 : tabIndex}
          onClick={handleClick as React.MouseEventHandler<HTMLElement>}
          className={cn(classes, inactive && "pointer-events-none opacity-50")}
          {...(props as React.HTMLAttributes<HTMLElement>)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={setRef}
        // default to "button" so a bare button never submits a surrounding <form>
        type={type ?? "button"}
        disabled={disabled}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        tabIndex={tabIndex}
        onClick={handleClick}
        className={classes}
        {...props}
      >
        {loading && <Spinner />}
        {loading && <span className="sr-only">{loadingLabel}</span>}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
