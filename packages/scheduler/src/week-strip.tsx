import { isSameDay, type CalendarEvent } from "@bpdm/scheduler-core";
import type { SchedulerMessages } from "./messages";
import { dowLabel, formatDayLabel } from "./format";

export interface WeekStripProps {
  /** The seven days of the focused week. */
  days: Date[];
  /** The day currently shown in the grid below. */
  selected: Date;
  now: Date;
  /** The visible week's events — drives the "has events" dot under each day. */
  events: CalendarEvent[];
  locale?: string;
  onSelect: (day: Date) => void;
  messages: SchedulerMessages;
}

/**
 * The compact-week day picker: a row of the week's seven days (two-letter name + date), shown above a
 * single-day grid on narrow screens. Tapping a day switches the grid to it. Each day is a real button
 * with a full-date accessible name and `aria-current="date"` on the selected one.
 */
export function WeekStrip({ days, selected, now, events, locale, onSelect, messages }: WeekStripProps) {
  const hasEvents = (d: Date) => events.some((e) => isSameDay(e.start, d));
  return (
    <div className="bpdm-sch-strip" role="group" aria-label={messages.gridLabel}>
      {days.map((d) => {
        const isSelected = isSameDay(d, selected);
        const isToday = isSameDay(d, now);
        return (
          <button
            key={d.toISOString()}
            type="button"
            className={
              "bpdm-sch-strip-day" +
              (isSelected ? " bpdm-sch-strip-day--sel" : "") +
              (isToday ? " bpdm-sch-strip-day--today" : "")
            }
            aria-current={isSelected ? "date" : undefined}
            aria-label={formatDayLabel(d, locale)}
            onClick={() => onSelect(d)}
          >
            <span className="bpdm-sch-strip-dow" aria-hidden="true">
              {dowLabel(d, locale).slice(0, 2)}
            </span>
            <span className="bpdm-sch-strip-date">{d.getDate()}</span>
            <span className="bpdm-sch-strip-dot" aria-hidden="true" data-has={hasEvents(d) ? "" : undefined} />
          </button>
        );
      })}
    </div>
  );
}
