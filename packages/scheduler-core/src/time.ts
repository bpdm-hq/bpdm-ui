/**
 * Pure, dependency-free date helpers. Every function returns a new Date and
 * never mutates its input. All math is in the runtime's local time zone;
 * explicit time-zone support is a later phase.
 */

export const MS_PER_MINUTE = 60_000;

/** 0 = Sunday … 6 = Saturday. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** The day the given date's week begins on (Monday by default). */
export function startOfWeek(d: Date, weekStartsOn: WeekStart = 1): Date {
  const x = startOfDay(d);
  const diff = (x.getDay() - weekStartsOn + 7) % 7;
  return addDays(x, -diff);
}

export function startOfMonth(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

export function endOfMonth(d: Date): Date {
  const x = startOfMonth(d);
  x.setMonth(x.getMonth() + 1);
  return addDays(x, -1);
}

/** Inclusive list of each day's start between `start` and `end`. */
export function eachDayOfInterval(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = startOfDay(start);
  const last = startOfDay(end).getTime();
  while (cur.getTime() <= last) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

/** Whole minutes from a day's midnight to the given moment (can exceed a day). */
export function minutesFromDayStart(d: Date, dayStart: Date): number {
  return Math.round((d.getTime() - dayStart.getTime()) / MS_PER_MINUTE);
}

export function clampNumber(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}
