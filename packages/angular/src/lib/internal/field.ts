// Shared trigger styling for the dropdown family (Select / MultiSelect /
// TreeSelect). Internal — not part of the public API. Mirrors the React
// `triggerVariants` / `fieldTriggerVariants`.

export type FieldSize = "sm" | "md" | "lg";

/** Single-value Select uses a native `<button>` with fixed-height variants. */
export const SELECT_TRIGGER_BASE =
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--bpdm-radius)] border border-[var(--bpdm-input)] bg-[var(--bpdm-background)] text-[var(--bpdm-foreground)] shadow-sm transition-colors focus-visible:border-[var(--bpdm-ring)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bpdm-ring)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--bpdm-destructive)] aria-[invalid=true]:focus-visible:ring-[var(--bpdm-destructive)]";
export const SELECT_TRIGGER_SIZE: Record<FieldSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};

/** Multi-value fields use a `<div role="combobox">` that grows with chips. */
export const FIELD_TRIGGER_BASE =
  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--bpdm-radius)] border border-[var(--bpdm-input)] bg-[var(--bpdm-background)] text-[var(--bpdm-foreground)] shadow-sm transition-colors focus-visible:border-[var(--bpdm-ring)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--bpdm-ring)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 aria-[invalid=true]:border-[var(--bpdm-destructive)] aria-[invalid=true]:focus-visible:ring-[var(--bpdm-destructive)]";
export const FIELD_TRIGGER_SIZE: Record<FieldSize, string> = {
  sm: "min-h-8 px-2 py-1 text-sm",
  md: "min-h-10 px-2.5 py-1.5 text-sm",
  lg: "min-h-12 px-3 py-2 text-base",
};

/** The dropdown panel chrome (shared by all three). */
export const FIELD_PANEL =
  "z-50 flex flex-col overflow-hidden rounded-[var(--bpdm-radius)] border border-[var(--bpdm-border)] bg-[var(--bpdm-popover)] text-[var(--bpdm-popover-foreground)] shadow-md animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)]";

/**
 * Wrapper shell for the boxed text-[var(--bpdm-input)] family (MoneyInput / PasswordInput /
 * SecureField) — a bordered row that holds the input plus inline adornments
 * (symbol, toggle, copy). `focus-within` lifts the ring; an inner control's
 * `aria-invalid` (matched via `:has`) reddens the shell.
 */
export const WRAP_FIELD_BASE =
  "flex w-full items-center gap-1.5 rounded-[var(--bpdm-radius)] border border-[var(--bpdm-input)] bg-[var(--bpdm-background)] text-[var(--bpdm-foreground)] shadow-sm transition-colors focus-within:border-[var(--bpdm-ring)] focus-within:ring-1 focus-within:ring-[var(--bpdm-ring)] has-[[aria-invalid=true]]:border-[var(--bpdm-destructive)] has-[[aria-invalid=true]]:focus-within:ring-[var(--bpdm-destructive)]";
export const WRAP_FIELD_SIZE: Record<FieldSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-base",
};
