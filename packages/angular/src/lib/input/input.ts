import { Directive, computed, input } from "@angular/core";
import { cn, inputVariants, type InputVariants } from "@bpdm/variants";

/**
 * `bpdmInput` — styles a native `<input>` (boxed `outline` or `underline`, three
 * sizes). Applied as an attribute so the element stays a real input: `ngModel`,
 * reactive forms, validation and a11y all work natively, no wrapper needed.
 *
 * ```html
 * <input bpdmInput placeholder="you@company.com" [(ngModel)]="email" />
 * <input bpdmInput variant="underline" size="lg" />
 * ```
 *
 * Error styling is driven by `aria-invalid="true"` (set it for invalid fields).
 */
@Directive({
  selector: "input[bpdmInput]",
  host: { "data-bpdm": "", "data-bpdm-slot": "input", "[class]": "classes()" },
})
export class BpdmInput {
  readonly variant = input<NonNullable<InputVariants["variant"]>>("outline");
  readonly size = input<NonNullable<InputVariants["size"]>>("md");
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly classes = computed(() =>
    cn(inputVariants({ variant: this.variant(), size: this.size() }), this.classInput()),
  );
}
