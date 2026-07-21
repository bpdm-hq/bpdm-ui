import { addDays, addMonths, startOfDay } from "./time";
import type { ViewType } from "./types";

/** The scheduler's navigation state — what a binding subscribes to. */
export interface SchedulerState {
  view: ViewType;
  /** The focused date; always normalized to the start of its day. */
  date: Date;
}

export interface SchedulerStore {
  getState(): SchedulerState;
  /** Subscribe to state changes; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  setView(view: ViewType): void;
  setDate(date: Date): void;
  /** Jump to today (inject `now` in tests for determinism). */
  today(now?: Date): void;
  /** Move forward one period for the current view. */
  next(): void;
  /** Move back one period for the current view. */
  previous(): void;
}

/** How far one step moves the focused date, per view. */
function step(view: ViewType, date: Date, direction: 1 | -1): Date {
  switch (view) {
    case "month":
      return addMonths(date, direction);
    case "year":
      return addMonths(date, direction * 12);
    case "week":
    case "workWeek":
    case "agenda":
      return addDays(date, direction * 7);
    default:
      return addDays(date, direction); // day, timeline
  }
}

export function createSchedulerStore(initial: Partial<SchedulerState> = {}): SchedulerStore {
  let state: SchedulerState = {
    view: initial.view ?? "week",
    date: startOfDay(initial.date ?? new Date()),
  };
  const listeners = new Set<() => void>();

  const set = (next: SchedulerState): void => {
    state = next;
    for (const listener of listeners) listener();
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setView: (view) => set({ ...state, view }),
    setDate: (date) => set({ ...state, date: startOfDay(date) }),
    today: (now = new Date()) => set({ ...state, date: startOfDay(now) }),
    next: () => set({ ...state, date: step(state.view, state.date, 1) }),
    previous: () => set({ ...state, date: step(state.view, state.date, -1) }),
  };
}
