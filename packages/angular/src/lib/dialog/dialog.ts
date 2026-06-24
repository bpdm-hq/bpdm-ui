import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  contentChild,
  Directive,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import { BpdmOverlayPanel } from "../overlay/overlay-panel";

export type DialogSize = "sm" | "md" | "lg" | "xl";

let did = 0;

const SIZE: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const ENTER = "animate-[bpdm-pop-in_var(--bpdm-duration-base)_var(--bpdm-ease-overshoot)]";
// `forwards` holds the faded-out frame until teardown (no snap-back flicker)
const EXIT = "animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in_forwards]";

/** Marker for the dialog body: `<ng-template bpdmDialogBody>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDialogBody]" })
export class BpdmDialogBody {}

/** Marker for the dialog footer: `<ng-template bpdmDialogFooter>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDialogFooter]" })
export class BpdmDialogFooter {}

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
 *     <button bpdmButton variant="secondary" appearance="ghost" bpdmDialogClose>Cancel</button>
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
  private panelRef?: ComponentRef<BpdmOverlayPanel>;
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

    const ref = this.overlayRef.attach(new ComponentPortal(BpdmOverlayPanel, this.vcr));
    this.panelRef = ref;
    ref.setInput("title", this.title());
    ref.setInput("description", this.description());
    ref.setInput("showClose", this.showClose());
    ref.setInput("body", this.body() ?? null);
    ref.setInput("footer", this.footer() ?? null);
    ref.setInput("labelId", this.labelId);
    ref.setInput("descId", this.descId);
    ref.setInput("fallbackTitle", "Dialog");
    ref.setInput(
      "panelClass",
      cn(
        "relative z-50 flex max-h-[85dvh] w-[calc(100vw-2rem)] flex-col rounded-xl bg-popover text-popover-foreground shadow-xl outline-none",
        SIZE[this.size()],
      ),
    );
    ref.setInput("enterAnim", ENTER);
    ref.setInput("exitAnim", EXIT);

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
