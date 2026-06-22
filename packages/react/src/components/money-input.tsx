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

export interface MoneyInputProps extends VariantProps<typeof wrapVariants> {
  /** ISO 4217 code, e.g. "USD", "EUR", "INR", "JPY". */
  currency?: string;
  /** BCP 47 locale for grouping/symbol, e.g. "en-US", "de-DE", "en-IN", "ja-JP". */
  locale?: string;
  /** Value as a precise numeric string (e.g. "1234.50"). */
  value?: string;
  defaultValue?: string;
  /** Called with the raw (unformatted) numeric string on every change. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  allowNegative?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Currency + locale-aware money input. The displayed value is grouped per locale
 * (e.g. en-IN → 1,00,000) with the currency symbol and the currency's decimal
 * count, while the stored value stays a precise numeric string (bignumber.js — no
 * float rounding). Editable as a plain number on focus, formatted on blur.
 */
export function MoneyInput({
  currency = "USD",
  locale = "en-US",
  value,
  defaultValue = "",
  onValueChange,
  placeholder,
  allowNegative = false,
  size,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: MoneyInputProps) {
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
      <span className="shrink-0 select-none text-muted-foreground">{symbol}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        disabled={disabled}
        value={focused ? raw : grouped}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        onFocus={(e) => {
          setFocused(true);
          e.currentTarget.select();
        }}
        onBlur={() => {
          setFocused(false);
          if (raw !== "" && raw !== "-" && raw !== ".") {
            const bn = new BigNumber(raw);
            if (!bn.isNaN()) setRaw(bn.toFixed(fractionDigits));
          }
        }}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || pattern.test(v)) setRaw(v);
        }}
        className="w-full min-w-0 bg-transparent text-right tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}
