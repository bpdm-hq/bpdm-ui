import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from "@angular/core";
import { startOfDay, type CalendarEvent, type PositionedEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatDayLabel, formatTime } from "./format";
import type { SchedulerMessages } from "./messages";

const MS_PER_MINUTE = 60_000;
const DRAG_THRESHOLD_PX = 3; // movement under this is a click, not a drag
const KEY_SHORTCUTS =
  "Enter Space ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Escape";

type DragMode = "move" | "resize";
type DayShift = (clientX: number, originDay: Date) => { targetDay: Date; dx: number } | null;

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(v, hi));

/**
 * A single positioned event in the day/week grid. The host IS the `<button>` (so it's the absolutely
 * positioned child of the column, exactly like the React binding) — drag to move (cross-day in week) or
 * resize the bottom edge; fully keyboard-operable via a grab mode (WCAG 2.1.1 + 2.5.7).
 */
@Component({
  selector: "button[bpdm-scheduler-event-block]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: "button",
    class: "bpdm-sch-event",
    "[class.bpdm-sch-event--editable]": "canDrag()",
    "[class.bpdm-sch-event--dragging]": "preview() !== null",
    "[class.bpdm-sch-event--grabbed]": "grabbed()",
    "[attr.data-event-id]": "event().id",
    "[style.--c]": "catColor()",
    "[style.--z]": "lane() + 1",
    "[style.top.px]": "topPx()",
    "[style.height.px]": "heightPx()",
    "[style.left]": "leftCalc()",
    "[style.width]": "widthCalc()",
    "[style.transform]": "transform()",
    "[title]": "titleText()",
    "[attr.aria-roledescription]": "canDrag() ? messages().eventAdjustable : null",
    "[attr.aria-keyshortcuts]": "canDrag() ? keyShortcuts : null",
    "(pointerdown)": "onPointerDown($event)",
    "(keydown)": "onKeyDown($event)",
    "(click)": "onClick()",
  },
  template: `
    <span class="bpdm-sch-event-title">{{ event().title }}</span>
    @if (showTime()) {
      <span class="bpdm-sch-event-time">{{ time(event().start) }} – {{ time(event().end) }}</span>
    }
    @if (canDrag()) {
      <span class="bpdm-sch-event-resize" aria-hidden="true" (pointerdown)="onResizeDown($event)"></span>
    }
  `,
})
export class BpdmSchedulerEventBlock {
  readonly positioned = input.required<PositionedEvent<CalendarEvent>>();
  readonly pxPerMinute = input.required<number>();
  /** Total minutes the grid spans (dayEnd − dayStart) — bounds a drag. */
  readonly spanMinutes = input.required<number>();
  /** Snap a dragged/keyboard-nudged edge or position to this many minutes. */
  readonly snapMinutes = input.required<number>();
  /** Enable drag-to-move / drag-to-resize. */
  readonly editable = input.required<boolean>();
  /** True while this event is "picked up" for keyboard move (grab mode). */
  readonly grabbed = input.required<boolean>();
  readonly locale = input<string>();
  readonly messages = input.required<SchedulerMessages>();
  /** Map a pointer X to the day column under it — enables cross-day (week) drag. */
  readonly resolveDayShift = input<DayShift>();

  readonly select = output<CalendarEvent>();
  /** The moved/resized event when a change commits. */
  readonly change = output<CalendarEvent>();
  /** Toggle grab (pick up / drop) for keyboard move. */
  readonly grabToggle = output<string>();
  /** Ask the scheduler to restore focus to this event after it re-renders (survives remounts). */
  readonly keepFocus = output<string>();
  /** Announce a change to assistive tech. */
  readonly announce = output<string>();

  protected readonly keyShortcuts = KEY_SHORTCUTS;

  protected readonly preview = signal<{ mode: DragMode; delta: number; dx: number; targetDay: Date | null } | null>(null);
  private drag: { mode: DragMode; startY: number; moved: boolean } | null = null;
  private activeMove: ((ev: PointerEvent) => void) | null = null;
  private activeUp: ((ev: PointerEvent) => void) | null = null;

  protected readonly event = computed(() => this.positioned().event);
  protected readonly lane = computed(() => this.positioned().lane);
  private readonly columns = computed(() => this.positioned().columns);
  private readonly topMinutes = computed(() => this.positioned().topMinutes);
  private readonly heightMinutes = computed(() => this.positioned().heightMinutes);
  protected readonly canDrag = computed(() => this.editable());

  private readonly previewTop = computed(() => {
    const p = this.preview();
    return p?.mode === "move" ? this.topMinutes() + p.delta : this.topMinutes();
  });
  private readonly previewHeight = computed(() => {
    const p = this.preview();
    return p?.mode === "resize" ? this.heightMinutes() + p.delta : this.heightMinutes();
  });
  protected readonly topPx = computed(() => this.previewTop() * this.pxPerMinute());
  protected readonly heightPx = computed(() => Math.max(this.previewHeight() * this.pxPerMinute() - 3, 16));
  protected readonly leftCalc = computed(() => `calc(3px + ${this.lane()} * var(--sch-overlap))`);
  protected readonly widthCalc = computed(() => `calc(100% - 6px - ${this.columns() - 1} * var(--sch-overlap))`);
  protected readonly transform = computed(() => {
    const p = this.preview();
    return p?.mode === "move" && p.dx ? `translateX(${p.dx}px)` : null;
  });
  protected readonly showTime = computed(() => this.heightMinutes() >= 40);
  protected readonly catColor = computed(() => categoryColor(this.event().category));
  protected readonly titleText = computed(() => {
    const e = this.event();
    return `${e.title} · ${formatTime(e.start, this.locale())} – ${formatTime(e.end, this.locale())}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.teardownDrag());
  }

  protected time(d: Date): string {
    return formatTime(d, this.locale());
  }

  // Clamp a minute-delta so the block stays inside the grid (and keeps a minimum duration).
  private clampDelta(mode: DragMode, rawMin: number): number {
    const snapped = Math.round(rawMin / this.snapMinutes()) * this.snapMinutes();
    const top = this.topMinutes();
    const height = this.heightMinutes();
    const span = this.spanMinutes();
    if (mode === "move") return clamp(top + snapped, 0, span - height) - top;
    return clamp(height + snapped, this.snapMinutes(), span - top) - height;
  }

  // A move = an optional day shift (cross-day) plus a within-day time shift.
  private commitMove(timeDeltaMin: number, targetDay: Date | null): void {
    const event = this.event();
    const dayShiftMs = targetDay ? startOfDay(targetDay).getTime() - startOfDay(event.start).getTime() : 0;
    const shift = dayShiftMs + timeDeltaMin * MS_PER_MINUTE;
    if (shift === 0) return;
    const next: CalendarEvent = {
      ...event,
      start: new Date(event.start.getTime() + shift),
      end: new Date(event.end.getTime() + shift),
    };
    this.change.emit(next);
    const l = this.locale();
    this.announce.emit(
      dayShiftMs !== 0
        ? `${this.messages().movedTo} ${formatDayLabel(next.start, l)} ${formatTime(next.start, l)}`
        : `${this.messages().movedTo} ${formatTime(next.start, l)} – ${formatTime(next.end, l)}`,
    );
  }

  private commitResize(deltaMin: number): void {
    if (deltaMin === 0) return;
    const event = this.event();
    const next: CalendarEvent = { ...event, end: new Date(event.end.getTime() + deltaMin * MS_PER_MINUTE) };
    this.change.emit(next);
    this.announce.emit(`${this.messages().resizedTo} ${formatTime(next.end, this.locale())}`);
  }

  protected onPointerDown(e: PointerEvent): void {
    this.beginDrag("move", e);
  }
  protected onResizeDown(e: PointerEvent): void {
    this.beginDrag("resize", e);
  }

  private beginDrag(mode: DragMode, e: PointerEvent): void {
    if (!this.canDrag() || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // preventDefault stops the browser focusing the button on pointerdown — restore it so a keyboard
    // move/resize works right after a click, not only after Tab.
    (e.currentTarget as HTMLElement).closest("button")?.focus();
    const startY = e.clientY;
    this.drag = { mode, startY, moved: false };
    const onMove = (ev: PointerEvent): void => {
      if (Math.abs(ev.clientY - startY) > DRAG_THRESHOLD_PX && this.drag) this.drag.moved = true;
      const delta = this.clampDelta(mode, (ev.clientY - startY) / this.pxPerMinute());
      const shift = mode === "move" ? (this.resolveDayShift()?.(ev.clientX, this.event().start) ?? null) : null;
      this.preview.set({ mode, delta, dx: shift?.dx ?? 0, targetDay: shift?.targetDay ?? null });
    };
    const onUp = (ev: PointerEvent): void => {
      this.teardownDrag();
      const d = this.drag;
      this.drag = null;
      this.preview.set(null);
      if (!d?.moved) {
        this.select.emit(this.event()); // no real movement → treat as a click
        return;
      }
      const delta = this.clampDelta(mode, (ev.clientY - startY) / this.pxPerMinute());
      if (mode === "resize") this.commitResize(delta);
      else this.commitMove(delta, this.resolveDayShift()?.(ev.clientX, this.event().start)?.targetDay ?? null);
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

  protected onClick(): void {
    if (!this.canDrag()) this.select.emit(this.event());
  }

  // Keyboard operability via a grab mode so arrows don't fight grid navigation.
  protected onKeyDown(e: KeyboardEvent): void {
    if (!this.canDrag()) return;
    const event = this.event();
    const grabbed = this.grabbed();
    if (e.key === "Escape") {
      if (grabbed) {
        e.preventDefault();
        this.grabToggle.emit(event.id);
        this.announce.emit(this.messages().dropped);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (grabbed) {
        this.grabToggle.emit(event.id);
        this.announce.emit(this.messages().dropped);
      } else {
        this.select.emit(event);
      }
      return;
    }
    if (e.key === " ") {
      e.preventDefault(); // also stops the page scrolling
      this.grabToggle.emit(event.id);
      this.announce.emit(grabbed ? this.messages().dropped : this.messages().grabbed);
      return;
    }
    if (!grabbed) return; // arrows only move once picked up
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? -1 : 1;
      if (e.shiftKey) this.commitResize(this.clampDelta("resize", dir * this.snapMinutes()));
      else this.commitMove(this.clampDelta("move", dir * this.snapMinutes()), null);
      this.keepFocus.emit(event.id);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const targetDay = new Date(event.start);
      targetDay.setDate(targetDay.getDate() + (e.key === "ArrowLeft" ? -1 : 1));
      this.commitMove(0, targetDay);
      this.keepFocus.emit(event.id);
    }
  }
}
