import * as React from "react";

/**
 * Controlled/uncontrolled state in one hook. Pass `controlled` (+ `onChange`) to
 * drive it from the parent, or leave `controlled` undefined to manage `fallback`
 * internally. Returns `[value, setValue]`; `setValue` always fires `onChange` and
 * only updates internal state when uncontrolled.
 */
export function useControllable<T>(
  controlled: T | undefined,
  fallback: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = React.useState(fallback);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : internal;
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [value, set] as const;
}
