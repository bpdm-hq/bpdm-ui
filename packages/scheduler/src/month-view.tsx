import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { isSameDay, startOfDay, type CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import type { SlotSelection } from "./types";
import { dowLabel } from "./format";

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

  return (
    <div ref={rootRef} className="bpdm-sch-month" role="grid" aria-label="Month">
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
            const dayEvents = eventsByDay.get(startOfDay(day).getTime()) ?? [];
            const shown = dayEvents.slice(0, monthMaxChips);
            const extra = dayEvents.length - shown.length;

            return (
              <div
                key={day.toISOString()}
                role="gridcell"
                className={
                  "bpdm-sch-cell" +
                  (inMonth ? "" : " bpdm-sch-cell--out") +
                  (today ? " bpdm-sch-cell--today" : "") +
                  (onSelectSlot ? " bpdm-sch-cell--selectable" : "")
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
                    className="bpdm-sch-chip"
                    style={{ "--c": categoryColor(e.category) } as CSSProperties}
                    title={e.title}
                    onClick={() => onSelect?.(e)}
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
                    aria-label={`Show all ${dayEvents.length} events`}
                  >
                    +{extra} more
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
