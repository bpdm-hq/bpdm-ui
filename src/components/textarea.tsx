import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex w-full rounded-[var(--radius)] border border-input bg-background text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
  {
    variants: {
      size: {
        sm: "min-h-16 px-2.5 py-1.5 text-sm",
        md: "min-h-20 px-3 py-2 text-sm",
        lg: "min-h-24 px-4 py-2.5 text-base",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        both: "resize",
      },
    },
    defaultVariants: { size: "md", resize: "vertical" },
  },
);

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "size">,
    VariantProps<typeof textareaVariants> {
  /** Grow to fit content (disables manual resize). */
  autoResize?: boolean;
  /** Show a character counter (pairs with `maxLength`). */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      size,
      resize,
      autoResize,
      showCount,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);
    const [count, setCount] = React.useState(
      String(value ?? defaultValue ?? "").length,
    );

    const adjust = React.useCallback(() => {
      const el = innerRef.current;
      if (!autoResize || !el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    React.useEffect(() => {
      adjust();
    }, [adjust]);
    React.useEffect(() => {
      if (value !== undefined) {
        setCount(String(value).length);
        adjust();
      }
    }, [value, adjust]);

    return (
      <div className="w-full">
        <textarea
          ref={innerRef}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={(e) => {
            setCount(e.target.value.length);
            adjust();
            onChange?.(e);
          }}
          className={cn(
            textareaVariants({ size, resize: autoResize ? "none" : resize }),
            className,
          )}
          {...props}
        />
        {showCount && (
          <div className="mt-1 text-right text-xs tabular-nums text-muted-foreground">
            {count}
            {maxLength != null ? ` / ${maxLength}` : ""}
          </div>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { textareaVariants };
