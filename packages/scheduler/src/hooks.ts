import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CalendarEvent, DataSource, DateRange, SchedulerState, SchedulerStore } from "@bpdm/scheduler-core";

/** Tear-free subscription to the scheduler store. */
export function useSchedulerState(store: SchedulerStore): SchedulerState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

// Module-level so overlapping overlays (e.g. a detail dialog opened over a day peek) don't
// unlock the page prematurely — the lock lifts only when the last one closes.
let scrollLockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/** Lock background scrolling while a modal overlay is mounted (ref-counted, SSR-safe). */
export function useScrollLock(): void {
  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (scrollLockCount === 0) {
      savedOverflow = body.style.overflow;
      savedPaddingRight = body.style.paddingRight;
      // pad for the scrollbar we're about to hide so the page behind doesn't shift
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
      body.style.overflow = "hidden";
    }
    scrollLockCount++;
    return () => {
      scrollLockCount--;
      if (scrollLockCount === 0) {
        body.style.overflow = savedOverflow;
        body.style.paddingRight = savedPaddingRight;
      }
    };
  }, []);
}

/**
 * Load the events for a visible range from a data source. Handles both a
 * synchronous (in-memory) and an asynchronous (server) source uniformly.
 */
export function useEvents(source: DataSource, range: DateRange, refreshKey = 0): CalendarEvent[] {
  const startMs = range.start.getTime();
  const endMs = range.end.getTime();

  // A synchronous (in-memory) source is read *during render* — so a move applies in a single commit,
  // rather than lagging a frame behind an effect (which would remount, and unfocus, the moved event a
  // commit later). A promise-returning (server) source resolves via the effect below.
  const sync = useMemo<CalendarEvent[] | null>(() => {
    const result = source.fetch({ start: new Date(startMs), end: new Date(endMs) });
    return Array.isArray(result) ? (result as CalendarEvent[]) : null;
    // refreshKey is an explicit "refetch" trigger, so a re-read is intended even though it isn't read here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, startMs, endMs, refreshKey]);

  const [asyncEvents, setAsyncEvents] = useState<CalendarEvent[]>(sync ?? []);

  useEffect(() => {
    if (sync) return; // synchronous source is already read during render
    let active = true;
    // external data subscription (server fetch), not derivable state
    Promise.resolve(source.fetch({ start: new Date(startMs), end: new Date(endMs) })).then((result) => {
      if (active) setAsyncEvents(result as CalendarEvent[]);
    });
    return () => {
      active = false;
    };
  }, [source, startMs, endMs, refreshKey, sync]);

  return sync ?? asyncEvents;
}
