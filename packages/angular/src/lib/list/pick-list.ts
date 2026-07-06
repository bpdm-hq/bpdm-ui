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
        [filterPlaceholder]="filterPlaceholder()"
        [scrollHeight]="scrollHeight()"
        [multiselectable]="true"
        [emptyText]="sourceEmptyText()"
        [isItemDisabled]="isItemDisabled()"
        (toggle)="toggleSel(sourceSel, $event.key)"
        (reorder)="setLists({ source: $event, target: target() })"
      />

      <div data-transfer-group role="group" aria-label="Transfer between lists" class="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <button type="button" aria-label="Move to target" title="Move to target" [class]="btn" [disabled]="sourceSel().size === 0" (click)="toTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move all to target" title="Move all to target" [class]="btn" [disabled]="!sourceHasEnabled()" (click)="allToTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 5 5-5 5M13 7l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move to source" title="Move to source" [class]="btn" [disabled]="targetSel().size === 0" (click)="toSource()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move all to source" title="Move all to source" [class]="btn" [disabled]="!targetHasEnabled()" (click)="allToSource()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m17 7-5 5 5 5M11 7l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
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
        [filterPlaceholder]="filterPlaceholder()"
        [scrollHeight]="scrollHeight()"
        [multiselectable]="true"
        [emptyText]="targetEmptyText()"
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
  readonly filterPlaceholder = input<string>("Filter");
  /** Show the reorder controls beside each list + within-list drag. Default true. */
  readonly reorder = input(true);
  readonly scrollHeight = input<string>("18rem");
  /** Empty-state text for the source list (default "No items"). */
  readonly sourceEmptyText = input<string>("No items");
  /** Empty-state text for the target list (default "Nothing here yet"). */
  readonly targetEmptyText = input<string>("Nothing here yet");
  /** Predicate marking an item as disabled — not selectable, transferable, or draggable. */
  readonly isItemDisabled = input<((item: T) => boolean) | undefined>(undefined);
  readonly classInput = input<string>("", { alias: "class" });

  /** Fired after a transfer, with the moved items and which list they landed in. */
  readonly transfer = output<{ moved: T[]; to: "source" | "target" }>();

  protected readonly btn = CONTROL_BTN_CLASS;
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
    return h || `${to} list`;
  }
  // emit the transfer, announce it to screen readers, and keep keyboard focus in
  // the transfer group if the pressed button becomes disabled.
  private afterTransfer(moving: T[], to: "source" | "target"): void {
    this.transfer.emit({ moved: moving, to });
    this.flip = !this.flip;
    const noun = moving.length === 1 ? "item" : "items";
    this.message.set(`${moving.length} ${noun} moved to ${this.listLabel(to)}` + (this.flip ? "" : " "));
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
