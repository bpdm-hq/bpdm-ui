import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";
import {
  defaultAccessor,
  isSameDay,
  layoutDay,
  minutesFromDayStart,
  MS_PER_MINUTE,
  startOfDay,
  type CalendarEvent,
} from "@bpdm/scheduler-core";
import { EventBlock } from "./event-block";
import type { SchedulerMessages } from "./messages";
import type { SlotSelection } from "./types";
import { dowLabel, formatHour } from "./format";

const GUTTER_PX = 56; // width of the time-label gutter (the grid's first column)

export interface TimeGridProps {
  days: Date[];
  events: CalendarEvent[];
  /** First hour rendered (default 0 — the full day is scrollable). */
  dayStartHour: number;
  /** Last hour rendered (default 24). */
  dayEndHour: number;
  /** Hour the viewport is scrolled to on open (default 7). */
  scrollToHour: number;
  /** Max viewport height in px; the grid scrolls beyond it. */
  maxHeight: number;
  /** Pixel height of one hour row (row density). */
  hourHeight: number;
  now: Date;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  /** Clicking empty grid space picks a time slot (for creating an event). */
  onSelectSlot?: (slot: SlotSelection) => void;
  /** Default length (minutes) of a slot created by clicking. */
  createDuration: number;
  /** Snap the clicked time (and a dragged move/resize) to this many minutes. */
  snapMinutes: number;
  /** Enable drag-to-move / drag-to-resize of events. */
  editable: boolean;
  /** Called with the moved/resized event when a drag commits. */
  onEventChange?: (event: CalendarEvent) => void;
  messages: SchedulerMessages;
  /** Announce a move/resize to assistive tech. */
  announce?: (message: string) => void;
  /** Id of the event currently picked up for keyboard move (grab mode), or null. */
  grabbedId: string | null;
  /** Toggle grab (pick up / drop) for an event. */
  onGrabToggle?: (eventId: string) => void;
  /** Restore focus to an event after a keyboard move remounts it. */
  keepFocus?: (eventId: string) => void;
  /** Hide the day-of-week/date header row (the compact week supplies its own strip above). */
  hideHeader?: boolean;
}

/** The day/week time-grid: a time gutter plus one column per day. */
export function TimeGrid({
  days,
  events,
  dayStartHour,
  dayEndHour,
  scrollToHour,
  maxHeight,
  hourHeight,
  now,
  locale,
  onSelect,
  onSelectSlot,
  createDuration,
  snapMinutes,
  editable,
  onEventChange,
  messages,
  announce,
  grabbedId,
  onGrabToggle,
  keepFocus,
  hideHeader,
}: TimeGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (el) el.scrollTop = Math.max(0, (scrollToHour - dayStartHour) * hourHeight);
  }, [scrollToHour, dayStartHour, hourHeight]);

  // Map a pointer's X to the day column under it (for cross-day drag). Columns are equal-width after
  // the fixed gutter, so no per-column refs are needed. Returns the target day + the px offset from
  // the event's own column (for a live translateX preview).
  const resolveDayShift = useCallback(
    (clientX: number, originDay: Date): { targetDay: Date; dx: number } | null => {
      const el = bodyRef.current;
      if (!el || days.length === 0) return null;
      const rect = el.getBoundingClientRect();
      const colsWidth = rect.width - GUTTER_PX;
      if (colsWidth <= 0) return null;
      const colW = colsWidth / days.length;
      const raw = Math.floor((clientX - rect.left - GUTTER_PX) / colW);
      const targetIdx = Math.max(0, Math.min(raw, days.length - 1));
      const originIdx = days.findIndex((d) => isSameDay(d, originDay));
      const targetDay = days[targetIdx]!;
      return { targetDay, dx: originIdx < 0 ? 0 : (targetIdx - originIdx) * colW };
    },
    [days],
  );

  const startMin = dayStartHour * 60;
  const endMin = dayEndHour * 60;
  const pxPerMinute = hourHeight / 60;

  // Lay out each day once per (events, range) change — not on every render — so
  // memoized EventBlocks only re-render when their position actually changes.
  const positionedByDay = useMemo(
    () => days.map((d) => layoutDay(events, d, startMin, endMin, defaultAccessor)),
    [days, events, startMin, endMin],
  );
  // one extra row past the last hour so the closing label (12 AM) has a row
  // beneath it, mirroring the empty row above the first (1 AM) label.
  const bodyHeight = (endMin - startMin) * pxPerMinute + hourHeight;
  // --sch-col-min is 0 by default (columns fill the width); a container query raises it on
  // narrow screens so the columns keep a usable width and the grid scrolls horizontally
  // instead of squishing a 7-day week into unreadable slivers.
  const columns = `${GUTTER_PX}px repeat(${days.length}, minmax(var(--sch-col-min, 0px), 1fr))`;

  // skip the top edge label (collides with the sticky header) but keep the
  // closing bottom label (e.g. 12 AM after 11 PM).
  const hours: number[] = [];
  for (let h = dayStartHour + 1; h <= dayEndHour; h++) hours.push(h);

  const nowMinutes = minutesFromDayStart(now, startOfDay(now));

  return (
    <div className="bpdm-sch-grid" role="grid" aria-label={messages.gridLabel} ref={gridRef} style={{ maxHeight }}>
      {!hideHeader && (
        <div className="bpdm-sch-head" style={{ gridTemplateColumns: columns }}>
          <div className="bpdm-sch-head-cell" aria-hidden="true" />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={"bpdm-sch-head-cell" + (isSameDay(d, now) ? " bpdm-sch-today" : "")}
              role="columnheader"
            >
              <div className="bpdm-sch-dow">{dowLabel(d, locale)}</div>
              <div className="bpdm-sch-dnum">{d.getDate()}</div>
            </div>
          ))}
        </div>
      )}

      <div
        className="bpdm-sch-body"
        ref={bodyRef}
        style={{ gridTemplateColumns: columns, height: bodyHeight, "--sch-hour-h": `${hourHeight}px` } as CSSProperties}
      >
        <div className="bpdm-sch-gutter" aria-hidden="true">
          {hours.map((h) => (
            <div key={h} className="bpdm-sch-hour" style={{ top: (h - dayStartHour) * hourHeight }}>
              {formatHour(h, locale)}
            </div>
          ))}
        </div>

        {days.map((d, dayIndex) => {
          const positioned = positionedByDay[dayIndex] ?? [];
          const today = isSameDay(d, now);
          const showNow = today && nowMinutes >= startMin && nowMinutes <= endMin;
          return (
            <div
              key={d.toISOString()}
              className={
                "bpdm-sch-col" +
                (today ? " bpdm-sch-col--today" : "") +
                (onSelectSlot ? " bpdm-sch-col--selectable" : "")
              }
              role="gridcell"
              onClick={
                onSelectSlot
                  ? (e) => {
                      // only fire on the column background, not on an event/now-line child
                      if (e.target !== e.currentTarget) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const rawMin = startMin + (e.clientY - rect.top) / pxPerMinute;
                      const snapped = Math.round(rawMin / snapMinutes) * snapMinutes;
                      const clamped = Math.max(startMin, Math.min(snapped, endMin - createDuration));
                      const start = new Date(startOfDay(d).getTime() + clamped * MS_PER_MINUTE);
                      const end = new Date(start.getTime() + createDuration * MS_PER_MINUTE);
                      onSelectSlot({ start, end });
                    }
                  : undefined
              }
            >
              {positioned.map((p) => (
                <EventBlock
                  key={p.event.id}
                  positioned={p}
                  pxPerMinute={pxPerMinute}
                  spanMinutes={endMin - startMin}
                  snapMinutes={snapMinutes}
                  editable={editable}
                  grabbed={grabbedId === p.event.id}
                  onGrabToggle={onGrabToggle}
                  keepFocus={keepFocus}
                  messages={messages}
                  locale={locale}
                  onSelect={onSelect}
                  onChange={onEventChange}
                  announce={announce}
                  resolveDayShift={resolveDayShift}
                />
              ))}
              {showNow && (
                <div
                  className="bpdm-sch-now"
                  style={{ top: (nowMinutes - startMin) * pxPerMinute }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
