import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  addDays,
  createSchedulerStore,
  eachDayOfInterval,
  endOfMonth,
  InMemoryDataSource,
  isSameDay,
  startOfMonth,
  startOfWeek,
  type CalendarEvent,
  type DataSource,
  type SchedulerStore,
  type ViewType,
  type WeekStart,
} from "@bpdm/scheduler-core";
import { CreateDialog } from "./create-dialog";
import { DayPeek } from "./day-peek";
import { EventDialog } from "./event-dialog";
import { formatDayLabel, formatMonthLabel, formatRangeLabel } from "./format";
import { useEvents, useSchedulerState } from "./hooks";
import { defaultMessages, type SchedulerMessages } from "./messages";
import { MonthView } from "./month-view";
import { TimeGrid } from "./time-grid";
import { Toolbar } from "./toolbar";
import type { CreateEventInput, CreateFormArgs, SlotSelection } from "./types";

/** Generate an id for a created event (interaction-time only — never during SSR). */
function generateId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "evt-" + Math.random().toString(36).slice(2);
}

export interface SchedulerProps {
  /** Events for a client-side (in-memory) source. Ignored if `dataSource` is set. */
  events?: CalendarEvent[];
  /** A custom source — e.g. one that fetches a visible range from a server. */
  dataSource?: DataSource;
  defaultView?: ViewType;
  defaultDate?: Date;
  /** First hour rendered in day/week (default 0 — the whole day is scrollable). */
  dayStartHour?: number;
  /** Last hour rendered (default 24). */
  dayEndHour?: number;
  /** Hour the day/week viewport opens scrolled to (default 7). */
  scrollToHour?: number;
  /** Max day/week grid viewport height in px before it scrolls (default 600). */
  maxHeight?: number;
  /** 0 = Sunday … 6 = Saturday (default 1, Monday). */
  weekStartsOn?: WeekStart;
  /** Which views the toolbar offers (default day + week + month). */
  views?: ViewType[];
  /** Reference "now" — injectable for tests/SSR. */
  now?: Date;
  locale?: string;
  messages?: Partial<SchedulerMessages>;
  /** Provide to handle event clicks yourself (suppresses the built-in dialog). */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when an empty slot is clicked (start/end of the clicked time). */
  onSelectSlot?: (slot: SlotSelection) => void;
  /**
   * Render your own create form inside the scheduler's popup when a slot is
   * clicked. You choose every field; call `submit(input)` to create the event
   * (it appears immediately) or `cancel()` to dismiss.
   */
  renderCreateForm?: (args: CreateFormArgs) => ReactNode;
  /** Persist a newly-created event — update your `events` state, or POST to your
   *  API (with a `dataSource`, do the create here; the grid refetches after). */
  onCreate?: (event: CalendarEvent) => void | Promise<void>;
  /** Default length (minutes) of a slot created by clicking (default 60). */
  createDuration?: number;
  /** Snap a clicked day/week time to this many minutes (default 30). */
  snapMinutes?: number;
  /** Month cells have no time axis, so a click there proposes this hour, 0–23 (default 9). */
  createDefaultHour?: number;
  /** Pixel height of one hour row in day/week (row density; default 52). */
  hourHeight?: number;
  /** Max event chips per day cell in month view before "+N more" (default 3). */
  monthMaxChips?: number;
  className?: string;
}

export function Scheduler({
  events,
  dataSource,
  defaultView = "week",
  defaultDate,
  dayStartHour = 0,
  dayEndHour = 24,
  scrollToHour = 7,
  maxHeight = 600,
  weekStartsOn = 1,
  views = ["day", "week", "month"],
  now = new Date(),
  locale,
  messages,
  onEventClick,
  onSelectSlot,
  renderCreateForm,
  onCreate,
  createDuration = 60,
  snapMinutes = 30,
  createDefaultHour = 9,
  hourHeight = 52,
  monthMaxChips = 3,
  className,
}: SchedulerProps) {
  const storeRef = useRef<SchedulerStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSchedulerStore({ view: defaultView, ...(defaultDate ? { date: defaultDate } : {}) });
  }
  const store = storeRef.current!;
  const state = useSchedulerState(store);

  const source = useMemo<DataSource>(
    () => dataSource ?? new InMemoryDataSource(events ?? []),
    [dataSource, events],
  );

  const layout = useMemo(() => {
    if (state.view === "month") {
      // as many weeks as the month spans (5 or 6), not a fixed 6 — so no phantom
      // fully-populated next-month row.
      const gridStart = startOfWeek(startOfMonth(state.date), weekStartsOn);
      const gridEnd = addDays(startOfWeek(endOfMonth(state.date), weekStartsOn), 6);
      const days = eachDayOfInterval(gridStart, gridEnd);
      const weekCount = Math.round(days.length / 7);
      const weeks = Array.from({ length: weekCount }, (_, w) => days.slice(w * 7, w * 7 + 7));
      return { kind: "month" as const, weeks, start: gridStart, end: addDays(gridEnd, 1), label: formatMonthLabel(state.date, locale) };
    }
    if (state.view === "day") {
      return { kind: "grid" as const, days: [state.date], start: state.date, end: addDays(state.date, 1), label: formatDayLabel(state.date, locale) };
    }
    const start = startOfWeek(state.date, weekStartsOn);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return { kind: "grid" as const, days, start, end: addDays(start, 7), label: formatRangeLabel(start, addDays(start, 6), locale) };
  }, [state.view, state.date, weekStartsOn, locale]);

  const [refreshKey, setRefreshKey] = useState(0);
  const range = useMemo(() => ({ start: layout.start, end: layout.end }), [layout.start, layout.end]);
  const visibleEvents = useEvents(source, range, refreshKey);
  const mergedMessages = { ...defaultMessages, ...messages };

  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  // stable identity so memoized EventBlocks don't re-render on unrelated updates
  const handleSelect = useCallback(
    (event: CalendarEvent) => {
      if (onEventClick) onEventClick(event);
      else setSelected(event);
    },
    [onEventClick],
  );

  // month "+N more" → a day peek listing every event on that day
  const [peekDay, setPeekDay] = useState<Date | null>(null);
  const peekEvents = useMemo(
    () =>
      peekDay
        ? visibleEvents
            .filter((e) => isSameDay(e.start, peekDay))
            .sort((a, b) => a.start.getTime() - b.start.getTime())
        : [],
    [peekDay, visibleEvents],
  );
  const handlePeekSelect = useCallback(
    (event: CalendarEvent) => {
      if (onEventClick) {
        onEventClick(event);
        setPeekDay(null);
      } else {
        setSelected(event); // keep peekDay so the dialog can go back to the list
      }
    },
    [onEventClick],
  );

  // create flow — a clicked slot opens the consumer's form in the popup
  const [slot, setSlot] = useState<SlotSelection | null>(null);
  const handleSelectSlot = useCallback(
    (picked: SlotSelection) => {
      onSelectSlot?.(picked);
      if (renderCreateForm) setSlot(picked);
    },
    [onSelectSlot, renderCreateForm],
  );
  const submitCreate = useCallback(
    async (input: CreateEventInput) => {
      const event: CalendarEvent = {
        id: input.id ?? generateId(),
        title: input.title,
        start: input.start ?? (slot ? slot.start : new Date()),
        end: input.end ?? (slot ? slot.end : new Date()),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.data !== undefined ? { data: input.data } : {}),
      };
      setSlot(null);
      await onCreate?.(event);
      // refetch so a server-backed source shows the new event (client sources
      // already re-render via their updated `events` prop, but this is harmless).
      setRefreshKey((k) => k + 1);
    },
    [slot, onCreate],
  );

  return (
    <div className={"bpdm-sch" + (className ? " " + className : "")}>
      <Toolbar store={store} view={state.view} label={layout.label} views={views} messages={mergedMessages} />

      {layout.kind === "month" ? (
        <MonthView
          weeks={layout.weeks}
          monthDate={state.date}
          events={visibleEvents}
          now={now}
          locale={locale}
          onSelect={handleSelect}
          onSelectSlot={onSelectSlot || renderCreateForm ? handleSelectSlot : undefined}
          onOpenDay={setPeekDay}
          monthMaxChips={monthMaxChips}
          createDefaultHour={createDefaultHour}
          createDuration={createDuration}
          onNext={() => store.next()}
          onPrevious={() => store.previous()}
        />
      ) : (
        <TimeGrid
          days={layout.days}
          events={visibleEvents}
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
          scrollToHour={scrollToHour}
          maxHeight={maxHeight}
          hourHeight={hourHeight}
          now={now}
          locale={locale}
          onSelect={handleSelect}
          onSelectSlot={onSelectSlot || renderCreateForm ? handleSelectSlot : undefined}
          createDuration={createDuration}
          snapMinutes={snapMinutes}
        />
      )}

      {peekDay && !selected && (
        <DayPeek
          day={peekDay}
          events={peekEvents}
          locale={locale}
          onSelect={handlePeekSelect}
          onClose={() => setPeekDay(null)}
        />
      )}

      {selected && (
        <EventDialog
          event={selected}
          messages={mergedMessages}
          locale={locale}
          onClose={() => {
            setSelected(null);
            setPeekDay(null);
          }}
          onBack={peekDay ? () => setSelected(null) : undefined}
        />
      )}

      {slot && renderCreateForm && (
        <CreateDialog title={mergedMessages.createTitle} onCancel={() => setSlot(null)}>
          {renderCreateForm({ slot, submit: submitCreate, cancel: () => setSlot(null) })}
        </CreateDialog>
      )}
    </div>
  );
}
