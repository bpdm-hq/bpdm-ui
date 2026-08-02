import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import type { CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatDayLabel, formatTime } from "./format";
import type { SchedulerMessages } from "./messages";
import { lockBodyScroll } from "./scroll-lock";

/**
 * A self-contained, token-styled detail dialog. Bypassed when the consumer handles `(eventClick)`
 * themselves. Opened from the day peek it shows a ‹ Back control that returns to the list.
 */
@Component({
  selector: "bpdm-scheduler-event-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "bpdm-sch-ov",
    role: "dialog",
    "[attr.aria-modal]": "'true'",
    "[attr.aria-label]": "event().title",
    "(click)": "onBackdrop($event)",
    "(document:keydown.escape)": "onEscape()",
  },
  template: `
    <div class="bpdm-sch-dlg" [style.--c]="catColor()">
      <div class="bpdm-sch-dlg-head">
        @if (canBack()) {
          <button type="button" class="bpdm-sch-dlg-back" [attr.aria-label]="messages().back" (click)="back.emit()">‹</button>
        }
        <div class="bpdm-sch-dlg-titlewrap">
          <span class="bpdm-sch-dlg-bar" aria-hidden="true"></span>
          <div class="bpdm-sch-dlg-title" role="heading" aria-level="3">{{ event().title }}</div>
        </div>
        <button #closeBtn type="button" class="bpdm-sch-dlg-x" [attr.aria-label]="messages().close" (click)="close.emit()">
          ✕
        </button>
      </div>
      <div class="bpdm-sch-dlg-body">
        <div class="bpdm-sch-dlg-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>{{ when() }}</span>
        </div>
        @if (event().location) {
          <div class="bpdm-sch-dlg-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{{ event().location }}</span>
          </div>
        }
        @if (event().description) {
          <p class="bpdm-sch-dlg-desc">{{ event().description }}</p>
        }
      </div>
      <div class="bpdm-sch-dlg-foot">
        <button type="button" class="bpdm-sch-btn" (click)="close.emit()">{{ messages().close }}</button>
      </div>
    </div>
  `,
})
export class BpdmSchedulerEventDialog implements AfterViewInit {
  readonly event = input.required<CalendarEvent>();
  readonly locale = input<string>();
  readonly messages = input.required<SchedulerMessages>();
  /** When opened from the day peek, show a ‹ Back control (Escape returns to the list). */
  readonly canBack = input(false);

  readonly close = output<void>();
  readonly back = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly closeBtn = viewChild.required<ElementRef<HTMLButtonElement>>("closeBtn");

  constructor() {
    inject(DestroyRef).onDestroy(lockBodyScroll());
  }

  ngAfterViewInit(): void {
    this.closeBtn().nativeElement.focus();
  }

  protected catColor(): string {
    return categoryColor(this.event().category);
  }

  protected when(): string {
    const e = this.event();
    const l = this.locale();
    return `${formatDayLabel(e.start, l)} · ${formatTime(e.start, l)} – ${formatTime(e.end, l)}`;
  }

  protected onEscape(): void {
    if (this.canBack()) this.back.emit();
    else this.close.emit();
  }

  protected onBackdrop(e: MouseEvent): void {
    if (e.target === this.host.nativeElement) this.close.emit();
  }
}
