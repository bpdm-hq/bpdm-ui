import * as React from "react";
import { textareaVariants, type VariantProps } from "@bpdm/variants";
import { cn } from "@/lib/utils";

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
