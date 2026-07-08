import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { cn, radioItemVariants, type RadioVariants } from "@bpdm/variants";

// resolved text direction of an element — so horizontal arrow keys follow the
// visual order (in RTL, ArrowLeft moves to the next radio).
function isRtl(el: HTMLElement): boolean {
  if (el.closest('[dir="rtl"]')) return true;
  return typeof getComputedStyle === "function" && getComputedStyle(el).direction === "rtl";
}

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
  host: {
    role: "radiogroup",
    "[attr.data-orientation]": "orientation()",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[class]": "hostClass()",
    "(keydown)": "onKeydown($event)",
  },
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

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /** All radios in the group (through wrappers like `<label>`), in DOM order. */
  private readonly items = contentChildren(BpdmRadio, { descendants: true });

  protected readonly hostClass = computed(() =>
    this.orientation() === "horizontal" ? "flex flex-wrap gap-5" : "grid gap-3",
  );

  /** The single tab stop: the selected radio, else the first enabled one. */
  readonly rovingValue = computed<string | null>(() => {
    const v = this.value();
    if (v != null) return v;
    const first = this.items().find((it) => !it.isDisabled());
    return first ? first.value() : null;
  });

  /** Called by child radios. */
  select(value: string): void {
    if (this.disabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  /** WAI-ARIA radiogroup keys: arrows move + select (wrapping), RTL-aware. */
  protected onKeydown(e: KeyboardEvent): void {
    if (this.disabled()) return;
    const NAV = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!NAV.includes(e.key)) return;
    const enabled = this.items().filter((it) => !it.isDisabled());
    if (enabled.length === 0) return;
    e.preventDefault();
    const rtl = isRtl(this.el.nativeElement);
    const forward = e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const dir = forward ? 1 : -1;
    const cur = enabled.findIndex((it) => it.value() === this.value());
    const start = cur === -1 ? (forward ? -1 : 0) : cur;
    const next = enabled[(start + dir + enabled.length) % enabled.length];
    this.select(next.value());
    next.focus();
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
      [id]="id() || null"
      [class]="itemClass()"
      [attr.tabindex]="tabindex()"
      [attr.data-state]="checked() ? 'checked' : 'unchecked'"
      [attr.aria-checked]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-labelledby]="ariaLabelledby() || null"
      [attr.aria-describedby]="ariaDescribedby() || null"
      [attr.aria-invalid]="ariaInvalid() ? 'true' : null"
      [disabled]="isDisabled()"
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
  /** Disable just this option. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Invalid state — set `aria-invalid="true"`; styled red. */
  readonly ariaInvalid = input(false, { alias: "aria-invalid", transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });
  /** Control id (label association / testing), forwarded to the radio. */
  readonly id = input<string>("");
  /** Accessible name — pass a translated string for i18n. Forwarded to the radio. */
  readonly ariaLabel = input<string>("", { alias: "aria-label" });
  /** Id(s) of the element(s) labelling the radio. Forwarded to the radio. */
  readonly ariaLabelledby = input<string>("", { alias: "aria-labelledby" });
  /** Id(s) of describing elements (help / error text). Forwarded to the radio. */
  readonly ariaDescribedby = input<string>("", { alias: "aria-describedby" });

  protected readonly group = inject(BpdmRadioGroup);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly checked = computed(() => this.group.value() === this.value());
  /** Disabled by the group or by this option. */
  isDisabled(): boolean {
    return this.group.disabled() || this.disabled();
  }
  /** Roving tabindex — only the group's single tab stop is 0. */
  protected readonly tabindex = computed(() =>
    this.isDisabled() ? -1 : this.group.rovingValue() === this.value() ? 0 : -1,
  );
  protected readonly itemClass = computed(() =>
    cn(radioItemVariants({ size: this.size() }), this.classInput()),
  );

  /** Focus this radio's control (used by the group's arrow-key navigation). */
  focus(): void {
    this.el.nativeElement.querySelector("button")?.focus();
  }
}
