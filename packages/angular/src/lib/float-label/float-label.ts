import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from "@angular/core";
import { cn, floatFloated, floatResting, type FloatLabelVariant } from "@bpdm/variants";

/**
 * `<bpdm-float-label>` — wraps a single input/textarea; the label rests as a
 * placeholder and floats up on focus or when filled (`over` / `in` / `on`).
 * Pure CSS via the Tailwind `peer` + `:placeholder-shown` trick — the wrapped
 * control automatically gets `peer` and a blank placeholder. Same look as React.
 *
 * ```html
 * <bpdm-float-label label="Email">
 *   <input bpdmInput id="email" [(ngModel)]="email" />
 * </bpdm-float-label>
 * ```
 */
@Component({
  selector: "bpdm-float-label",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "relative block" },
  template: `
    <ng-content />
    <label [attr.for]="htmlFor()" [class]="labelClass()">{{ label() }}</label>
  `,
})
export class BpdmFloatLabel {
  readonly label = input.required<string>();
  /** id of the wrapped control; the label's `for` points here. */
  readonly htmlFor = input<string>();
  /** `over` floats above · `in` top-inside · `on` a notch on the border. */
  readonly variant = input<FloatLabelVariant>("over");

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly labelClass = computed(() =>
    cn(floatResting, floatFloated[this.variant()]),
  );

  constructor() {
    // mirror React's clone: give the wrapped control `peer` + a blank placeholder
    // (so :placeholder-shown drives the float) without the consumer wiring it up
    afterNextRender(() => {
      const control = this.el.nativeElement.querySelector<HTMLInputElement>(
        "input, textarea, select",
      );
      if (!control) return;
      control.classList.add("peer");
      if (this.variant() === "in") control.classList.add("pt-4");
      if (!control.getAttribute("placeholder")) control.setAttribute("placeholder", " ");
    });
  }
}
