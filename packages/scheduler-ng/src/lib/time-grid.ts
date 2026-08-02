import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from "@angular/core";
import {
  defaultAccessor,
  isSameDay,
  layoutDay,
  minutesFromDayStart,
  MS_PER_MINUTE,
  startOfDay,
  type CalendarEvent,
} from "@bpdm/scheduler-core";
import { BpdmSchedulerEventBlock } from "./event-block";
import { dowLabel, formatHour } from "./format";
import type { SchedulerMessages } from "./messages";
import type { SlotSelection } from "./types";

const GUTTER_PX = 56; // width of the time-label gutter (the grid's first column)

/** The day/week time-grid: a time gutter plus one column per day, with positioned event blocks. */
@Component({
  selector: "bpdm-scheduler-time-grid",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmSchedulerEventBlock],
  template: `
    <div class="bpdm-sch-grid" role="grid" [attr.aria-label]="messages().gridLabel" #grid [style.maxHeight.px]="maxHeight()">
      @if (!hideHeader()) {
        <div class="bpdm-sch-head" [style.gridTemplateColumns]="columns()">
          <div class="bpdm-sch-head-cell" aria-hidden="true"></div>
          @for (d of days(); track d.toISOString()) {
            <div [class]="headCellClass(d)" role="columnheader">
              <div class="bpdm-sch-dow">{{ dow(d) }}</div>
              <div class="bpdm-sch-dnum">{{ d.getDate() }}</div>
            </div>
          }
        </div>
      }

      <div
        class="bpdm-sch-body"
        #body
        [style.gridTemplateColumns]="columns()"
        [style.height.px]="bodyHeight()"
        [style.--sch-hour-h.px]="hourHeight()"
      >
        <div class="bpdm-sch-gutter" aria-hidden="true">
          @for (h of hours(); track h) {
            <div class="bpdm-sch-hour" [style.top.px]="(h - dayStartHour()) * hourHeight()">{{ hourLabel(h) }}</div>
          }
        </div>

        @for (col of columnsData(); track col.day.toISOString()) {
          <div [class]="colClass(col.today)" role="gridcell" (click)="onColumnClick(col.day, $event)">
            @for (p of col.positioned; track p.event.id) {
              <button
                bpdm-scheduler-event-block
                [positioned]="p"
                [pxPerMinute]="pxPerMinute()"
                [spanMinutes]="spanMinutes()"
                [snapMinutes]="snapMinutes()"
                [editable]="editable()"
                [grabbed]="grabbedId() === p.event.id"
                [messages]="messages()"
                [locale]="locale()"
                [resolveDayShift]="resolveDayShift"
                (select)="select.emit($event)"
                (change)="eventChange.emit($event)"
                (grabToggle)="grabToggle.emit($event)"
                (keepFocus)="keepFocus.emit($event)"
                (announce)="announce.emit($event)"
              ></button>
            }
            @if (col.showNow) {
              <div class="bpdm-sch-now" [style.top.px]="nowTop()" aria-hidden="true"></div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class BpdmSchedulerTimeGrid implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly days = input.required<Date[]>();
  readonly events = input.required<CalendarEvent[]>();
  readonly dayStartHour = input.required<number>();
  readonly dayEndHour = input.required<number>();
  readonly scrollToHour = input.required<number>();
  readonly maxHeight = input.required<number>();
  readonly hourHeight = input.required<number>();
  readonly now = input.required<Date>();
  readonly locale = input<string>();
  readonly createDuration = input.required<number>();
  readonly snapMinutes = input.required<number>();
  readonly editable = input.required<boolean>();
  /** Whether clicking empty grid space selects a slot (for creating an event). */
  readonly selectable = input.required<boolean>();
  readonly messages = input.required<SchedulerMessages>();
  /** Id of the event currently picked up for keyboard move (grab mode), or null. */
  readonly grabbedId = input.required<string | null>();
  /** Hide the day-of-week/date header row (the compact week supplies its own strip above). */
  readonly hideHeader = input(false);

  readonly select = output<CalendarEvent>();
  readonly selectSlot = output<SlotSelection>();
  readonly eventChange = output<CalendarEvent>();
  readonly grabToggle = output<string>();
  readonly keepFocus = output<string>();
  readonly announce = output<string>();

  private readonly grid = viewChild<ElementRef<HTMLDivElement>>("grid");
  private readonly body = viewChild<ElementRef<HTMLDivElement>>("body");

  private readonly startMin = computed(() => this.dayStartHour() * 60);
  private readonly endMin = computed(() => this.dayEndHour() * 60);
  protected readonly pxPerMinute = computed(() => this.hourHeight() / 60);
  protected readonly spanMinutes = computed(() => this.endMin() - this.startMin());

  protected readonly columns = computed(
    () => `${GUTTER_PX}px repeat(${this.days().length}, minmax(var(--sch-col-min, 0px), 1fr))`,
  );

  protected readonly bodyHeight = computed(
    // one extra hour past the last so the closing (12 AM) label has a row beneath it
    () => (this.endMin() - this.startMin()) * this.pxPerMinute() + this.hourHeight(),
  );

  protected readonly hours = computed(() => {
    const out: number[] = [];
    for (let h = this.dayStartHour() + 1; h <= this.dayEndHour(); h++) out.push(h);
    return out;
  });

  private readonly nowMinutes = computed(() => minutesFromDayStart(this.now(), startOfDay(this.now())));
  protected readonly nowTop = computed(() => (this.nowMinutes() - this.startMin()) * this.pxPerMinute());

  // Lay out each day once per (days, events, range) change, then decorate with today/now-line flags.
  protected readonly columnsData = computed(() => {
    const start = this.startMin();
    const end = this.endMin();
    const now = this.now();
    const nowMin = this.nowMinutes();
    return this.days().map((d) => {
      const today = isSameDay(d, now);
      return {
        day: d,
        positioned: layoutDay(this.events(), d, start, end, defaultAccessor),
        today,
        showNow: today && nowMin >= start && nowMin <= end,
      };
    });
  });

  ngAfterViewInit(): void {
    // Open scrolled to `scrollToHour`. The grid only becomes scrollable once its stylesheet (which supplies
    // `overflow: auto`) has loaded — until then a scrollTop write is silently clamped back to 0. So write it,
    // read it back, and retry until it actually sticks. We retry with setTimeout rather than
    // requestAnimationFrame because rAF is paused in a hidden/background tab (a scheduler opened in a
    // background tab would otherwise never scroll); the loop exits the instant the write takes. Runs per
    // instance, so re-entering the grid (e.g. from month view) re-scrolls too.
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scroll = (): void => {
      const el = this.grid()?.nativeElement;
      if (!el) return;
      const target = Math.max(0, (this.scrollToHour() - this.dayStartHour()) * this.hourHeight());
      el.scrollTop = target;
      if (el.scrollTop !== target && tries++ < 60) {
        timer = setTimeout(scroll, 16);
      }
    };
    scroll();
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  protected dow(d: Date): string {
    return dowLabel(d, this.locale());
  }
  protected hourLabel(h: number): string {
    return formatHour(h, this.locale());
  }
  protected headCellClass(d: Date): string {
    return "bpdm-sch-head-cell" + (isSameDay(d, this.now()) ? " bpdm-sch-today" : "");
  }
  protected colClass(today: boolean): string {
    return (
      "bpdm-sch-col" +
      (today ? " bpdm-sch-col--today" : "") +
      (this.selectable() ? " bpdm-sch-col--selectable" : "")
    );
  }

  protected onColumnClick(day: Date, e: MouseEvent): void {
    // only fire on the column background, not on an event / now-line child
    if (!this.selectable() || e.target !== e.currentTarget) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startMin = this.startMin();
    const rawMin = startMin + (e.clientY - rect.top) / this.pxPerMinute();
    const snapped = Math.round(rawMin / this.snapMinutes()) * this.snapMinutes();
    const clamped = Math.max(startMin, Math.min(snapped, this.endMin() - this.createDuration()));
    const start = new Date(startOfDay(day).getTime() + clamped * MS_PER_MINUTE);
    const end = new Date(start.getTime() + this.createDuration() * MS_PER_MINUTE);
    this.selectSlot.emit({ start, end });
  }

  // Map a pointer X to the day column under it (for cross-day drag). Stable arrow so it can be passed
  // straight to each EventBlock's resolveDayShift input.
  protected readonly resolveDayShift = (clientX: number, originDay: Date): { targetDay: Date; dx: number } | null => {
    const el = this.body()?.nativeElement;
    const days = this.days();
    if (!el || days.length === 0) return null;
    const rect = el.getBoundingClientRect();
    const colsWidth = rect.width - GUTTER_PX;
    if (colsWidth <= 0) return null;
    const colW = colsWidth / days.length;
    const raw = Math.floor((clientX - rect.left - GUTTER_PX) / colW);
    const targetIdx = Math.max(0, Math.min(raw, days.length - 1));
    const originIdx = days.findIndex((d) => isSameDay(d, originDay));
    return { targetDay: days[targetIdx], dx: originIdx < 0 ? 0 : (targetIdx - originIdx) * colW };
  };
}
