import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { isSameDay, type CalendarEvent } from "@bpdm/scheduler-core";
import { dowLabel, formatDayLabel } from "./format";
import type { SchedulerMessages } from "./messages";

/**
 * The compact-week day picker: a row of the week's seven days (two-letter name + date), shown above a
 * single-day grid on narrow screens. Tapping a day switches the grid to it. Each day is a real button
 * with a full-date accessible name and `aria-current="date"` on the selected one.
 */
@Component({
  selector: "bpdm-scheduler-week-strip",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bpdm-sch-strip" role="group" [attr.aria-label]="messages().gridLabel">
      @for (d of days(); track d.toISOString()) {
        <button
          type="button"
          [class]="dayClass(d)"
          [attr.aria-current]="sameDay(d, selected()) ? 'date' : null"
          [attr.aria-label]="fullLabel(d)"
          (click)="select.emit(d)"
        >
          <span class="bpdm-sch-strip-dow" aria-hidden="true">{{ dow(d) }}</span>
          <span class="bpdm-sch-strip-date">{{ d.getDate() }}</span>
          <span class="bpdm-sch-strip-dot" aria-hidden="true" [attr.data-has]="hasEvents(d) ? '' : null"></span>
        </button>
      }
    </div>
  `,
})
export class BpdmSchedulerWeekStrip {
  /** The seven days of the focused week. */
  readonly days = input.required<Date[]>();
  /** The day currently shown in the grid below. */
  readonly selected = input.required<Date>();
  readonly now = input.required<Date>();
  /** The visible week's events — drives the "has events" dot under each day. */
  readonly events = input.required<CalendarEvent[]>();
  readonly locale = input<string>();
  readonly messages = input.required<SchedulerMessages>();

  readonly select = output<Date>();

  protected sameDay(a: Date, b: Date): boolean {
    return isSameDay(a, b);
  }

  protected dow(d: Date): string {
    return dowLabel(d, this.locale()).slice(0, 2);
  }

  protected fullLabel(d: Date): string {
    return formatDayLabel(d, this.locale());
  }

  protected hasEvents(d: Date): boolean {
    return this.events().some((e) => isSameDay(e.start, d));
  }

  protected dayClass(d: Date): string {
    return (
      "bpdm-sch-strip-day" +
      (isSameDay(d, this.selected()) ? " bpdm-sch-strip-day--sel" : "") +
      (isSameDay(d, this.now()) ? " bpdm-sch-strip-day--today" : "")
    );
  }
}
