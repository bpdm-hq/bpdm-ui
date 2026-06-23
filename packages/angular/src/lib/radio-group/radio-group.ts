import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { cn, radioItemVariants, type RadioVariants } from "@bpdm/variants";

/**
 * `<bpdm-radio-group>` — a single-select group of `<bpdm-radio>` items. Works with
 * `[(ngModel)]` / reactive forms (ControlValueAccessor) or `[(value)]`. Vertical
 * by default; set `orientation="horizontal"`. Same look as the React radio group.
 *
 * ```html
 * <bpdm-radio-group [(ngModel)]="plan">
 *   <label><bpdm-radio value="free" /> Free</label>
 *   <label><bpdm-radio value="pro" /> Pro</label>
 * </bpdm-radio-group>
 * ```
 */
@Component({
  selector: "bpdm-radio-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: "radiogroup", "[attr.data-orientation]": "orientation()", "[class]": "hostClass()" },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BpdmRadioGroup), multi: true },
  ],
  template: `<ng-content />`,
})
export class BpdmRadioGroup implements ControlValueAccessor {
  readonly orientation = input<"vertical" | "horizontal">("vertical");
  /** Standalone two-way binding; also driven by ngModel / formControl. */
  readonly value = model<string | null>(null);
  /** Disable the whole group (also driven by a disabled form control). */
  readonly disabledInput = input(false, { alias: "disabled", transform: booleanAttribute });

  private readonly cvaDisabled = signal(false);
  readonly disabled = computed(() => this.disabledInput() || this.cvaDisabled());
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClass = computed(() =>
    this.orientation() === "horizontal" ? "flex flex-wrap gap-5" : "grid gap-3",
  );

  /** Called by child radios. */
  select(value: string): void {
    if (this.disabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  // ControlValueAccessor
  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}

/** A single radio button inside a `<bpdm-radio-group>`. */
@Component({
  selector: "bpdm-radio",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  template: `
    <button
      type="button"
      role="radio"
      [class]="itemClass()"
      [attr.data-state]="checked() ? 'checked' : 'unchecked'"
      [attr.aria-checked]="checked()"
      [disabled]="group.disabled()"
      (click)="group.select(value())"
    >
      @if (checked()) {
        <span class="flex h-full w-full items-center justify-center">
          <span class="size-[45%] rounded-full bg-primary animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]"></span>
        </span>
      }
    </button>
  `,
})
export class BpdmRadio {
  readonly value = input.required<string>();
  readonly size = input<NonNullable<RadioVariants["size"]>>("md");
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly group = inject(BpdmRadioGroup);
  protected readonly checked = computed(() => this.group.value() === this.value());
  protected readonly itemClass = computed(() =>
    cn(radioItemVariants({ size: this.size() }), this.classInput()),
  );
}
