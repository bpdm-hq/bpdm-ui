/** A time range picked by clicking empty grid/cell space. */
export interface SlotSelection {
  start: Date;
  end: Date;
}

/**
 * What the create-form template submits. `id` is generated if omitted; `start`/`end` default to the
 * clicked slot. Everything else maps straight onto `CalendarEvent` (put recurrence, room, agenda, etc.
 * on `data`, or use `location`/`description`).
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

/**
 * Context handed to the create-form `<ng-template>` — bind with
 * `let-slot="slot" let-submit="submit" let-cancel="cancel"`.
 */
export interface CreateFormContext {
  /** The clicked slot (its `start`/`end` are sensible form defaults). */
  slot: SlotSelection;
  /** Call with the new event's fields to create it and close the popup. */
  submit: (input: CreateEventInput) => void;
  /** Close the popup without creating. */
  cancel: () => void;
  /** Also exposed as the template's implicit value, so `let-ctx` works too. */
  $implicit: SlotSelection;
}
