import {
  memo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { CalendarEvent, PositionedEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatTime } from "./format";
import type { SchedulerMessages } from "./messages";

const MS_PER_MINUTE = 60_000;
const DRAG_THRESHOLD_PX = 3; // movement under this is a click, not a drag

type DragMode = "move" | "resize";

export interface EventBlockProps {
  positioned: PositionedEvent<CalendarEvent>;
  pxPerMinute: number;
  /** Total minutes the grid spans (dayEnd − dayStart) — bounds a drag. */
  spanMinutes: number;
  /** Snap a dragged/keyboard-nudged edge or position to this many minutes. */
  snapMinutes: number;
  /** Enable drag-to-move / drag-to-resize (needs an `onChange` handler). */
  editable: boolean;
  messages: SchedulerMessages;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  /** Called with the moved/resized event when a change commits. */
  onChange?: (event: CalendarEvent) => void;
  /** Announce a change to assistive tech (writes to the scheduler's live region). */
  announce?: (message: string) => void;
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(v, hi));

/** memo'd: with stable callbacks + memoized layout, only events whose position changed re-render. */
export const EventBlock = memo(function EventBlock({
  positioned,
  pxPerMinute,
  spanMinutes,
  snapMinutes,
  editable,
  messages,
  locale,
  onSelect,
  onChange,
  announce,
}: EventBlockProps) {
  const { event, lane, columns, topMinutes, heightMinutes } = positioned;

  const [preview, setPreview] = useState<{ mode: DragMode; delta: number } | null>(null);
  const dragRef = useRef<{ mode: DragMode; startY: number; moved: boolean } | null>(null);

  const canDrag = editable && typeof onChange === "function";

  // Clamp a minute-delta so the block stays inside the grid (and keeps a minimum duration).
  const clampDelta = (mode: DragMode, rawMin: number): number => {
    const snapped = Math.round(rawMin / snapMinutes) * snapMinutes;
    if (mode === "move") return clamp(topMinutes + snapped, 0, spanMinutes - heightMinutes) - topMinutes;
    return clamp(heightMinutes + snapped, snapMinutes, spanMinutes - topMinutes) - heightMinutes;
  };

  // Build the changed event + announce it, for both pointer and keyboard commits.
  const commit = (mode: DragMode, delta: number): void => {
    if (delta === 0) return;
    const shift = delta * MS_PER_MINUTE;
    const next: CalendarEvent =
      mode === "move"
        ? { ...event, start: new Date(event.start.getTime() + shift), end: new Date(event.end.getTime() + shift) }
        : { ...event, end: new Date(event.end.getTime() + shift) };
    onChange?.(next);
    announce?.(
      mode === "move"
        ? `${messages.movedTo} ${formatTime(next.start, locale)} – ${formatTime(next.end, locale)}`
        : `${messages.resizedTo} ${formatTime(next.end, locale)}`,
    );
  };

  const beginDrag = (mode: DragMode) => (e: ReactPointerEvent) => {
    if (!canDrag || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    dragRef.current = { mode, startY, moved: false };
    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientY - startY) > DRAG_THRESHOLD_PX) dragRef.current!.moved = true;
      setPreview({ mode, delta: clampDelta(mode, (ev.clientY - startY) / pxPerMinute) });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const d = dragRef.current;
      dragRef.current = null;
      setPreview(null);
      if (!d?.moved) {
        onSelect?.(event); // no real movement → treat as a click
        return;
      }
      commit(mode, clampDelta(mode, (ev.clientY - startY) / pxPerMinute));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Keyboard operability (WCAG 2.1.1 Keyboard + 2.5.7 Dragging Movements): a full alternative to the
  // pointer drag. Enter/Space opens; arrows move; Shift+arrows resize; each step is announced.
  const onKeyDown = (e: ReactKeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(event);
      return;
    }
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const dir = e.key === "ArrowUp" ? -1 : 1;
    const mode: DragMode = e.shiftKey ? "resize" : "move";
    commit(mode, clampDelta(mode, dir * snapMinutes));
  };

  const previewTop = preview?.mode === "move" ? topMinutes + preview.delta : topMinutes;
  const previewHeight = preview?.mode === "resize" ? heightMinutes + preview.delta : heightMinutes;

  const style = {
    "--c": categoryColor(event.category),
    "--z": lane + 1,
    top: previewTop * pxPerMinute,
    height: Math.max(previewHeight * pxPerMinute - 3, 16),
    left: `calc(3px + ${lane} * var(--sch-overlap))`,
    width: `calc(100% - 6px - ${columns - 1} * var(--sch-overlap))`,
  } as CSSProperties;

  const showTime = heightMinutes >= 40;
  return (
    <button
      type="button"
      className={"bpdm-sch-event" + (canDrag ? " bpdm-sch-event--editable" : "") + (preview ? " bpdm-sch-event--dragging" : "")}
      style={style}
      title={`${event.title} · ${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`}
      aria-roledescription={canDrag ? messages.eventAdjustable : undefined}
      aria-keyshortcuts={canDrag ? "ArrowUp ArrowDown Shift+ArrowUp Shift+ArrowDown Enter" : undefined}
      onPointerDown={canDrag ? beginDrag("move") : undefined}
      onKeyDown={canDrag ? onKeyDown : undefined}
      onClick={canDrag ? undefined : () => onSelect?.(event)}
    >
      <span className="bpdm-sch-event-title">{event.title}</span>
      {showTime && (
        <span className="bpdm-sch-event-time">
          {formatTime(event.start, locale)} – {formatTime(event.end, locale)}
        </span>
      )}
      {canDrag && <span className="bpdm-sch-event-resize" aria-hidden="true" onPointerDown={beginDrag("resize")} />}
    </button>
  );
});
