import {
  afterNextRender,
  booleanAttribute,
  Directive,
  ElementRef,
  computed,
  inject,
  input,
} from "@angular/core";
import { cn, textareaVariants, type TextareaVariants } from "@bpdm/variants";

/**
 * `bpdmTextarea` — styles a native `<textarea>` (three sizes, `resize` control).
 * Applied as an attribute so `ngModel` / reactive forms work natively. Set
 * `autoResize` to grow the field to fit its content. Invalid styling is driven by
 * `aria-invalid="true"`.
 *
 * ```html
 * <textarea bpdmTextarea size="lg" autoResize [(ngModel)]="bio"></textarea>
 * ```
 */
@Directive({
  selector: "textarea[bpdmTextarea]",
  host: {
    "[class]": "classes()",
    "(input)": "adjust()",
  },
})
export class BpdmTextarea {
  readonly size = input<NonNullable<TextareaVariants["size"]>>("md");
  readonly resize = input<NonNullable<TextareaVariants["resize"]>>("vertical");
  /** Grow to fit content (disables manual resize). */
  readonly autoResize = input(false, { transform: booleanAttribute });
  readonly classInput = input<string>("", { alias: "class" });

  private readonly el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  protected readonly classes = computed(() =>
    cn(
      textareaVariants({
        size: this.size(),
        resize: this.autoResize() ? "none" : this.resize(),
      }),
      this.classInput(),
    ),
  );

  constructor() {
    // size to existing content once the textarea is in the DOM
    afterNextRender(() => this.adjust());
  }

  protected adjust(): void {
    if (!this.autoResize()) return;
    const el = this.el.nativeElement;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }
}
