import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  avatarInitials,
  avatarSize,
  avatarStatusColor,
  avatarTint,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
} from "@bpdm/variants";
import { cn } from "@/lib/utils";

export type { AvatarSize, AvatarShape, AvatarStatus };

// --- i18n ---
export interface AvatarMessages {
  online: string;
  offline: string;
  busy: string;
  away: string;
  /** AvatarGroup overflow tile label. `{count}` is interpolated. */
  more: string;
}

export const DEFAULT_AVATAR_MESSAGES: AvatarMessages = {
  online: "Online",
  offline: "Offline",
  busy: "Busy",
  away: "Away",
  more: "{count} more",
};

// local aliases so the component body below reads the same as before
const SIZE = avatarSize;
const STATUS_COLOR = avatarStatusColor;
const initialsOf = avatarInitials;

export interface AvatarProps {
  /** Image URL. Falls back to initials, then the icon, if it fails to load. */
  src?: string;
  /** Person/entity name — drives the initials, the auto color, and the alt text. */
  name?: string;
  /** Icon shown when there's no image and no name. */
  icon?: React.ReactNode;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Presence dot: online / busy / away / offline. */
  status?: AvatarStatus;
  /** Auto-tint initials from the name. Default true. Set false for a neutral look. */
  colorful?: boolean;
  /** Draw a background-colored ring around the circle (used by AvatarGroup). */
  ring?: boolean;
  /** Override the translatable strings (status dot labels). */
  messages?: Partial<AvatarMessages>;
  className?: string;
}

/**
 * Avatar built on Radix — shows an image with a graceful fallback to initials
 * (auto-tinted from the name) and then an icon. Circle or square, six sizes, an
 * optional presence dot. Compose with `NotificationBadge` for a count overlay.
 */
export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      src,
      name,
      icon,
      alt,
      size = "md",
      shape = "circle",
      status,
      colorful = true,
      ring = false,
      messages,
      className,
    },
    ref,
  ) => {
    const initials = name ? initialsOf(name) : "";
    const tint =
      colorful && initials
        ? avatarTint(name ?? "")
        : "bg-muted text-muted-foreground";
    const t = React.useMemo(() => ({ ...DEFAULT_AVATAR_MESSAGES, ...messages }), [messages]);

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 select-none items-center justify-center overflow-visible",
          SIZE[size],
          className,
        )}
      >
        <span
          className={cn(
            "flex size-full items-center justify-center overflow-hidden",
            shape === "circle" ? "rounded-full" : "rounded-[28%]",
            ring && "ring-2 ring-background",
          )}
        >
          {src && (
            <AvatarPrimitive.Image
              src={src}
              alt={alt ?? name ?? ""}
              className="size-full object-cover animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]"
            />
          )}
          <AvatarPrimitive.Fallback
            delayMs={src ? 300 : 0}
            // when we fall back to initials/icon, name the avatar so a screen
            // reader announces the full person name, not just the initials
            role={name ? "img" : undefined}
            aria-label={name || undefined}
            className={cn(
              "flex size-full items-center justify-center font-semibold animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
              tint,
              "[&_svg]:size-[55%]",
            )}
          >
            {initials || icon || <DefaultUserIcon />}
          </AvatarPrimitive.Fallback>
        </span>

        {status && (
          <span
            role="img"
            className={cn(
              "absolute z-10 rounded-full ring-2 ring-background",
              STATUS_COLOR[status],
              // ~28% of the avatar, nudged onto the lower-inline-end edge
              "size-[28%] min-h-2 min-w-2",
              shape === "circle" ? "bottom-[6%] end-[6%]" : "-bottom-0.5 -end-0.5",
            )}
            aria-label={t[status]}
          />
        )}
      </AvatarPrimitive.Root>
    );
  },
);
Avatar.displayName = "Avatar";

function DefaultUserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" fill="currentColor" />
      <path
        d="M4.5 19.5a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  /** Show at most this many avatars; the rest collapse into a "+N" tile. */
  max?: number;
  /** Applied to every avatar (and the overflow tile). */
  size?: AvatarSize;
  /**
   * Override the translatable strings. Forwarded down to each child Avatar so a
   * group-level `messages` localizes the children's status dots too (a child's
   * own `messages` prop, if set, still wins).
   */
  messages?: Partial<AvatarMessages>;
  className?: string;
}

/**
 * Overlapping stack of avatars with a `+N` overflow tile. Each avatar lifts on
 * hover so the one under the cursor comes forward.
 */
export function AvatarGroup({ children, max, size = "md", messages, className }: AvatarGroupProps) {
  const all = React.Children.toArray(children).filter(React.isValidElement);
  const shown = max ? all.slice(0, max) : all;
  const overflow = all.length - shown.length;
  const t = React.useMemo(() => ({ ...DEFAULT_AVATAR_MESSAGES, ...messages }), [messages]);

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((child, i) => {
        const el = child as React.ReactElement<AvatarProps>;
        return React.cloneElement(el, {
          key: i,
          size,
          ring: true,
          // forward the group's messages; the child's own messages still wins
          messages: { ...messages, ...el.props.messages },
          className: cn(
            el.props.className,
            "transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:z-10 hover:-translate-y-1",
            i > 0 && "-ms-2.5",
          ),
        });
      })}
      {overflow > 0 && (
        <span
          role="img"
          aria-label={t.more.replace("{count}", String(overflow))}
          className={cn(
            "relative -ms-2.5 inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:z-10 hover:-translate-y-1",
            SIZE[size],
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
