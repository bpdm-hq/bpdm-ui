/**
 * Spinner size specs — framework-agnostic, shared by the React and Angular
 * spinners so every variant matches across frameworks.
 */
export type SpinnerVariant = "ring" | "gradient" | "square" | "dots" | "bars" | "flip";
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SpinnerSizeSpec {
  ring: string;
  border: string;
  thickness: string;
  dot: string;
  bar: string;
  gap: string;
}

export const spinnerSize: Record<SpinnerSize, SpinnerSizeSpec> = {
  xs: { ring: "size-4", border: "border-2", thickness: "2px", dot: "size-1", bar: "h-3 w-0.5", gap: "gap-0.5" },
  sm: { ring: "size-5", border: "border-2", thickness: "2px", dot: "size-1.5", bar: "h-4 w-0.5", gap: "gap-1" },
  md: { ring: "size-6", border: "border-2", thickness: "3px", dot: "size-2", bar: "h-5 w-1", gap: "gap-1" },
  lg: { ring: "size-8", border: "border-[3px]", thickness: "3px", dot: "size-2.5", bar: "h-7 w-1", gap: "gap-1.5" },
  xl: { ring: "size-12", border: "border-4", thickness: "4px", dot: "size-3.5", bar: "h-10 w-1.5", gap: "gap-2" },
};
