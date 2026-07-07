import * as React from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

export interface InputOtpProps {
  /** Number of cells. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired once every cell is filled — handy for auto-submit. */
  onComplete?: (value: string) => void;
  /** Focus the first cell on mount. */
  autoFocus?: boolean;
  /** Hide characters (one-time PINs). */
  mask?: boolean;
  /** Restrict input to digits 0-9. */
  integerOnly?: boolean;
  size?: Size;
  /** Connect cells into fixed groups of this size (e.g. 3 → 3-3, last = remainder). */
  groupSize?: number;
  /** Auto-group into 2 balanced segments (even → equal, odd → ceil+floor). Ignored if `groupSize` is set. */
  grouped?: boolean;
  /** Node shown between groups. */
  separator?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  /** Emits the joined value under this `name` via a hidden input for native form submission. */
  name?: string;
  /** Group id (for label association / testing). */
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  /** Per-cell screen-reader label. Override for i18n. Default: `Character N of M`. */
  cellLabel?: (index: number, length: number) => string;
}

const cellSize: Record<Size, string> = {
  sm: "size-9 text-sm",
  md: "size-11 text-base",
  lg: "size-14 text-lg",
};

// Group sizes: explicit groupSize wins (last group = remainder); otherwise auto
// into 2 balanced groups (even → equal halves, odd → ceil + floor).
function getGroups(
  length: number,
  groupSize?: number,
  grouped?: boolean,
): number[] {
  if (groupSize && groupSize > 0) {
    const out: number[] = [];
    for (let i = 0; i < length; i += groupSize)
      out.push(Math.min(groupSize, length - i));
    return out;
  }
  if (grouped) {
    return length % 2 === 0
      ? [length / 2, length / 2]
      : [Math.ceil(length / 2), Math.floor(length / 2)];
  }
  return [length];
}

/**
 * One-time-code input: one box per character with auto-advance,
 * backspace-to-previous, arrow navigation, and paste-to-fill. Controlled
 * (`value` + `onValueChange`) or uncontrolled (`defaultValue`); value is a string.
 */
export function InputOtp({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  onComplete,
  autoFocus,
  mask = false,
  integerOnly = false,
  size = "md",
  groupSize,
  grouped,
  separator = "−",
  disabled,
  className,
  name,
  id,
  "aria-label": ariaLabel = "One-time code",
  "aria-describedby": ariaDescribedBy,
  cellLabel = (index: number, len: number) => `Character ${index + 1} of ${len}`,
}: InputOtpProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const isControlled = value !== undefined;

  // re-sizes to the current `length` every render, so changing length grows/
  // shrinks the cells (works for a string or an array source).
  const toCells = (src: string | string[]) =>
    Array.from({ length }, (_, i) => src[i] ?? "");
  const [internal, setInternal] = React.useState<string[]>(() =>
    toCells(defaultValue),
  );
  const cells = toCells(isControlled ? (value ?? "") : internal);

  const commit = (next: string[]) => {
    if (!isControlled) setInternal(next);
    const joined = next.join("");
    onValueChange?.(joined);
    if (next.length === length && next.every((c) => c.length === 1)) onComplete?.(joined);
  };

  const focusCell = (i: number) =>
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
    // focus once on mount when requested
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (i: number, raw: string) => {
    const ch = raw.slice(-1);
    if (integerOnly && ch && !/\d/.test(ch)) return;
    const next = cells.slice();
    next[i] = ch;
    commit(next);
    if (ch) focusCell(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = cells.slice();
      if (cells[i]) {
        next[i] = "";
        commit(next);
      } else if (i > 0) {
        next[i - 1] = "";
        commit(next);
        focusCell(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let chars = e.clipboardData.getData("text").trim().split("");
    if (integerOnly) chars = chars.filter((c) => /\d/.test(c));
    const next = Array.from({ length }, (_, k) => chars[k] ?? "");
    commit(next);
    focusCell(Math.min(chars.length, length - 1));
  };

  const isGrouped = (!!groupSize && groupSize > 0) || !!grouped;

  const baseCell =
    "border border-input bg-background text-center font-medium text-foreground shadow-sm transition-[color,border-color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] ease-[var(--bpdm-ease-overshoot)] focus:z-10 focus:scale-[1.08] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  // isFirst/isLast = position within the cell's group (for connected rounding)
  const renderCell = (i: number, isFirst: boolean, isLast: boolean) => (
    <input
      key={i}
      ref={(el) => {
        refs.current[i] = el;
      }}
      // keep type=text (not password) so password managers don't hijack the
      // field; mask visually with -webkit-text-security instead.
      type="text"
      inputMode={integerOnly ? "numeric" : "text"}
      autoComplete={i === 0 ? "one-time-code" : "off"}
      data-1p-ignore
      data-lpignore="true"
      maxLength={1}
      disabled={disabled}
      aria-label={cellLabel(i, length)}
      value={cells[i]}
      onChange={(e) => handleChange(i, e.target.value)}
      onKeyDown={(e) => handleKeyDown(i, e)}
      onPaste={handlePaste}
      onFocus={(e) => e.currentTarget.select()}
      style={
        mask ? ({ WebkitTextSecurity: "disc" } as React.CSSProperties) : undefined
      }
      className={cn(
        "relative",
        baseCell,
        cellSize[size],
        isGrouped
          ? cn(
              "rounded-none",
              !isFirst && "-ms-px", // collapse adjacent borders into one divider
              isFirst && "rounded-s-[var(--radius)]",
              isLast && "rounded-e-[var(--radius)]",
            )
          : "rounded-[var(--radius)]",
      )}
    />
  );

  const hiddenField = name ? (
    <input type="hidden" name={name} value={cells.join("")} />
  ) : null;

  if (!isGrouped) {
    return (
      <div
        role="group"
        id={id}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={cn("flex items-center gap-2", className)}
      >
        {cells.map((_, i) => renderCell(i, false, false))}
        {hiddenField}
      </div>
    );
  }

  // grouped: connected segments with a separator between groups
  const sizes = getGroups(length, groupSize, grouped);
  let offset = 0;
  return (
    <div
      role="group"
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={cn("flex items-center gap-3", className)}
    >
      {sizes.map((sz, g) => {
        const start = offset;
        offset += sz;
        return (
          <React.Fragment key={g}>
            {g > 0 && (
              <span aria-hidden className="select-none px-1 text-muted-foreground">
                {separator}
              </span>
            )}
            <div className="flex items-center">
              {Array.from({ length: sz }, (_, k) =>
                renderCell(start + k, k === 0, k === sz - 1),
              )}
            </div>
          </React.Fragment>
        );
      })}
      {hiddenField}
    </div>
  );
}
