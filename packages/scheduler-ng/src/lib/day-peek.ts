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
 * The full list of a day's events, opened from a month cell's "+N more". A self-contained popup (no
 * deps); each row opens that event's detail dialog. Background scroll is locked while it is open.
 */
@Component({
  selector: "bpdm-scheduler-day-peek",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "bpdm-sch-ov",
    role: "dialog",
    "[attr.aria-modal]": "'true'",
    "[attr.aria-label]": "peekLabel()",
    "(click)": "onBackdrop($event)",
    "(document:keydown.escape)": "close.emit()",
  },
  template: `
    <div class="bpdm-sch-peek">
      <div class="bpdm-sch-peek-head">
        <div class="bpdm-sch-peek-dow">{{ dow() }}</div>
        <div class="bpdm-sch-peek-dnum">{{ day().getDate() }}</div>
        <button #closeBtn type="button" class="bpdm-sch-dlg-x" [attr.aria-label]="messages().close" (click)="close.emit()">
          ✕
        </button>
      </div>
      <div class="bpdm-sch-peek-list">
        @for (e of events(); track e.id) {
          <button type="button" class="bpdm-sch-peek-item" [style.--c]="catColor(e.category)" (click)="select.emit(e)">
            <span class="bpdm-sch-peek-dot" aria-hidden="true"></span>
            <span class="bpdm-sch-peek-time">{{ e.allDay ? messages().allDay : time(e.start) }}</span>
            <span class="bpdm-sch-peek-title">{{ e.title }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class BpdmSchedulerDayPeek implements AfterViewInit {
  readonly day = input.required<Date>();
  /** All events on that day (already sorted). */
  readonly events = input.required<CalendarEvent[]>();
  readonly locale = input<string>();
  readonly messages = input.required<SchedulerMessages>();

  readonly select = output<CalendarEvent>();
  readonly close = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly closeBtn = viewChild.required<ElementRef<HTMLButtonElement>>("closeBtn");

  constructor() {
    inject(DestroyRef).onDestroy(lockBodyScroll());
  }

  ngAfterViewInit(): void {
    this.closeBtn().nativeElement.focus();
  }

  protected peekLabel(): string {
    return formatDayLabel(this.day(), this.locale());
  }

  protected dow(): string {
    return this.day().toLocaleDateString(this.locale(), { weekday: "short" });
  }

  protected time(d: Date): string {
    return formatTime(d, this.locale());
  }

  protected catColor(category?: string): string {
    return categoryColor(category);
  }

  protected onBackdrop(e: MouseEvent): void {
    if (e.target === this.host.nativeElement) this.close.emit();
  }
}
