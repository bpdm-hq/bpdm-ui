import * as React from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/use-controllable";
import { Popover } from "./popover";

// date helpers (local, compared by y/m/d so DST never bites)
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a?: Date | null, b?: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isBefore(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}
function isAfter(a: Date, b: Date) {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}
function clampDay(d: Date, min?: Date, max?: Date) {
  if (min && isBefore(d, min)) return startOfDay(min);
  if (max && isAfter(d, max)) return startOfDay(max);
  return startOfDay(d);
}
function inRange(d: Date, from?: Date | null, to?: Date | null) {
  if (!from || !to) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(from).getTime() && t < startOfDay(to).getTime();
}


/** Build the 6×7 grid of dates for the month containing `viewDate`. */
function buildGrid(viewDate: Date, weekStartsOn: number) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from({ length: 42 }, (_, i) =>
    new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

export type DateRange = { from: Date | null; to: Date | null };

export interface CalendarProps {
  /** "single" → a Date; "range" → a { from, to }. Default "single". */
  mode?: "single" | "range";
  /** Controlled value. */
  value?: Date | DateRange | null;
  defaultValue?: Date | DateRange | null;
  onChange?: (value: Date | DateRange | null) => void;
  min?: Date;
  max?: Date;
  /** Disable specific days, e.g. weekends. */
  disabled?: (date: Date) => boolean;
  /** 0 = Sunday, 1 = Monday. Default 1. */
  weekStartsOn?: 0 | 1;
  /** Shape of the day highlight: "circle" (default) or "square" (rounded-corner square). */
  dayShape?: "circle" | "square";
  /** How many months to show side by side. Default 1. */
  numberOfMonths?: number;
  /** Header style: "buttons" (prev/next only) or "dropdown" (month + year menus). */
  captionLayout?: "buttons" | "dropdown";
  /** Year-dropdown range. Default: 100 years back to 10 years ahead. */
  fromYear?: number;
  toYear?: number;
  /** BCP 47 locale for month/weekday names + date formatting (e.g. "de-DE", "ar"). */
  locale?: string;
  /** Override the control labels (screen-reader text) for i18n. */
  messages?: CalendarMessages;
  className?: string;
}

export interface CalendarMessages {
  calendar?: string;
  previousMonth?: string;
  nextMonth?: string;
  month?: string;
  year?: string;
  /** Clear button on the DatePicker trigger. */
  clear?: string;
  /** DatePicker `confirm` footer — discard the draft. */
  cancel?: string;
  /** DatePicker `confirm` footer — commit the draft. */
  apply?: string;
}

const DEFAULT_CALENDAR_MESSAGES = {
  calendar: "Calendar",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  month: "Month",
  year: "Year",
  clear: "Clear",
  cancel: "Cancel",
  apply: "Apply",
};

// Aug 1 2021 is a Sunday → index 0 = Sunday for weekday names.
const SUNDAY_2021 = new Date(2021, 7, 1);

/**
 * Month calendar built on native dates — single date or a range, with month/year
 * navigation, min/max and per-day `disabled`, today + selection highlights, and
 * a full WAI-ARIA grid: roving focus moves real DOM focus to the active day so
 * screen readers announce it. Keyboard: arrows move (RTL-aware), Home/End jump to
 * the week edges, PageUp/Down change month, Enter/Space selects.
 */
export function Calendar({
  mode = "single",
  value: valueProp,
  defaultValue = null,
  onChange,
  min,
  max,
  disabled,
  weekStartsOn = 1,
  dayShape = "circle",
  numberOfMonths = 1,
  captionLayout = "buttons",
  fromYear,
  toYear,
  locale,
  messages,
  className,
}: CalendarProps) {
  const t = { ...DEFAULT_CALENDAR_MESSAGES, ...messages };
  const rootRef = React.useRef<HTMLDivElement>(null);
  // locale-driven names + formatting (no hard-coded English)
  const monthNames = React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, m) => f.format(new Date(2021, m, 1)));
  }, [locale]);
  const weekdayNames = React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) =>
      f.format(new Date(SUNDAY_2021.getFullYear(), SUNDAY_2021.getMonth(), 1 + i)),
    );
  }, [locale]);
  const weekdayLongNames = React.useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "long" });
    return Array.from({ length: 7 }, (_, i) =>
      f.format(new Date(SUNDAY_2021.getFullYear(), SUNDAY_2021.getMonth(), 1 + i)),
    );
  }, [locale]);
  const dayLabelFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "long" }),
    [locale],
  );
  const captionFmt = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    [locale],
  );
  const round = dayShape === "circle" ? "rounded-full" : "rounded-lg";
  const months = Math.max(1, numberOfMonths);
  const nowYear = new Date().getFullYear();
  const yearFrom = fromYear ?? min?.getFullYear() ?? nowYear - 100;
  const yearTo = toYear ?? max?.getFullYear() ?? nowYear + 10;
  const years = React.useMemo(
    () => Array.from({ length: Math.max(1, yearTo - yearFrom + 1) }, (_, i) => yearFrom + i),
    [yearFrom, yearTo],
  );
  const [value, setValue] = useControllable<Date | DateRange | null>(
    valueProp,
    defaultValue,
    onChange,
  );

  const asRange = (v: Date | DateRange | null): DateRange =>
    v && "from" in (v as DateRange) ? (v as DateRange) : { from: null, to: null };
  const single = mode === "single" ? (value as Date | null) : null;
  const range = mode === "range" ? asRange(value) : { from: null, to: null };

  // the month being viewed — seeded from the selection (or today)
  const seed =
    (mode === "single" ? single : range.from) ?? new Date();
  const [view, setView] = React.useState(() => new Date(seed.getFullYear(), seed.getMonth(), 1));
  const [focused, setFocused] = React.useState<Date>(() => startOfDay(seed));
  const [hover, setHover] = React.useState<Date | null>(null);

  const today = startOfDay(new Date());
  const headers = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekdayNames[(weekStartsOn + i) % 7]),
    [weekStartsOn, weekdayNames],
  );
  const longHeaders = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekdayLongNames[(weekStartsOn + i) % 7]),
    [weekStartsOn, weekdayLongNames],
  );

  const isDisabled = (d: Date) =>
    (min && isBefore(d, min)) || (max && isAfter(d, max)) || (disabled?.(d) ?? false);

  // keep the visible month + roving focus in sync with the selection when it is
  // changed externally (presets, a controlled parent, or a click).
  const anchor = mode === "single" ? single : range.from;
  const anchorKey = anchor ? `${anchor.getFullYear()}-${anchor.getMonth()}-${anchor.getDate()}` : "";
  React.useEffect(() => {
    if (!anchor) return;
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    setView((v) => (v.getFullYear() === y && v.getMonth() === m ? v : new Date(y, m, 1)));
    setFocused(startOfDay(anchor));
    // anchorKey encodes the anchor's y/m/d; re-run only when the day changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorKey]);

  // roving focus: move real DOM focus onto the active day so AT announces it —
  // but only when focus already lives inside the calendar (never steal it).
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !root.contains(document.activeElement)) return;
    root
      .querySelector<HTMLButtonElement>(`[data-day="${focused.getTime()}"]`)
      ?.focus();
  }, [focused, view]);

  const goMonth = (n: number) => setView((v) => addMonths(v, n));
  // set a given panel (index) to a year/month; the shared `view` shifts so that
  // this panel lands on the chosen month
  const setPanel = (index: number, year: number, month: number) =>
    setView(new Date(year, month - index, 1));

  const selectCls =
    "cursor-pointer appearance-none rounded-md bg-transparent py-1 ps-2 pe-6 text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const select = (d: Date) => {
    if (isDisabled(d)) return;
    const day = startOfDay(d);
    if (mode === "single") {
      setValue(day);
      return;
    }
    // range: first click sets `from`; second completes (ordering handled)
    const r = range;
    if (!r.from || (r.from && r.to)) {
      setValue({ from: day, to: null });
    } else {
      setValue(isBefore(day, r.from) ? { from: day, to: r.from } : { from: r.from, to: day });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // let the month/year dropdowns (and any other native control) keep their keys
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "SELECT" || tag === "OPTION" || tag === "INPUT") return;
    // arrows follow the visual layout, so they flip under RTL
    const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
    const dow = (focused.getDay() - weekStartsOn + 7) % 7; // column within the row
    let next: Date;
    switch (e.key) {
      case "ArrowLeft":
        next = addDays(focused, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        next = addDays(focused, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        next = addDays(focused, -7);
        break;
      case "ArrowDown":
        next = addDays(focused, 7);
        break;
      case "Home":
        next = addDays(focused, -dow);
        break;
      case "End":
        next = addDays(focused, 6 - dow);
        break;
      case "PageUp":
        next = addMonths(focused, -1);
        break;
      case "PageDown":
        next = addMonths(focused, 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(focused);
        return;
      default:
        return;
    }
    e.preventDefault();
    const clamped = clampDay(next, min, max);
    setFocused(clamped);
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) {
      setView(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    }
  };

  const isSelected = (d: Date) =>
    mode === "single" ? sameDay(single, d) : sameDay(range.from, d) || sameDay(range.to, d);

  // live range preview while picking the second endpoint. Only preview once the
  // pointer is on a *different* day than `from` — a same-day preview paints a
  // pointless one-cell band, and on touch the tap's hover sticks there, leaving a
  // stray box behind the selected day.
  const previewTo =
    mode === "range" && range.from && !range.to
      ? hover && !sameDay(hover, range.from)
        ? hover
        : null
      : range.to;
  const isInRange = (d: Date) =>
    mode === "range" && inRange(d, range.from, previewTo);

  // the grid dates only depend on the visible month(s) + week start, so build them
  // once per view — not on every hover/focus/selection re-render.
  const monthGrids = React.useMemo(
    () =>
      Array.from({ length: months }, (_, i) => {
        const monthDate = addMonths(view, i);
        return { monthDate, grid: buildGrid(monthDate, weekStartsOn) };
      }),
    [view, months, weekStartsOn],
  );

  const renderMonth = ({ monthDate, grid }: { monthDate: Date; grid: Date[] }, index: number) => {
    const isFirst = index === 0;
    const isLast = index === months - 1;
    return (
      <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`} data-bpdm-slot="calendar-month" className="w-[17rem]">
        {/* header — kept OUTSIDE role="grid" so its nav + selects aren't grid rows */}
        <div data-bpdm-slot="calendar-header" className="mb-2 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label={t.previousMonth}
            onClick={() => goMonth(-1)}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
              !isFirst && "invisible",
            )}
          >
            <ChevronLeft className="rtl:-scale-x-100" aria-hidden="true" />
          </button>
          {captionLayout === "dropdown" ? (
            <div className="flex items-center gap-1">
              <div className="relative inline-flex items-center">
                <select
                  aria-label={t.month}
                  value={monthDate.getMonth()}
                  onChange={(e) => setPanel(index, monthDate.getFullYear(), Number(e.target.value))}
                  className={selectCls}
                >
                  {monthNames.map((m, mi) => (
                    <option key={m} value={mi}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="relative inline-flex items-center">
                <select
                  aria-label={t.year}
                  value={monthDate.getFullYear()}
                  onChange={(e) => setPanel(index, Number(e.target.value), monthDate.getMonth())}
                  className={selectCls}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-1.5 size-3.5 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          ) : (
            <span className="text-sm font-semibold tabular-nums">
              {captionFmt.format(monthDate)}
            </span>
          )}
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => goMonth(1)}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
              !isLast && "invisible",
            )}
          >
            <ChevronRight className="rtl:-scale-x-100" aria-hidden="true" />
          </button>
        </div>

        {/* the grid: weekday header row + week rows are its only (direct) children */}
        <div
          role="grid"
          aria-label={captionFmt.format(monthDate)}
          aria-multiselectable={mode === "range" ? true : undefined}
          onKeyDown={onKeyDown}
          data-bpdm-slot="calendar-grid"
          className="flex flex-col gap-0.5 outline-none"
        >
          <div role="row" data-bpdm-slot="calendar-weekdays" className="grid grid-cols-7">
            {headers.map((w, i) => (
              <div
                key={i}
                role="columnheader"
                aria-label={longHeaders[i]}
                className="grid h-8 place-items-center text-xs font-medium text-muted-foreground"
              >
                {w}
              </div>
            ))}
          </div>
          {Array.from({ length: 6 }, (_, wk) => (
            <div key={wk} role="row" data-bpdm-slot="calendar-week" className="grid grid-cols-7">
              {grid.slice(wk * 7, wk * 7 + 7).map((d) => {
                const outside = d.getMonth() !== monthDate.getMonth();
                const selected = isSelected(d);
                const disabledDay = isDisabled(d);
                const rangeMid = isInRange(d);
                const isToday = sameDay(d, today);
                const isFocused = sameDay(d, focused);
                const rangeStart = mode === "range" && sameDay(range.from, d) && (range.to || previewTo);
                const rangeEnd = mode === "range" && sameDay(range.to ?? previewTo, d) && range.from && !sameDay(range.from, d);

                return (
                  <div
                    key={d.getTime()}
                    role="gridcell"
                    aria-selected={selected}
                    className={cn(
                      "relative grid place-items-center",
                      // soft range-band background spanning the row
                      (rangeMid || rangeStart || rangeEnd) && "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]",
                      rangeStart && (dayShape === "circle" ? "rounded-s-full" : "rounded-s-lg"),
                      rangeEnd && (dayShape === "circle" ? "rounded-e-full" : "rounded-e-lg"),
                    )}
                  >
                    <button
                      type="button"
                      data-day={d.getTime()}
                      tabIndex={isFocused ? 0 : -1}
                      disabled={disabledDay}
                      onClick={() => select(d)}
                      onMouseEnter={mode === "range" ? () => setHover(d) : undefined}
                      onMouseLeave={mode === "range" ? () => setHover(null) : undefined}
                      aria-label={dayLabelFmt.format(d)}
                      aria-current={isToday ? "date" : undefined}
                      data-bpdm-slot="calendar-day"
                      className={cn(
                    "grid size-9 cursor-pointer place-items-center text-sm tabular-nums transition-[background-color,color,transform] duration-[var(--bpdm-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    round,
                    "hover:bg-muted active:scale-90",
                    outside && "text-muted-foreground",
                    !outside && !selected && "text-foreground",
                    isToday && !selected && "font-semibold text-foreground ring-1 ring-inset ring-primary",
                    selected &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]",
                    disabledDay && "pointer-events-none text-muted-foreground/30 line-through",
                  )}
                    >
                      {d.getDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={t.calendar}
      data-bpdm="" data-bpdm-slot="calendar"
      className={cn(
        "flex w-fit select-none flex-col gap-5 rounded-[var(--radius)] p-3 sm:flex-row",
        className,
      )}
    >
      {monthGrids.map((m, i) => renderMonth(m, i))}
    </div>
  );
}

// DatePicker (trigger + popover calendar)
function fmt(d: Date, locale?: string) {
  return d.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}
function fmtValue(mode: "single" | "range", v: Date | DateRange | null, locale?: string): string {
  if (!v) return "";
  if (mode === "single") return fmt(v as Date, locale);
  const r = v as DateRange;
  if (r.from && r.to) return `${fmt(r.from, locale)} – ${fmt(r.to, locale)}`;
  if (r.from) return `${fmt(r.from, locale)} – …`;
  return "";
}

export interface DateRangePreset {
  label: string;
  /** Computed at click time so "today"-relative ranges stay correct. */
  range: () => DateRange;
}

/** Common range presets for dashboards — pass to `<DatePicker mode="range" presets={…} />`. */
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

export interface DatePickerProps extends Omit<CalendarProps, "className"> {
  /** Range-mode quick presets shown beside the calendar (e.g. defaultRangePresets). */
  presets?: DateRangePreset[];
  placeholder?: string;
  /** Show a clear (×) button when a value is set. Default true. */
  clearable?: boolean;
  /** Disable the whole trigger (distinct from `disabled`, which filters days). */
  disabledInput?: boolean;
  /**
   * Buffer the selection and only commit on **Apply**. Adds a Cancel/Apply
   * footer; Cancel, Escape and outside-click discard the draft. Default false
   * (pick commits immediately).
   */
  confirm?: boolean;
  /** aria-invalid styling on the trigger. */
  invalid?: boolean;
  id?: string;
  className?: string;
  /** Classes on the popover panel. */
  contentClassName?: string;
}

const rangeComplete = (v: Date | DateRange | null, mode: "single" | "range") =>
  mode === "single" ? !!v : !!((v as DateRange | null)?.from && (v as DateRange | null)?.to);

/**
 * Date (or range) picker — a trigger showing the formatted value that opens a
 * `Calendar` in a popover. Without `confirm`, single mode closes on pick and range
 * closes once both ends are chosen. With `confirm`, the selection is buffered and
 * only committed on Apply. Controlled or uncontrolled, clearable, min/max + disabled days.
 */
export function DatePicker({
  mode = "single",
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "Pick a date",
  clearable = true,
  disabledInput = false,
  confirm = false,
  invalid = false,
  id,
  className,
  contentClassName,
  numberOfMonths,
  presets,
  ...calendarProps
}: DatePickerProps) {
  // range pickers show two months by default; single shows one
  const monthsToShow = numberOfMonths ?? (mode === "range" ? 2 : 1);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = useControllable<Date | DateRange | null>(
    valueProp,
    defaultValue,
    onChange,
  );
  // in confirm mode the popover edits a draft; nothing is committed until Apply
  const [draft, setDraft] = React.useState<Date | DateRange | null>(value);

  const handleOpenChange = (o: boolean) => {
    if (o && confirm) setDraft(value); // seed the draft from the committed value
    setOpen(o);
  };

  // commit + auto-close (non-confirm), else just update the draft
  const commit = (v: Date | DateRange | null) => {
    setValue(v);
    if (mode === "single") setOpen(false);
    else if (v && (v as DateRange).from && (v as DateRange).to) setOpen(false);
  };
  const pick = confirm ? setDraft : commit;

  const cancel = () => setOpen(false); // draft is discarded (re-seeded on next open)
  const apply = () => {
    setValue(draft);
    setOpen(false);
  };

  const calValue = confirm ? draft : value;
  const text = fmtValue(mode, value, calendarProps.locale);
  const hasValue = mode === "single" ? !!value : !!(value as DateRange | null)?.from;
  const showClear = clearable && hasValue && !disabledInput;
  const messages = calendarProps.messages;

  const calendar = (
    <Calendar
      mode={mode}
      value={calValue}
      onChange={pick}
      numberOfMonths={monthsToShow}
      {...calendarProps}
    />
  );

  return (
    <div data-bpdm="" data-bpdm-slot="date-picker" className="relative w-full">
      <Popover
        open={open}
        onOpenChange={handleOpenChange}
        align="start"
        className={cn("w-auto p-0", contentClassName)}
        trigger={
          <button
            type="button"
            id={id}
            disabled={disabledInput}
            aria-invalid={invalid || undefined}
            data-bpdm-slot="date-picker-trigger"
            className={cn(
              "group inline-flex h-10 w-full min-w-[14rem] cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-input bg-background ps-3 text-start text-sm transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
              showClear ? "pe-9" : "pe-3",
              className,
            )}
          >
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className={cn("flex-1 truncate", !hasValue && "text-muted-foreground")}>
              {text || placeholder}
            </span>
          </button>
        }
      >
        <div className="flex flex-col">
          {mode === "range" && presets && presets.length > 0 ? (
            <div className="flex w-fit flex-col sm:w-auto sm:flex-row">
              <div className="flex w-0 min-w-full shrink-0 flex-wrap gap-1 border-b border-border p-2 sm:w-auto sm:min-w-0 sm:max-w-[9rem] sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-b-0 sm:border-e">
                {presets.map((p) => {
                  const r = calValue as DateRange | null;
                  const pr = p.range();
                  const active = !!r && sameDay(r.from, pr.from) && sameDay(r.to, pr.to);
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => pick(p.range())}
                      data-bpdm-slot="date-picker-preset"
                      className={cn(
                        "shrink-0 cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-start text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              {calendar}
            </div>
          ) : (
            calendar
          )}
          {confirm && (
            <div className="flex items-center justify-end gap-2 border-t border-border p-2">
              <button
                type="button"
                onClick={cancel}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {messages?.cancel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={!rangeComplete(draft, mode)}
                className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {messages?.apply ?? "Apply"}
              </button>
            </div>
          )}
        </div>
      </Popover>
      {showClear && (
        <button
          type="button"
          aria-label={messages?.clear ?? "Clear"}
          onClick={() => commit(mode === "single" ? null : { from: null, to: null })}
          data-bpdm-slot="date-picker-clear"
          className="absolute end-2 top-1/2 z-10 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5"
        >
          <X aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
