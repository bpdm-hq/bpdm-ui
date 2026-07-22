import type { CalendarEvent } from "@bpdm/scheduler-core";

/** A time range picked by clicking empty grid/cell space. */
export interface SlotSelection {
  start: Date;
  end: Date;
}

/**
 * What a `renderCreateForm` submits. `id` is generated if omitted; `start`/`end`
 * default to the clicked slot. Everything else maps straight onto `CalendarEvent`
 * (put recurrence, room, agenda, etc. on `data` or use `location`/`description`).
 */
export interface CreateEventInput {
  id?: string;
  title: string;
  start?: Date;
  end?: Date;
  category?: string;
  location?: string;
  description?: string;
  data?: unknown;
}

/** Arguments handed to a `renderCreateForm` render-prop. */
export interface CreateFormArgs {
  /** The clicked slot (its `start`/`end` are sensible form defaults). */
  slot: SlotSelection;
  /** Call with the new event's fields to create it and close the popup. */
  submit: (input: CreateEventInput) => void;
  /** Close the popup without creating. */
  cancel: () => void;
}

export type CreateEvent = CalendarEvent;
