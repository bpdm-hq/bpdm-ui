import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "over" | "in" | "on";

export interface FloatLabelProps {
  label: string;
  /** id of the wrapped control; the label's htmlFor points here. */
  htmlFor?: string;
  /** over = floats above the field; in = top inside; on = notch on the border. */
  variant?: Variant;
  className?: string;
  /** A single input-like control (needs to be the label's previous sibling). */
  children: React.ReactElement<{
    id?: string;
    placeholder?: string;
    className?: string;
  }>;
}

// Resting (placeholder) state — same for every variant.
const resting =
  "pointer-events-none absolute left-3 z-10 origin-left text-muted-foreground transition-all duration-150 top-1/2 -translate-y-1/2 text-sm peer-focus:text-ring";

// Floated state — triggered on focus OR when the field is filled
// (:not(:placeholder-shown)). Classes are written out in full so Tailwind
// can detect them (no dynamic concatenation).
const floated: Record<Variant, string> = {
  over:
    "peer-focus:top-0 peer-focus:-translate-y-[135%] peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-[135%] peer-[:not(:placeholder-shown)]:text-xs",
  on:
    "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-background peer-focus:px-1 peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs",
  in:
    "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
};

/**
 * Floating label wrapper. Wrap a single input; the label sits as
 * a placeholder and floats up on focus or when filled. Drives entirely on CSS via
 * the `peer` + `:placeholder-shown` trick — the input gets `peer` and a blank
 * placeholder injected automatically.
 */
export function FloatLabel({
  label,
  htmlFor,
  variant = "over",
  className,
  children,
}: FloatLabelProps) {
  const id = htmlFor ?? children.props.id;
  const control = React.cloneElement(children, {
    id,
    placeholder: children.props.placeholder ?? " ",
    className: cn(
      "peer",
      variant === "in" && "pt-4",
      children.props.className,
    ),
  });

  return (
    <div className={cn("relative", className)}>
      {control}
      <label htmlFor={id} className={cn(resting, floated[variant])}>
        {label}
      </label>
    </div>
  );
}
