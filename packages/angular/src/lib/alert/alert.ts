import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { type AlertAppearance, alertTones, cn, type AlertVariant } from "@bpdm/variants";

/** Actions row inside an alert — lays its buttons out with the right spacing. */
@Directive({
  selector: "[bpdmAlertActions]",
  host: { class: "mt-3 flex flex-wrap gap-2" },
})
export class BpdmAlertActions {}

/**
 * `<bpdm-alert>` — an inline, persistent alert: a colored accent, a tinted icon,
 * a title and body, with an optional actions slot and a dismiss button. Three
 * appearances (`soft` / `solid` / `outline`) × the full severity palette.
 * Theme-aware across all four themes. For transient notifications use a toast.
 *
 * ```html
 * <bpdm-alert variant="success" title="Saved" dismissible (closed)="onClose()">
 *   Your changes have been published.
 *   <div bpdmAlertActions><button bpdmButton size="sm" variant="secondary" appearance="ghost">Undo</button></div>
 * </bpdm-alert>
 * ```
 *
 * Colors come from the shared `@bpdm/variants` tones — identical to the React alert.
 */
@Component({
  selector: "bpdm-alert",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // dismissible alerts collapse their height + fade on close
    class: "grid transition-all duration-200 ease-out",
    "[class.grid-rows-[0fr]]": "closing()",
    "[class.opacity-0]": "closing()",
    "[class.grid-rows-[1fr]]": "!closing()",
    "[class.opacity-100]": "!closing()",
    "(transitionend)": "onTransitionEnd($event)",
  },
  template: `
    <div class="min-h-0 overflow-hidden">
      <div role="alert" [class]="boxClass()">
        @if (showIcon()) {
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg animate-[bpdm-pop-in_220ms_ease-out]"
            [class]="iconWrapClass()"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
              [class]="iconColor()"
              aria-hidden="true"
            >
              @switch (variant()) {
                @case ("success") {
                  <path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" />
                }
                @case ("warning") {
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
                }
                @case ("error") {
                  <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                }
                @case ("help") {
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
                }
                @default {
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                }
              }
            </svg>
          </span>
        }

        <div class="min-w-0 flex-1" [class.pr-6]="dismissible()">
          @if (title()) {
            <p class="text-sm font-semibold">{{ title() }}</p>
          }
          <div class="text-sm empty:hidden" [class]="bodyClass()" [class.mt-1]="!!title()">
            <ng-content />
          </div>
          <ng-content select="[bpdmAlertActions]" />
        </div>

        @if (dismissible()) {
          <button
            type="button"
            (click)="dismiss()"
            aria-label="Dismiss"
            class="absolute right-2.5 top-2.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            [class]="closeClass()"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="size-3.5" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class BpdmAlert {
  /** Color + default icon. */
  readonly variant = input<AlertVariant>("default");
  /** Visual style — `soft` (tinted, default), `solid` (filled), `outline` (border). */
  readonly appearance = input<AlertAppearance>("soft");
  /** Bold heading line. */
  readonly title = input<string>();
  /** Show a dismiss button; emits `closed` after the collapse animation. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  /** Show the leading status icon. */
  readonly showIcon = input(true, { transform: booleanAttribute });
  /** Fired once the alert has finished collapsing after dismiss. */
  readonly closed = output<void>();

  protected readonly closing = signal(false);
  protected readonly tone = computed(() => alertTones[this.variant()]);
  private readonly solid = computed(() => this.appearance() === "solid");

  protected readonly boxClass = computed(() => {
    const base = "relative flex w-full gap-3 overflow-hidden rounded-lg border p-4 shadow-sm";
    const a = this.appearance();
    if (a === "solid") return cn(base, this.tone().solid);
    if (a === "outline") return cn(base, "bg-card text-card-foreground", this.tone().outline);
    return cn(
      base,
      "border-border bg-card text-card-foreground before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
      this.tone().accent,
    );
  });
  protected readonly iconWrapClass = computed(() => (this.solid() ? "bg-white/15" : this.tone().tint));
  protected readonly iconColor = computed(() => (this.solid() ? "" : this.tone().fg));
  protected readonly bodyClass = computed(() => (this.solid() ? "text-current/90" : "text-muted-foreground"));
  protected readonly closeClass = computed(() =>
    this.solid()
      ? "text-current/70 hover:bg-white/15 hover:text-current"
      : "text-muted-foreground/70 hover:bg-muted hover:text-foreground",
  );

  protected dismiss(): void {
    this.closing.set(true);
  }

  protected onTransitionEnd(event: TransitionEvent): void {
    if (this.closing() && event.propertyName === "grid-template-rows") {
      this.closed.emit();
    }
  }
}
