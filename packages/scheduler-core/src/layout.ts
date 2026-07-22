import { clampNumber, minutesFromDayStart, startOfDay } from "./time";
import type { TimeAccessor } from "./types";

/**
 * The overlap layout engine.
 *
 * Timed events that overlap are packed into lanes (columns) within a cluster of
 * mutually-overlapping items, so a binding can lay them side by side or cascade
 * them. The algorithm is intentionally numeric and pure — it works on plain
 * `{ start, end }` intervals — which makes it trivial to unit-test and reuse.
 */

export interface Interval {
  start: number;
  end: number;
}

export interface Packed {
  /** 0-based column within the event's overlap cluster. */
  lane: number;
  /** Total columns in that cluster (for width / cascade math). */
  columns: number;
}

/**
 * Assign each interval a lane and its cluster's column count. Touching
 * intervals (`a.end === b.start`) do not overlap. Returns results in the SAME
 * order as the input.
 */
export function packEvents(intervals: readonly Interval[]): Packed[] {
  const n = intervals.length;
  const lane = new Array<number>(n).fill(0);
  const columns = new Array<number>(n).fill(1);
  if (n === 0) return [];

  // process left-to-right; ties broken by the longer interval first
  const order = intervals
    .map((_, i) => i)
    .sort((a, b) => intervals[a]!.start - intervals[b]!.start || intervals[b]!.end - intervals[a]!.end);

  const laneEnds: number[] = []; // last end time per lane, reset per cluster
  let cluster: number[] = [];
  let clusterEnd = -Infinity;

  const closeCluster = (): void => {
    if (cluster.length === 0) return;
    let cols = 0;
    for (const i of cluster) cols = Math.max(cols, lane[i]! + 1);
    for (const i of cluster) columns[i] = cols;
    cluster = [];
    laneEnds.length = 0;
    clusterEnd = -Infinity;
  };

  for (const i of order) {
    const iv = intervals[i]!;
    // a gap from every open lane ends the cluster
    if (cluster.length > 0 && iv.start >= clusterEnd) closeCluster();

    let placed = false;
    for (let l = 0; l < laneEnds.length; l++) {
      if (laneEnds[l]! <= iv.start) {
        lane[i] = l;
        laneEnds[l] = iv.end;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lane[i] = laneEnds.length;
      laneEnds.push(iv.end);
    }

    cluster.push(i);
    clusterEnd = Math.max(clusterEnd, iv.end);
  }
  closeCluster();

  return intervals.map((_, i) => ({ lane: lane[i]!, columns: columns[i]! }));
}

/** An event placed within a single day's time axis. */
export interface PositionedEvent<E> extends Packed {
  event: E;
  /** Minutes from the top of the visible range to the event's start. */
  topMinutes: number;
  /** The event's visible height, in minutes (clamped to the range). */
  heightMinutes: number;
}

/**
 * Lay out one day's timed events against a visible range (e.g. 7 AM–7 PM).
 * Events are clamped to the range; anything fully outside is dropped. Bindings
 * turn `topMinutes` / `heightMinutes` into pixels and use `lane` / `columns`
 * for horizontal placement.
 */
export function layoutDay<E>(
  events: readonly E[],
  day: Date,
  rangeStartMinutes: number,
  rangeEndMinutes: number,
  accessor: TimeAccessor<E>,
): PositionedEvent<E>[] {
  const dayStart = startOfDay(day);
  const kept: { event: E; start: number; end: number }[] = [];

  for (const event of events) {
    const rawStart = minutesFromDayStart(accessor.start(event), dayStart);
    const rawEnd = minutesFromDayStart(accessor.end(event), dayStart);
    const start = clampNumber(rawStart, rangeStartMinutes, rangeEndMinutes);
    const end = clampNumber(rawEnd, rangeStartMinutes, rangeEndMinutes);
    if (end <= start) continue; // zero-length or outside the visible range
    kept.push({ event, start, end });
  }

  const packed = packEvents(kept.map((k) => ({ start: k.start, end: k.end })));
  return kept.map((k, i) => ({
    event: k.event,
    lane: packed[i]!.lane,
    columns: packed[i]!.columns,
    topMinutes: k.start - rangeStartMinutes,
    heightMinutes: k.end - k.start,
  }));
}
