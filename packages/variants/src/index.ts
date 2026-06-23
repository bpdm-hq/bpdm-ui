// @bpdm/variants — framework-agnostic styling primitives (class-merge + cva
// variant maps) shared by every bpdm framework package, so the React and
// Angular components render byte-identical Tailwind class strings.
export { cn, type ClassValue } from "./cn";
export { buttonVariants, type ButtonVariants } from "./button";
export { cardVariants, type CardVariants } from "./card";
export { alertTones, type AlertVariant, type AlertTone } from "./alert";

// Re-export cva's type helper so framework packages can derive prop types
// without taking a direct dependency on class-variance-authority.
export type { VariantProps } from "class-variance-authority";
