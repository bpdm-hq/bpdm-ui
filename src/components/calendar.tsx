import * as React from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "./popover";

// ── date helpers (local, compared by y/m/d so DST never bites) ───────────────
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a?: Date | null, b?: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  /** Shape of the day highlight: "circle" (default) or "rounded" (squircle). */
  dayShape?: "circle" | "rounded";
  /** How many months to show side by side. Default 1. */
  numberOfMonths?: number;
  /** Header style: "buttons" (prev/next only) or "dropdown" (month + year menus). */
  captionLayout?: "buttons" | "dropdown";
  /** Year-dropdown range. Default: 100 years back to 10 years ahead. */
  fromYear?: number;
  toYear?: number;
  className?: string;
}

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = React.useState(fallback);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : internal;
  const set = React.useCallback(
    (v: T) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    },
    [isControlled, onChange],
  );
  return [value, set] as const;
}

/**
 * Month calendar built on native dates — single date or a range, with month/year
 * navigation, min/max and per-day `disabled`, today + selection highlights, and
 * keyboard support (arrows move, Enter selects, PageUp/Down change month).
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
  className,
}: CalendarProps) {
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
    () => Array.from({ length: 7 }, (_, i) => WEEKDAYS[(weekStartsOn + i) % 7]),
    [weekStartsOn],
  );

  const isDisabled = (d: Date) =>
    (min && isBefore(d, min)) || (max && isAfter(d, max)) || (disabled?.(d) ?? false);

  const goMonth = (n: number) => setView((v) => addMonths(v, n));
  // set a given panel (index) to a year/month; the shared `view` shifts so that
  // this panel lands on the chosen month
  const setPanel = (index: number, year: number, month: number) =>
    setView(new Date(year, month - index, 1));

  const selectCls =
    "cursor-pointer appearance-none rounded-md bg-transparent py-1 pl-2 pr-6 text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
    let next: Date | null = null;
    if (e.key === "ArrowLeft") next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() - 1);
    else if (e.key === "ArrowRight") next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() + 1);
    else if (e.key === "ArrowUp") next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() - 7);
    else if (e.key === "ArrowDown") next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() + 7);
    else if (e.key === "PageUp") next = addMonths(focused, -1);
    else if (e.key === "PageDown") next = addMonths(focused, 1);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(focused);
      return;
    } else return;
    e.preventDefault();
    const clamped = clampDay(next, min, max);
    setFocused(clamped);
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) {
      setView(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    }
  };

  const isSelected = (d: Date) =>
    mode === "single" ? sameDay(single, d) : sameDay(range.from, d) || sameDay(range.to, d);

  // live range preview while picking the second endpoint
  const previewTo = mode === "range" && range.from && !range.to ? hover : range.to;
  const isInRange = (d: Date) =>
    mode === "range" && inRange(d, range.from, previewTo);

  const renderMonth = (monthDate: Date, index: number) => {
    const grid = buildGrid(monthDate, weekStartsOn);
    const isFirst = index === 0;
    const isLast = index === months - 1;
    return (
      <div key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`} className="w-[17rem]">
        {/* header: nav (ends only) + month/year */}
        <div className="mb-2 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => goMonth(-1)}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
              !isFirst && "invisible",
            )}
          >
            <ChevronLeft />
          </button>
          {captionLayout === "dropdown" ? (
            <div className="flex items-center gap-1">
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Month"
                  value={monthDate.getMonth()}
                  onChange={(e) => setPanel(index, monthDate.getFullYear(), Number(e.target.value))}
                  className={selectCls}
                >
                  {MONTHS.map((m, mi) => (
                    <option key={m} value={mi}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5 text-muted-foreground" />
              </div>
              <div className="relative inline-flex items-center">
                <select
                  aria-label="Year"
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
                <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <span className="text-sm font-semibold tabular-nums">
              {MONTHS[monthDate.getMonth()]} {monthDate.getFullYear()}
            </span>
          )}
          <button
            type="button"
            aria-label="Next month"
            onClick={() => goMonth(1)}
            className={cn(
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4",
              !isLast && "invisible",
            )}
          >
            <ChevronRight />
          </button>
        </div>

        {/* weekday row */}
        <div className="grid grid-cols-7 gap-0.5">
          {headers.map((w) => (
            <div key={w} className="grid h-8 place-items-center text-xs font-medium text-muted-foreground">
              {w}
            </div>
          ))}
        </div>

        {/* day grid */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {grid.map((d) => {
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
                className={cn(
                  "relative grid place-items-center",
                  // soft range-band background spanning the row
                  (rangeMid || rangeStart || rangeEnd) && "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]",
                  rangeStart && (dayShape === "circle" ? "rounded-l-full" : "rounded-l-lg"),
                  rangeEnd && (dayShape === "circle" ? "rounded-r-full" : "rounded-r-lg"),
                )}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={disabledDay}
                  onClick={() => select(d)}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  aria-selected={selected}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "grid size-9 cursor-pointer place-items-center text-sm tabular-nums transition-[background-color,color,transform] duration-[var(--bpdm-duration-fast)] focus:outline-none",
                    round,
                    "hover:bg-muted active:scale-90",
                    outside && "text-muted-foreground/40",
                    !outside && !selected && "text-foreground",
                    isToday && !selected && "font-semibold text-primary",
                    selected &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]",
                    isFocused && !selected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                    disabledDay && "pointer-events-none text-muted-foreground/30 line-through",
                  )}
                >
                  {d.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      role="grid"
      aria-label="Calendar"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "flex w-fit select-none gap-5 rounded-[var(--radius)] p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {Array.from({ length: months }, (_, i) => renderMonth(addMonths(view, i), i))}
    </div>
  );
}

// ── DatePicker (trigger + popover calendar) ──────────────────────────────────
function fmt(d: Date) {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
function fmtValue(mode: "single" | "range", v: Date | DateRange | null): string {
  if (!v) return "";
  if (mode === "single") return fmt(v as Date);
  const r = v as DateRange;
  if (r.from && r.to) return `${fmt(r.from)} – ${fmt(r.to)}`;
  if (r.from) return `${fmt(r.from)} – …`;
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
  disabledInput?: boolean;
  /** aria-invalid styling on the trigger. */
  invalid?: boolean;
  id?: string;
  className?: string;
  /** Classes on the popover panel. */
  contentClassName?: string;
}

/**
 * Date (or range) picker — a trigger showing the formatted value that opens a
 * `Calendar` in a popover. Single mode closes on pick; range mode closes once both
 * ends are chosen. Controlled or uncontrolled, clearable, min/max + disabled days.
 */
export function DatePicker({
  mode = "single",
  value: valueProp,
  defaultValue = null,
  onChange,
  placeholder = "Pick a date",
  clearable = true,
  disabledInput = false,
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

  const handleChange = (v: Date | DateRange | null) => {
    setValue(v);
    if (mode === "single") setOpen(false);
    else if (v && (v as DateRange).from && (v as DateRange).to) setOpen(false);
  };

  const text = fmtValue(mode, value);
  const hasValue = mode === "single" ? !!value : !!(value as DateRange | null)?.from;

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      className={cn("w-auto p-0", contentClassName)}
      trigger={
        <button
          type="button"
          id={id}
          disabled={disabledInput}
          aria-invalid={invalid || undefined}
          className={cn(
            "group inline-flex h-10 w-full min-w-[14rem] cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-input bg-background px-3 text-left text-sm transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !hasValue && "text-muted-foreground")}>
            {text || placeholder}
          </span>
          {clearable && hasValue && !disabledInput && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                e.stopPropagation();
                handleChange(mode === "single" ? null : { from: null, to: null });
              }}
              className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-3.5"
            >
              <X />
            </span>
          )}
        </button>
      }
    >
      {mode === "range" && presets && presets.length > 0 ? (
        <div className="flex flex-col sm:flex-row">
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:max-w-[9rem] sm:flex-col sm:gap-0.5 sm:overflow-visible sm:border-b-0 sm:border-r">
            {presets.map((p) => {
              const r = value as DateRange | null;
              const pr = p.range();
              const active = !!r && sameDay(r.from, pr.from) && sameDay(r.to, pr.to);
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleChange(p.range())}
                  className={cn(
                    "shrink-0 cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <Calendar
            mode={mode}
            value={value}
            onChange={handleChange}
            numberOfMonths={monthsToShow}
            {...calendarProps}
          />
        </div>
      ) : (
        <Calendar
          mode={mode}
          value={value}
          onChange={handleChange}
          numberOfMonths={monthsToShow}
          {...calendarProps}
        />
      )}
    </Popover>
  );
}
