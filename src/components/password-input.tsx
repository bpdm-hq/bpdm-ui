import * as React from "react";
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

function Eye({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden>
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      {off && <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

/** 0–4 strength score from length + character variety. */
export function scorePassword(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

const DEFAULT_LABELS: Record<number, string[]> = {
  3: ["Weak", "Medium", "Strong"],
  4: ["Weak", "Fair", "Good", "Strong"],
  5: ["Very weak", "Weak", "Fair", "Good", "Strong"],
};

export interface PasswordInputProps extends VariantProps<typeof wrapVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Show the strength meter below the field. Default true. */
  feedback?: boolean;
  /** Number of strength segments. Default 4. */
  levels?: number;
  /** Custom scorer returning 0..levels. Defaults to a length + variety heuristic. */
  strength?: (value: string) => number;
  /** Labels per level (length = levels). Defaults provided for 3 / 4 / 5. */
  labels?: string[];
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Password input with a show/hide toggle and an optional strength meter
 * (segmented bar + label). Uses `type="password"` so password managers work.
 */
export function PasswordInput({
  value,
  defaultValue = "",
  onValueChange,
  feedback = true,
  levels = 4,
  strength,
  labels,
  placeholder,
  size,
  disabled,
  autoComplete,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: PasswordInputProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const val = isControlled ? (value ?? "") : internal;
  const [revealed, setRevealed] = React.useState(false);

  const rawScore = strength
    ? strength(val)
    : Math.round((scorePassword(val) / 4) * levels);
  const filled = Math.max(0, Math.min(levels, rawScore));
  const ratio = levels > 0 ? filled / levels : 0;
  const tone = filled === 0 ? "" : ratio <= 0.34 ? "weak" : ratio <= 0.67 ? "medium" : "strong";
  const barColor =
    tone === "weak" ? "bg-destructive" : tone === "strong" ? "bg-success" : "bg-primary";
  const textColor =
    tone === "weak"
      ? "text-destructive"
      : tone === "strong"
        ? "text-success"
        : "text-muted-foreground";
  const labelSet = labels ?? DEFAULT_LABELS[levels] ?? [];
  const meterLabel = filled > 0 ? (labelSet[filled - 1] ?? "") : "";

  const setVal = (s: string) => {
    if (!isControlled) setInternal(s);
    onValueChange?.(s);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        aria-invalid={ariaInvalid}
        className={cn(wrapVariants({ size }), disabled && "cursor-not-allowed opacity-50")}
      >
        <input
          id={id}
          type={revealed ? "text" : "password"}
          autoComplete={autoComplete}
          disabled={disabled}
          value={val}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          onChange={(e) => setVal(e.target.value)}
          className="w-full min-w-0 bg-transparent focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="button"
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          disabled={disabled}
          onClick={() => setRevealed((r) => !r)}
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-[calc(var(--radius)-4px)] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none"
        >
          <Eye off={revealed} />
        </button>
      </div>

      {feedback && val.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1" aria-hidden>
            {Array.from({ length: levels }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < filled ? barColor : "bg-muted",
                )}
              />
            ))}
          </div>
          <p className={cn("mt-1 text-xs", textColor)} aria-live="polite">
            {meterLabel}
          </p>
        </div>
      )}
    </div>
  );
}
