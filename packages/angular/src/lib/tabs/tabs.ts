import { NgTemplateOutlet } from "@angular/common";
import {
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  signal,
  TemplateRef,
  viewChild,
  viewChildren,
} from "@angular/core";
import { cn } from "@bpdm/variants";

export type TabsVariant = "underline" | "pill";
export type TabsBaseline = "full" | "content";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface TabItem {
  value: string;
  label: string;
  /** Optional leading icon template. */
  icon?: TemplateRef<unknown>;
  /** Optional panel content template. */
  content?: TemplateRef<unknown>;
  disabled?: boolean;
}

let tid = 0;

const TRIGGER_BASE =
  "inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed! disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";
const TRIGGER_VARIANT: Record<TabsVariant, string> = {
  // no per-tab active marker for horizontal — the sliding indicator draws it (see template);
  // vertical adds its own per-tab marker back in `triggerClass`
  underline:
    "-mb-px border-b-2 border-transparent px-3 py-2.5 text-muted-foreground data-[state=inactive]:enabled:hover:border-primary-strong/60 data-[state=inactive]:enabled:hover:text-primary-strong data-[state=active]:font-semibold data-[state=active]:text-primary-strong",
  pill: "relative z-10 rounded-lg px-3 py-1.5 text-muted-foreground data-[state=inactive]:enabled:hover:text-foreground data-[state=active]:text-foreground",
};

/**
 * `<bpdm-tabs>` — accessible tabs (roving focus, arrow-key nav) with two looks:
 * `underline` (a line indicator under the active tab) and `pill` (a filled active
 * tab). Data-driven via `items`; controlled or uncontrolled (`[(value)]` /
 * `defaultValue`); supports icons, disabled tabs, and `fullWidth`. Mirrors the
 * React `Tabs`.
 *
 * ```html
 * <bpdm-tabs [items]="tabs" variant="underline" />
 * ```
 */
@Component({
  selector: "bpdm-tabs",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { "[class]": "hostClass()" },
  template: `
    <div [class]="wrapClass()">
    @if (scrollable()) {
      <button type="button" aria-hidden="true" tabindex="-1" [disabled]="!canPrev()" [class]="chevron" (click)="scrollByDir(-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 rtl:-scale-x-100" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
      </button>
    }
    <div
      #list
      role="tablist"
      [attr.aria-orientation]="orientation()"
      [attr.aria-label]="ariaLabel() || null"
      [class]="listClass()"
      [style.mask-image]="scrollable() ? fade : null"
      [style.-webkit-mask-image]="scrollable() ? fade : null"
      (keydown)="onKeydown($event)"
      (scroll)="updateEdges(); measureIndicator()"
    >
      @if (slide()) {
        <span #indicator aria-hidden="true" [class]="indicatorClass()"></span>
      }
      @for (t of items(); track t.value) {
        <button
          #tab
          type="button"
          role="tab"
          [id]="ids + '-tab-' + t.value"
          [attr.aria-selected]="t.value === active()"
          [attr.aria-controls]="
            hasContent() && t.value === active() ? ids + '-panel-' + t.value : null
          "
          [attr.data-state]="t.value === active() ? 'active' : 'inactive'"
          [tabindex]="t.value === rovingValue() ? 0 : -1"
          [disabled]="t.disabled || null"
          [class]="triggerClass()"
          (click)="select(t)"
        >
          @if (t.icon) {
            <ng-container [ngTemplateOutlet]="t.icon" />
          }
          {{ t.label }}
        </button>
      }
    </div>
    @if (scrollable()) {
      <button type="button" aria-hidden="true" tabindex="-1" [disabled]="!canNext()" [class]="chevron" (click)="scrollByDir(1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 rtl:-scale-x-100" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    }
    </div>
    @if (hasContent()) {
      @for (t of items(); track t.value) {
        @if (t.value === active()) {
          <div
            role="tabpanel"
            tabindex="0"
            [id]="ids + '-panel-' + t.value"
            [attr.aria-labelledby]="ids + '-tab-' + t.value"
            [class]="panelClass()"
          >
            @if (t.content) {
              <ng-container [ngTemplateOutlet]="t.content" />
            }
          </div>
        }
      }
    }
  `,
})
export class BpdmTabs {
  readonly items = input<TabItem[]>([]);
  readonly value = model<string>("");
  readonly defaultValue = input<string>("");
  readonly variant = input<TabsVariant>("underline");
  readonly baseline = input<TabsBaseline>("full");
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Scroll the tab row horizontally when the tabs overflow (many tabs). */
  readonly scrollable = input(false, { transform: booleanAttribute });
  /** Layout + arrow-key axis. "horizontal" (default) or "vertical". */
  readonly orientation = input<TabsOrientation>("horizontal");
  /** "automatic" (default) — arrow selects; "manual" — arrow moves focus, Enter/Space selects. */
  readonly activationMode = input<TabsActivationMode>("automatic");
  /** Accessible name for the tablist (screen readers). The one translatable a11y string. */
  readonly ariaLabel = input<string>("");
  /** Arrow-key direction for horizontal tabs; auto-detected from the ambient direction when omitted. */
  readonly dir = input<"" | "ltr" | "rtl">("");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly ids = `bpdm-tabs-${++tid}`;
  private readonly tabs = viewChildren<ElementRef<HTMLButtonElement>>("tab");
  private readonly listEl = viewChild<ElementRef<HTMLDivElement>>("list");
  private readonly indicatorEl = viewChild<ElementRef<HTMLSpanElement>>("indicator");
  // manual-activation roving target (the focused, not-yet-selected, tab)
  private readonly focusedValue = signal<string>("");
  // scroll-button visibility (mouse affordance for the scrollable row)
  protected readonly canPrev = signal(false);
  protected readonly canNext = signal(false);
  // minimal inline chevron (no chip/border); dims at the edge it can't scroll toward
  protected readonly chevron =
    "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-30";
  // symmetric edge fade so partial tabs dissolve at both ends (RTL-safe)
  protected readonly fade =
    "linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)";

  constructor() {
    // re-measure overflow after renders (items/size changes) and on container resize
    afterEveryRender(() => {
      if (this.scrollable()) this.updateEdges();
      if (this.slide()) this.measureIndicator();
    });
    afterNextRender(() => {
      const el = this.listEl()?.nativeElement;
      if (!el) return;
      const ro = new ResizeObserver(() => this.updateEdges());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  /** The effective active value — controlled `value`, else default, else first tab. */
  protected readonly active = computed(
    () => this.value() || this.defaultValue() || this.items()[0]?.value || "",
  );
  /** Which tab is the single tab stop: the focused one in manual mode, else the active one. */
  protected readonly rovingValue = computed(() =>
    this.activationMode() === "manual" ? this.focusedValue() || this.active() : this.active(),
  );
  protected readonly hasContent = computed(() => this.items().some((t) => t.content));

  protected readonly hostClass = computed(() =>
    // vertical: list + panel sit side by side
    cn("block", this.orientation() === "vertical" && "flex gap-3"),
  );

  // scrollable wraps the row in a flex bar (chevrons + masked list); `contents` keeps
  // the non-scrollable case structurally identical (no extra box)
  protected readonly wrapClass = computed(() =>
    this.scrollable()
      ? cn("flex items-center", this.variant() === "underline" && "border-b border-border")
      : "contents",
  );

  protected readonly listClass = computed(() => {
    const underline = this.variant() === "underline";
    const vertical = this.orientation() === "vertical";
    const scroll = this.scrollable();
    return cn(
      "relative flex items-center gap-1",
      vertical && "flex-col items-stretch",
      // underline border sits on the list normally; when scrollable it moves to the wrapper
      underline && !scroll && (vertical ? "border-e border-border" : "border-b border-border"),
      underline && this.baseline() === "content" && "w-fit",
      this.fullWidth() && "w-full",
      // scroll the row when tabs overflow: natural-width tabs, hidden scrollbar
      scroll &&
        "min-w-0 flex-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&>*]:shrink-0 [&::-webkit-scrollbar]:hidden",
    );
  });

  protected readonly slide = computed(() => this.orientation() === "horizontal");

  protected readonly triggerClass = computed(() => {
    const vertical = this.orientation() === "vertical";
    const underline = this.variant() === "underline";
    // vertical keeps a per-tab active marker; horizontal uses the sliding indicator
    const verticalActive = !vertical
      ? ""
      : underline
        ? "mb-0 -me-px border-b-0 border-e-2 data-[state=active]:border-primary-strong"
        : "data-[state=inactive]:enabled:hover:bg-muted/60 data-[state=active]:bg-muted";
    return cn(
      TRIGGER_BASE,
      vertical && "justify-start",
      TRIGGER_VARIANT[this.variant()],
      verticalActive,
      this.fullWidth() && "flex-1 justify-center",
    );
  });

  protected readonly indicatorClass = computed(() =>
    cn(
      "pointer-events-none absolute left-0 opacity-0 transition-[transform,width,opacity] duration-[var(--bpdm-duration-base)] ease-[var(--bpdm-ease-out)] motion-reduce:transition-none",
      this.variant() === "underline"
        ? "-bottom-px h-0.5 bg-primary-strong" // sit on the baseline (like the tab's -mb-px border), flush not floating
        : "inset-y-0 z-0 rounded-lg bg-muted",
    ),
  );

  protected readonly panelClass = computed(() =>
    cn(
      "outline-none animate-[bpdm-fade-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] motion-reduce:animate-none",
      this.orientation() === "vertical" ? "flex-1 ps-4" : "pt-4",
    ),
  );

  protected select(t: TabItem): void {
    if (t.disabled) return;
    this.value.set(t.value);
    this.focusedValue.set(t.value);
  }

  private isRtl(): boolean {
    const d = this.dir();
    if (d === "rtl") return true;
    if (d === "ltr") return false;
    return getComputedStyle(this.host.nativeElement).direction === "rtl";
  }

  protected updateEdges(): void {
    const el = this.listEl()?.nativeElement;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // abs handles the negative-scrollLeft RTL model
    this.canPrev.set(pos > 1);
    this.canNext.set(pos < max - 1);
  }

  protected scrollByDir(logical: -1 | 1): void {
    const el = this.listEl()?.nativeElement;
    if (!el) return;
    el.scrollBy({
      left: (this.isRtl() ? -logical : logical) * el.clientWidth * 0.7,
      behavior: "smooth",
    });
  }

  protected measureIndicator(): void {
    const ind = this.indicatorEl()?.nativeElement;
    const list = this.listEl()?.nativeElement;
    if (!ind || !list) return;
    const idx = this.items().findIndex((t) => t.value === this.active());
    const active = idx >= 0 ? this.tabs()[idx]?.nativeElement : null;
    if (!active) {
      ind.style.opacity = "0";
      return;
    }
    const first = !ind.dataset["ready"];
    if (first) ind.style.transition = "none"; // don't animate the initial placement
    ind.style.opacity = "1";
    ind.style.width = `${active.offsetWidth}px`;
    ind.style.transform = `translateX(${active.offsetLeft - list.scrollLeft}px)`;
    if (first) {
      void ind.offsetWidth; // flush, then hand control back to the CSS transition
      ind.style.transition = "";
      ind.dataset["ready"] = "1";
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const horizontal = this.orientation() !== "vertical";
    // only the keys that match the orientation (plus Home/End) navigate
    const nav = horizontal
      ? ["ArrowLeft", "ArrowRight", "Home", "End"]
      : ["ArrowUp", "ArrowDown", "Home", "End"];
    if (!nav.includes(event.key)) return;
    event.preventDefault();

    const items = this.items();
    const enabled = items.filter((t) => !t.disabled);
    if (!enabled.length) return;
    let curr = enabled.findIndex((t) => t.value === this.rovingValue());
    if (curr < 0) curr = 0;
    const len = enabled.length;
    const rtl = horizontal && this.isRtl();
    let nextIdx = curr;
    switch (event.key) {
      case "ArrowRight":
        nextIdx = (curr + (rtl ? -1 : 1) + len) % len;
        break;
      case "ArrowLeft":
        nextIdx = (curr + (rtl ? 1 : -1) + len) % len;
        break;
      case "ArrowDown":
        nextIdx = (curr + 1) % len;
        break;
      case "ArrowUp":
        nextIdx = (curr - 1 + len) % len;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = len - 1;
        break;
    }
    const target = enabled[nextIdx];
    // automatic: move focus AND select; manual: move focus only (Enter/Space selects via the native button)
    if (this.activationMode() === "manual") this.focusedValue.set(target.value);
    else this.select(target);
    const fullIndex = items.findIndex((t) => t.value === target.value);
    this.tabs()[fullIndex]?.nativeElement.focus();
  }
}
