import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
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
import {
  GlobalPositionStrategy,
  Overlay,
  OverlayRef,
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { cn } from "@bpdm/variants";
import { BpdmOverlayPanel } from "../overlay/overlay-panel";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

// --- i18n ---
export interface DrawerMessages {
  /** Close button aria-label. */
  close: string;
  /** Fallback screen-reader title when no `title` is set. */
  drawerLabel: string;
}

export const DEFAULT_DRAWER_MESSAGES: DrawerMessages = { close: "Close", drawerLabel: "Drawer" };

let dwid = 0;

// edge anchor + border on the inner edge + the full cross-axis dimension
const SIDE_BASE: Record<DrawerSide, string> = {
  right: "h-dvh border-l border-border",
  left: "h-dvh border-r border-border",
  top: "w-dvw border-b border-border",
  bottom: "w-dvw border-t border-border",
};

const ENTER: Record<DrawerSide, string> = {
  right: "animate-[bpdm-slide-in-right_var(--bpdm-duration-slow)_var(--bpdm-ease-out)]",
  left: "animate-[bpdm-slide-in-left_var(--bpdm-duration-slow)_var(--bpdm-ease-out)]",
  top: "animate-[bpdm-slide-in-top_var(--bpdm-duration-slow)_var(--bpdm-ease-out)]",
  bottom: "animate-[bpdm-slide-in-bottom_var(--bpdm-duration-slow)_var(--bpdm-ease-out)]",
};

// `forwards` holds the slid-out frame until teardown (no snap-back flicker)
const EXIT: Record<DrawerSide, string> = {
  right: "animate-[bpdm-slide-out-right_var(--bpdm-duration-base)_ease-in_forwards]",
  left: "animate-[bpdm-slide-out-left_var(--bpdm-duration-base)_ease-in_forwards]",
  top: "animate-[bpdm-slide-out-top_var(--bpdm-duration-base)_ease-in_forwards]",
  bottom: "animate-[bpdm-slide-out-bottom_var(--bpdm-duration-base)_ease-in_forwards]",
};

function sizeClass(side: DrawerSide, size: DrawerSize): string {
  if (side === "left" || side === "right") {
    return { sm: "w-80", md: "w-96", lg: "w-[32rem]", xl: "w-[40rem]", full: "w-dvw" }[size];
  }
  return { sm: "h-[33dvh]", md: "h-[50dvh]", lg: "h-[67dvh]", xl: "h-[83dvh]", full: "h-dvh" }[size];
}

/** Marker for the drawer body: `<ng-template bpdmDrawerBody>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDrawerBody]" })
export class BpdmDrawerBody {}

/** Marker for the drawer footer: `<ng-template bpdmDrawerFooter>…</ng-template>`. */
@Directive({ selector: "ng-template[bpdmDrawerFooter]" })
export class BpdmDrawerFooter {}

/**
 * `<bpdm-drawer>` — a slide-in panel ("sheet") on the Angular CDK overlay: focus
 * trap, scroll lock, Escape + backdrop-click to close, full ARIA. Slides in from
 * any edge. Mirrors the React `Drawer`: set `side`/`size`/`title`/`description`,
 * project a `[bpdmDrawerTrigger]` button and `ng-template[bpdmDrawerBody]` /
 * `ng-template[bpdmDrawerFooter]`, or drive it with `[(open)]`. `bpdmDrawerClose`
 * dismisses from inside.
 *
 * ```html
 * <bpdm-drawer side="right" title="Edit project">
 *   <button bpdmButton bpdmDrawerTrigger>Open</button>
 *   <ng-template bpdmDrawerBody>…</ng-template>
 *   <ng-template bpdmDrawerFooter>
 *     <button bpdmButton bpdmDrawerClose>Save</button>
 *   </ng-template>
 * </bpdm-drawer>
 * ```
 */
@Component({
  selector: "bpdm-drawer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  template: `<ng-content select="[bpdmDrawerTrigger]" />`,
})
export class BpdmDrawer implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  /** Open state — two-way bindable via `[(open)]`. */
  readonly open = model(false);
  /** Edge to slide in from. Default "right". */
  readonly side = input<DrawerSide>("right");
  /** Panel size — width for left/right, height for top/bottom. Default "md". */
  readonly size = input<DrawerSize>("md");
  readonly title = input("");
  readonly description = input("");
  /** Show the top-right close button. Default true. */
  readonly showClose = input(true, { transform: booleanAttribute });
  /** Screen-reader strings (close button label, fallback title). */
  readonly messages = input<Partial<DrawerMessages>>({});

  protected readonly t = computed<DrawerMessages>(() => ({
    ...DEFAULT_DRAWER_MESSAGES,
    ...this.messages(),
  }));

  private readonly body = contentChild(BpdmDrawerBody, { read: TemplateRef });
  private readonly footer = contentChild(BpdmDrawerFooter, { read: TemplateRef });

  protected readonly labelId = `bpdm-drawer-title-${++dwid}`;
  protected readonly descId = `bpdm-drawer-desc-${dwid}`;

  private overlayRef?: OverlayRef;
  private panelRef?: ComponentRef<BpdmOverlayPanel>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const want = this.open();
      untracked(() => (want ? this.attach() : this.beginClose()));
    });

    // propagate live message/title/description changes to an already-open panel
    effect(() => {
      const msgs = this.t();
      const title = this.title();
      const description = this.description();
      untracked(() => {
        const ref = this.panelRef;
        if (!ref) return;
        ref.setInput("closeLabel", msgs.close);
        ref.setInput("fallbackTitle", msgs.drawerLabel);
        ref.setInput("title", title);
        ref.setInput("description", description);
      });
    });
  }

  openDrawer(): void {
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  private edgePosition(): GlobalPositionStrategy {
    const pos = this.overlay.position().global();
    switch (this.side()) {
      case "left":
        return pos.top("0").left("0");
      case "top":
        return pos.top("0").left("0");
      case "bottom":
        return pos.bottom("0").left("0");
      default:
        return pos.top("0").right("0");
    }
  }

  private attach(): void {
    clearTimeout(this.closeTimer);
    if (this.overlayRef) {
      this.panelRef?.setInput("closing", false);
      if (this.overlayRef.backdropElement) this.overlayRef.backdropElement.style.opacity = "";
      return;
    }

    this.previouslyFocused = document.activeElement as HTMLElement | null;
    const side = this.side();

    this.overlayRef = this.overlay.create({
      positionStrategy: this.edgePosition(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: ["cdk-overlay-backdrop", "bpdm-dialog-backdrop"],
    });

    const ref = this.overlayRef.attach(new ComponentPortal(BpdmOverlayPanel, this.vcr));
    ref.setInput("slotBase", "drawer");
    this.panelRef = ref;
    ref.setInput("title", this.title());
    ref.setInput("description", this.description());
    ref.setInput("showClose", this.showClose());
    ref.setInput("closeLabel", this.t().close);
    ref.setInput("body", this.body() ?? null);
    ref.setInput("footer", this.footer() ?? null);
    ref.setInput("labelId", this.labelId);
    ref.setInput("descId", this.descId);
    ref.setInput("fallbackTitle", this.t().drawerLabel);
    ref.setInput(
      "panelClass",
      cn(
        "relative z-50 flex flex-col bg-popover text-popover-foreground shadow-xl outline-none",
        SIDE_BASE[side],
        sizeClass(side, this.size()),
      ),
    );
    ref.setInput("enterAnim", ENTER[side]);
    ref.setInput("exitAnim", EXIT[side]);

    ref.instance.dismiss.subscribe(() => this.close());
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  private beginClose(): void {
    if (!this.overlayRef) return;
    this.panelRef?.setInput("closing", true);
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
    }, 240);
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.overlayRef?.dispose();
  }
}

/** Opens the nearest `<bpdm-drawer>` — put it on any trigger button. */
@Directive({
  selector: "[bpdmDrawerTrigger]",
  host: {
    "data-bpdm": "",
    "data-bpdm-slot": "drawer-trigger",
    "(click)": "drawer.openDrawer()",
  },
})
export class BpdmDrawerTrigger {
  protected readonly drawer = inject(BpdmDrawer);
}

/** Dismisses the drawer from inside its body/footer — put it on any button. */
@Directive({
  selector: "[bpdmDrawerClose]",
  host: { "(click)": "drawer.close()" },
})
export class BpdmDrawerClose {
  protected readonly drawer = inject(BpdmDrawer);
}
