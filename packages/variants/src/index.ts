// @bpdm/variants — framework-agnostic styling primitives (class-merge + cva
// variant maps) shared by every bpdm framework package, so the React and
// Angular components render byte-identical Tailwind class strings.
export { cn, type ClassValue } from "./cn";
export { buttonVariants, type ButtonVariants } from "./button";
export { cardVariants, type CardVariants } from "./card";
export { alertTones, type AlertVariant, type AlertTone } from "./alert";
export {
  progressTrack,
  progressFill,
  progressFillFg,
  type ProgressVariant,
  type ProgressSize,
} from "./progress";
export {
  spinnerSize,
  type SpinnerVariant,
  type SpinnerSize,
  type SpinnerSizeSpec,
} from "./spinner";
export {
  badgeVariants,
  badgeDot,
  badgeTone,
  type BadgeVariant,
  type BadgeAppearance,
  type BadgeVariants,
} from "./badge";
export {
  avatarSize,
  avatarStatusColor,
  avatarPalette,
  avatarInitials,
  avatarTint,
  type AvatarSize,
  type AvatarShape,
  type AvatarStatus,
} from "./avatar";
export { inputVariants, type InputVariants } from "./input";
export { textareaVariants, type TextareaVariants } from "./textarea";
export { checkboxVariants, type CheckboxVariants } from "./checkbox";
export { switchVariants, thumbVariants, type SwitchVariants } from "./switch";
export { radioItemVariants, type RadioVariants } from "./radio";
export {
  floatResting,
  floatFloated,
  type FloatLabelVariant,
} from "./float-label";

// Re-export cva's type helper so framework packages can derive prop types
// without taking a direct dependency on class-variance-authority.
export type { VariantProps } from "class-variance-authority";
