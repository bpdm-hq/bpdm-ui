/**
 * Floating-label classes — framework-agnostic. The label rests as a placeholder
 * and floats up on focus or when the field is filled, driven purely by the
 * Tailwind `peer` + `:placeholder-shown` trick. Shared by React & Angular.
 */
export type FloatLabelVariant = "over" | "in" | "on";

/** Resting (placeholder) state — same for every variant. */
export const floatResting =
  "pointer-events-none absolute left-3 z-10 origin-left text-muted-foreground transition-all duration-150 top-1/2 -translate-y-1/2 text-sm peer-focus:text-ring";

/** Floated state — on focus OR when filled (:not(:placeholder-shown)). */
export const floatFloated: Record<FloatLabelVariant, string> = {
  over:
    "peer-focus:top-0 peer-focus:-translate-y-[135%] peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-[135%] peer-[:not(:placeholder-shown)]:text-xs",
  on:
    "peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-background peer-focus:px-1 peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:bg-background peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs",
  in:
    "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs " +
    "peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs",
};
