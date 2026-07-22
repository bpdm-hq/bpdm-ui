import { defaultAccessor, type CalendarEvent, type DateRange, type TimeAccessor } from "./types";

export interface FetchOptions {
  /** When set, only events assigned to one of these resources are returned. */
  resourceIds?: readonly string[];
}

/**
 * How the scheduler gets events for a visible window. A client source returns
 * an array synchronously; a server source returns a promise and fetches the
 * range lazily. Write-back methods are optional — omit them for a read-only
 * calendar.
 */
export interface DataSource<E = CalendarEvent> {
  fetch(range: DateRange, options?: FetchOptions): E[] | Promise<E[]>;
  create?(event: E): E | Promise<E>;
  update?(event: E): E | Promise<E>;
  remove?(id: string): void | Promise<void>;
}

/** A client-side {@link DataSource} backed by an in-memory array. */
export class InMemoryDataSource<E extends { id: string; resourceId?: string } = CalendarEvent>
  implements DataSource<E>
{
  private items: E[];
  private readonly accessor: TimeAccessor<E>;

  // The default accessor is valid only when E is CalendarEvent (has start/end);
  // any other event shape must supply its own accessor.
  constructor(events: readonly E[] = [], accessor: TimeAccessor<E> = defaultAccessor as unknown as TimeAccessor<E>) {
    this.items = [...events];
    this.accessor = accessor;
  }

  /** Events that overlap the half-open window `[range.start, range.end)`. */
  fetch(range: DateRange, options?: FetchOptions): E[] {
    const start = range.start.getTime();
    const end = range.end.getTime();
    const ids = options?.resourceIds;
    return this.items.filter((e) => {
      if (this.accessor.end(e).getTime() <= start || this.accessor.start(e).getTime() >= end) return false;
      if (ids && (e.resourceId === undefined || !ids.includes(e.resourceId))) return false;
      return true;
    });
  }

  create(event: E): E {
    this.items = [...this.items, event];
    return event;
  }

  update(event: E): E {
    this.items = this.items.map((e) => (e.id === event.id ? event : e));
    return event;
  }

  remove(id: string): void {
    this.items = this.items.filter((e) => e.id !== id);
  }

  /** Everything currently held, unfiltered — useful for tools and tests. */
  all(): readonly E[] {
    return this.items;
  }
}
