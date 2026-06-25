import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { BpdmPopover } from "../popover/popover";
import { BpdmCalendar, type CalendarCaptionLayout, type CalendarDayShape, type CalendarMode } from "./calendar";
import {
  type DateRange,
  type DateRangePreset,
  fmtValue,
  sameDay,
} from "./date-utils";

/**
 * `<bpdm-date-picker>` — date (or range) picker: a trigger showing the formatted
 * value that opens a `<bpdm-calendar>` in a popover. Single mode closes on pick;
 * range mode closes once both ends are chosen. Controlled or uncontrolled,
 * clearable, with `min`/`max` + per-day `disabled` and range presets.
 *
 * ```html
 * <bpdm-date-picker [(value)]="date" />
 * <bpdm-date-picker mode="range" [(value)]="range" [presets]="presets" />
 * ```
 */
@Component({
  selector: "bpdm-date-picker",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [BpdmPopover, BpdmCalendar],
  template: `
    <button
      type="button"
      [bpdmPopover]="panel"
      [(bpdmPopoverOpen)]="open"
      bpdmPopoverAlign="start"
      [bpdmPopoverClass]="'w-auto p-0 ' + contentClassName()"
      [id]="id() || null"
      [disabled]="disabledInput()"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="triggerClass()"
    >
      <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
        <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <span [class]="cn('flex-1 truncate', !hasValue() && 'text-muted-foreground')">
        {{ text() || placeholder() }}
      </span>
      @if (clearable() && hasValue() && !disabledInput()) {
        <span
          role="button"
          tabindex="-1"
          aria-label="Clear"
          (click)="clear($event)"
          class="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" fill="none" class="size-3.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      }
    </button>

    <ng-template #panel>
      @if (mode() === "range" && presets() && presets()!.length > 0) {
        <div class="flex flex-col sm:flex-row">
          <div class="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:max-w-[9rem] sm:flex-col sm:gap-0.5 sm:overflow-visible sm:border-b-0 sm:border-r">
            @for (p of presets(); track p.label) {
              <button
                type="button"
                (click)="apply(p)"
                [class]="presetClass(p)"
              >
                {{ p.label }}
              </button>
            }
          </div>
          <bpdm-calendar
            [mode]="mode()"
            [value]="value()"
            (valueChange)="handleChange($event)"
            [numberOfMonths]="monthsToShow()"
            [min]="min()"
            [max]="max()"
            [disabled]="disabled()"
            [weekStartsOn]="weekStartsOn()"
            [dayShape]="dayShape()"
            [captionLayout]="captionLayout()"
            [fromYear]="fromYear()"
            [toYear]="toYear()"
          />
        </div>
      } @else {
        <bpdm-calendar
          [mode]="mode()"
          [value]="value()"
          (valueChange)="handleChange($event)"
          [numberOfMonths]="monthsToShow()"
          [min]="min()"
          [max]="max()"
          [disabled]="disabled()"
          [weekStartsOn]="weekStartsOn()"
          [dayShape]="dayShape()"
          [captionLayout]="captionLayout()"
          [fromYear]="fromYear()"
          [toYear]="toYear()"
        />
      }
    </ng-template>
  `,
})
export class BpdmDatePicker {
  readonly mode = input<CalendarMode>("single");
  /** Controlled / uncontrolled value — `[(value)]`. */
  readonly value = model<Date | DateRange | null>(null);
  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly disabled = input<((date: Date) => boolean) | undefined>(undefined);
  readonly weekStartsOn = input<0 | 1>(1);
  readonly dayShape = input<CalendarDayShape>("circle");
  readonly numberOfMonths = input<number | undefined>(undefined);
  readonly captionLayout = input<CalendarCaptionLayout>("buttons");
  readonly fromYear = input<number | undefined>(undefined);
  readonly toYear = input<number | undefined>(undefined);
  /** Range-mode quick presets shown beside the calendar (e.g. defaultRangePresets). */
  readonly presets = input<DateRangePreset[] | undefined>(undefined);
  readonly placeholder = input<string>("Pick a date");
  /** Show a clear (×) button when a value is set. Default true. */
  readonly clearable = input(true, { transform: booleanAttribute });
  readonly disabledInput = input(false, { transform: booleanAttribute });
  /** aria-invalid styling on the trigger. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly id = input<string>("");
  readonly classInput = input<string>("", { alias: "class" });
  /** Classes on the popover panel. */
  readonly contentClassName = input<string>("");

  protected readonly cn = cn;
  protected readonly open = signal(false);

  // range pickers show two months by default; single shows one
  protected readonly monthsToShow = computed(
    () => this.numberOfMonths() ?? (this.mode() === "range" ? 2 : 1),
  );

  protected readonly text = computed(() => fmtValue(this.mode(), this.value()));
  protected readonly hasValue = computed(() =>
    this.mode() === "single"
      ? !!this.value()
      : !!(this.value() as DateRange | null)?.from,
  );

  protected readonly triggerClass = computed(() =>
    cn(
      "group inline-flex h-10 w-full min-w-[14rem] cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-input bg-background px-3 text-left text-sm transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
      this.classInput(),
    ),
  );

  protected handleChange(v: Date | DateRange | null): void {
    this.value.set(v);
    if (this.mode() === "single") this.open.set(false);
    else if (v && (v as DateRange).from && (v as DateRange).to) this.open.set(false);
  }

  protected apply(p: DateRangePreset): void {
    this.handleChange(p.range());
  }

  protected clear(e: Event): void {
    e.stopPropagation();
    this.handleChange(this.mode() === "single" ? null : { from: null, to: null });
  }

  protected presetClass(p: DateRangePreset): string {
    const r = this.value() as DateRange | null;
    const pr = p.range();
    const active = !!r && sameDay(r.from, pr.from) && sameDay(r.to, pr.to);
    return cn(
      "shrink-0 cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
    );
  }
}
