import { useEffect, useRef, type CSSProperties } from "react";
import type { CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatDayLabel, formatTime } from "./format";

export interface DayPeekProps {
  day: Date;
  /** All events on that day (already sorted). */
  events: CalendarEvent[];
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  onClose: () => void;
}

/**
 * The full list of a day's events, opened from a month cell's "+N more". A
 * self-contained popup (no deps); each row opens that event's detail dialog.
 */
export function DayPeek({ day, events, locale, onSelect, onClose }: DayPeekProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // lock the background from scrolling while the peek is open, so wheeling
    // over it scrolls the peek's own list (not the page behind)
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="bpdm-sch-ov"
      role="dialog"
      aria-modal="true"
      aria-label={formatDayLabel(day, locale)}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bpdm-sch-peek">
        <div className="bpdm-sch-peek-head">
          <div className="bpdm-sch-peek-dow">{day.toLocaleDateString(locale, { weekday: "short" })}</div>
          <div className="bpdm-sch-peek-dnum">{day.getDate()}</div>
          <button ref={closeRef} type="button" className="bpdm-sch-dlg-x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="bpdm-sch-peek-list">
          {events.map((e) => (
            <button
              key={e.id}
              type="button"
              className="bpdm-sch-peek-item"
              style={{ "--c": categoryColor(e.category) } as CSSProperties}
              onClick={() => onSelect?.(e)}
            >
              <span className="bpdm-sch-peek-dot" aria-hidden="true" />
              <span className="bpdm-sch-peek-time">
                {e.allDay ? "All day" : formatTime(e.start, locale)}
              </span>
              <span className="bpdm-sch-peek-title">{e.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
