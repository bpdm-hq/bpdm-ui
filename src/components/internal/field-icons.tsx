import { cn } from "@/lib/utils";

// Shared icons for the dropdown family (Select / MultiSelect / TreeSelect).
// Internal — not part of the public API. Kept as tuned SVGs (not lucide) so the
// stroke weights match the field controls exactly; consolidated here so the three
// components share one consistent set instead of each re-defining them.

/** Trigger chevron — rotates when the enclosing `group` is open. */
export function FieldChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn(
        "size-4 shrink-0 opacity-60 transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] group-data-[state=open]:rotate-180",
        className,
      )}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Selected-option checkmark. */
export function FieldCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("size-3.5", className)}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Indeterminate dash (partial group selection). */
export function FieldDash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("size-3.5", className)}>
      <path d="M4 8h8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Clear / remove "×". */
export function FieldClearX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("size-3", className)}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Search/filter magnifier. */
export function FieldSearch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={cn("size-4 shrink-0 text-muted-foreground", className)}
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
