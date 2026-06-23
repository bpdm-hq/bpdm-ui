import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { alertTones, cn, type AlertVariant } from "@bpdm/variants";

/**
 * `<bpdm-alert>` — an inline, persistent alert: a colored left accent, a tinted
 * icon, a title and body, with an optional actions slot and a dismiss button.
 * Theme-aware across all four themes. For transient notifications use a toast.
 *
 * ```html
 * <bpdm-alert variant="success" title="Saved" dismissible (closed)="onClose()">
 *   Your changes have been published.
 *   <div bpdmAlertActions><button bpdmButton size="sm" variant="ghost">Undo</button></div>
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
      <div
        role="alert"
        [class]="boxClass()"
      >
        @if (showIcon()) {
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg animate-[bpdm-pop-in_220ms_ease-out]"
            [class]="tone().tint"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="size-4"
              [class]="tone().fg"
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
          <div class="text-sm text-muted-foreground empty:hidden" [class.mt-1]="!!title()">
            <ng-content />
          </div>
          <div class="mt-3 flex flex-wrap gap-2 empty:hidden">
            <ng-content select="[bpdmAlertActions]" />
          </div>
        </div>

        @if (dismissible()) {
          <button
            type="button"
            (click)="dismiss()"
            aria-label="Dismiss"
            class="absolute right-2.5 top-2.5 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  /** Bold heading line. */
  readonly title = input<string>();
  /** Show a dismiss button; emits `closed` after the collapse animation. */
  readonly dismissible = input(false);
  /** Show the leading status icon. */
  readonly showIcon = input(true);
  /** Fired once the alert has finished collapsing after dismiss. */
  readonly closed = output<void>();

  protected readonly closing = signal(false);
  protected readonly tone = computed(() => alertTones[this.variant()]);
  protected readonly boxClass = computed(() =>
    cn(
      "relative flex w-full gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
      "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
      this.tone().accent,
    ),
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
