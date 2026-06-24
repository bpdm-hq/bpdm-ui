import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  InjectionToken,
  Injector,
  input,
  model,
  OnDestroy,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
} from "@angular/core";
import { CdkTrapFocus } from "@angular/cdk/a11y";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import {
  connectedPositions,
  OVERLAY_ARROW,
  OVERLAY_ORIGIN,
  type OverlayAlign,
  type OverlaySide,
  sideFromPair,
} from "../overlay/overlay";

export type PopoverSide = OverlaySide;
export type PopoverAlign = OverlayAlign;

let pid = 0;

/** Handle handed to the popover content so a close button can dismiss the panel. */
interface PopoverRef {
  close: () => void;
}
const BPDM_POPOVER_REF = new InjectionToken<PopoverRef>("BpdmPopoverRef");

/**
 * Dismiss the popover from inside its content — put it on any button.
 *
 * ```html
 * <button bpdmButton bpdmPopoverClose>Done</button>
 * ```
 */
@Directive({
  selector: "[bpdmPopoverClose]",
  host: { "(click)": "ref?.close()" },
})
export class BpdmPopoverClose {
  protected readonly ref = inject(BPDM_POPOVER_REF, { optional: true });
}

/** Internal styled panel rendered into the CDK overlay. Not part of the public API. */
@Component({
  selector: "bpdm-popover-panel",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, CdkTrapFocus],
  host: { class: "contents" },
  template: `
    <div
      #panel
      role="dialog"
      tabindex="-1"
      [attr.id]="id()"
      [class]="boxClass()"
      [style.width]="widthStyle()"
      [cdkTrapFocus]="modal()"
      [cdkTrapFocusAutoCapture]="modal()"
    >
      <ng-container
        [ngTemplateOutlet]="tpl()!"
        [ngTemplateOutletContext]="ctx()"
        [ngTemplateOutletInjector]="injector()"
      />
      @if (showArrow()) {
        <span [class]="arrowClass()" aria-hidden="true">
          <svg width="12" height="6" viewBox="0 0 12 6" class="block fill-popover">
            <path d="M0 0L6 6L12 0Z" />
          </svg>
        </span>
      }
    </div>
  `,
})
class BpdmPopoverPanel {
  readonly tpl = input<TemplateRef<unknown> | null>(null);
  readonly ctx = input<unknown>(undefined);
  readonly injector = input<Injector | null>(null);
  readonly side = input<PopoverSide>("bottom");
  readonly showArrow = input(false);
  readonly modal = input(false);
  readonly closing = input(false);
  readonly width = input<number | string | undefined>(undefined);
  readonly id = input("");
  readonly panelClassInput = input("");

  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");

  protected readonly arrowClass = computed(() => OVERLAY_ARROW[this.side()]);

  protected readonly widthStyle = computed(() => {
    const w = this.width();
    return w === undefined ? null : typeof w === "number" ? `${w}px` : w;
  });

  protected readonly boxClass = computed(() =>
    cn(
      "relative z-50 rounded-[var(--radius)] bg-popover p-4 text-popover-foreground shadow-lg outline-none",
      OVERLAY_ORIGIN[this.side()],
      this.closing()
        ? // `forwards` holds the faded-out frame until teardown — without it the
          // element snaps back to its visible base state for a frame (a flicker)
          "animate-[bpdm-pop-out_var(--bpdm-duration-fast)_ease-in_forwards]"
        : "animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)]",
      this.panelClassInput(),
    ),
  );

  /** Move focus into the panel (non-modal case; the modal trap auto-captures). */
  focus(): void {
    this.panel()?.nativeElement.focus();
  }
}

/**
 * `bpdmPopover` — a click-triggered floating panel on any trigger, built on the
 * Angular CDK overlay (escapes `overflow: hidden` and CSS transforms),
 * collision-aware, and theme-aware. Pass the panel as a `TemplateRef`. Mirrors
 * the React `Popover`; use `bpdmPopoverClose` inside the content to dismiss it.
 *
 * ```html
 * <button bpdmButton [bpdmPopover]="panel">Open</button>
 * <ng-template #panel>
 *   <p>Anything can go here.</p>
 *   <button bpdmButton bpdmPopoverClose>Done</button>
 * </ng-template>
 * ```
 */
@Directive({
  selector: "[bpdmPopover]",
  exportAs: "bpdmPopover",
  host: {
    "(click)": "toggle()",
    "(keydown.escape)": "close()",
    "[attr.aria-haspopup]": "'dialog'",
    "[attr.aria-expanded]": "open()",
    "[attr.aria-controls]": "open() ? panelId : null",
  },
})
export class BpdmPopover implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly parentInjector = inject(Injector);

  /** The panel content. */
  readonly content = input<TemplateRef<unknown> | null>(null, { alias: "bpdmPopover" });
  readonly side = input<PopoverSide>("bottom", { alias: "bpdmPopoverSide" });
  readonly align = input<PopoverAlign>("center", { alias: "bpdmPopoverAlign" });
  /** Gap from the trigger, in px. Default 8. */
  readonly offset = input(8, { alias: "bpdmPopoverOffset" });
  /** Fixed panel width, e.g. 280 or "20rem". Defaults to fit-content. */
  readonly width = input<number | string | undefined>(undefined, { alias: "bpdmPopoverWidth" });
  /** Trap focus + block outside interaction (a mini-modal). Default false. */
  readonly modal = input(false, { alias: "bpdmPopoverModal", transform: booleanAttribute });
  /** Show a little arrow pointing at the trigger. Default false. */
  readonly showArrow = input(false, {
    alias: "bpdmPopoverShowArrow",
    transform: booleanAttribute,
  });
  readonly classInput = input("", { alias: "bpdmPopoverClass" });
  /** Open state — two-way bindable via `[(bpdmPopoverOpen)]`. */
  readonly open = model(false, { alias: "bpdmPopoverOpen" });

  protected readonly panelId = `bpdm-popover-${++pid}`;

  private overlayRef?: OverlayRef;
  private panelRef?: ComponentRef<BpdmPopoverPanel>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  // return focus to the trigger on keyboard/programmatic close, but not when the
  // user clicked elsewhere (yanking focus back would fight where they clicked)
  private restoreFocus = true;

  constructor() {
    // `open` is the single source of truth; only track it (read the rest untracked)
    effect(() => {
      const want = this.open();
      untracked(() => (want ? this.show() : this.hide()));
    });
  }

  protected toggle(): void {
    if (this.content()) this.open.set(!this.open());
  }

  close(): void {
    this.open.set(false);
  }

  private show(): void {
    clearTimeout(this.closeTimer);
    const tpl = this.content();
    if (!tpl) return;
    if (this.overlayRef) {
      this.panelRef?.setInput("closing", false);
      return;
    }

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions(connectedPositions(this.side(), this.align(), this.offset()))
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: this.modal(),
      backdropClass: "cdk-overlay-transparent-backdrop",
    });

    const ref: PopoverRef = { close: () => this.close() };
    const tplInjector = Injector.create({
      providers: [{ provide: BPDM_POPOVER_REF, useValue: ref }],
      parent: this.parentInjector,
    });

    const p = this.overlayRef.attach(new ComponentPortal(BpdmPopoverPanel, this.vcr));
    this.panelRef = p;
    p.setInput("tpl", tpl);
    p.setInput("ctx", { $implicit: ref, close: ref.close });
    p.setInput("injector", tplInjector);
    p.setInput("side", this.side());
    p.setInput("showArrow", this.showArrow());
    p.setInput("modal", this.modal());
    p.setInput("width", this.width());
    p.setInput("panelClassInput", this.classInput());
    p.setInput("id", this.panelId);

    positionStrategy.positionChanges.subscribe((change) => {
      this.panelRef?.setInput("side", sideFromPair(change.connectionPair));
    });

    if (this.modal()) {
      this.overlayRef.backdropClick().subscribe(() => this.close());
    } else {
      this.overlayRef.outsidePointerEvents().subscribe((e) => {
        if (!this.host.nativeElement.contains(e.target as Node)) {
          this.restoreFocus = false;
          this.close();
        }
      });
      // move focus into the panel without trapping (so the user can still tab out)
      setTimeout(() => this.panelRef?.instance.focus(), 0);
    }
  }

  private hide(): void {
    if (!this.overlayRef) return;
    this.panelRef?.setInput("closing", true);
    const wasModal = this.modal();
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.teardown();
      // modal focus-trap restores focus itself; restore it ourselves otherwise
      if (!wasModal && this.restoreFocus) this.host.nativeElement.focus();
      this.restoreFocus = true;
    }, 150);
  }

  private teardown(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.panelRef = undefined;
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.teardown();
  }
}
