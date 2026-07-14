import * as React from "react";
import BigNumber from "bignumber.js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wrapVariants = cva(
  "flex w-full items-center gap-1.5 rounded-[var(--radius)] border border-input bg-background text-foreground shadow-sm transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-within:ring-destructive",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface MoneyInputProps
  extends Omit<
      React.ComponentProps<"input">,
      "size" | "value" | "defaultValue" | "onChange" | "prefix"
    >,
    VariantProps<typeof wrapVariants> {
  /** ISO 4217 code, e.g. "USD", "EUR", "INR", "JPY". */
  currency?: string;
  /** BCP 47 locale for grouping/symbol, e.g. "en-US", "de-DE", "en-IN", "ja-JP". */
  locale?: string;
  /** Value as a precise numeric string (e.g. "1234.50"). */
  value?: string;
  defaultValue?: string;
  /** Called with the raw (unformatted) numeric string on every change. */
  onValueChange?: (value: string) => void;
  allowNegative?: boolean;
}

/**
 * Currency + locale-aware money input. The displayed value is grouped per locale
 * (e.g. en-IN → 1,00,000) with the currency symbol and the currency's decimal
 * count, while the stored value stays a precise numeric string (bignumber.js — no
 * float rounding). Editable as a plain number on focus, formatted on blur.
 *
 * Forwards its ref to the underlying `<input>` and spreads any extra native props
 * (`name`, `aria-label`, `aria-describedby`, `required`, `autoComplete`,
 * `data-*`, …) onto it, so it drops into forms and test harnesses unchanged.
 * `className` styles the wrapper.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  {
    currency = "USD",
    locale = "en-US",
    value,
    defaultValue = "",
    onValueChange,
    allowNegative = false,
    size,
    disabled,
    className,
    "aria-invalid": ariaInvalid,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const raw = isControlled ? (value ?? "") : internal;
  const [focused, setFocused] = React.useState(false);

  const fractionDigits = React.useMemo(() => {
    try {
      return (
        new Intl.NumberFormat(locale, { style: "currency", currency })
          .resolvedOptions().maximumFractionDigits ?? 2
      );
    } catch {
      return 2;
    }
  }, [locale, currency]);

  const symbol = React.useMemo(() => {
    try {
      const parts = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value ?? currency;
    } catch {
      return currency;
    }
  }, [locale, currency]);

  // Some locales place the currency symbol after the number (e.g. de-DE → "1 €").
  // Ask Intl where the symbol sits relative to the digits and slot it accordingly.
  const symbolBefore = React.useMemo(() => {
    try {
      const parts = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).formatToParts(1);
      const currencyIndex = parts.findIndex((p) => p.type === "currency");
      const numberIndex = parts.findIndex((p) => p.type === "integer");
      if (currencyIndex === -1 || numberIndex === -1) return true;
      return currencyIndex < numberIndex;
    } catch {
      return true;
    }
  }, [locale, currency]);

  const grouped = React.useMemo(() => {
    if (raw === "" || raw === "-" || raw === ".") return "";
    const bn = new BigNumber(raw);
    if (bn.isNaN()) return "";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(Number(bn.toFixed(fractionDigits)));
  }, [raw, locale, fractionDigits]);

  const setRaw = (s: string) => {
    if (!isControlled) setInternal(s);
    onValueChange?.(s);
  };

  const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/;

  return (
    <div
      aria-invalid={ariaInvalid}
      className={cn(
        wrapVariants({ size }),
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {symbolBefore && (
        <span aria-hidden="true" className="shrink-0 select-none text-muted-foreground">
          {symbol}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={focused ? raw : grouped}
        aria-invalid={ariaInvalid}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (raw !== "" && raw !== "-" && raw !== ".") {
            const bn = new BigNumber(raw);
            if (!bn.isNaN()) setRaw(bn.toFixed(fractionDigits));
          }
          onBlur?.(e);
        }}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || pattern.test(v)) setRaw(v);
        }}
        className="w-full min-w-0 bg-transparent text-end tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
      {!symbolBefore && (
        <span aria-hidden="true" className="shrink-0 select-none text-muted-foreground">
          {symbol}
        </span>
      )}
    </div>
  );
});
