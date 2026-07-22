import { useEffect, useRef, type CSSProperties } from "react";
import type { CalendarEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatDayLabel, formatTime } from "./format";
import type { SchedulerMessages } from "./messages";

export interface EventDialogProps {
  event: CalendarEvent;
  messages: SchedulerMessages;
  locale?: string;
  onClose: () => void;
  /** When opened from the day peek, returns to that list instead of closing. */
  onBack?: () => void;
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** A self-contained, token-styled detail dialog. Bypassed when the consumer
 *  supplies their own `onEventClick`. */
export function EventDialog({ event, messages, locale, onClose, onBack }: EventDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") (onBack ?? onClose)();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onBack]);

  const style = { "--c": categoryColor(event.category) } as CSSProperties;
  const when = `${formatDayLabel(event.start, locale)} · ${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`;

  return (
    <div
      className="bpdm-sch-ov"
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bpdm-sch-dlg" style={style}>
        <div className="bpdm-sch-dlg-head">
          {onBack && (
            <button type="button" className="bpdm-sch-dlg-back" aria-label={messages.back} onClick={onBack}>
              ‹
            </button>
          )}
          <div className="bpdm-sch-dlg-titlewrap">
            <span className="bpdm-sch-dlg-bar" aria-hidden="true" />
            <div className="bpdm-sch-dlg-title" role="heading" aria-level={3}>
              {event.title}
            </div>
          </div>
          <button ref={closeRef} type="button" className="bpdm-sch-dlg-x" aria-label={messages.close} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="bpdm-sch-dlg-body">
          <div className="bpdm-sch-dlg-row">
            <ClockIcon />
            <span>{when}</span>
          </div>
          {event.location && (
            <div className="bpdm-sch-dlg-row">
              <PinIcon />
              <span>{event.location}</span>
            </div>
          )}
          {event.description && <p className="bpdm-sch-dlg-desc">{event.description}</p>}
        </div>
        <div className="bpdm-sch-dlg-foot">
          <button type="button" className="bpdm-sch-btn" onClick={onClose}>
            {messages.close}
          </button>
        </div>
      </div>
    </div>
  );
}
