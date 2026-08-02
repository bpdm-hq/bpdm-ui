import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { isSameDay, startOfDay, type CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { dowLabel, formatDayLabel } from "./format";
import type { SchedulerMessages } from "./messages";
import type { SlotSelection } from "./types";

const MS_PER_MINUTE = 60_000;
const DRAG_THRESHOLD_PX = 3;
// Wheel-to-navigate tuning: accumulate so a small nudge doesn't flip a month; cool down so one flick
// can't skip several.
const WHEEL_THRESHOLD = 48;
const WHEEL_COOLDOWN_MS = 340;
const CHIP_KEY_SHORTCUTS = "Enter Space ArrowLeft ArrowRight ArrowUp ArrowDown Escape";

interface Cell {
  day: Date;
  dayMs: number;
  inMonth: boolean;
  today: boolean;
  shown: CalendarEvent[];
  extra: number;
  total: number;
}

/** The month grid: weeks of day cells with event chips and a "+N more" overflow. Chips are draggable to
 *  another day (pointer + keyboard grab mode); scrolling the grid navigates months. */
@Component({
  selector: "bpdm-scheduler-month-view",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bpdm-sch-month" role="grid" [attr.aria-label]="messages().monthLabel" #root>
      <div class="bpdm-sch-mhead" role="row">
        @for (d of headerDays(); track d.toISOString()) {
          <div role="columnheader">{{ dow(d) }}</div>
        }
      </div>

      @for (row of rows(); track row.key) {
        <div class="bpdm-sch-mrow" role="row">
          @for (cell of row.cells; track cell.day.toISOString()) {
            <div
              [class]="cellClass(cell)"
              role="gridcell"
              [attr.data-day-ms]="cell.dayMs"
              (click)="onCellClick(cell.day, $event)"
            >
              <span class="bpdm-sch-cell-d">{{ cell.day.getDate() }}</span>
              <div class="bpdm-sch-cell-events">
                @for (e of cell.shown; track e.id) {
                  <button
                    type="button"
                    [attr.data-event-id]="e.id"
                    [class]="chipClass(e)"
                    [style.--c]="catColor(e.category)"
                    [title]="e.title"
                    [attr.aria-roledescription]="canDrag() ? messages().eventAdjustable : null"
                    [attr.aria-keyshortcuts]="canDrag() ? chipKeyShortcuts : null"
                    (pointerdown)="onChipPointerDown(e, $event)"
                    (keydown)="onChipKeyDown(e, $event)"
                    (click)="onChipClick(e)"
                  >
                    <span class="bpdm-sch-chip-dot" aria-hidden="true"></span>
                    <span class="bpdm-sch-chip-label">{{ e.title }}</span>
                  </button>
                }
                @if (cell.extra > 0) {
                  <button
                    type="button"
                    class="bpdm-sch-more"
                    [attr.aria-label]="showAllLabel(cell.total)"
                    (click)="openDay.emit(cell.day)"
                  >
                    +{{ cell.extra }} {{ messages().more }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class BpdmSchedulerMonthView {
  /** As many weeks as the month spans (5 or 6). */
  readonly weeks = input.required<Date[][]>();
  /** The focused month — days outside it are dimmed. */
  readonly monthDate = input.required<Date>();
  readonly events = input.required<CalendarEvent[]>();
  readonly now = input.required<Date>();
  readonly locale = input<string>();
  /** Max event chips shown per day cell before "+N more". */
  readonly monthMaxChips = input.required<number>();
  /** A month cell has no time axis, so a click proposes this hour (0–23). */
  readonly createDefaultHour = input.required<number>();
  readonly createDuration = input.required<number>();
  readonly editable = input.required<boolean>();
  /** Whether clicking an empty cell selects a slot (for creating an event). */
  readonly selectable = input.required<boolean>();
  readonly messages = input.required<SchedulerMessages>();
  /** Id of the chip currently picked up for keyboard move (grab mode), or null. */
  readonly grabbedId = input.required<string | null>();

  readonly select = output<CalendarEvent>();
  readonly selectSlot = output<SlotSelection>();
  /** Clicking "+N more" opens the full-day list for that date. */
  readonly openDay = output<Date>();
  /** Scrolling down over the grid advances a month; up goes back. */
  readonly next = output<void>();
  readonly previous = output<void>();
  readonly eventChange = output<CalendarEvent>();
  readonly grabToggle = output<string>();
  readonly keepFocus = output<string>();
  readonly announce = output<string>();

  protected readonly chipKeyShortcuts = CHIP_KEY_SHORTCUTS;

  private readonly root = viewChild<ElementRef<HTMLDivElement>>("root");
  protected readonly dragOverMs = signal<number | null>(null);
  private chipMoved = false;
  private activeMove: ((ev: PointerEvent) => void) | null = null;
  private activeUp: ((ev: PointerEvent) => void) | null = null;

  protected readonly canDrag = computed(() => this.editable());
  protected readonly headerDays = computed(() => this.weeks()[0] ?? []);

  // Group events by day once (sorted), so each cell is an O(1) lookup instead of filtering the list.
  private readonly eventsByDay = computed(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const e of this.events()) {
      const key = startOfDay(e.start).getTime();
      const bucket = map.get(key);
      if (bucket) bucket.push(e);
      else map.set(key, [e]);
    }
    for (const bucket of map.values()) bucket.sort((a, b) => a.start.getTime() - b.start.getTime());
    return map;
  });

  protected readonly rows = computed(() => {
    const month = this.monthDate().getMonth();
    const now = this.now();
    const byDay = this.eventsByDay();
    const maxChips = this.monthMaxChips();
    return this.weeks().map((week) => ({
      key: week[0]?.toISOString() ?? "",
      cells: week.map((day): Cell => {
        const dayMs = startOfDay(day).getTime();
        const dayEvents = byDay.get(dayMs) ?? [];
        const shown = dayEvents.slice(0, maxChips);
        return {
          day,
          dayMs,
          inMonth: day.getMonth() === month,
          today: isSameDay(day, now),
          shown,
          extra: dayEvents.length - shown.length,
          total: dayEvents.length,
        };
      }),
    }));
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Wheel-to-navigate — registered non-passive so we can preventDefault (mirrors the React binding).
    afterNextRender(() => {
      const el = this.root()?.nativeElement;
      if (!el) return;
      let acc = 0;
      let cooling = false;
      const onWheel = (e: WheelEvent): void => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return; // leave horizontal / pinch alone
        e.preventDefault();
        if (cooling) return;
        acc += e.deltaY;
        if (Math.abs(acc) < WHEEL_THRESHOLD) return;
        const goNext = acc > 0;
        acc = 0;
        cooling = true;
        if (goNext) this.next.emit();
        else this.previous.emit();
        window.setTimeout(() => (cooling = false), WHEEL_COOLDOWN_MS);
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      destroyRef.onDestroy(() => el.removeEventListener("wheel", onWheel));
    });
    destroyRef.onDestroy(() => this.teardownDrag());
  }

  protected dow(d: Date): string {
    return dowLabel(d, this.locale());
  }
  protected catColor(category?: string): string {
    return categoryColor(category);
  }
  protected showAllLabel(total: number): string {
    return this.messages().showAll.replace("{count}", String(total));
  }
  protected cellClass(cell: Cell): string {
    return (
      "bpdm-sch-cell" +
      (cell.inMonth ? "" : " bpdm-sch-cell--out") +
      (cell.today ? " bpdm-sch-cell--today" : "") +
      (this.selectable() ? " bpdm-sch-cell--selectable" : "") +
      (this.dragOverMs() === cell.dayMs ? " bpdm-sch-cell--dragover" : "")
    );
  }
  protected chipClass(e: CalendarEvent): string {
    return (
      "bpdm-sch-chip" +
      (this.canDrag() ? " bpdm-sch-chip--editable" : "") +
      (this.grabbedId() === e.id ? " bpdm-sch-chip--grabbed" : "")
    );
  }

  protected onCellClick(day: Date, e: MouseEvent): void {
    // only the empty cell background, not a chip / "+N more"
    if (!this.selectable() || e.target !== e.currentTarget) return;
    const start = new Date(day);
    start.setHours(this.createDefaultHour(), 0, 0, 0);
    const end = new Date(start.getTime() + this.createDuration() * MS_PER_MINUTE);
    this.selectSlot.emit({ start, end });
  }

  protected onChipClick(e: CalendarEvent): void {
    if (!this.canDrag()) this.select.emit(e);
  }

  // Move only (month is day-granular, so no resize) — drag a chip to another day.
  protected onChipPointerDown(event: CalendarEvent, ev: PointerEvent): void {
    if (!this.canDrag() || ev.button !== 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    (ev.currentTarget as HTMLElement).focus(); // keep focus so keyboard move works after a click
    const startX = ev.clientX;
    const startY = ev.clientY;
    this.chipMoved = false;
    const onMove = (m: PointerEvent): void => {
      if (Math.abs(m.clientX - startX) > DRAG_THRESHOLD_PX || Math.abs(m.clientY - startY) > DRAG_THRESHOLD_PX) {
        this.chipMoved = true;
      }
      this.dragOverMs.set(this.dayMsUnder(m.clientX, m.clientY));
    };
    const onUp = (m: PointerEvent): void => {
      this.teardownDrag();
      this.dragOverMs.set(null);
      if (!this.chipMoved) {
        this.select.emit(event); // no real movement → treat as a click
        return;
      }
      const targetMs = this.dayMsUnder(m.clientX, m.clientY);
      if (targetMs !== null) this.commitDayMove(event, targetMs);
    };
    this.activeMove = onMove;
    this.activeUp = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  private teardownDrag(): void {
    if (this.activeMove) window.removeEventListener("pointermove", this.activeMove);
    if (this.activeUp) window.removeEventListener("pointerup", this.activeUp);
    this.activeMove = null;
    this.activeUp = null;
  }

  private dayMsUnder(clientX: number, clientY: number): number | null {
    const cell = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-day-ms]");
    const ms = cell?.dataset["dayMs"];
    return ms ? Number(ms) : null;
  }

  private commitDayMove(event: CalendarEvent, targetDayMs: number): void {
    const shift = targetDayMs - startOfDay(event.start).getTime();
    if (shift === 0) return;
    const next: CalendarEvent = {
      ...event,
      start: new Date(event.start.getTime() + shift),
      end: new Date(event.end.getTime() + shift),
    };
    this.eventChange.emit(next);
    this.announce.emit(`${this.messages().movedTo} ${formatDayLabel(next.start, this.locale())}`);
  }

  // Keyboard alternative to dragging via a grab mode: Enter opens; Space picks up / drops; while
  // grabbed, ←/→ move a day, ↑/↓ a week; Escape releases.
  protected onChipKeyDown(event: CalendarEvent, e: KeyboardEvent): void {
    if (!this.canDrag()) return;
    const isGrabbed = this.grabbedId() === event.id;
    if (e.key === "Escape") {
      if (isGrabbed) {
        e.preventDefault();
        this.grabToggle.emit(event.id);
        this.announce.emit(this.messages().dropped);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (isGrabbed) {
        this.grabToggle.emit(event.id);
        this.announce.emit(this.messages().dropped);
      } else {
        this.select.emit(event);
      }
      return;
    }
    if (e.key === " ") {
      e.preventDefault(); // also stops the page from scrolling
      this.grabToggle.emit(event.id);
      this.announce.emit(isGrabbed ? this.messages().dropped : this.messages().grabbed);
      return;
    }
    if (!isGrabbed) return; // arrows only move once picked up
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const days = deltas[e.key];
    if (days === undefined) return;
    e.preventDefault();
    const target = startOfDay(event.start);
    target.setDate(target.getDate() + days);
    this.commitDayMove(event, target.getTime());
    // moving lands the chip in another cell → remount; restore focus so grab stays live
    this.keepFocus.emit(event.id);
  }
}
