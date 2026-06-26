import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  addMonths,
  buildGrid,
  clampDay,
  type DatePredicate,
  type DateRange,
  inRange,
  isAfter,
  isBefore,
  MONTHS,
  sameDay,
  startOfDay,
  WEEKDAYS,
} from "./date-utils";

export type CalendarMode = "single" | "range";
export type CalendarDayShape = "circle" | "rounded";
export type CalendarCaptionLayout = "buttons" | "dropdown";

interface DayCell {
  key: number;
  date: Date;
  label: number;
  disabled: boolean;
  selected: boolean;
  today: boolean;
  wrapperClass: string;
  buttonClass: string;
}
interface MonthView {
  key: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  monthIndex: number;
  year: number;
  label: string;
  days: DayCell[];
}

/**
 * `<bpdm-calendar>` — month calendar built on native dates: single date or a
 * range, with month/year navigation, `min`/`max` and per-day `disabled`, today +
 * selection highlights, and keyboard support (arrows move, Enter selects,
 * PageUp/PageDown change month). Controlled or uncontrolled via `[(value)]`.
 *
 * ```html
 * <bpdm-calendar [(value)]="date" />
 * <bpdm-calendar mode="range" [(value)]="range" [numberOfMonths]="2" />
 * <bpdm-calendar captionLayout="dropdown" [(value)]="date" />
 * ```
 */
@Component({
  selector: "bpdm-calendar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-fit" },
  template: `
    <div
      role="grid"
      aria-label="Calendar"
      tabindex="0"
      (keydown)="onKeyDown($event)"
      [class]="rootClass()"
    >
      @for (m of months(); track m.key) {
        <div class="w-[17rem]">
          <!-- header: nav (ends only) + month/year -->
          <div class="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              aria-label="Previous month"
              (click)="goMonth(-1)"
              [class]="navClass(m.isFirst)"
            >
              <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            @if (captionLayout() === "dropdown") {
              <div class="flex items-center gap-1">
                <div class="relative inline-flex items-center">
                  <select
                    aria-label="Month"
                    [value]="m.monthIndex"
                    (change)="setPanel(m.index, m.year, +$any($event.target).value)"
                    [class]="selectCls"
                  >
                    @for (mo of monthOptions; track mo.value) {
                      <option [value]="mo.value">{{ mo.label }}</option>
                    }
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" class="pointer-events-none absolute right-1.5 size-3.5 text-muted-foreground" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="relative inline-flex items-center">
                  <select
                    aria-label="Year"
                    [value]="m.year"
                    (change)="setPanel(m.index, +$any($event.target).value, m.monthIndex)"
                    [class]="selectCls"
                  >
                    @for (y of years(); track y) {
                      <option [value]="y">{{ y }}</option>
                    }
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" class="pointer-events-none absolute right-1.5 size-3.5 text-muted-foreground" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            } @else {
              <span class="text-sm font-semibold tabular-nums">{{ m.label }}</span>
            }

            <button
              type="button"
              aria-label="Next month"
              (click)="goMonth(1)"
              [class]="navClass(m.isLast)"
            >
              <svg viewBox="0 0 24 24" fill="none" class="size-4" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- weekday row -->
          <div class="grid grid-cols-7 gap-0.5">
            @for (w of headers(); track $index) {
              <div class="grid h-8 place-items-center text-xs font-medium text-muted-foreground">{{ w }}</div>
            }
          </div>

          <!-- day grid -->
          <div class="grid grid-cols-7 gap-y-0.5">
            @for (d of m.days; track d.key) {
              <div [class]="d.wrapperClass">
                <button
                  type="button"
                  tabindex="-1"
                  [disabled]="d.disabled"
                  (click)="select(d.date)"
                  (mouseenter)="hover.set(d.date)"
                  (mouseleave)="hover.set(null)"
                  [attr.aria-selected]="d.selected"
                  [attr.aria-current]="d.today ? 'date' : null"
                  [class]="d.buttonClass"
                >
                  {{ d.label }}
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class BpdmCalendar {
  /** "single" → a Date; "range" → a { from, to }. Default "single". */
  readonly mode = input<CalendarMode>("single");
  /** Controlled / uncontrolled value — `[(value)]`. */
  readonly value = model<Date | DateRange | null>(null);
  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  /** Disable specific days, e.g. weekends. */
  readonly disabled = input<DatePredicate | undefined>(undefined);
  /** 0 = Sunday, 1 = Monday. Default 1. */
  readonly weekStartsOn = input<0 | 1>(1);
  /** Shape of the day highlight: "circle" (default) or "rounded" (squircle). */
  readonly dayShape = input<CalendarDayShape>("circle");
  /** How many months to show side by side. Default 1. */
  readonly numberOfMonths = input<number>(1);
  /** Header style: "buttons" (prev/next only) or "dropdown" (month + year menus). */
  readonly captionLayout = input<CalendarCaptionLayout>("buttons");
  /** Year-dropdown range. Default: 100 years back to 10 years ahead. */
  readonly fromYear = input<number | undefined>(undefined);
  readonly toYear = input<number | undefined>(undefined);
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly monthOptions = MONTHS.map((label, value) => ({ label, value }));
  protected readonly selectCls =
    "cursor-pointer appearance-none rounded-md bg-transparent py-1 pl-2 pr-6 text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  protected readonly hover = signal<Date | null>(null);
  // null = "follow the selection"; set explicitly once the user navigates
  private readonly viewOverride = signal<Date | null>(null);
  private readonly focusOverride = signal<Date | null>(null);

  private readonly today = startOfDay(new Date());
  private readonly monthsCount = computed(() => Math.max(1, this.numberOfMonths()));

  private asRange(v: Date | DateRange | null): DateRange {
    return v && "from" in (v as DateRange) ? (v as DateRange) : { from: null, to: null };
  }
  private get single(): Date | null {
    return this.mode() === "single" ? (this.value() as Date | null) : null;
  }
  private get range(): DateRange {
    return this.mode() === "range" ? this.asRange(this.value()) : { from: null, to: null };
  }

  private readonly seed = computed<Date>(() => {
    const s = this.mode() === "single" ? this.single : this.range.from;
    return s ?? new Date();
  });
  private readonly viewMonth = computed<Date>(() => {
    const o = this.viewOverride();
    return o ?? new Date(this.seed().getFullYear(), this.seed().getMonth(), 1);
  });
  private readonly focused = computed<Date>(() => this.focusOverride() ?? startOfDay(this.seed()));

  protected readonly headers = computed(() =>
    Array.from({ length: 7 }, (_, i) => WEEKDAYS[(this.weekStartsOn() + i) % 7]),
  );

  protected readonly years = computed(() => {
    const now = new Date().getFullYear();
    const from = this.fromYear() ?? this.min()?.getFullYear() ?? now - 100;
    const to = this.toYear() ?? this.max()?.getFullYear() ?? now + 10;
    return Array.from({ length: Math.max(1, to - from + 1) }, (_, i) => from + i);
  });

  protected readonly rootClass = computed(() =>
    cn(
      "flex w-fit select-none gap-5 rounded-[var(--radius)] p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring",
      this.classInput(),
    ),
  );

  private isDisabled(d: Date): boolean {
    const min = this.min();
    const max = this.max();
    return (
      (!!min && isBefore(d, min)) ||
      (!!max && isAfter(d, max)) ||
      (this.disabled()?.(d) ?? false)
    );
  }

  protected readonly months = computed<MonthView[]>(() => {
    const count = this.monthsCount();
    const view = this.viewMonth();
    const mode = this.mode();
    const range = this.range;
    const single = this.single;
    const focused = this.focused();
    const hover = this.hover();
    const shape = this.dayShape();
    const round = shape === "circle" ? "rounded-full" : "rounded-lg";

    // live range preview while picking the second endpoint
    const previewTo = mode === "range" && range.from && !range.to ? hover : range.to;

    const out: MonthView[] = [];
    for (let index = 0; index < count; index++) {
      const monthDate = addMonths(view, index);
      const grid = buildGrid(monthDate, this.weekStartsOn());
      const days: DayCell[] = grid.map((d) => {
        const outside = d.getMonth() !== monthDate.getMonth();
        const selected =
          mode === "single" ? sameDay(single, d) : sameDay(range.from, d) || sameDay(range.to, d);
        const disabledDay = this.isDisabled(d);
        const rangeMid = mode === "range" && inRange(d, range.from, previewTo);
        const isToday = sameDay(d, this.today);
        const isFocused = sameDay(d, focused);
        const rangeStart =
          mode === "range" && sameDay(range.from, d) && !!(range.to || previewTo);
        const rangeEnd =
          mode === "range" &&
          sameDay(range.to ?? previewTo, d) &&
          !!range.from &&
          !sameDay(range.from, d);

        const wrapperClass = cn(
          "relative grid place-items-center",
          (rangeMid || rangeStart || rangeEnd) &&
            "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]",
          rangeStart && (shape === "circle" ? "rounded-l-full" : "rounded-l-lg"),
          rangeEnd && (shape === "circle" ? "rounded-r-full" : "rounded-r-lg"),
        );
        const buttonClass = cn(
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
        );

        return {
          key: d.getTime(),
          date: d,
          label: d.getDate(),
          disabled: disabledDay,
          selected,
          today: isToday,
          wrapperClass,
          buttonClass,
        };
      });

      out.push({
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
        index,
        isFirst: index === 0,
        isLast: index === count - 1,
        monthIndex: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        label: `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        days,
      });
    }
    return out;
  });

  protected navClass(visible: boolean): string {
    return cn(
      "inline-flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      !visible && "invisible",
    );
  }

  protected goMonth(n: number): void {
    this.viewOverride.set(addMonths(this.viewMonth(), n));
  }

  // set a given panel (index) to a year/month; the shared view shifts so this
  // panel lands on the chosen month
  protected setPanel(index: number, year: number, month: number): void {
    this.viewOverride.set(new Date(year, month - index, 1));
  }

  protected select(d: Date): void {
    if (this.isDisabled(d)) return;
    const day = startOfDay(d);
    if (this.mode() === "single") {
      this.value.set(day);
      return;
    }
    const r = this.range;
    if (!r.from || (r.from && r.to)) {
      this.value.set({ from: day, to: null });
    } else {
      this.value.set(
        isBefore(day, r.from) ? { from: day, to: r.from } : { from: r.from, to: day },
      );
    }
  }

  protected onKeyDown(e: KeyboardEvent): void {
    const f = this.focused();
    let next: Date;
    if (e.key === "ArrowLeft") next = new Date(f.getFullYear(), f.getMonth(), f.getDate() - 1);
    else if (e.key === "ArrowRight") next = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 1);
    else if (e.key === "ArrowUp") next = new Date(f.getFullYear(), f.getMonth(), f.getDate() - 7);
    else if (e.key === "ArrowDown") next = new Date(f.getFullYear(), f.getMonth(), f.getDate() + 7);
    else if (e.key === "PageUp") next = addMonths(f, -1);
    else if (e.key === "PageDown") next = addMonths(f, 1);
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.select(f);
      return;
    } else return;
    e.preventDefault();
    const clamped = clampDay(next, this.min(), this.max());
    this.focusOverride.set(clamped);
    const view = this.viewMonth();
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) {
      this.viewOverride.set(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    }
  }
}
