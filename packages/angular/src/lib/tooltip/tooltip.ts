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
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import {
  ConnectedPosition,
  ConnectionPositionPair,
  Overlay,
  OverlayRef,
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

let uid = 0;

// the side the bubble grows from — so the pop-in scales out of the trigger edge
const ORIGIN: Record<TooltipSide, string> = {
  top: "origin-bottom",
  bottom: "origin-top",
  left: "origin-right",
  right: "origin-left",
};

// where the little arrow sits + how it's rotated to point back at the trigger
const ARROW: Record<TooltipSide, string> = {
  top: "absolute left-1/2 top-full -translate-x-1/2",
  bottom: "absolute left-1/2 bottom-full -translate-x-1/2 rotate-180",
  left: "absolute top-1/2 left-full -translate-y-1/2 -rotate-90",
  right: "absolute top-1/2 right-full -translate-y-1/2 rotate-90",
};

/**
 * Internal bubble rendered into the CDK overlay. Not part of the public API —
 * created imperatively by {@link BpdmTooltip}.
 */
@Component({
  selector: "bpdm-tooltip-content",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    "[class]": "boxClass()",
    "[attr.id]": "id()",
    role: "tooltip",
  },
  template: `
    @if (isTemplate()) {
      <ng-container [ngTemplateOutlet]="tpl()!" />
    } @else {
      {{ text() }}
    }
    @if (!hideArrow()) {
      <span [class]="arrowClass()" aria-hidden="true">
        <svg width="12" height="6" viewBox="0 0 12 6" class="block fill-popover">
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

  protected readonly arrowClass = computed(() => ARROW[this.side()]);

  protected readonly boxClass = computed(() =>
    cn(
      "relative z-50 max-w-xs rounded-md bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg",
      ORIGIN[this.side()],
      this.closing()
        ? "animate-[bpdm-pop-out_100ms_ease-in]"
        : "animate-[bpdm-pop-in_var(--bpdm-duration-fast)_var(--bpdm-ease-out)]",
      this.boxClassInput(),
    ),
  );
}

function onePosition(
  side: TooltipSide,
  align: TooltipAlign,
  offset: number,
): ConnectedPosition {
  if (side === "top" || side === "bottom") {
    const x = align === "center" ? "center" : align === "start" ? "start" : "end";
    const base = { originX: x, overlayX: x } as const;
    return side === "top"
      ? { ...base, originY: "top", overlayY: "bottom", offsetY: -offset }
      : { ...base, originY: "bottom", overlayY: "top", offsetY: offset };
  }
  const y = align === "center" ? "center" : align === "start" ? "top" : "bottom";
  const base = { originY: y, overlayY: y } as const;
  return side === "left"
    ? { ...base, originX: "start", overlayX: "end", offsetX: -offset }
    : { ...base, originX: "end", overlayX: "start", offsetX: offset };
}

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

// primary placement, plus the opposite side as a flip fallback when space is tight
function buildPositions(
  side: TooltipSide,
  align: TooltipAlign,
  offset: number,
): ConnectedPosition[] {
  return [onePosition(side, align, offset), onePosition(OPPOSITE[side], align, offset)];
}

// recover which side CDK actually settled on (it may have flipped) so the arrow follows
function sideFromPair(p: ConnectionPositionPair): TooltipSide {
  const vertical =
    p.originY !== p.overlayY && p.originY !== "center" && p.overlayY !== "center";
  if (vertical) return p.overlayY === "bottom" ? "top" : "bottom";
  return p.overlayX === "end" ? "left" : "right";
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
      .withPositions(buildPositions(this.side(), this.align(), this.offset()));

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const ref = this.overlayRef.attach(new ComponentPortal(BpdmTooltipContent, this.vcr));
    this.contentRef = ref;

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
