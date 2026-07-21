import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { Directionality } from "@angular/cdk/bidi";
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

export type TooltipSide = OverlaySide;
export type TooltipAlign = OverlayAlign;

let uid = 0;

/**
 * Internal bubble rendered into the CDK overlay. Not part of the public API —
 * created imperatively by {@link BpdmTooltip}.
 */
@Component({
  selector: "bpdm-tooltip-content",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    "data-bpdm": "",
    "data-bpdm-slot": "tooltip-content",
    "[class]": "boxClass()",
    "[attr.id]": "id()",
    role: "tooltip",
    // keep the bubble alive while the pointer is over it (WCAG 1.4.13 "hoverable")
    "(mouseenter)": "keepAlive.emit()",
    "(mouseleave)": "dismiss.emit()",
  },
  template: `
    @if (isTemplate()) {
      <ng-container [ngTemplateOutlet]="tpl()!" />
    } @else {
      {{ text() }}
    }
    @if (!hideArrow()) {
      <span [class]="arrowClass()" aria-hidden="true">
        <svg
          width="12"
          height="6"
          viewBox="0 0 12 6"
          class="block fill-popover"
          style="filter: drop-shadow(0 0 1.5px rgb(0 0 0 / 0.22))"
        >
          <path d="M0 0L6 6L12 0Z" />
        </svg>
      </span>
    }
  `,
})
class BpdmTooltipContent {
  readonly text = input("");
  readonly tpl = input<TemplateRef<unknown> | null>(null);
  readonly isTemplate = input(false);
  readonly side = input<TooltipSide>("top");
  readonly hideArrow = input(false);
  readonly closing = input(false);
  readonly id = input("");
  readonly boxClassInput = input("");

  /** Pointer entered the bubble — the directive cancels the pending hide. */
  readonly keepAlive = output<void>();
  /** Pointer left the bubble — the directive schedules the hide. */
  readonly dismiss = output<void>();

  protected readonly arrowClass = computed(() => OVERLAY_ARROW[this.side()]);

  protected readonly boxClass = computed(() =>
    cn(
      "relative z-50 max-w-xs rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg",
      OVERLAY_ORIGIN[this.side()],
      this.closing()
        ? // `forwards` holds the faded-out frame until teardown (no snap-back flicker)
          "animate-[bpdm-pop-out_100ms_ease-in_forwards]"
        : "animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)]",
      this.boxClassInput(),
    ),
  );
}

/**
 * `bpdmTooltip` — a hover/focus tooltip on any trigger, built on the Angular CDK
 * overlay (so it escapes `overflow: hidden` and CSS transforms) and theme-aware.
 * Pass a string or a `TemplateRef` for rich content. Mirrors the React `Tooltip`.
 *
 * ```html
 * <button bpdmButton bpdmTooltip="Copy address">Copy</button>
 *
 * <button bpdmButton [bpdmTooltip]="rich" bpdmTooltipSide="right">Sync info</button>
 * <ng-template #rich>…</ng-template>
 * ```
 *
 * A disabled control emits no hover/focus events, so put the directive on a
 * focusable wrapper to explain why it's disabled:
 *
 * ```html
 * <span bpdmTooltip="You need the Admin role" tabindex="0" class="inline-flex">
 *   <button bpdmButton disabled class="pointer-events-none">Publish</button>
 * </span>
 * ```
 */
@Directive({
  selector: "[bpdmTooltip]",
  exportAs: "bpdmTooltip",
  host: {
    "data-bpdm": "",
    "data-bpdm-slot": "tooltip-trigger",
    "(mouseenter)": "onEnter()",
    "(mouseleave)": "onLeave()",
    "(focusin)": "onEnter()",
    "(focusout)": "onLeave()",
    "(keydown.escape)": "onLeave()",
  },
})
export class BpdmTooltip implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly vcr = inject(ViewContainerRef);
  // ambient text direction — fed to the overlay so `align="start"/"end"` resolve
  // to physical left/right correctly (they flip under `dir="rtl"`).
  private readonly directionality = inject(Directionality);

  /** Tooltip body — a string, or a `TemplateRef` for rich content. */
  readonly content = input<string | TemplateRef<unknown> | null | undefined>("", {
    alias: "bpdmTooltip",
  });
  readonly side = input<TooltipSide>("top", { alias: "bpdmTooltipSide" });
  readonly align = input<TooltipAlign>("center", { alias: "bpdmTooltipAlign" });
  /** Delay before opening, in ms. Default 200. */
  readonly delay = input(200, { alias: "bpdmTooltipDelay" });
  /** Gap between trigger and tooltip, in px. Default 6. */
  readonly offset = input(6, { alias: "bpdmTooltipOffset" });
  readonly hideArrow = input(false, {
    alias: "bpdmTooltipHideArrow",
    transform: booleanAttribute,
  });
  /** Turn the tooltip off; the trigger stays interactive. Disables the *tooltip*, not the trigger. */
  readonly disabled = input(false, {
    alias: "bpdmTooltipDisabled",
    transform: booleanAttribute,
  });
  readonly classInput = input("", { alias: "bpdmTooltipClass" });

  private readonly tooltipId = `bpdm-tooltip-${++uid}`;
  private overlayRef?: OverlayRef;
  private contentRef?: ComponentRef<BpdmTooltipContent>;
  private showTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;

  protected onEnter(): void {
    if (this.disabled() || this.isEmpty()) return;
    clearTimeout(this.closeTimer);
    // re-entered while fading out → cancel the close
    if (this.contentRef) {
      this.contentRef.setInput("closing", false);
      return;
    }
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), this.delay());
  }

  protected onLeave(): void {
    clearTimeout(this.showTimer);
    this.hide();
  }

  private isEmpty(): boolean {
    const c = this.content();
    return c == null || c === "";
  }

  private show(): void {
    if (this.overlayRef) return;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions(connectedPositions(this.side(), this.align(), this.offset()));

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      // without this the overlay defaults to LTR and `start`/`end` never flip
      direction: this.directionality,
    });

    const ref = this.overlayRef.attach(new ComponentPortal(BpdmTooltipContent, this.vcr));
    this.contentRef = ref;

    // hoverable (WCAG 1.4.13): treat trigger + bubble as one hover region so the
    // pointer can travel across the offset gap onto the bubble without it tearing
    // down. Entering the bubble cancels a pending hide; leaving it re-schedules.
    ref.instance.keepAlive.subscribe(() => this.onEnter());
    ref.instance.dismiss.subscribe(() => this.onLeave());

    const c = this.content();
    const isTpl = c instanceof TemplateRef;
    ref.setInput("isTemplate", isTpl);
    ref.setInput("tpl", isTpl ? c : null);
    ref.setInput("text", isTpl ? "" : (c ?? ""));
    ref.setInput("side", this.side());
    ref.setInput("hideArrow", this.hideArrow());
    ref.setInput("boxClassInput", this.classInput());
    ref.setInput("id", this.tooltipId);

    this.host.nativeElement.setAttribute("aria-describedby", this.tooltipId);

    positionStrategy.positionChanges.subscribe((change) => {
      this.contentRef?.setInput("side", sideFromPair(change.connectionPair));
    });
  }

  private hide(): void {
    if (!this.contentRef || !this.overlayRef) return;
    this.contentRef.setInput("closing", true);
    this.closeTimer = setTimeout(() => this.teardown(), 110);
  }

  private teardown(): void {
    this.host.nativeElement.removeAttribute("aria-describedby");
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.contentRef = undefined;
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.closeTimer);
    this.teardown();
  }
}
