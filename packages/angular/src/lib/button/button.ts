import {
  afterNextRender,
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  computed,
} from "@angular/core";
import { buttonVariants, cn, type ButtonVariants } from "@bpdm/variants";

/**
 * `bpdmButton` — turns a native `<button>` or `<a>` into a bpdm button.
 *
 * Applied as an attribute so the host stays a real, accessible element
 * (native `disabled`, focus and keyboard behaviour are preserved). `type`
 * defaults to `"button"` so a bare button never submits a surrounding form.
 *
 * ```html
 * <button bpdmButton variant="primary" (click)="save()">Save changes</button>
 * <button bpdmButton [loading]="saving()">Save</button>
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
    "data-bpdm": "",
    "data-bpdm-slot": "button",
    "[class]": "classes()",
    "[attr.type]": "resolvedType()",
    "[attr.aria-busy]": "loading() || null",
    "[attr.aria-disabled]": "loading() || null",
    "(click)": "onClick($event)",
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
  /** Native button `type`. Defaults to `"button"` so it never submits a surrounding form. */
  readonly type = input<string | undefined>(undefined);
  /** Show a spinner, mark the host `aria-busy`, and block interaction. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Screen-reader text announced while `loading` (i18n). Default "Loading". */
  readonly loadingLabel = input("Loading");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly isAnchor = (this.host.nativeElement.tagName || "").toLowerCase() === "a";
  private spinner: HTMLElement | null = null;
  private srLabel: HTMLElement | null = null;

  // anchors have no meaningful `type`; a bare <button> defaults to "button"
  protected readonly resolvedType = computed(() =>
    this.isAnchor ? (this.type() ?? null) : (this.type() ?? "button"),
  );

  protected readonly classes = computed(() =>
    cn(
      buttonVariants({
        variant: this.variant(),
        appearance: this.appearance(),
        size: this.size(),
        shape: this.shape(),
      }),
      this.loading() && "pointer-events-none",
      this.classInput(),
    ),
  );

  constructor() {
    // The directive doesn't own the projected label, so it manages a leading
    // spinner node (with a translatable, screen-reader-only label) imperatively.
    effect(() => {
      const loading = this.loading();
      const label = this.loadingLabel();
      if (loading) {
        if (!this.spinner) {
          const el = this.renderer.createElement("span") as HTMLElement;
          this.renderer.setAttribute(el, "data-bpdm-spinner", "");
          this.renderer.setAttribute(el, "class", "inline-flex items-center");
          el.innerHTML =
            '<svg class="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
            '<path class="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>' +
            "</svg>";
          const sr = this.renderer.createElement("span") as HTMLElement;
          this.renderer.setAttribute(sr, "class", "sr-only");
          this.renderer.appendChild(el, sr);
          this.renderer.insertBefore(this.host.nativeElement, el, this.host.nativeElement.firstChild);
          this.spinner = el;
          this.srLabel = sr;
        }
        if (this.srLabel) this.srLabel.textContent = label;
      } else if (this.spinner) {
        this.renderer.removeChild(this.host.nativeElement, this.spinner);
        this.spinner = null;
        this.srLabel = null;
      }
    });

    // dev-only: catch icon-only buttons shipping without an accessible name (WCAG 4.1.2)
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const iconOnly = this.size().startsWith("icon");
      const named =
        el.getAttribute("aria-label") ||
        el.getAttribute("aria-labelledby") ||
        el.getAttribute("title") ||
        (el.textContent ?? "").trim();
      if (iconOnly && !named) {
        console.warn(
          "[bpdm/ng] bpdmButton: an icon-only size has no accessible name — add aria-label describing the action.",
        );
      }
    });
  }

  protected onClick(e: Event): void {
    if (this.loading()) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
}
