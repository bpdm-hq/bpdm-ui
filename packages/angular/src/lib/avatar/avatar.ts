import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import {
  avatarInitials,
  avatarSize,
  avatarStatusColor,
  avatarTint,
  cn,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
} from "@bpdm/variants";

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

/**
 * `<bpdm-avatar>` — an image with a graceful fallback to initials (auto-tinted
 * from the name) and then a person icon. Circle or square, six sizes, an optional
 * presence dot. Same look as the React avatar.
 *
 * ```html
 * <bpdm-avatar name="Aria Lindqvist" src="/aria.jpg" status="online" />
 * <bpdm-avatar name="Theo Brandt" />  <!-- initials, auto-colored -->
 * ```
 */
@Component({
  selector: "bpdm-avatar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-bpdm": "", "data-bpdm-slot": "avatar", "[class]": "hostClass()" },
  template: `
    <span
      class="flex size-full items-center justify-center overflow-hidden"
      [class]="shape() === 'circle' ? 'rounded-full' : 'rounded-[28%]'"
      [class.ring-2]="ring()"
      [class.ring-background]="ring()"
    >
      @if (src() && !failed()) {
        <img
          [src]="src()"
          [alt]="alt() ?? name() ?? ''"
          (error)="failed.set(true)"
          data-bpdm-slot="avatar-image"
          class="size-full object-cover animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]"
        />
      } @else {
        <span
          class="flex size-full items-center justify-center font-semibold animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] [&_svg]:size-[55%]"
          [class]="tint()"
          data-bpdm-slot="avatar-fallback"
          [attr.role]="name() ? 'img' : null"
          [attr.aria-label]="name() || null"
        >
          @if (initials()) {
            {{ initials() }}
          } @else {
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.5" fill="currentColor" />
              <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          }
        </span>
      }
    </span>

    @if (status()) {
      <span
        role="img"
        class="absolute z-10 rounded-full ring-2 ring-background size-[28%] min-h-2 min-w-2"
        [class]="statusDotClass()"
        data-bpdm-slot="avatar-status"
        [attr.aria-label]="statusLabel()"
      ></span>
    }
  `,
})
export class BpdmAvatar {
  /** Image URL. Falls back to initials, then a person icon, if it fails to load. */
  readonly src = input<string>();
  /** Name — drives the initials, the auto color, and the alt text. */
  readonly name = input<string>();
  readonly alt = input<string>();
  readonly size = input<AvatarSize>("md");
  readonly shape = input<AvatarShape>("circle");
  /** Presence dot: online / busy / away / offline. */
  readonly status = input<AvatarStatus>();
  /** Auto-tint initials from the name. Set false for a neutral look. */
  readonly colorful = input(true, { transform: booleanAttribute });
  /** Background-colored ring around the avatar (used by the group). */
  readonly ring = input(false, { transform: booleanAttribute });
  /** Override the translatable strings (status dot labels). */
  readonly messages = input<Partial<AvatarMessages>>({});
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly t = computed(() => ({ ...DEFAULT_AVATAR_MESSAGES, ...this.messages() }));
  protected readonly statusLabel = computed(() => {
    const st = this.status();
    return st ? this.t()[st] : null;
  });
  protected readonly failed = signal(false);
  protected readonly initials = computed(() => {
    const n = this.name();
    return n ? avatarInitials(n) : "";
  });
  protected readonly tint = computed(() =>
    this.colorful() && this.initials()
      ? avatarTint(this.name() ?? "")
      : "bg-muted text-muted-foreground",
  );
  protected readonly statusDotClass = computed(() => {
    const st = this.status();
    if (!st) return "";
    return cn(
      avatarStatusColor[st],
      this.shape() === "circle" ? "bottom-[6%] end-[6%]" : "-bottom-0.5 -end-0.5",
    );
  });
  protected readonly hostClass = computed(() =>
    cn(
      "relative inline-flex shrink-0 select-none items-center justify-center overflow-visible",
      avatarSize[this.size()],
      this.classInput(),
    ),
  );
}

export interface AvatarGroupUser {
  name?: string;
  src?: string;
  status?: AvatarStatus;
}

/**
 * `<bpdm-avatar-group>` — an overlapping stack of avatars with a `+N` overflow
 * tile; each lifts on hover. Pass the people via `users` (an Angular-idiomatic
 * array rather than projected children).
 */
@Component({
  selector: "bpdm-avatar-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmAvatar],
  host: { "data-bpdm": "", "data-bpdm-slot": "avatar-group", class: "flex items-center" },
  template: `
    @for (u of shown(); track $index) {
      <bpdm-avatar
        [name]="u.name"
        [src]="u.src"
        [status]="u.status"
        [size]="size()"
        [messages]="messages()"
        ring
        class="transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:z-10 hover:-translate-y-1"
        [class.-ms-2.5]="$index > 0"
      />
    }
    @if (overflow() > 0) {
      <span
        role="img"
        [attr.aria-label]="overflowLabel()"
        data-bpdm-slot="avatar-group-overflow"
        class="relative -ms-2.5 inline-flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background transition-transform duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] hover:z-10 hover:-translate-y-1"
        [class]="sizeClass()"
      >+{{ overflow() }}</span>
    }
  `,
})
export class BpdmAvatarGroup {
  readonly users = input.required<AvatarGroupUser[]>();
  /** Show at most this many avatars; the rest collapse into a "+N" tile. */
  readonly max = input<number>();
  readonly size = input<AvatarSize>("md");
  /**
   * Override the translatable strings. Forwarded down to each child avatar so a
   * group-level `messages` localizes the children's status dots and the overflow
   * tile.
   */
  readonly messages = input<Partial<AvatarMessages>>({});

  protected readonly shown = computed(() => {
    const m = this.max();
    return m ? this.users().slice(0, m) : this.users();
  });
  protected readonly overflow = computed(() => this.users().length - this.shown().length);
  protected readonly sizeClass = computed(() => avatarSize[this.size()]);
  protected readonly overflowLabel = computed(() => {
    const t = { ...DEFAULT_AVATAR_MESSAGES, ...this.messages() };
    return t.more.replace("{count}", String(this.overflow()));
  });
}
