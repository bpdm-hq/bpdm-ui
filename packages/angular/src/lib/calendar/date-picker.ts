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
import {
  BpdmCalendar,
  type CalendarCaptionLayout,
  type CalendarDayShape,
  type CalendarMessages,
  type CalendarMode,
} from "./calendar";
import {
  type DatePredicate,
  type DateRange,
  type DateRangePreset,
  fmtValue,
  sameDay,
} from "./date-utils";

/**
 * `<bpdm-date-picker>` — date (or range) picker: a trigger showing the formatted
 * value that opens a `<bpdm-calendar>` in a popover. Without `confirm`, single mode
 * closes on pick and range closes once both ends are chosen. With `confirm`, the
 * selection is buffered and only committed on Apply (Cancel / Escape / outside-click
 * discard it). Controlled or uncontrolled, clearable, `min`/`max` + per-day
 * `disabled` and range presets.
 *
 * ```html
 * <bpdm-date-picker [(value)]="date" />
 * <bpdm-date-picker mode="range" [(value)]="range" [presets]="presets" confirm />
 * ```
 */
@Component({
  selector: "bpdm-date-picker",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [BpdmPopover, BpdmCalendar],
  template: `
    <div data-bpdm="" data-bpdm-slot="date-picker" class="relative w-full">
      <button
        type="button"
        data-bpdm-slot="date-picker-trigger"
        [bpdmPopover]="panel"
        [bpdmPopoverOpen]="open()"
        (bpdmPopoverOpenChange)="onOpenChange($event)"
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
      </button>
      @if (showClear()) {
        <button
          type="button"
          data-bpdm-slot="date-picker-clear"
          [attr.aria-label]="messages().clear || 'Clear'"
          (click)="clear($event)"
          class="absolute end-2 top-1/2 z-10 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg viewBox="0 0 24 24" fill="none" class="size-3.5" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      }
    </div>

    <ng-template #panel>
      <div class="flex flex-col">
        @if (mode() === "range" && presets() && presets()!.length > 0) {
          <div class="flex w-fit flex-col sm:w-auto sm:flex-row">
            <div class="flex w-0 min-w-full shrink-0 flex-wrap gap-1 border-b border-border p-2 sm:w-auto sm:min-w-0 sm:max-w-[9rem] sm:flex-col sm:flex-nowrap sm:gap-0.5 sm:border-b-0 sm:border-e">
              @for (p of presets(); track p.label) {
                <button
                  type="button"
                  data-bpdm-slot="date-picker-preset"
                  (click)="pick(p.range())"
                  [class]="presetClass(p)"
                >
                  {{ p.label }}
                </button>
              }
            </div>
            <bpdm-calendar
              [mode]="mode()"
              [value]="calValue()"
              (valueChange)="pick($event)"
              [numberOfMonths]="monthsToShow()"
              [min]="min()"
              [max]="max()"
              [disabled]="disabled()"
              [weekStartsOn]="weekStartsOn()"
              [dayShape]="dayShape()"
              [captionLayout]="captionLayout()"
              [fromYear]="fromYear()"
              [toYear]="toYear()"
              [locale]="locale()"
              [messages]="messages()"
            />
          </div>
        } @else {
          <bpdm-calendar
            [mode]="mode()"
            [value]="calValue()"
            (valueChange)="pick($event)"
            [numberOfMonths]="monthsToShow()"
            [min]="min()"
            [max]="max()"
            [disabled]="disabled()"
            [weekStartsOn]="weekStartsOn()"
            [dayShape]="dayShape()"
            [captionLayout]="captionLayout()"
            [fromYear]="fromYear()"
            [toYear]="toYear()"
            [locale]="locale()"
            [messages]="messages()"
          />
        }
        @if (confirm()) {
          <div class="flex items-center justify-end gap-2 border-t border-border p-2">
            <button
              type="button"
              (click)="cancel()"
              class="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ messages().cancel || "Cancel" }}
            </button>
            <button
              type="button"
              (click)="apply()"
              [disabled]="!draftComplete()"
              class="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ messages().apply || "Apply" }}
            </button>
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class BpdmDatePicker {
  readonly mode = input<CalendarMode>("single");
  /** Controlled / uncontrolled value — `[(value)]`. */
  readonly value = model<Date | DateRange | null>(null);
  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly disabled = input<DatePredicate | undefined>(undefined);
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
  /**
   * Buffer the selection and only commit on Apply. Adds a Cancel/Apply footer;
   * Cancel, Escape and outside-click discard the draft. Default false.
   */
  readonly confirm = input(false, { transform: booleanAttribute });
  /** aria-invalid styling on the trigger. */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly id = input<string>("");
  readonly classInput = input<string>("", { alias: "class" });
  /** Classes on the popover panel. */
  readonly contentClassName = input<string>("");
  /** BCP 47 locale for date formatting + the calendar's month/weekday names. */
  readonly locale = input<string | undefined>(undefined);
  /** Override control labels (screen-reader text) for i18n; forwarded to the calendar. */
  readonly messages = input<CalendarMessages>({});

  protected readonly cn = cn;
  protected readonly open = signal(false);
  // in confirm mode the popover edits a draft; nothing commits until Apply
  private readonly draft = signal<Date | DateRange | null>(null);

  // range pickers show two months by default; single shows one
  protected readonly monthsToShow = computed(
    () => this.numberOfMonths() ?? (this.mode() === "range" ? 2 : 1),
  );

  protected readonly calValue = computed(() =>
    this.confirm() ? this.draft() : this.value(),
  );
  protected readonly draftComplete = computed(() => {
    const d = this.draft();
    return this.mode() === "single"
      ? !!d
      : !!((d as DateRange | null)?.from && (d as DateRange | null)?.to);
  });

  protected readonly text = computed(() => fmtValue(this.mode(), this.value(), this.locale()));
  protected readonly hasValue = computed(() =>
    this.mode() === "single"
      ? !!this.value()
      : !!(this.value() as DateRange | null)?.from,
  );
  protected readonly showClear = computed(
    () => this.clearable() && this.hasValue() && !this.disabledInput(),
  );

  protected readonly triggerClass = computed(() =>
    cn(
      "group inline-flex h-10 w-full min-w-[14rem] cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-input bg-background ps-3 text-start text-sm transition-colors hover:border-ring/60 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive",
      this.showClear() ? "pe-9" : "pe-3",
      this.classInput(),
    ),
  );

  protected onOpenChange(o: boolean): void {
    if (o && this.confirm()) this.draft.set(this.value()); // seed draft from committed value
    this.open.set(o);
  }

  // commit + auto-close (non-confirm), else buffer into the draft
  private handleChange(v: Date | DateRange | null): void {
    this.value.set(v);
    if (this.mode() === "single") this.open.set(false);
    else if (v && (v as DateRange).from && (v as DateRange).to) this.open.set(false);
  }

  protected pick(v: Date | DateRange | null): void {
    if (this.confirm()) this.draft.set(v);
    else this.handleChange(v);
  }

  protected cancel(): void {
    this.open.set(false); // draft discarded (re-seeded on next open)
  }

  protected apply(): void {
    this.value.set(this.draft());
    this.open.set(false);
  }

  protected clear(e: Event): void {
    e.stopPropagation();
    this.handleChange(this.mode() === "single" ? null : { from: null, to: null });
  }

  protected presetClass(p: DateRangePreset): string {
    const r = this.calValue() as DateRange | null;
    const pr = p.range();
    const active = !!r && sameDay(r.from, pr.from) && sameDay(r.to, pr.to);
    return cn(
      "shrink-0 cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-start text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
    );
  }
}
