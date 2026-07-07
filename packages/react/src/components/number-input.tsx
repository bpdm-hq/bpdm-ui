import * as React from "react";
import BigNumber from "bignumber.js";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type ButtonLayout = "stacked" | "horizontal";
type Numeric = string | number;

export interface NumberInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "value" | "defaultValue" | "onChange" | "size" | "prefix" | "min" | "max" | "step"
  > {
  /** Value as a string to preserve precision (numbers also accepted). */
  value?: Numeric;
  defaultValue?: Numeric;
  min?: Numeric;
  max?: Numeric;
  step?: Numeric;
  size?: Size;
  /** "stacked" = up/down chevrons on the right; "horizontal" = −/+ on each side. */
  buttonLayout?: ButtonLayout;
  /** Static text shown before the value, e.g. "$". */
  prefix?: string;
  /** Static text shown after the value, e.g. "kg". */
  suffix?: string;
  /** Called with the (string) value on every change — never loses precision. */
  onValueChange?: (value: string) => void;
  /** Override the stepper button labels (screen-reader text) for i18n. */
  messages?: { increase?: string; decrease?: string };
}

const DEFAULT_MESSAGES = { increase: "Increase", decrease: "Decrease" };

const dims: Record<Size, { h: string; btn: string; text: string }> = {
  sm: { h: "h-8", btn: "w-8", text: "text-sm" },
  md: { h: "h-10", btn: "w-10", text: "text-sm" },
  lg: { h: "h-12", btn: "w-12", text: "text-base" },
};

const Glyph = {
  minus: "M3 7h8",
  plus: "M7 3v8M3 7h8",
  up: "M3.5 8.5 7 5l3.5 3.5",
  down: "M3.5 5.5 7 9l3.5-3.5",
} as const;

function Icon({ d }: { d: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A single stepper button. Adds a short (~160ms) press "flash" (amber + squish)
 * so a quick click gives clear visual feedback — `active:` alone is too brief.
 */
function StepButton({
  onTrigger,
  disabled,
  label,
  path,
  className,
}: {
  onTrigger: () => void;
  disabled?: boolean;
  label: string;
  path: string;
  className?: string;
}) {
  const [pressed, setPressed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        onTrigger();
        setPressed(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setPressed(false), 160);
      }}
      className={cn(
        "flex cursor-pointer select-none items-center justify-center text-foreground transition-transform duration-100 hover:bg-muted active:scale-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        pressed && "scale-90",
        className,
      )}
    >
      <Icon d={path} />
    </button>
  );
}

// allow empty / partial entries ("", "-", "1.", "1.0") while typing
const partial = /^-?\d*\.?\d*$/;

/**
 * Number input with stepper buttons. **Precision-safe**: values
 * are strings and all arithmetic uses bignumber.js, so very large quantities and
 * high-decimal measurements never lose precision (unlike JS `number`). Controlled
 * (`value` + `onValueChange`) or uncontrolled (`defaultValue`); clamps to min/max.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      value,
      defaultValue = "0",
      min,
      max,
      step = 1,
      size = "md",
      buttonLayout = "stacked",
      prefix,
      suffix,
      disabled,
      onValueChange,
      messages,
      ...props
    },
    ref,
  ) => {
    const t = { ...DEFAULT_MESSAGES, ...messages };
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(String(defaultValue));
    const current = isControlled ? String(value) : internal;

    // clamp + normalize a string value (no exponential notation for big numbers)
    const clamp = (s: string): string => {
      if (s === "" || s === "-" || s === ".") return "0";
      const bn = new BigNumber(s);
      if (bn.isNaN()) return "0";
      if (min !== undefined && bn.isLessThan(min)) return new BigNumber(min).toFixed();
      if (max !== undefined && bn.isGreaterThan(max)) return new BigNumber(max).toFixed();
      return bn.toFixed();
    };

    const setRaw = (s: string) => {
      if (!isControlled) setInternal(s);
      onValueChange?.(s);
    };
    const commit = (s: string) => setRaw(clamp(s));

    const base = new BigNumber(current === "" || current === "-" ? "0" : current);
    const safeBase = base.isNaN() ? new BigNumber(0) : base;
    const dec = () => commit(safeBase.minus(step).toFixed());
    const inc = () => commit(safeBase.plus(step).toFixed());

    const d = dims[size];
    const atMin =
      min !== undefined && !base.isNaN() && safeBase.isLessThanOrEqualTo(min);
    const atMax =
      max !== undefined && !base.isNaN() && safeBase.isGreaterThanOrEqualTo(max);

    const field = (
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1 px-3",
          buttonLayout === "horizontal" ? "justify-center" : "",
        )}
      >
        {prefix && (
          <span className="shrink-0 text-muted-foreground">{prefix}</span>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={current}
          disabled={disabled}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" || partial.test(raw)) setRaw(raw);
          }}
          onBlur={() => commit(current)}
          className={cn(
            "w-full min-w-0 border-0 bg-transparent text-foreground tabular-nums focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            buttonLayout === "horizontal" ? "text-center" : "text-start",
            d.text,
          )}
          {...props}
        />
        {suffix && (
          <span className="shrink-0 text-muted-foreground">{suffix}</span>
        )}
      </div>
    );

    return (
      <div
        key={buttonLayout}
        role="group"
        className={cn(
          "inline-flex items-stretch overflow-hidden rounded-[var(--radius)] border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          d.h,
          className,
        )}
      >
        {buttonLayout === "horizontal" && (
          <StepButton
            label={t.decrease}
            path={Glyph.minus}
            disabled={disabled || atMin}
            onTrigger={dec}
            className={cn(d.btn, "border-r border-input")}
          />
        )}

        {field}

        {buttonLayout === "horizontal" ? (
          <StepButton
            label={t.increase}
            path={Glyph.plus}
            disabled={disabled || atMax}
            onTrigger={inc}
            className={cn(d.btn, "border-l border-input")}
          />
        ) : (
          <div className="flex w-7 flex-col border-l border-input">
            <StepButton
              label={t.increase}
              path={Glyph.up}
              disabled={disabled || atMax}
              onTrigger={inc}
              className="flex-1"
            />
            <StepButton
              label={t.decrease}
              path={Glyph.down}
              disabled={disabled || atMin}
              onTrigger={dec}
              className="flex-1 border-t border-input"
            />
          </div>
        )}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";
