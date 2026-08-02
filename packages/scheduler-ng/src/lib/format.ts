/** Locale-aware date/time formatting via Intl (no dependencies). Mirrors @bpdm/scheduler. */

export function formatTime(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(d);
}

export function formatHour(hour: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "numeric" }).format(new Date(2000, 0, 1, hour));
}

export function formatDayLabel(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatRangeLabel(start: Date, end: Date, locale?: string): string {
  const s = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(start);
  const e = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(end);
  return `${s} – ${e}`;
}

export function formatMonthLabel(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d);
}

export function dowLabel(d: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(d);
}
