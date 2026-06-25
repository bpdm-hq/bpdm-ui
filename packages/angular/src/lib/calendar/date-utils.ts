// Native-date helpers shared by Calendar / DatePicker — compared by y/m/d so DST
// never bites. No date library; these mirror the React calendar's helpers.

export type DateRange = { from: Date | null; to: Date | null };

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function sameDay(a?: Date | null, b?: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
export function isBefore(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}
export function isAfter(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}
export function clampDay(d: Date, min?: Date, max?: Date): Date {
  if (min && isBefore(d, min)) return startOfDay(min);
  if (max && isAfter(d, max)) return startOfDay(max);
  return startOfDay(d);
}
export function inRange(d: Date, from?: Date | null, to?: Date | null): boolean {
  if (!from || !to) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(from).getTime() && t < startOfDay(to).getTime();
}

/** Build the 6×7 grid of dates for the month containing `viewDate`. */
export function buildGrid(viewDate: Date, weekStartsOn: number): Date[] {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

export function fmtDate(d: Date): string {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
export function fmtValue(mode: "single" | "range", v: Date | DateRange | null): string {
  if (!v) return "";
  if (mode === "single") return fmtDate(v as Date);
  const r = v as DateRange;
  if (r.from && r.to) return `${fmtDate(r.from)} – ${fmtDate(r.to)}`;
  if (r.from) return `${fmtDate(r.from)} – …`;
  return "";
}

export interface DateRangePreset {
  label: string;
  /** Computed at click time so "today"-relative ranges stay correct. */
  range: () => DateRange;
}

/** Common range presets for dashboards — pass to `<bpdm-date-picker mode="range" [presets]="…">`. */
export const defaultRangePresets: DateRangePreset[] = [
  {
    label: "Last 7 days",
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getFullYear(), to.getMonth(), to.getDate() - 6), to };
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const to = startOfDay(new Date());
      return { from: new Date(to.getFullYear(), to.getMonth(), to.getDate() - 29), to };
    },
  },
  {
    label: "This month",
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), n.getMonth(), 1), to: startOfDay(n) };
    },
  },
  {
    label: "This year",
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), 0, 1), to: startOfDay(n) };
    },
  },
  {
    label: "Previous year",
    range: () => {
      const y = new Date().getFullYear() - 1;
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
    },
  },
];
