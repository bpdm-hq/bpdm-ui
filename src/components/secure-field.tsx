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
      <path
        d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      {off && (
        <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}
function CopyIcon({ done }: { done?: boolean }) {
  return done ? (
    <svg viewBox="0 0 16 16" fill="none" className="size-4 text-primary" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 10.5h-.5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function groupCard(digits: string) {
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

function maskValue(formatted: string, tail: number) {
  const visible = new Set<number>();
  if (tail > 0) {
    const idx: number[] = [];
    [...formatted].forEach((c, i) => {
      if (!/\s/.test(c)) idx.push(i);
    });
    idx.slice(Math.max(0, idx.length - tail)).forEach((i) => visible.add(i));
  }
  return [...formatted]
    .map((c, i) => (/\s/.test(c) ? c : visible.has(i) ? c : "•"))
    .join("");
}

export interface SecureFieldProps extends VariantProps<typeof wrapVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "card" groups digits 4-4-4-4 and restricts to digits. */
  format?: "card" | "none";
  /** Characters kept visible while masked (e.g. 4 → •••• •••• •••• 4242). */
  unmaskedTail?: number;
  /** Show the reveal (eye) toggle. */
  revealable?: boolean;
  /** Show a copy-to-clipboard button. */
  copyable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
}

/**
 * Masked input for sensitive values (card numbers, IBANs, API keys, secrets).
 * Shows masked at rest with an optional visible tail, a reveal toggle, and an
 * optional copy button. Uses text + masking (not type=password) so password
 * managers don't hijack it. The real value is what you read/copy/onValueChange.
 */
export function SecureField({
  value,
  defaultValue = "",
  onValueChange,
  format = "none",
  unmaskedTail = 0,
  revealable = true,
  copyable = false,
  placeholder,
  size,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
}: SecureFieldProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const raw = isControlled ? (value ?? "") : internal;
  const [revealed, setRevealed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(copyTimer.current), []);

  const formatted = format === "card" ? groupCard(raw) : raw;
  const masked = maskValue(formatted, unmaskedTail);
  const show = revealed || focused;
  const display = show ? formatted : masked;

  const setRaw = (s: string) => {
    if (!isControlled) setInternal(s);
    onValueChange?.(s);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (format === "card") v = v.replace(/\D/g, "").slice(0, 19);
    setRaw(v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const btn =
    "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius)-4px)] text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50";

  return (
    <div
      aria-invalid={ariaInvalid}
      className={cn(
        wrapVariants({ size }),
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        id={id}
        type="text"
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        inputMode={format === "card" ? "numeric" : "text"}
        disabled={disabled}
        value={display}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        className="w-full min-w-0 bg-transparent tracking-wide tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
      {copyable && (
        <button
          type="button"
          aria-label="Copy"
          disabled={disabled || !raw}
          onClick={copy}
          className={cn(btn)}
        >
          <CopyIcon done={copied} />
        </button>
      )}
      {revealable && (
        <button
          type="button"
          aria-label={revealed ? "Hide" : "Reveal"}
          aria-pressed={revealed}
          disabled={disabled}
          onClick={() => setRevealed((r) => !r)}
          className={cn(btn)}
        >
          <Eye off={revealed} />
        </button>
      )}
    </div>
  );
}
