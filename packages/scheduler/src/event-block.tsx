import {
  memo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { startOfDay, type CalendarEvent, type PositionedEvent } from "@bpdm/scheduler-core";
import { categoryColor } from "./category";
import { formatDayLabel, formatTime } from "./format";
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
  /** True while this event is "picked up" for keyboard move (grab mode). */
  grabbed: boolean;
  /** Toggle grab (pick up / drop) for keyboard move. */
  onGrabToggle?: (eventId: string) => void;
  /** Ask the scheduler to restore focus to this event after it re-renders (survives remounts). */
  keepFocus?: (eventId: string) => void;
  messages: SchedulerMessages;
  locale?: string;
  onSelect?: (event: CalendarEvent) => void;
  /** Called with the moved/resized event when a change commits. */
  onChange?: (event: CalendarEvent) => void;
  /** Announce a change to assistive tech (writes to the scheduler's live region). */
  announce?: (message: string) => void;
  /** Map a pointer X to the day column under it — enables cross-day (week) drag. */
  resolveDayShift?: (clientX: number, originDay: Date) => { targetDay: Date; dx: number } | null;
}

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(v, hi));

/** memo'd: with stable callbacks + memoized layout, only events whose position changed re-render. */
export const EventBlock = memo(function EventBlock({
  positioned,
  pxPerMinute,
  spanMinutes,
  snapMinutes,
  editable,
  grabbed,
  onGrabToggle,
  keepFocus,
  messages,
  locale,
  onSelect,
  onChange,
  announce,
  resolveDayShift,
}: EventBlockProps) {
  const { event, lane, columns, topMinutes, heightMinutes } = positioned;

  const [preview, setPreview] = useState<{ mode: DragMode; delta: number; dx: number; targetDay: Date | null } | null>(null);
  const dragRef = useRef<{ mode: DragMode; startY: number; moved: boolean } | null>(null);

  const canDrag = editable && typeof onChange === "function";

  // Clamp a minute-delta so the block stays inside the grid (and keeps a minimum duration).
  const clampDelta = (mode: DragMode, rawMin: number): number => {
    const snapped = Math.round(rawMin / snapMinutes) * snapMinutes;
    if (mode === "move") return clamp(topMinutes + snapped, 0, spanMinutes - heightMinutes) - topMinutes;
    return clamp(heightMinutes + snapped, snapMinutes, spanMinutes - topMinutes) - heightMinutes;
  };

  // A move = an optional day shift (cross-day) plus a within-day time shift.
  const commitMove = (timeDeltaMin: number, targetDay: Date | null): void => {
    const dayShiftMs = targetDay ? startOfDay(targetDay).getTime() - startOfDay(event.start).getTime() : 0;
    const shift = dayShiftMs + timeDeltaMin * MS_PER_MINUTE;
    if (shift === 0) return;
    const next: CalendarEvent = {
      ...event,
      start: new Date(event.start.getTime() + shift),
      end: new Date(event.end.getTime() + shift),
    };
    onChange?.(next);
    announce?.(
      dayShiftMs !== 0
        ? `${messages.movedTo} ${formatDayLabel(next.start, locale)} ${formatTime(next.start, locale)}`
        : `${messages.movedTo} ${formatTime(next.start, locale)} – ${formatTime(next.end, locale)}`,
    );
  };

  const commitResize = (deltaMin: number): void => {
    if (deltaMin === 0) return;
    const next: CalendarEvent = { ...event, end: new Date(event.end.getTime() + deltaMin * MS_PER_MINUTE) };
    onChange?.(next);
    announce?.(`${messages.resizedTo} ${formatTime(next.end, locale)}`);
  };

  const beginDrag = (mode: DragMode) => (e: ReactPointerEvent) => {
    if (!canDrag || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    // preventDefault stops the browser from focusing the button on pointerdown — restore it so the
    // keyboard move/resize (arrow keys) works right after a click, not only after Tab.
    (e.currentTarget as HTMLElement).closest("button")?.focus();
    const startY = e.clientY;
    dragRef.current = { mode, startY, moved: false };
    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientY - startY) > DRAG_THRESHOLD_PX) dragRef.current!.moved = true;
      const delta = clampDelta(mode, (ev.clientY - startY) / pxPerMinute);
      const shift = mode === "move" ? resolveDayShift?.(ev.clientX, event.start) ?? null : null;
      setPreview({ mode, delta, dx: shift?.dx ?? 0, targetDay: shift?.targetDay ?? null });
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
      const delta = clampDelta(mode, (ev.clientY - startY) / pxPerMinute);
      if (mode === "resize") {
        commitResize(delta);
      } else {
        commitMove(delta, resolveDayShift?.(ev.clientX, event.start)?.targetDay ?? null);
      }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Keyboard operability (WCAG 2.1.1 Keyboard + 2.5.7 Dragging Movements) via a "grab" mode, so
  // arrow keys don't fight grid navigation: Enter opens; Space picks up / drops; while grabbed,
  // ↑/↓ move the time, ←/→ move a day, Shift+↑/↓ resize; Escape releases.
  const onKeyDown = (e: ReactKeyboardEvent): void => {
    if (e.key === "Escape") {
      if (grabbed) {
        e.preventDefault();
        onGrabToggle?.(event.id);
        announce?.(messages.dropped);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (grabbed) {
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
      announce?.(grabbed ? messages.dropped : messages.grabbed);
      return;
    }
    if (!grabbed) return; // arrows only move once picked up — otherwise leave grid navigation alone
    // Moving may remount this block in another column/cell — ask the scheduler to restore focus,
    // so the grab (kept at the root, keyed by id) stays live and the next key isn't lost to the page.
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? -1 : 1;
      if (e.shiftKey) commitResize(clampDelta("resize", dir * snapMinutes));
      else commitMove(clampDelta("move", dir * snapMinutes), null);
      keepFocus?.(event.id);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const targetDay = new Date(event.start);
      targetDay.setDate(targetDay.getDate() + (e.key === "ArrowLeft" ? -1 : 1));
      commitMove(0, targetDay);
      keepFocus?.(event.id);
    }
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
    // cross-day drag: slide horizontally toward the hovered day column
    ...(preview?.mode === "move" && preview.dx ? { transform: `translateX(${preview.dx}px)` } : {}),
  } as CSSProperties;

  const showTime = heightMinutes >= 40;
  return (
    <button
      type="button"
      data-event-id={event.id}
      className={
        "bpdm-sch-event" +
        (canDrag ? " bpdm-sch-event--editable" : "") +
        (preview ? " bpdm-sch-event--dragging" : "") +
        (grabbed ? " bpdm-sch-event--grabbed" : "")
      }
      style={style}
      title={`${event.title} · ${formatTime(event.start, locale)} – ${formatTime(event.end, locale)}`}
      aria-roledescription={canDrag ? messages.eventAdjustable : undefined}
      aria-keyshortcuts={canDrag ? "Enter Space ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Escape" : undefined}
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
