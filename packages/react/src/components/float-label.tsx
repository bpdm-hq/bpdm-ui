import * as React from "react";
import {
  floatFloated,
  floatResting,
  type FloatLabelVariant as Variant,
} from "@bpdm/variants";
import { cn } from "@/lib/utils";

export interface FloatLabelProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  label: string;
  /** id of the wrapped control; the label's htmlFor points here. Auto-generated if omitted. */
  htmlFor?: string;
  /** over = floats above the field; in = top inside; on = notch on the border. */
  variant?: Variant;
  /** A single input-like control (needs to be the label's previous sibling). */
  children: React.ReactElement<{
    id?: string;
    placeholder?: string;
    className?: string;
  }>;
}

// local aliases so the component body reads the same as before
const resting = floatResting;
const floated = floatFloated;

/**
 * Floating label wrapper. Wrap a single input; the label sits as
 * a placeholder and floats up on focus or when filled. Drives entirely on CSS via
 * the `peer` + `:placeholder-shown` trick — the input gets `peer` and a blank
 * placeholder injected automatically.
 *
 * The label is always associated with the control: an id is taken from `htmlFor`,
 * else the child's own `id`, else a generated one — so `<label for>` never dangles.
 * Any extra props (`data-*`, `aria-*`, `style`, …) land on the wrapper.
 */
export function FloatLabel({
  label,
  htmlFor,
  variant = "over",
  className,
  children,
  ...rest
}: FloatLabelProps) {
  const generatedId = React.useId();
  const id = htmlFor ?? children.props.id ?? generatedId;
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
    <div data-bpdm="" data-bpdm-slot="float-label" className={cn("relative", className)} {...rest}>
      {control}
      <label htmlFor={id} data-bpdm-slot="float-label-label" className={cn(resting, floated[variant])}>
        {label}
      </label>
    </div>
  );
}
