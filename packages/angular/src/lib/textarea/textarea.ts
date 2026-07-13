import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  Renderer2,
  computed,
  inject,
  input,
} from "@angular/core";
import { cn, textareaVariants, type TextareaVariants } from "@bpdm/variants";

/** Per-instance counter for a stable character-counter id (aria-describedby). */
let counterUid = 0;

/**
 * `bpdmTextarea` — styles a native `<textarea>` (three sizes, `resize` control).
 * Applied as an attribute so `ngModel` / reactive forms work natively. Set
 * `autoResize` to grow the field to fit its content. Set `showCount` to render a
 * character counter (pairs with `maxlength`) that's linked to the field via
 * `aria-describedby`. Invalid styling is driven by `aria-invalid="true"`.
 *
 * ```html
 * <textarea bpdmTextarea size="lg" autoResize [(ngModel)]="bio"></textarea>
 * <textarea bpdmTextarea showCount maxlength="120" [(ngModel)]="note"></textarea>
 * ```
 */
@Directive({
  selector: "textarea[bpdmTextarea]",
  host: {
    "[class]": "classes()",
    "[attr.aria-describedby]": "describedBy()",
    "(input)": "onInput()",
  },
})
export class BpdmTextarea {
  readonly size = input<NonNullable<TextareaVariants["size"]>>("md");
  readonly resize = input<NonNullable<TextareaVariants["resize"]>>("vertical");
  /** Grow to fit content (disables manual resize). */
  readonly autoResize = input(false, { transform: booleanAttribute });
  /** Show a character counter (pairs with `maxlength`). Mirrors React `showCount`. */
  readonly showCount = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });

  private readonly el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /** Stable id linking the counter to the field via aria-describedby. */
  protected readonly countId = `bpdm-textarea-count-${(counterUid += 1)}`;
  private counterEl: HTMLElement | null = null;
  /** Any consumer-supplied `aria-describedby`, preserved and merged with the counter id. */
  private readonly initialDescribedBy = this.el.nativeElement.getAttribute("aria-describedby");

  protected readonly classes = computed(() =>
    cn(
      textareaVariants({
        size: this.size(),
        resize: this.autoResize() ? "none" : this.resize(),
      }),
      this.classInput(),
    ),
  );

  protected readonly describedBy = computed(() => {
    const parts = [this.initialDescribedBy, this.showCount() ? this.countId : null].filter(Boolean);
    return parts.length ? parts.join(" ") : null;
  });

  constructor() {
    // size to existing content + render the counter once the textarea is in the DOM
    afterNextRender(() => {
      this.adjust();
      if (this.showCount()) this.buildCounter();
    });
  }

  protected onInput(): void {
    this.adjust();
    this.updateCounter();
  }

  protected adjust(): void {
    if (!this.autoResize()) return;
    const el = this.el.nativeElement;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  private buildCounter(): void {
    const el = this.el.nativeElement;
    const counter = this.renderer.createElement("div") as HTMLElement;
    this.renderer.setAttribute(counter, "id", this.countId);
    for (const c of "mt-1 text-end text-xs tabular-nums text-muted-foreground".split(" ")) {
      this.renderer.addClass(counter, c);
    }
    // insert directly after the textarea so it reads as the field's description
    this.renderer.insertBefore(el.parentNode, counter, el.nextSibling);
    this.counterEl = counter;
    this.updateCounter();
  }

  private updateCounter(): void {
    if (!this.counterEl) return;
    const el = this.el.nativeElement;
    const max = el.maxLength;
    const text = max >= 0 ? `${el.value.length} / ${max}` : `${el.value.length}`;
    this.renderer.setProperty(this.counterEl, "textContent", text);
  }
}
