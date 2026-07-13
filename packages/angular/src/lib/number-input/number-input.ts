import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import BigNumber from "bignumber.js";
import { cn } from "@bpdm/variants";

export type NumberInputSize = "sm" | "md" | "lg";
export type NumberInputButtonLayout = "stacked" | "horizontal";
type Numeric = string | number;

const dims: Record<NumberInputSize, { h: string; btn: string; text: string }> = {
  sm: { h: "h-8", btn: "w-8", text: "text-sm" },
  md: { h: "h-10", btn: "w-10", text: "text-sm" },
  lg: { h: "h-12", btn: "w-12", text: "text-base" },
};

const GLYPH = {
  minus: "M3 7h8",
  plus: "M7 3v8M3 7h8",
  up: "M3.5 8.5 7 5l3.5 3.5",
  down: "M3.5 5.5 7 9l3.5-3.5",
} as const;

// allow empty / partial entries ("", "-", "1.", "1.0") while typing
const PARTIAL = /^-?\d*\.?\d*$/;

/**
 * `<bpdm-number-input>` — number field with stepper buttons. **Precision-safe**:
 * the value is a string and all arithmetic uses bignumber.js, so very large
 * quantities and high-decimal measurements never lose precision (unlike JS
 * `number`). Two button layouts — `stacked` (chevrons) and `horizontal` (−/+).
 * Controlled (`[(value)]`) or uncontrolled (`defaultValue`); clamps to `min`/`max`.
 *
 * ```html
 * <bpdm-number-input defaultValue="20" prefix="$" />
 * <bpdm-number-input buttonLayout="horizontal" defaultValue="25" step="5" prefix="€" />
 * <bpdm-number-input min="0" max="10" defaultValue="5" />
 * <bpdm-number-input [(value)]="amount" step="0.0001" suffix="kg" />
 * ```
 */
@Component({
  selector: "bpdm-number-input",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  template: `
    <div [class]="rootClass()" role="group">
      @if (buttonLayout() === "horizontal") {
        <button
          type="button"
          [attr.aria-label]="t().decrease"
          [disabled]="disabled() || atMin()"
          (click)="step1(-1)"
          [class]="btnClass('dec', dims().btn + ' border-r border-input')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path [attr.d]="glyph.minus" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      }

      <div [class]="fieldClass()">
        @if (prefix()) {
          <span class="shrink-0 text-muted-foreground">{{ prefix() }}</span>
        }
        <input
          type="text"
          inputmode="decimal"
          [value]="current()"
          [disabled]="disabled()"
          (input)="onInput($any($event.target).value)"
          (blur)="commit(current())"
          [class]="inputClass()"
        />
        @if (suffix()) {
          <span class="shrink-0 text-muted-foreground">{{ suffix() }}</span>
        }
      </div>

      @if (buttonLayout() === "horizontal") {
        <button
          type="button"
          [attr.aria-label]="t().increase"
          [disabled]="disabled() || atMax()"
          (click)="step1(1)"
          [class]="btnClass('inc', dims().btn + ' border-l border-input')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path [attr.d]="glyph.plus" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      } @else {
        <div class="flex w-7 flex-col border-l border-input">
          <button
            type="button"
            [attr.aria-label]="t().increase"
            [disabled]="disabled() || atMax()"
            (click)="step1(1)"
            [class]="btnClass('inc', 'flex-1')"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path [attr.d]="glyph.up" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            [attr.aria-label]="t().decrease"
            [disabled]="disabled() || atMin()"
            (click)="step1(-1)"
            [class]="btnClass('dec', 'flex-1 border-t border-input')"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path [attr.d]="glyph.down" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class BpdmNumberInput {
  /** Controlled value as a string (numbers also accepted) — `[(value)]`. */
  readonly value = model<Numeric | undefined>(undefined);
  /** Uncontrolled initial value. */
  readonly defaultValue = input<Numeric>("0");
  readonly min = input<Numeric | undefined>(undefined);
  readonly max = input<Numeric | undefined>(undefined);
  readonly step = input<Numeric>(1);
  readonly size = input<NumberInputSize>("md");
  /** "stacked" = up/down chevrons on the right; "horizontal" = −/+ on each side. */
  readonly buttonLayout = input<NumberInputButtonLayout>("stacked");
  /** Static text shown before the value, e.g. "$". */
  readonly prefix = input<string>("");
  /** Static text shown after the value, e.g. "kg". */
  readonly suffix = input<string>("");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  /** Override the stepper button labels (screen-reader text) for i18n. */
  readonly messages = input<{ increase?: string; decrease?: string }>({});

  protected readonly t = computed(() => ({
    increase: "Increase",
    decrease: "Decrease",
    ...this.messages(),
  }));

  protected readonly glyph = GLYPH;
  protected readonly dims = computed(() => dims[this.size()]);

  // the value model is the source of truth once edited; before that we show
  // the uncontrolled `defaultValue` (so [(value)] and defaultValue both work).
  protected readonly current = computed(() => {
    const v = this.value();
    return v === undefined ? String(this.defaultValue()) : String(v);
  });

  private readonly base = computed(() => {
    const c = this.current();
    const bn = new BigNumber(c === "" || c === "-" ? "0" : c);
    return bn.isNaN() ? new BigNumber(0) : bn;
  });

  protected readonly atMin = computed(() => {
    const min = this.min();
    return min !== undefined && this.base().isLessThanOrEqualTo(min);
  });
  protected readonly atMax = computed(() => {
    const max = this.max();
    return max !== undefined && this.base().isGreaterThanOrEqualTo(max);
  });

  // a short (~160ms) press flash on the stepper so a quick click reads clearly
  private readonly pressed = signal<"inc" | "dec" | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected readonly rootClass = computed(() =>
    cn(
      "inline-flex items-stretch overflow-hidden rounded-[var(--radius)] border border-input bg-background shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
      this.dims().h,
      this.classInput(),
    ),
  );
  protected readonly fieldClass = computed(() =>
    cn(
      "flex min-w-0 flex-1 items-center gap-1 px-3",
      this.buttonLayout() === "horizontal" ? "justify-center" : "",
    ),
  );
  protected readonly inputClass = computed(() =>
    cn(
      "w-full min-w-0 border-0 bg-transparent text-foreground tabular-nums focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      this.buttonLayout() === "horizontal" ? "text-center" : "text-start",
      this.dims().text,
    ),
  );

  protected btnClass(which: "inc" | "dec", extra: string): string {
    return cn(
      "flex cursor-pointer select-none items-center justify-center text-foreground transition-transform duration-100 enabled:hover:bg-muted enabled:active:scale-90 disabled:cursor-not-allowed! disabled:opacity-40",
      this.pressed() === which && "scale-90",
      extra,
    );
  }

  protected onInput(raw: string): void {
    if (raw === "" || PARTIAL.test(raw)) this.value.set(raw);
  }

  protected commit(s: string): void {
    this.value.set(this.clamp(s));
  }

  protected step1(dir: 1 | -1): void {
    const next = this.base().plus(new BigNumber(this.step()).multipliedBy(dir));
    this.commit(next.toFixed());
    this.flash(dir === 1 ? "inc" : "dec");
  }

  private flash(which: "inc" | "dec"): void {
    this.pressed.set(which);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.pressed.set(null), 160);
  }

  // clamp + normalize a string value (no exponential notation for big numbers)
  private clamp(s: string): string {
    if (s === "" || s === "-" || s === ".") return "0";
    const bn = new BigNumber(s);
    if (bn.isNaN()) return "0";
    const min = this.min();
    const max = this.max();
    if (min !== undefined && bn.isLessThan(min)) return new BigNumber(min).toFixed();
    if (max !== undefined && bn.isGreaterThan(max)) return new BigNumber(max).toFixed();
    return bn.toFixed();
  }
}
