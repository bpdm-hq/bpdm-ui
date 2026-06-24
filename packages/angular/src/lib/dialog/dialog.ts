import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  output,
  TemplateRef,
  untracked,
  ViewContainerRef,
  viewChild,
} from "@angular/core";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";

export type DialogSize = "sm" | "md" | "lg" | "xl";

let did = 0;

const SIZE: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/** Marker for the dialog body: `<ng-template bpdmDialogBody>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDialogBody]" })
export class BpdmDialogBody {}

/** Marker for the dialog footer: `<ng-template bpdmDialogFooter>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDialogFooter]" })
export class BpdmDialogFooter {}

/** Internal panel rendered into the CDK overlay. Not part of the public API. */
@Component({
  selector: "bpdm-dialog-panel",
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
          {{ title() || "Dialog" }}
        </h2>
        @if (description()) {
          <p [attr.id]="descId()" class="text-sm text-muted-foreground">{{ description() }}</p>
        }
      </div>
      @if (body()) {
        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <ng-container [ngTemplateOutlet]="body()!" />
        </div>
      }
      @if (footer()) {
        <div class="flex flex-col-reverse gap-2 p-6 pt-2 sm:flex-row sm:justify-end">
          <ng-container [ngTemplateOutlet]="footer()!" />
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
class BpdmDialogPanel {
  readonly title = input("");
  readonly description = input("");
  readonly size = input<DialogSize>("md");
  readonly showClose = input(true);
  readonly body = input<TemplateRef<unknown> | null>(null);
  readonly footer = input<TemplateRef<unknown> | null>(null);
  readonly labelId = input("");
  readonly descId = input("");
  readonly closing = input(false);
  readonly dismiss = output<void>();

  private readonly root = viewChild<ElementRef<HTMLElement>>("root");

  constructor() {
    // focus the panel itself (not the first field) — like Radix — so a prefilled
    // input isn't auto-focused with the caret jammed at the start
    afterNextRender(() => this.root()?.nativeElement.focus());
  }

  protected readonly boxClass = computed(() =>
    cn(
      "relative z-50 flex max-h-[85dvh] w-[calc(100vw-2rem)] flex-col rounded-xl bg-popover text-popover-foreground shadow-xl outline-none",
      SIZE[this.size()],
      this.closing()
        ? // `forwards` holds the faded-out frame until teardown (no snap-back flicker)
          "animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in_forwards]"
        : "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]",
    ),
  );
}

/**
 * `<bpdm-dialog>` — a modal dialog on the Angular CDK overlay: focus trap, scroll
 * lock, Escape + backdrop-click to close, and full ARIA, all handled. Mirrors the
 * React `Dialog`: set `title`/`description`/`size`, project a `[bpdmDialogTrigger]`
 * button and `ng-template[bpdmDialogBody]` / `ng-template[bpdmDialogFooter]`, or
 * drive it yourself with `[(open)]`. Use `bpdmDialogClose` to dismiss from inside.
 *
 * ```html
 * <bpdm-dialog title="Edit project" description="Update the details.">
 *   <button bpdmButton bpdmDialogTrigger>Edit project</button>
 *   <ng-template bpdmDialogBody>…</ng-template>
 *   <ng-template bpdmDialogFooter>
 *     <button bpdmButton variant="ghost" bpdmDialogClose>Cancel</button>
 *     <button bpdmButton bpdmDialogClose>Save</button>
 *   </ng-template>
 * </bpdm-dialog>
 * ```
 */
@Component({
  selector: "bpdm-dialog",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  template: `<ng-content select="[bpdmDialogTrigger]" />`,
})
export class BpdmDialog implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  /** Open state — two-way bindable via `[(open)]`. */
  readonly open = model(false);
  readonly title = input("");
  readonly description = input("");
  readonly size = input<DialogSize>("md");
  /** Show the top-right close button. Default true. */
  readonly showClose = input(true, { transform: booleanAttribute });

  private readonly body = contentChild(BpdmDialogBody, { read: TemplateRef });
  private readonly footer = contentChild(BpdmDialogFooter, { read: TemplateRef });

  protected readonly labelId = `bpdm-dialog-title-${++did}`;
  protected readonly descId = `bpdm-dialog-desc-${did}`;

  private overlayRef?: OverlayRef;
  private panelRef?: ComponentRef<BpdmDialogPanel>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    // `open` is the single source of truth; only track it
    effect(() => {
      const want = this.open();
      untracked(() => (want ? this.attach() : this.beginClose()));
    });
  }

  openDialog(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  private attach(): void {
    clearTimeout(this.closeTimer);
    if (this.overlayRef) {
      this.panelRef?.setInput("closing", false);
      if (this.overlayRef.backdropElement) this.overlayRef.backdropElement.style.opacity = "";
      return;
    }

    // remember where focus was (usually the trigger) to restore it on close
    this.previouslyFocused = document.activeElement as HTMLElement | null;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: ["cdk-overlay-backdrop", "bpdm-dialog-backdrop"],
    });

    const ref = this.overlayRef.attach(new ComponentPortal(BpdmDialogPanel, this.vcr));
    this.panelRef = ref;
    ref.setInput("title", this.title());
    ref.setInput("description", this.description());
    ref.setInput("size", this.size());
    ref.setInput("showClose", this.showClose());
    ref.setInput("body", this.body() ?? null);
    ref.setInput("footer", this.footer() ?? null);
    ref.setInput("labelId", this.labelId);
    ref.setInput("descId", this.descId);

    ref.instance.dismiss.subscribe(() => this.close());
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  private beginClose(): void {
    if (!this.overlayRef) return;
    this.panelRef?.setInput("closing", true);
    // fade the backdrop out alongside the panel's pop-out
    if (this.overlayRef.backdropElement) this.overlayRef.backdropElement.style.opacity = "0";
    const ref = this.overlayRef;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      ref.dispose();
      if (this.overlayRef === ref) {
        this.overlayRef = undefined;
        this.panelRef = undefined;
      }
      this.previouslyFocused?.focus();
      this.previouslyFocused = null;
    }, 200);
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.overlayRef?.dispose();
  }
}

/** Opens the nearest `<bpdm-dialog>` — put it on any trigger button. */
@Directive({
  selector: "[bpdmDialogTrigger]",
  host: { "(click)": "dialog.openDialog()" },
})
export class BpdmDialogTrigger {
  protected readonly dialog = inject(BpdmDialog);
}

/** Dismisses the dialog from inside its body/footer — put it on any button. */
@Directive({
  selector: "[bpdmDialogClose]",
  host: { "(click)": "dialog.close()" },
})
export class BpdmDialogClose {
  protected readonly dialog = inject(BpdmDialog);
}
