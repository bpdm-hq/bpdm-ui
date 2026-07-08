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
import { cn, switchVariants, thumbVariants, type SwitchVariants } from "@bpdm/variants";

/**
 * `<bpdm-switch>` — a toggle (three sizes, three shapes, optional ✓/✗ glyph).
 * Works with `[(ngModel)]` / reactive forms (ControlValueAccessor) or `[(checked)]`.
 * Same look and motion as the React switch.
 *
 * ```html
 * <bpdm-switch [(ngModel)]="notifications" />
 * <bpdm-switch [(checked)]="dark" size="lg" icon />
 * ```
 */
@Component({
  selector: "bpdm-switch",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "inline-flex" },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BpdmSwitch), multi: true },
  ],
  template: `
    <button
      type="button"
      role="switch"
      [id]="id() || null"
      [class]="trackClass()"
      [attr.data-state]="state()"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [disabled]="disabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      <span [class]="thumbClass()" [attr.data-state]="state()">
        @if (icon()) {
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="hidden size-[62%] text-primary group-data-[state=checked]:block">
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="hidden size-[62%] text-muted-foreground group-data-[state=unchecked]:block">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
        }
      </span>
    </button>
  `,
})
export class BpdmSwitch implements ControlValueAccessor {
  readonly size = input<NonNullable<SwitchVariants["size"]>>("md");
  readonly shape = input<NonNullable<SwitchVariants["shape"]>>("pill");
  /** Show a ✓ / ✗ glyph inside the thumb. */
  readonly icon = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  /** Control id (label association / testing), forwarded to the switch. */
  readonly id = input<string>("");
  /** Accessible name — pass a translated string for i18n. Forwarded to the switch. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** Id(s) of the element(s) labelling the switch. Forwarded to the switch. */
  readonly ariaLabelledby = input<string>("", { alias: "aria-labelledby" });
  /** Id(s) of describing elements (help text). Forwarded to the switch. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });
  /** Standalone two-way binding; also driven by ngModel / formControl. */
  readonly checked = model(false);

  protected readonly disabled = signal(false);
  protected onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly state = computed(() => (this.checked() ? "checked" : "unchecked"));
  protected readonly trackClass = computed(() =>
    cn(switchVariants({ size: this.size(), shape: this.shape() }), this.classInput()),
  );
  protected readonly thumbClass = computed(() =>
    thumbVariants({ size: this.size(), shape: this.shape() }),
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
