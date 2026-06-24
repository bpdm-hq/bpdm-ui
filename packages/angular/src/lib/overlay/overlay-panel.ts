import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { cn } from "@bpdm/variants";

/**
 * Shared modal surface for the CDK-overlay components (Dialog, Drawer). Renders a
 * focus-trapped panel with a header (title + description), a projected body and
 * footer template, and an optional close button. The host supplies `panelClass`
 * (position/size/chrome) and the `enterAnim` / `exitAnim` utilities, so the same
 * surface works centered (dialog) or edge-anchored (drawer). Internal — not public.
 */
@Component({
  selector: "bpdm-overlay-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CdkTrapFocus],
  host: { class: "contents" },
  template: `
    <div
      #root
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      [attr.aria-labelledby]="labelId()"
      [attr.aria-describedby]="description() ? descId() : null"
      [class]="boxClass()"
      [cdkTrapFocus]="true"
      (keydown.escape)="dismiss.emit()"
    >
      <div class="flex flex-col gap-1.5 p-6 pb-2">
        <h2
          [attr.id]="labelId()"
          [class]="title() ? 'text-lg font-semibold tracking-tight' : 'sr-only'"
        >
          {{ title() || fallbackTitle() }}
        </h2>
        @if (description()) {
          <p [attr.id]="descId()" class="text-sm text-muted-foreground">{{ description() }}</p>
        }
      </div>
      @if (body()) {
        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <ng-container [ngTemplateOutlet]="body()!" [ngTemplateOutletContext]="ctx()" />
        </div>
      }
      @if (footer()) {
        <div class="flex flex-col-reverse gap-2 p-6 pt-2 sm:flex-row sm:justify-end">
          <ng-container [ngTemplateOutlet]="footer()!" [ngTemplateOutletContext]="ctx()" />
        </div>
      }
      @if (showClose()) {
        <button
          type="button"
          aria-label="Close"
          (click)="dismiss.emit()"
          class="absolute right-3 top-3 grid size-7 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      }
    </div>
  `,
})
export class BpdmOverlayPanel {
  readonly title = input("");
  readonly description = input("");
  readonly showClose = input(true);
  readonly body = input<TemplateRef<unknown> | null>(null);
  readonly footer = input<TemplateRef<unknown> | null>(null);
  /** Context passed to the body/footer template outlets (e.g. `{ close }`). */
  readonly ctx = input<unknown>(undefined);
  readonly labelId = input("");
  readonly descId = input("");
  readonly closing = input(false);
  /** Static panel chrome: position, size, background, rounding, border. */
  readonly panelClass = input("");
  /** Enter animation utility (played while open). */
  readonly enterAnim = input("");
  /** Exit animation utility (played while closing; should end with `forwards`). */
  readonly exitAnim = input("");
  /** Title used only for the screen-reader label when no visible title is set. */
  readonly fallbackTitle = input("Dialog");
  readonly dismiss = output<void>();

  private readonly root = viewChild<ElementRef<HTMLElement>>("root");

  constructor() {
    // focus the panel itself (not the first field) — like Radix — so a prefilled
    // input isn't auto-focused with the caret jammed at the start
    afterNextRender(() => this.root()?.nativeElement.focus());
  }

  protected readonly boxClass = computed(() =>
    cn(this.panelClass(), this.closing() ? this.exitAnim() : this.enterAnim()),
  );
}
