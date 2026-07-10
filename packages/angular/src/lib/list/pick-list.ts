import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, model, output, signal, TemplateRef } from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  CONTROL_BTN_CLASS,
  type ItemKey,
  type ItemKeyFn,
  type ItemTextFn,
  type ListItemContext,
} from "./list-internals";
import { BpdmReorderControls } from "./reorder-controls";
import { BpdmSelectableList } from "./selectable-list";

export interface PickListValue<T> {
  source: T[];
  target: T[];
}

/**
 * Every user-facing / screen-reader string in the Pick List, for i18n. Pass a
 * `Partial<PickListMessages>` via `[messages]` to override any subset; the rest
 * fall back to {@link defaultPickListMessages} (English).
 */
export interface PickListMessages {
  /** `aria-label` for the middle transfer-control group. */
  transferGroup: string;
  /** Move-selected → target button (aria-label + tooltip). */
  moveToTarget: string;
  /** Move-all ⇒ target button. */
  moveAllToTarget: string;
  /** Move-selected ← source button. */
  moveToSource: string;
  /** Move-all ⇐ source button. */
  moveAllToSource: string;
  /** Empty-state text for the source list. */
  sourceEmpty: string;
  /** Empty-state text for the target list. */
  targetEmpty: string;
  /** Placeholder + aria-label for the filter box (both lists). */
  filterPlaceholder: string;
  /** Fallback accessible name for the source list when it has no visible header. */
  sourceLabel: string;
  /** Fallback accessible name for the target list when it has no visible header. */
  targetLabel: string;
  /** Live-region announcement built after each transfer. */
  transferAnnouncement: (count: number, listLabel: string) => string;
}

/** English defaults for {@link PickListMessages}. */
export const defaultPickListMessages: PickListMessages = {
  transferGroup: "Transfer between lists",
  moveToTarget: "Move to target",
  moveAllToTarget: "Move all to target",
  moveToSource: "Move to source",
  moveAllToSource: "Move all to source",
  sourceEmpty: "No items",
  targetEmpty: "Nothing here yet",
  filterPlaceholder: "Filter",
  sourceLabel: "source list",
  targetLabel: "target list",
  transferAnnouncement: (count, listLabel) =>
    `${count} ${count === 1 ? "item" : "items"} moved to ${listLabel}`,
};

/**
 * `<bpdm-pick-list>` — move items between two lists. Select items on either side
 * and transfer them with the middle controls (move / move all, each way);
 * optionally reorder within each list (drag or the side controls). Controlled
 * (`[(value)]`) or uncontrolled, filterable, responsive — the two lists stack on
 * small screens. Reuses `SelectableList`.
 *
 * ```html
 * <bpdm-pick-list [(value)]="lists" [itemKey]="key" [itemTemplate]="tpl"
 *   sourceHeader="Available" targetHeader="Your dashboard" />
 * <ng-template #tpl let-item>{{ item }}</ng-template>
 * ```
 */
@Component({
  selector: "bpdm-pick-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [BpdmReorderControls, BpdmSelectableList],
  template: `
    <div [class]="rootClass()">
      @if (reorder()) {
        <bpdm-reorder-controls
          class="self-center"
          [items]="source()"
          [itemKey]="itemKey()"
          [selected]="sourceSel()"
          (reorder)="setLists({ source: $event, target: target() })"
        />
      }

      <bpdm-selectable-list
        class="flex-1"
        [items]="source()"
        [keyOf]="itemKey()"
        [itemTemplate]="itemTemplate()"
        [selected]="sourceSel()"
        [reorderable]="reorder()"
        [header]="sourceHeader()"
        [filterBy]="filterBy()"
        [filterPlaceholder]="filterPlaceholder() || t().filterPlaceholder"
        [scrollHeight]="scrollHeight()"
        [multiselectable]="true"
        [emptyText]="sourceEmptyText() || t().sourceEmpty"
        [ariaLabel]="t().sourceLabel"
        [isItemDisabled]="isItemDisabled()"
        (toggle)="toggleSel(sourceSel, $event.key)"
        (reorder)="setLists({ source: $event, target: target() })"
      />

      <!-- transfer controls — a row on mobile, a column on lg+. The horizontal
           arrows flip under RTL so "toward target" always points at the target. -->
      <div data-transfer-group role="group" [attr.aria-label]="t().transferGroup" class="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <button type="button" [attr.aria-label]="t().moveToTarget" [attr.title]="t().moveToTarget" [class]="btn" [disabled]="sourceSel().size === 0" (click)="toTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="rtl:-scale-x-100"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" [attr.aria-label]="t().moveAllToTarget" [attr.title]="t().moveAllToTarget" [class]="btn" [disabled]="!sourceHasEnabled()" (click)="allToTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="rtl:-scale-x-100"><path d="m7 7 5 5-5 5M13 7l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" [attr.aria-label]="t().moveToSource" [attr.title]="t().moveToSource" [class]="btn" [disabled]="targetSel().size === 0" (click)="toSource()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="rtl:-scale-x-100"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" [attr.aria-label]="t().moveAllToSource" [attr.title]="t().moveAllToSource" [class]="btn" [disabled]="!targetHasEnabled()" (click)="allToSource()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="rtl:-scale-x-100"><path d="m17 7-5 5 5 5M11 7l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </div>

      <bpdm-selectable-list
        class="flex-1"
        [items]="target()"
        [keyOf]="itemKey()"
        [itemTemplate]="itemTemplate()"
        [selected]="targetSel()"
        [reorderable]="reorder()"
        [header]="targetHeader()"
        [filterBy]="filterBy()"
        [filterPlaceholder]="filterPlaceholder() || t().filterPlaceholder"
        [scrollHeight]="scrollHeight()"
        [multiselectable]="true"
        [emptyText]="targetEmptyText() || t().targetEmpty"
        [ariaLabel]="t().targetLabel"
        [isItemDisabled]="isItemDisabled()"
        (toggle)="toggleSel(targetSel, $event.key)"
        (reorder)="setLists({ source: source(), target: $event })"
      />

      @if (reorder()) {
        <bpdm-reorder-controls
          class="self-center"
          [items]="target()"
          [itemKey]="itemKey()"
          [selected]="targetSel()"
          (reorder)="setLists({ source: source(), target: $event })"
        />
      }

      <div role="status" aria-live="polite" class="sr-only">{{ message() }}</div>
    </div>
  `,
})
export class BpdmPickList<T = unknown> {
  /** Controlled / uncontrolled `{ source, target }` — `[(value)]`. */
  readonly value = model<PickListValue<T> | undefined>(undefined);
  readonly defaultValue = input<PickListValue<T>>({ source: [], target: [] });
  readonly itemKey = input.required<ItemKeyFn<T>>();
  readonly itemTemplate = input.required<TemplateRef<ListItemContext<T>>>();
  readonly sourceHeader = input<string>("");
  readonly targetHeader = input<string>("");
  readonly filterBy = input<ItemTextFn<T> | undefined>(undefined);
  /** Filter box placeholder. Overrides `messages.filterPlaceholder` when set. */
  readonly filterPlaceholder = input<string>("");
  /** Show the reorder controls beside each list + within-list drag. Default true. */
  readonly reorder = input(true);
  readonly scrollHeight = input<string>("18rem");
  /** Empty-state text for the source list. Overrides `messages.sourceEmpty` when set. */
  readonly sourceEmptyText = input<string>("");
  /** Empty-state text for the target list. Overrides `messages.targetEmpty` when set. */
  readonly targetEmptyText = input<string>("");
  /** Predicate marking an item as disabled — not selectable, transferable, or draggable. */
  readonly isItemDisabled = input<((item: T) => boolean) | undefined>(undefined);
  /** Override any user-facing / screen-reader string for i18n. */
  readonly messages = input<Partial<PickListMessages>>({});
  readonly classInput = input<string>("", { alias: "class" });

  /** Fired after a transfer, with the moved items and which list they landed in. */
  readonly transfer = output<{ moved: T[]; to: "source" | "target" }>();

  protected readonly btn = CONTROL_BTN_CLASS;
  /** Merged messages — English defaults overlaid with any caller overrides. */
  protected readonly t = computed<PickListMessages>(() => ({
    ...defaultPickListMessages,
    ...this.messages(),
  }));
  protected readonly sourceSel = signal<Set<ItemKey>>(new Set());
  protected readonly targetSel = signal<Set<ItemKey>>(new Set());

  private readonly lists = computed<PickListValue<T>>(() => this.value() ?? this.defaultValue());
  protected readonly source = computed(() => this.lists().source);
  protected readonly target = computed(() => this.lists().target);
  protected readonly rootClass = computed(() =>
    cn("flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch", this.classInput()),
  );

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly message = signal("");
  private flip = false;

  protected isDisabled(item: T): boolean {
    const fn = this.isItemDisabled();
    return !!fn && fn(item);
  }
  /** True when a list has at least one enabled item (drives the move-all buttons). */
  protected readonly sourceHasEnabled = computed(() => this.source().some((i) => !this.isDisabled(i)));
  protected readonly targetHasEnabled = computed(() => this.target().some((i) => !this.isDisabled(i)));

  protected setLists(next: PickListValue<T>): void {
    this.value.set(next);
  }

  private listLabel(to: "source" | "target"): string {
    const h = to === "target" ? this.targetHeader() : this.sourceHeader();
    if (h) return h;
    return to === "target" ? this.t().targetLabel : this.t().sourceLabel;
  }
  // emit the transfer, announce it to screen readers, and keep keyboard focus in
  // the transfer group if the pressed button becomes disabled.
  private afterTransfer(moving: T[], to: "source" | "target"): void {
    this.transfer.emit({ moved: moving, to });
    this.flip = !this.flip;
    this.message.set(this.t().transferAnnouncement(moving.length, this.listLabel(to)) + (this.flip ? "" : " "));
    setTimeout(() => {
      const el = this.host.nativeElement;
      const grp = el.querySelector<HTMLElement>("[data-transfer-group]");
      if (!grp) return;
      const active = el.ownerDocument.activeElement as HTMLElement | null;
      const lost = !active || active === el.ownerDocument.body || (active as HTMLButtonElement).disabled;
      if (lost) grp.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
    });
  }

  protected toggleSel(sel: typeof this.sourceSel, key: ItemKey): void {
    sel.update((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  protected toTarget(): void {
    const k = this.itemKey();
    const sel = this.sourceSel();
    const moving = this.source().filter((i) => sel.has(k(i)) && !this.isDisabled(i));
    if (moving.length === 0) return;
    const movingKeys = new Set(moving.map(k));
    this.setLists({ source: this.source().filter((i) => !movingKeys.has(k(i))), target: [...this.target(), ...moving] });
    this.sourceSel.set(new Set());
    this.afterTransfer(moving, "target");
  }
  protected toSource(): void {
    const k = this.itemKey();
    const sel = this.targetSel();
    const moving = this.target().filter((i) => sel.has(k(i)) && !this.isDisabled(i));
    if (moving.length === 0) return;
    const movingKeys = new Set(moving.map(k));
    this.setLists({ source: [...this.source(), ...moving], target: this.target().filter((i) => !movingKeys.has(k(i))) });
    this.targetSel.set(new Set());
    this.afterTransfer(moving, "source");
  }
  protected allToTarget(): void {
    const moving = this.source().filter((i) => !this.isDisabled(i)); // locked items stay put
    if (moving.length === 0) return;
    this.setLists({ source: this.source().filter((i) => this.isDisabled(i)), target: [...this.target(), ...moving] });
    this.sourceSel.set(new Set());
    this.afterTransfer(moving, "target");
  }
  protected allToSource(): void {
    const moving = this.target().filter((i) => !this.isDisabled(i));
    if (moving.length === 0) return;
    this.setLists({ source: [...this.source(), ...moving], target: this.target().filter((i) => this.isDisabled(i)) });
    this.targetSel.set(new Set());
    this.afterTransfer(moving, "source");
  }
}
