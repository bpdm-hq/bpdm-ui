/** The views a scheduler can present. Bindings render each from the same data. */
export type ViewType = "day" | "week" | "workWeek" | "month" | "timeline" | "agenda" | "year";

/** A single scheduled item. Framework-agnostic; bindings render it. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  /** Groups the event under a resource column (multi-person views). */
  resourceId?: string;
  /** RRULE string — expanded by the core (Phase 3). */
  recurrence?: string;
  /** A category id/hue the binding maps to a token. */
  category?: string;
  /** Optional detail shown in the event dialog. */
  location?: string;
  description?: string;
  /** Arbitrary consumer payload, untouched by the core. */
  data?: unknown;
}

/** A person/room/track that owns a column in resource views. */
export interface Resource {
  id: string;
  name: string;
  category?: string;
}

/** A half-open time window [start, end). */
export interface DateRange {
  start: Date;
  end: Date;
}

/** How the core reads times off whatever event shape a consumer uses. */
export interface TimeAccessor<E> {
  start(event: E): Date;
  end(event: E): Date;
}

/** The default accessor for {@link CalendarEvent}. */
export const defaultAccessor: TimeAccessor<CalendarEvent> = {
  start: (e) => e.start,
  end: (e) => e.end,
};
