import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  signal,
} from "@angular/core";
import BigNumber from "bignumber.js";
import { cn } from "@bpdm/variants";
import { type FieldSize, WRAP_FIELD_BASE, WRAP_FIELD_SIZE } from "../internal/field";

const PARTIAL_NEG = /^-?\d*\.?\d*$/;
const PARTIAL_POS = /^\d*\.?\d*$/;

/**
 * `<bpdm-money-input>` — currency + locale-aware money input. The displayed
 * value is grouped per locale (e.g. en-IN → 1,00,000) with the currency symbol
 * and the currency's decimal count, while the stored value stays a precise
 * numeric string (bignumber.js — no float rounding). Editable as a plain number
 * on focus, formatted on blur.
 *
 * ```html
 * <bpdm-money-input currency="USD" locale="en-US" [(value)]="amount" />
 * <bpdm-money-input currency="INR" locale="en-IN" defaultValue="100000" />
 * <bpdm-money-input currency="JPY" locale="ja-JP" defaultValue="5000" />
 * ```
 */
@Component({
  selector: "bpdm-money-input",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-full" },
  template: `
    <div [class]="wrapClass()" [attr.aria-invalid]="ariaInvalid() ? 'true' : null">
      <span aria-hidden="true" class="shrink-0 select-none text-muted-foreground">{{ symbol() }}</span>
      <input
        [id]="id() || null"
        type="text"
        inputmode="decimal"
        [disabled]="disabled()"
        [value]="focused() ? current() : grouped()"
        [attr.name]="name() || null"
        [attr.placeholder]="placeholder() || null"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-describedby]="ariaDescribedby() || null"
        [attr.aria-invalid]="ariaInvalid() ? 'true' : null"
        (focus)="onFocus($any($event.target))"
        (blur)="onBlur()"
        (input)="onInput($any($event.target).value)"
        class="w-full min-w-0 bg-transparent text-right tabular-nums focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  `,
})
export class BpdmMoneyInput {
  /** ISO 4217 code, e.g. "USD", "EUR", "INR", "JPY". */
  readonly currency = input<string>("USD");
  /** BCP 47 locale for grouping/symbol, e.g. "en-US", "de-DE", "en-IN", "ja-JP". */
  readonly locale = input<string>("en-US");
  /** Controlled value as a precise numeric string — `[(value)]`. */
  readonly value = model<string | undefined>(undefined);
  /** Uncontrolled initial value. */
  readonly defaultValue = input<string>("");
  readonly placeholder = input<string>("");
  readonly allowNegative = input(false, { transform: booleanAttribute });
  readonly size = input<FieldSize>("md");
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  readonly id = input<string>("");
  /** Native `name` for form submission, forwarded to the inner `<input>`. */
  readonly name = input<string>("");
  /** Accessible name for the field, forwarded to the inner `<input>`. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** IDs of describing elements, forwarded to the inner `<input>`. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });

  protected readonly focused = signal(false);

  protected readonly current = computed(() => {
    const v = this.value();
    return v === undefined ? this.defaultValue() : v;
  });

  protected readonly fractionDigits = computed(() => {
    try {
      return (
        new Intl.NumberFormat(this.locale(), { style: "currency", currency: this.currency() })
          .resolvedOptions().maximumFractionDigits ?? 2
      );
    } catch {
      return 2;
    }
  });

  protected readonly symbol = computed(() => {
    try {
      const parts = new Intl.NumberFormat(this.locale(), {
        style: "currency",
        currency: this.currency(),
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value ?? this.currency();
    } catch {
      return this.currency();
    }
  });

  protected readonly grouped = computed(() => {
    const raw = this.current();
    if (raw === "" || raw === "-" || raw === ".") return "";
    const bn = new BigNumber(raw);
    if (bn.isNaN()) return "";
    return new Intl.NumberFormat(this.locale(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: this.fractionDigits(),
    }).format(Number(bn.toFixed(this.fractionDigits())));
  });

  protected readonly wrapClass = computed(() =>
    cn(
      WRAP_FIELD_BASE,
      WRAP_FIELD_SIZE[this.size()],
      this.disabled() && "cursor-not-allowed opacity-50",
      this.classInput(),
    ),
  );

  protected onFocus(el: HTMLInputElement): void {
    this.focused.set(true);
    el.select();
  }

  protected onBlur(): void {
    this.focused.set(false);
    const raw = this.current();
    if (raw !== "" && raw !== "-" && raw !== ".") {
      const bn = new BigNumber(raw);
      if (!bn.isNaN()) this.value.set(bn.toFixed(this.fractionDigits()));
    }
  }

  protected onInput(v: string): void {
    const pattern = this.allowNegative() ? PARTIAL_NEG : PARTIAL_POS;
    if (v === "" || pattern.test(v)) this.value.set(v);
  }
}
