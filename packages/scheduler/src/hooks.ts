import { useEffect, useState, useSyncExternalStore } from "react";
import type { CalendarEvent, DataSource, DateRange, SchedulerState, SchedulerStore } from "@bpdm/scheduler-core";

/** Tear-free subscription to the scheduler store. */
export function useSchedulerState(store: SchedulerStore): SchedulerState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/**
 * Load the events for a visible range from a data source. Handles both a
 * synchronous (in-memory) and an asynchronous (server) source uniformly.
 */
export function useEvents(source: DataSource, range: DateRange, refreshKey = 0): CalendarEvent[] {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  // Seed synchronously from an in-memory source so events render on first paint
  // (and during SSR); a promise-returning (server) source seeds empty then fills.
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const result = source.fetch({ start: new Date(startMs), end: new Date(endMs) });
    return Array.isArray(result) ? (result as CalendarEvent[]) : [];
  });

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- external data subscription, not derivable state
    Promise.resolve(source.fetch({ start: new Date(startMs), end: new Date(endMs) })).then((result) => {
      if (active) setEvents(result as CalendarEvent[]);
    });
    return () => {
      active = false;
    };
  }, [source, startMs, endMs, refreshKey]);

  return events;
}
