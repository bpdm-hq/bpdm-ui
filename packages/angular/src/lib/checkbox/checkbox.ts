import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { checkboxVariants, cn, type CheckboxVariants } from "@bpdm/variants";

/**
 * `<bpdm-checkbox>` — an accessible checkbox (three sizes, indeterminate state).
 * Works with `[(ngModel)]` / reactive forms (ControlValueAccessor) or the
 * standalone `[(checked)]` two-way binding. Same look as the React checkbox.
 *
 * ```html
 * <bpdm-checkbox [(ngModel)]="agreed" /> I agree
 * <bpdm-checkbox [(checked)]="selected" size="lg" />
 * ```
 */
@Component({
  selector: "bpdm-checkbox",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BpdmCheckbox), multi: true },
  ],
  template: `
    <button
      type="button"
      role="checkbox"
      data-bpdm=""
      data-bpdm-slot="checkbox"
      [id]="id() || null"
      [class]="boxClass()"
      [attr.data-state]="state()"
      [attr.aria-checked]="indeterminate() ? 'mixed' : checked()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="ariaInvalid() ? 'true' : null"
      [disabled]="disabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      @if (checked() || indeterminate()) {
        <span
          data-bpdm-slot="checkbox-indicator"
          class="flex size-full items-center justify-center text-current animate-[bpdm-indicator-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]"
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="size-full p-[14%]">
            @if (indeterminate()) {
              <path d="M4 8h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            } @else {
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            }
          </svg>
        </span>
      }
    </button>
  `,
})
export class BpdmCheckbox implements ControlValueAccessor {
  readonly size = input<NonNullable<CheckboxVariants["size"]>>("md");
  readonly indeterminate = input(false, { transform: booleanAttribute });
  /** Invalid state — set `aria-invalid="true"`; styled red. */
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  /** Control id (for label association / testing), forwarded to the checkbox. */
  readonly id = input<string>("");
  /** Accessible name — pass a translated string for i18n. Forwarded to the checkbox. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** Id(s) of the element(s) labelling the checkbox. Forwarded to the checkbox. */
  readonly ariaLabelledby = input<string>("", { alias: "aria-labelledby" });
  /** Id(s) of describing elements (help / error text). Forwarded to the checkbox. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });
  /** Standalone two-way binding; also driven by ngModel / formControl. */
  readonly checked = model(false);

  protected readonly disabled = signal(false);
  protected onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly state = computed(() =>
    this.indeterminate() ? "indeterminate" : this.checked() ? "checked" : "unchecked",
  );
  protected readonly boxClass = computed(() =>
    cn(checkboxVariants({ size: this.size() }), this.classInput()),
  );

  protected toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  // ControlValueAccessor
  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
