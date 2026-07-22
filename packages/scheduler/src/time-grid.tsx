import { useEffect, useRef } from "react";
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
import type { SlotSelection } from "./types";
import { dowLabel, formatHour } from "./format";

const HOUR_HEIGHT = 52;

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
  now: Date;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  /** Clicking empty grid space picks a time slot (for creating an event). */
  onSelectSlot?: (slot: SlotSelection) => void;
  /** Default length (minutes) of a slot created by clicking. */
  createDuration: number;
  /** Snap the clicked time to this many minutes. */
  snapMinutes: number;
}

/** The day/week time-grid: a time gutter plus one column per day. */
export function TimeGrid({
  days,
  events,
  dayStartHour,
  dayEndHour,
  scrollToHour,
  maxHeight,
  now,
  locale,
  onSelect,
  onSelectSlot,
  createDuration,
  snapMinutes,
}: TimeGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = gridRef.current;
    if (el) el.scrollTop = Math.max(0, (scrollToHour - dayStartHour) * HOUR_HEIGHT);
  }, [scrollToHour, dayStartHour]);

  const startMin = dayStartHour * 60;
  const endMin = dayEndHour * 60;
  const pxPerMinute = HOUR_HEIGHT / 60;
  // one extra row past the last hour so the closing label (12 AM) has a row
  // beneath it, mirroring the empty row above the first (1 AM) label.
  const bodyHeight = (endMin - startMin) * pxPerMinute + HOUR_HEIGHT;
  const columns = `56px repeat(${days.length}, minmax(0, 1fr))`;

  // skip the top edge label (collides with the sticky header) but keep the
  // closing bottom label (e.g. 12 AM after 11 PM).
  const hours: number[] = [];
  for (let h = dayStartHour + 1; h <= dayEndHour; h++) hours.push(h);

  const nowMinutes = minutesFromDayStart(now, startOfDay(now));

  return (
    <div className="bpdm-sch-grid" role="grid" aria-label="Schedule" ref={gridRef} style={{ maxHeight }}>
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

      <div className="bpdm-sch-body" style={{ gridTemplateColumns: columns, height: bodyHeight }}>
        <div className="bpdm-sch-gutter" aria-hidden="true">
          {hours.map((h) => (
            <div key={h} className="bpdm-sch-hour" style={{ top: (h - dayStartHour) * HOUR_HEIGHT }}>
              {formatHour(h, locale)}
            </div>
          ))}
        </div>

        {days.map((d) => {
          const positioned = layoutDay(events, d, startMin, endMin, defaultAccessor);
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
                  locale={locale}
                  onSelect={onSelect}
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
