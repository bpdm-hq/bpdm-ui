/**
 * Avatar size/status/palette + initials helpers — framework-agnostic, shared by
 * the React and Angular avatars.
 */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export const avatarSize: Record<AvatarSize, string> = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-14 text-lg",
  "2xl": "size-16 text-xl",
};

export const avatarStatusColor: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-muted-foreground",
  busy: "bg-destructive",
  away: "bg-warning",
};

// deterministic, pleasant tint per name — so initials avatars aren't all grey
export const avatarPalette = [
  "bg-[color-mix(in_srgb,var(--info)_20%,transparent)] text-info",
  "bg-[color-mix(in_srgb,var(--success)_20%,transparent)] text-success",
  "bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-accent",
  "bg-[color-mix(in_srgb,#8b5cf6_22%,transparent)] text-[#8b5cf6]",
  "bg-[color-mix(in_srgb,#ec4899_22%,transparent)] text-[#ec4899]",
  "bg-[color-mix(in_srgb,#14b8a6_22%,transparent)] text-[#14b8a6]",
];

/** Up to two uppercase initials from a name. */
export function avatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashOf(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic palette tint (bg + text classes) for a given name. */
export function avatarTint(name: string): string {
  return avatarPalette[hashOf(name) % avatarPalette.length];
}
