import { Directive, computed, input } from "@angular/core";
import { buttonVariants, cn, type ButtonVariants } from "@bpdm/variants";

/**
 * `bpdmButton` — turns a native `<button>` or `<a>` into a bpdm button.
 *
 * Applied as an attribute so the host stays a real, accessible element
 * (native `type`, `disabled`, focus and keyboard behaviour are preserved):
 *
 * ```html
 * <button bpdmButton variant="primary" (click)="save()">Save changes</button>
 * <a bpdmButton variant="secondary" appearance="ghost" href="/docs">Read the docs</a>
 * ```
 *
 * The variant classes come from the shared `@bpdm/variants` package — the same
 * source that powers the React `@bpdm/ui` button — so both render identically,
 * including the design system's motion touch (overshoot ease + press scale).
 * Extra classes passed via `class` are merged with tailwind-merge, so your
 * overrides win without specificity fights.
 */
@Directive({
  selector: "button[bpdmButton], a[bpdmButton]",
  host: {
    "[class]": "classes()",
  },
})
export class BpdmButton {
  /** Colour / severity. */
  readonly variant = input<NonNullable<ButtonVariants["variant"]>>("primary");
  /** Visual style — `solid` (filled), `outline` (border), or `ghost` (no border/fill). */
  readonly appearance = input<NonNullable<ButtonVariants["appearance"]>>("solid");
  /** Text sizes (`sm`/`md`/`lg`), square icon sizes (`iconSm`/`icon`/`iconLg`), or `none` to opt out. */
  readonly size = input<NonNullable<ButtonVariants["size"]>>("md");
  /** Corner shape — `default` (token radius) or `round` (pill / circle). */
  readonly shape = input<NonNullable<ButtonVariants["shape"]>>("default");
  /** Extra classes; merged with the variant classes via tailwind-merge. */
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({
        variant: this.variant(),
        appearance: this.appearance(),
        size: this.size(),
        shape: this.shape(),
      }),
      this.classInput(),
    ),
  );
}
