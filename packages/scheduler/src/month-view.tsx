import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { isSameDay, startOfDay, type CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import type { SchedulerMessages } from "./messages";
import type { SlotSelection } from "./types";
import { dowLabel, formatDayLabel } from "./format";

const DRAG_THRESHOLD_PX = 3;

const MS_PER_MINUTE = 60_000;

// Wheel-to-navigate tuning: accumulate delta so a small trackpad nudge doesn't
// flip a month, and cool down so one flick can't skip several.
const WHEEL_THRESHOLD = 48;
const WHEEL_COOLDOWN_MS = 340;

export interface MonthViewProps {
  /** Six rows of seven days. */
  weeks: Date[][];
  /** The focused month — days outside it are dimmed. */
  monthDate: Date;
  events: CalendarEvent[];
  now: Date;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  /** Clicking an empty cell picks that day (for creating an event). */
  onSelectSlot?: (slot: SlotSelection) => void;
  /** Clicking "+N more" opens the full-day list for that date. */
  onOpenDay?: (day: Date) => void;
  /** Max event chips shown per day cell before "+N more". */
  monthMaxChips: number;
  /** A month cell has no time axis, so a click proposes this hour (0–23). */
  createDefaultHour: number;
  /** Length (minutes) of the proposed slot. */
  createDuration: number;
  /** Scrolling down over the grid advances a month (Google-Calendar style). */
  onNext?: () => void;
  /** Scrolling up over the grid goes back a month. */
  onPrevious?: () => void;
  /** Enable drag-a-chip-to-another-day (needs `onEventChange`). */
  editable: boolean;
  /** Called with the moved event (its date changed, time kept) when a drag/keyboard-move commits. */
  onEventChange?: (event: CalendarEvent) => void;
  messages: SchedulerMessages;
  /** Announce a move to assistive tech. */
  announce?: (message: string) => void;
  /** Id of the chip currently picked up for keyboard move (grab mode), or null. */
  grabbedId: string | null;
  /** Toggle grab (pick up / drop) for a chip. */
  onGrabToggle?: (eventId: string) => void;
  /** Restore focus to a chip after a keyboard move remounts it in another cell. */
  keepFocus?: (eventId: string) => void;
}

export function MonthView({
  weeks,
  monthDate,
  events,
  now,
  locale,
  onSelect,
  onSelectSlot,
  onOpenDay,
  monthMaxChips,
  createDefaultHour,
  createDuration,
  onNext,
  onPrevious,
  editable,
  onEventChange,
  messages,
  announce,
  grabbedId,
  onGrabToggle,
  keepFocus,
}: MonthViewProps) {
  const headerDays = weeks[0] ?? [];
  const month = monthDate.getMonth();

  // Group events by day once (sorted) so each of the ~42 cells is an O(1) lookup
  // instead of filtering the whole event list — keeps month view fast at scale.
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const e of events) {
      const key = startOfDay(e.start).getTime();
      const bucket = map.get(key);
      if (bucket) bucket.push(e);
      else map.set(key, [e]);
    }
    for (const bucket of map.values()) bucket.sort((a, b) => a.start.getTime() - b.start.getTime());
    return map;
  }, [events]);

  const rootRef = useRef<HTMLDivElement>(null);
  // Keep the latest callbacks without re-attaching the native listener.
  const navRef = useRef({ onNext, onPrevious });
  navRef.current = { onNext, onPrevious };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let acc = 0;
    let cooling = false;
    const onWheel = (e: WheelEvent) => {
      // leave horizontal gestures (and pinch-zoom) alone
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.ctrlKey) return;
      e.preventDefault();
      if (cooling) return;
      acc += e.deltaY;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      const goNext = acc > 0;
      acc = 0;
      cooling = true;
      (goNext ? navRef.current.onNext : navRef.current.onPrevious)?.();
      window.setTimeout(() => {
        cooling = false;
      }, WHEEL_COOLDOWN_MS);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // --- drag a chip to another day (move only; month is day-granular, so no resize) ---
  const canDrag = editable && typeof onEventChange === "function";
  const [dragOverMs, setDragOverMs] = useState<number | null>(null);
  const chipDragRef = useRef<{ moved: boolean } | null>(null);

  const commitDayMove = (event: CalendarEvent, targetDayMs: number): void => {
    const shift = targetDayMs - startOfDay(event.start).getTime();
    if (shift === 0) return;
    const next: CalendarEvent = {
      ...event,
      start: new Date(event.start.getTime() + shift),
      end: new Date(event.end.getTime() + shift),
    };
    onEventChange?.(next);
    announce?.(`${messages.movedTo} ${formatDayLabel(next.start, locale)}`);
  };

  const dayMsUnder = (clientX: number, clientY: number): number | null => {
    const cell = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-day-ms]");
    const ms = cell?.dataset.dayMs;
    return ms ? Number(ms) : null;
  };

  const beginChipDrag = (event: CalendarEvent) => (ev: ReactPointerEvent) => {
    if (!canDrag || ev.button !== 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    (ev.currentTarget as HTMLElement).focus(); // keep focus so keyboard move works after a click
    const startX = ev.clientX;
    const startY = ev.clientY;
    chipDragRef.current = { moved: false };
    const onMove = (m: PointerEvent) => {
      if (Math.abs(m.clientX - startX) > DRAG_THRESHOLD_PX || Math.abs(m.clientY - startY) > DRAG_THRESHOLD_PX) {
        chipDragRef.current!.moved = true;
      }
      setDragOverMs(dayMsUnder(m.clientX, m.clientY));
    };
    const onUp = (m: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const d = chipDragRef.current;
      chipDragRef.current = null;
      setDragOverMs(null);
      if (!d?.moved) {
        onSelect?.(event); // no real movement → treat as a click
        return;
      }
      const targetMs = dayMsUnder(m.clientX, m.clientY);
      if (targetMs !== null) commitDayMove(event, targetMs);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Keyboard alternative to dragging (WCAG 2.1.1 + 2.5.7) via a "grab" mode so arrows don't fight
  // grid navigation: Enter opens; Space picks up / drops; while grabbed, ←/→ move a day, ↑/↓ a week;
  // Escape releases.
  const chipKeyDown = (event: CalendarEvent) => (e: ReactKeyboardEvent): void => {
    const isGrabbed = grabbedId === event.id;
    if (e.key === "Escape") {
      if (isGrabbed) {
        e.preventDefault();
        onGrabToggle?.(event.id);
        announce?.(messages.dropped);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (isGrabbed) {
        onGrabToggle?.(event.id);
        announce?.(messages.dropped);
      } else {
        onSelect?.(event);
      }
      return;
    }
    if (e.key === " ") {
      e.preventDefault(); // also stops the page from scrolling
      onGrabToggle?.(event.id);
      announce?.(isGrabbed ? messages.dropped : messages.grabbed);
      return;
    }
    if (!isGrabbed) return; // arrows only move once picked up
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const days = deltas[e.key];
    if (days === undefined) return;
    e.preventDefault();
    const target = startOfDay(event.start);
    target.setDate(target.getDate() + days);
    commitDayMove(event, target.getTime());
    // moving lands the chip in another cell → remount; restore focus so grab stays live
    keepFocus?.(event.id);
  };

  return (
    <div ref={rootRef} className="bpdm-sch-month" role="grid" aria-label={messages.monthLabel}>
      <div className="bpdm-sch-mhead" role="row">
        {headerDays.map((d) => (
          <div key={d.toISOString()} role="columnheader">
            {dowLabel(d, locale)}
          </div>
        ))}
      </div>

      {weeks.map((week) => (
        <div className="bpdm-sch-mrow" role="row" key={week[0]?.toISOString()}>
          {week.map((day) => {
            const inMonth = day.getMonth() === month;
            const today = isSameDay(day, now);
            const dayMs = startOfDay(day).getTime();
            const dayEvents = eventsByDay.get(dayMs) ?? [];
            const shown = dayEvents.slice(0, monthMaxChips);
            const extra = dayEvents.length - shown.length;

            return (
              <div
                key={day.toISOString()}
                role="gridcell"
                data-day-ms={dayMs}
                className={
                  "bpdm-sch-cell" +
                  (inMonth ? "" : " bpdm-sch-cell--out") +
                  (today ? " bpdm-sch-cell--today" : "") +
                  (onSelectSlot ? " bpdm-sch-cell--selectable" : "") +
                  (dragOverMs === dayMs ? " bpdm-sch-cell--dragover" : "")
                }
                onClick={
                  onSelectSlot
                    ? (e) => {
                        // only the empty cell background, not a chip / "+N more"
                        if (e.target !== e.currentTarget) return;
                        const start = new Date(day);
                        start.setHours(createDefaultHour, 0, 0, 0);
                        const end = new Date(start.getTime() + createDuration * MS_PER_MINUTE);
                        onSelectSlot({ start, end });
                      }
                    : undefined
                }
              >
                <span className="bpdm-sch-cell-d">{day.getDate()}</span>
                {shown.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    data-event-id={e.id}
                    className={
                      "bpdm-sch-chip" +
                      (canDrag ? " bpdm-sch-chip--editable" : "") +
                      (grabbedId === e.id ? " bpdm-sch-chip--grabbed" : "")
                    }
                    style={{ "--c": categoryColor(e.category) } as CSSProperties}
                    title={e.title}
                    aria-roledescription={canDrag ? messages.eventAdjustable : undefined}
                    aria-keyshortcuts={canDrag ? "Enter Space ArrowLeft ArrowRight ArrowUp ArrowDown Escape" : undefined}
                    onPointerDown={canDrag ? beginChipDrag(e) : undefined}
                    onKeyDown={canDrag ? chipKeyDown(e) : undefined}
                    onClick={canDrag ? undefined : () => onSelect?.(e)}
                  >
                    <span className="bpdm-sch-chip-dot" aria-hidden="true" />
                    {e.title}
                  </button>
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    className="bpdm-sch-more"
                    onClick={() => onOpenDay?.(day)}
                    aria-label={messages.showAll.replace("{count}", String(dayEvents.length))}
                  >
                    +{extra} {messages.more}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
