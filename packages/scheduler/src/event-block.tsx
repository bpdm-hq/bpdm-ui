import { memo, type CSSProperties } from "react";
import type { CalendarEvent, PositionedEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatTime } from "./format";

export interface EventBlockProps {
  positioned: PositionedEvent<CalendarEvent>;
  pxPerMinute: number;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
}

/** memo'd: with a stable `onSelect` and memoized layout, only the events whose
 *  position actually changed re-render. */
export const EventBlock = memo(function EventBlock({ positioned, pxPerMinute, locale, onSelect }: EventBlockProps) {
  const { event, lane, columns, topMinutes, heightMinutes } = positioned;
  const style = {
    "--c": categoryColor(event.category),
    "--z": lane + 1,
    top: topMinutes * pxPerMinute,
    height: Math.max(heightMinutes * pxPerMinute - 3, 16),
    left: `calc(3px + ${lane} * var(--sch-overlap))`,
    width: `calc(100% - 6px - ${columns - 1} * var(--sch-overlap))`,
  } as CSSProperties;

  // short events (< 40 min) have no room for a second line — show the title only
  const showTime = heightMinutes >= 40;
  return (
    <button
      type="button"
      className="bpdm-sch-event"
      style={style}
      title={`${event.title} · ${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`}
      onClick={() => onSelect?.(event)}
    >
      <span className="bpdm-sch-event-title">{event.title}</span>
      {showTime && (
        <span className="bpdm-sch-event-time">
          {formatTime(event.start, locale)} – {formatTime(event.end, locale)}
        </span>
      )}
    </button>
  );
});
