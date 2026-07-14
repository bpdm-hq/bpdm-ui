import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
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
  sameDay,
  startOfDay,
} from "./date-utils";

export type CalendarMode = "single" | "range";
export type CalendarDayShape = "circle" | "square";
export type CalendarCaptionLayout = "buttons" | "dropdown";

export interface CalendarMessages {
  calendar?: string;
  previousMonth?: string;
  nextMonth?: string;
  month?: string;
  year?: string;
  clear?: string;
  /** DatePicker `confirm` footer — discard the draft. */
  cancel?: string;
  /** DatePicker `confirm` footer — commit the draft. */
  apply?: string;
}

// Aug 1 2021 is a Sunday → index 0 = Sunday for weekday names.
const SUNDAY_2021 = new Date(2021, 7, 1);

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

interface DayCell {
  key: number;
  date: Date;
  label: number;
  ariaLabel: string;
  disabled: boolean;
  selected: boolean;
  today: boolean;
  focused: boolean;
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
  weeks: DayCell[][];
}

/**
 * `<bpdm-calendar>` — month calendar built on native dates: single date or a
 * range, with month/year navigation, `min`/`max` and per-day `disabled`, today +
 * selection highlights, and a full WAI-ARIA grid: roving focus moves real DOM
 * focus to the active day so screen readers announce it. Keyboard: arrows move
 * (RTL-aware), Home/End jump to the week edges, PageUp/Down change month,
 * Enter/Space selects. Controlled or uncontrolled via `[(value)]`.
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
    <div role="group" [attr.aria-label]="t().calendar" [class]="rootClass()">
      @for (m of months(); track m.key) {
        <div class="w-[17rem]">
          <!-- header — kept OUTSIDE role="grid" so its nav + selects aren't grid rows -->
          <div class="mb-2 flex items-center justify-between px-1">
            <button
              type="button"
              [attr.aria-label]="t().previousMonth"
              (click)="goMonth(-1)"
              [class]="navClass(m.isFirst)"
            >
              <svg viewBox="0 0 24 24" fill="none" class="size-4 rtl:-scale-x-100" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            @if (captionLayout() === "dropdown") {
              <div class="flex items-center gap-1">
                <div class="relative inline-flex items-center">
                  <select
                    [attr.aria-label]="t().month"
                    [value]="m.monthIndex"
                    (change)="setPanel(m.index, m.year, +$any($event.target).value)"
                    [class]="selectCls"
                  >
                    @for (mo of monthOptions(); track mo.value) {
                      <option [value]="mo.value">{{ mo.label }}</option>
                    }
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" class="pointer-events-none absolute end-1.5 size-3.5 text-muted-foreground" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="relative inline-flex items-center">
                  <select
                    [attr.aria-label]="t().year"
                    [value]="m.year"
                    (change)="setPanel(m.index, +$any($event.target).value, m.monthIndex)"
                    [class]="selectCls"
                  >
                    @for (y of years(); track y) {
                      <option [value]="y">{{ y }}</option>
                    }
                  </select>
                  <svg viewBox="0 0 24 24" fill="none" class="pointer-events-none absolute end-1.5 size-3.5 text-muted-foreground" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            } @else {
              <span class="text-sm font-semibold tabular-nums">{{ m.label }}</span>
            }

            <button
              type="button"
              [attr.aria-label]="t().nextMonth"
              (click)="goMonth(1)"
              [class]="navClass(m.isLast)"
            >
              <svg viewBox="0 0 24 24" fill="none" class="size-4 rtl:-scale-x-100" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- the grid: weekday header row + week rows are its only (direct) children -->
          <div
            role="grid"
            [attr.aria-label]="m.label"
            [attr.aria-multiselectable]="mode() === 'range' ? true : null"
            (keydown)="onKeyDown($event)"
            class="flex flex-col gap-0.5 outline-none"
          >
            <div role="row" class="grid grid-cols-7">
              @for (w of headers(); track $index) {
                <div role="columnheader" [attr.aria-label]="longHeaders()[$index]" class="grid h-8 place-items-center text-xs font-medium text-muted-foreground">{{ w }}</div>
              }
            </div>
            @for (week of m.weeks; track $index) {
              <div role="row" class="grid grid-cols-7">
                @for (d of week; track d.key) {
                  <div role="gridcell" [attr.aria-selected]="d.selected" [class]="d.wrapperClass">
                    <button
                      type="button"
                      [attr.data-day]="d.key"
                      [tabindex]="d.focused ? 0 : -1"
                      [disabled]="d.disabled"
                      (click)="select(d.date)"
                      (mouseenter)="onHover(d.date)"
                      (mouseleave)="onHover(null)"
                      [attr.aria-label]="d.ariaLabel"
                      [attr.aria-current]="d.today ? 'date' : null"
                      [class]="d.buttonClass"
                    >
                      {{ d.label }}
                    </button>
                  </div>
                }
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
  /** Shape of the day highlight: "circle" (default) or "square" (rounded-corner square). */
  readonly dayShape = input<CalendarDayShape>("circle");
  /** How many months to show side by side. Default 1. */
  readonly numberOfMonths = input<number>(1);
  /** Header style: "buttons" (prev/next only) or "dropdown" (month + year menus). */
  readonly captionLayout = input<CalendarCaptionLayout>("buttons");
  /** Year-dropdown range. Default: 100 years back to 10 years ahead. */
  readonly fromYear = input<number | undefined>(undefined);
  readonly toYear = input<number | undefined>(undefined);
  readonly classInput = input<string>("", { alias: "class" });
  /** BCP 47 locale for month/weekday names + date formatting (e.g. "de-DE", "ar"). */
  readonly locale = input<string | undefined>(undefined);
  /** Override the control labels (screen-reader text) for i18n. */
  readonly messages = input<CalendarMessages>({});

  private readonly host = inject(ElementRef<HTMLElement>);
  // day (getTime) to move real DOM focus onto after the next render (keyboard nav)
  private pendingFocusKey: number | null = null;

  constructor() {
    afterEveryRender(() => {
      const key = this.pendingFocusKey;
      if (key == null) return;
      this.pendingFocusKey = null;
      (
        this.host.nativeElement.querySelector(`[data-day="${key}"]`) as HTMLButtonElement | null
      )?.focus();
    });
  }

  protected readonly t = computed(() => ({
    calendar: "Calendar",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    month: "Month",
    year: "Year",
    clear: "Clear",
    cancel: "Cancel",
    apply: "Apply",
    ...this.messages(),
  }));
  protected readonly monthNames = computed(() => {
    const f = new Intl.DateTimeFormat(this.locale(), { month: "long" });
    return Array.from({ length: 12 }, (_, m) => f.format(new Date(2021, m, 1)));
  });
  private readonly weekdayNames = computed(() => {
    const f = new Intl.DateTimeFormat(this.locale(), { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) =>
      f.format(new Date(SUNDAY_2021.getFullYear(), SUNDAY_2021.getMonth(), 1 + i)),
    );
  });
  private readonly weekdayLongNames = computed(() => {
    const f = new Intl.DateTimeFormat(this.locale(), { weekday: "long" });
    return Array.from({ length: 7 }, (_, i) =>
      f.format(new Date(SUNDAY_2021.getFullYear(), SUNDAY_2021.getMonth(), 1 + i)),
    );
  });
  private readonly dayLabelFmt = computed(() => new Intl.DateTimeFormat(this.locale(), { dateStyle: "long" }));
  private readonly captionFmt = computed(
    () => new Intl.DateTimeFormat(this.locale(), { month: "long", year: "numeric" }),
  );
  protected readonly monthOptions = computed(() =>
    this.monthNames().map((label, value) => ({ label, value })),
  );
  protected readonly selectCls =
    "cursor-pointer appearance-none rounded-md bg-transparent py-1 ps-2 pe-6 text-sm font-semibold tabular-nums text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  protected readonly hover = signal<Date | null>(null);
  // null = "follow the selection"; set explicitly once the user navigates
  private readonly viewOverride = signal<Date | null>(null);
  private readonly focusOverride = signal<Date | null>(null);

  private get today(): Date {
    return startOfDay(new Date());
  }
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
    Array.from({ length: 7 }, (_, i) => this.weekdayNames()[(this.weekStartsOn() + i) % 7]),
  );
  protected readonly longHeaders = computed(() =>
    Array.from({ length: 7 }, (_, i) => this.weekdayLongNames()[(this.weekStartsOn() + i) % 7]),
  );

  protected readonly years = computed(() => {
    const now = new Date().getFullYear();
    const from = this.fromYear() ?? this.min()?.getFullYear() ?? now - 100;
    const to = this.toYear() ?? this.max()?.getFullYear() ?? now + 10;
    return Array.from({ length: Math.max(1, to - from + 1) }, (_, i) => from + i);
  });

  protected readonly rootClass = computed(() =>
    cn("flex w-fit select-none gap-5 rounded-[var(--radius)] p-3", this.classInput()),
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
    const today = this.today;
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
        const isToday = sameDay(d, today);
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
          rangeStart && (shape === "circle" ? "rounded-s-full" : "rounded-s-lg"),
          rangeEnd && (shape === "circle" ? "rounded-e-full" : "rounded-e-lg"),
        );
        const buttonClass = cn(
          "grid size-9 cursor-pointer place-items-center text-sm tabular-nums transition-[background-color,color,transform] duration-[var(--bpdm-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          round,
          "hover:bg-muted active:scale-90",
          outside && "text-muted-foreground",
          !outside && !selected && "text-foreground",
          isToday && !selected && "font-semibold text-foreground ring-1 ring-inset ring-primary",
          selected &&
            "bg-primary font-semibold text-primary-foreground hover:bg-primary animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]",
          disabledDay && "pointer-events-none text-muted-foreground/30 line-through",
        );

        return {
          key: d.getTime(),
          date: d,
          label: d.getDate(),
          ariaLabel: this.dayLabelFmt().format(d),
          disabled: disabledDay,
          selected,
          today: isToday,
          focused: isFocused,
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
        label: this.captionFmt().format(monthDate),
        weeks: Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7)),
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

  // hover only drives the range preview; skip it in single mode so the grid
  // doesn't recompute on every mouse move.
  protected onHover(d: Date | null): void {
    if (this.mode() === "range") this.hover.set(d);
  }

  protected select(d: Date): void {
    if (this.isDisabled(d)) return;
    const day = startOfDay(d);
    // selection becomes the new anchor: let view + focus follow it again
    this.viewOverride.set(null);
    this.focusOverride.set(null);
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
    // let the month/year dropdowns (and any other native control) keep their keys
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "SELECT" || tag === "OPTION" || tag === "INPUT") return;
    const f = this.focused();
    // arrows follow the visual layout, so they flip under RTL
    const rtl = getComputedStyle(e.currentTarget as HTMLElement).direction === "rtl";
    const dow = (f.getDay() - this.weekStartsOn() + 7) % 7; // column within the row
    let next: Date;
    switch (e.key) {
      case "ArrowLeft":
        next = addDays(f, rtl ? 1 : -1);
        break;
      case "ArrowRight":
        next = addDays(f, rtl ? -1 : 1);
        break;
      case "ArrowUp":
        next = addDays(f, -7);
        break;
      case "ArrowDown":
        next = addDays(f, 7);
        break;
      case "Home":
        next = addDays(f, -dow);
        break;
      case "End":
        next = addDays(f, 6 - dow);
        break;
      case "PageUp":
        next = addMonths(f, -1);
        break;
      case "PageDown":
        next = addMonths(f, 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.select(f);
        return;
      default:
        return;
    }
    e.preventDefault();
    const clamped = clampDay(next, this.min(), this.max());
    this.focusOverride.set(clamped);
    const view = this.viewMonth();
    if (clamped.getMonth() !== view.getMonth() || clamped.getFullYear() !== view.getFullYear()) {
      this.viewOverride.set(new Date(clamped.getFullYear(), clamped.getMonth(), 1));
    }
    this.pendingFocusKey = clamped.getTime();
  }
}
