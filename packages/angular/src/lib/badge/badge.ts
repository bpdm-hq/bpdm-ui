import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import {
  badgeDot,
  badgeTone,
  badgeVariants,
  cn,
  type BadgeAppearance,
  type BadgeVariant,
  type BadgeVariants,
} from "@bpdm/variants";

// --- i18n ---
export interface BadgeMessages {
  /** Remove (X) button aria-label. */
  remove: string;
}

export const DEFAULT_BADGE_MESSAGES: BadgeMessages = { remove: "Remove" };

export interface NotificationBadgeMessages {
  /**
   * Accessible label for a numeric count — receives the displayed count text
   * (already capped, e.g. `"99+"`). Default `"{count} notifications"`.
   */
  count: (count: string) => string;
  /** Accessible label for the dot (no-number) indicator. Default "New notifications". */
  dot: string;
}

export const DEFAULT_NOTIFICATION_BADGE_MESSAGES: NotificationBadgeMessages = {
  count: (count) => `${count} notifications`,
  dot: "New notifications",
};

/**
 * `<bpdm-badge>` — a compact status/label chip. Six variants × four appearances
 * (`soft`/`solid`/`outline`/`ghost`), an optional status `dot` (with a `pulse`
 * ring for live states), and a `removable` chip that collapses + fades out.
 * Same tones as the React badge.
 *
 * ```html
 * <bpdm-badge variant="success" dot pulse>Live</bpdm-badge>
 * <bpdm-badge variant="primary" removable (removed)="drop()">Design</bpdm-badge>
 * ```
 */
@Component({
  selector: "bpdm-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "wrapperClass()",
    "(transitionend)": "onTransitionEnd($event)",
  },
  template: `
    <span [class]="removable() ? 'block min-w-0 overflow-hidden' : 'contents'">
      <span
        [class]="badgeClass()"
        data-bpdm
        data-bpdm-slot="badge"
        [attr.role]="interactive() ? 'button' : null"
        [attr.tabindex]="interactive() ? 0 : null"
        (keydown)="onKeyDown($event)"
      >
        @if (dot()) {
          <span class="relative flex size-2 shrink-0" data-bpdm-slot="badge-dot">
            @if (pulse()) {
              <span
                class="absolute inset-0 rounded-full animate-[bpdm-ping_1.8s_var(--bpdm-ease-out)_infinite]"
                [class]="dotColor()"
                aria-hidden="true"
              ></span>
            }
            <span class="size-2 rounded-full" [class]="dotColor()"></span>
          </span>
        }
        <ng-content />
        @if (removable()) {
          <button
            type="button"
            data-bpdm-slot="badge-remove"
            [attr.aria-label]="t().remove"
            (click)="remove($event)"
            class="-me-1 ms-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-current opacity-60 transition-[color,background-color,opacity] hover:bg-foreground/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 16 16" fill="none" class="size-2.5" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        }
      </span>
    </span>
  `,
})
export class BpdmBadge {
  readonly variant = input<BadgeVariant>("neutral");
  readonly appearance = input<BadgeAppearance>("soft");
  readonly size = input<NonNullable<BadgeVariants["size"]>>("md");
  /** Leading status dot, tinted to the variant. */
  readonly dot = input(false, { transform: booleanAttribute });
  /** Animate the dot with a pulse ring — for "live" / in-progress status. */
  readonly pulse = input(false, { transform: booleanAttribute });
  /** Interactive (cursor + press feedback) — pair with a `(click)`. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Show a remove button; the badge collapses + fades, then emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  /** Override the translatable strings (currently just the remove button label). */
  readonly messages = input<Partial<BadgeMessages>>({});
  /** Fired after the badge has collapsed away. */
  readonly removed = output<void>();

  protected readonly removing = signal(false);

  protected readonly t = computed(() => ({ ...DEFAULT_BADGE_MESSAGES, ...this.messages() }));

  protected readonly dotColor = computed(() => badgeDot[this.variant()]);

  protected readonly badgeClass = computed(() => {
    const ghost = this.appearance() === "ghost";
    const tone = ghost
      ? "border-transparent bg-transparent text-foreground"
      : badgeTone[this.variant()][this.appearance() as "soft" | "solid" | "outline"];
    return cn(
      badgeVariants({ size: this.size() }),
      tone,
      ghost && "h-auto gap-1.5 px-0 text-sm font-normal",
      this.interactive() && "cursor-pointer active:scale-[0.96]",
      // an interactive badge is keyboard-operable (role=button + tabindex), so it
      // needs a visible focus ring like the rest of the library's controls
      this.interactive() &&
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      this.removable() &&
        "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)]",
      this.classInput(),
    );
  });

  protected readonly wrapperClass = computed(() => {
    if (!this.removable()) return "contents";
    return cn(
      "inline-grid transition-all duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)]",
      this.removing() ? "grid-cols-[0fr] opacity-0" : "grid-cols-[1fr] opacity-100",
    );
  });

  /**
   * An interactive badge (`role="button"`, focusable) activates on Enter/Space —
   * the synthesized click bubbles to the host's `(click)` binding, mirroring a
   * pointer click.
   */
  protected onKeyDown(e: KeyboardEvent): void {
    if (!this.interactive()) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      (e.target as HTMLElement).click();
    }
  }

  protected remove(event: Event): void {
    event.stopPropagation();
    this.removing.set(true);
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (this.removing() && event.propertyName === "grid-template-columns") {
      this.removed.emit();
    }
  }
}

/**
 * `<bpdm-notification-badge>` — overlays a count or dot on the corner of its
 * content (a bell, an avatar, a button). Pops in on mount and re-pops when the
 * count changes.
 *
 * ```html
 * <bpdm-notification-badge [count]="5"><button …>🔔</button></bpdm-notification-badge>
 * ```
 */
@Component({
  selector: "bpdm-notification-badge",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-bpdm": "", "data-bpdm-slot": "notification-badge", class: "relative inline-flex" },
  template: `
    <ng-content />
    @if (show()) {
      <span
        class="pointer-events-none absolute z-10 -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2"
        [class]="dot() ? 'end-1 top-1' : 'end-0 top-0'"
      >
        <span
          class="flex items-center justify-center rounded-full font-semibold leading-none ring-2 ring-background animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]"
          [class]="indicatorClass()"
          data-bpdm-slot="notification-badge-indicator"
          [attr.role]="announced() ? 'status' : null"
          [attr.aria-label]="announced()"
        >{{ label() }}</span>
      </span>
    }
  `,
})
export class BpdmNotificationBadge {
  /** Numeric count. Omit (with `dot`) for a plain indicator. */
  readonly count = input<number>();
  /** Cap the displayed number, e.g. max=99 shows "99+". */
  readonly max = input(99);
  /** Show a small dot instead of a number. */
  readonly dot = input(false, { transform: booleanAttribute });
  /** Still render when count is 0. */
  readonly showZero = input(false, { transform: booleanAttribute });
  readonly variant = input<BadgeVariant>("destructive");
  /**
   * Accessible name for the indicator. Overrides the default templated label
   * (`messages`). Set this when the meaning is more specific than the generic
   * default (e.g. "5 unread messages").
   */
  readonly ariaLabel = input<string | undefined>();
  /**
   * Override the translatable label templates. By default the indicator
   * announces meaningfully — "{count} notifications" for a count, "New
   * notifications" for a dot — so a screen reader never reads a bare "5".
   */
  readonly messages = input<Partial<NotificationBadgeMessages>>({});

  protected readonly t = computed(() => ({
    ...DEFAULT_NOTIFICATION_BADGE_MESSAGES,
    ...this.messages(),
  }));
  protected readonly show = computed(() => {
    if (this.dot()) return true;
    const c = this.count();
    return c !== undefined && (c > 0 || (c === 0 && this.showZero()));
  });
  protected readonly label = computed(() => {
    if (this.dot()) return "";
    const c = this.count();
    if (c === undefined) return "";
    return c > this.max() ? `${this.max()}+` : String(c);
  });
  // Announce meaningfully by default so a screen reader never reads a bare "5".
  // An explicit `ariaLabel` wins; otherwise use the templated label.
  protected readonly announced = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) return explicit;
    if (this.dot()) return this.t().dot;
    const l = this.label();
    return l ? this.t().count(l) : undefined;
  });
  protected readonly indicatorClass = computed(() =>
    cn(
      badgeTone[this.variant()].solid,
      this.dot() ? "size-2.5" : "h-[1.125rem] min-w-[1.125rem] px-1 text-[0.625rem]",
    ),
  );
}
