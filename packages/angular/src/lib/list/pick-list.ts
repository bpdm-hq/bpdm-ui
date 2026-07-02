import { ChangeDetectionStrategy, Component, computed, input, model, signal, TemplateRef } from "@angular/core";
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
          class="self-center lg:self-start"
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
        emptyText="No items"
        (toggle)="toggleSel(sourceSel, $event.key)"
        (reorder)="setLists({ source: $event, target: target() })"
      />

      <div class="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <button type="button" aria-label="Move to target" title="Move to target" [class]="btn" [disabled]="sourceSel().size === 0" (click)="toTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move all to target" title="Move all to target" [class]="btn" [disabled]="source().length === 0" (click)="allToTarget()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 5 5-5 5M13 7l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move to source" title="Move to source" [class]="btn" [disabled]="targetSel().size === 0" (click)="toSource()">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Move all to source" title="Move all to source" [class]="btn" [disabled]="target().length === 0" (click)="allToSource()">
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
        emptyText="Nothing here yet"
        (toggle)="toggleSel(targetSel, $event.key)"
        (reorder)="setLists({ source: source(), target: $event })"
      />

      @if (reorder()) {
        <bpdm-reorder-controls
          class="self-center lg:self-start"
          [items]="target()"
          [itemKey]="itemKey()"
          [selected]="targetSel()"
          (reorder)="setLists({ source: source(), target: $event })"
        />
      }
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
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly btn = CONTROL_BTN_CLASS;
  protected readonly sourceSel = signal<Set<ItemKey>>(new Set());
  protected readonly targetSel = signal<Set<ItemKey>>(new Set());

  private readonly lists = computed<PickListValue<T>>(() => this.value() ?? this.defaultValue());
  protected readonly source = computed(() => this.lists().source);
  protected readonly target = computed(() => this.lists().target);
  protected readonly rootClass = computed(() =>
    cn("flex flex-col items-stretch gap-2 lg:flex-row lg:items-start", this.classInput()),
  );

  protected setLists(next: PickListValue<T>): void {
    this.value.set(next);
  }

  protected toggleSel(sel: typeof this.sourceSel, key: ItemKey): void {
    sel.update((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  private moveSelected(from: T[], to: T[], sel: Set<ItemKey>): { from: T[]; to: T[] } | null {
    const k = this.itemKey();
    const moving = from.filter((i) => sel.has(k(i)));
    if (moving.length === 0) return null;
    return { from: from.filter((i) => !sel.has(k(i))), to: [...to, ...moving] };
  }

  protected toTarget(): void {
    const r = this.moveSelected(this.source(), this.target(), this.sourceSel());
    if (!r) return;
    this.setLists({ source: r.from, target: r.to });
    this.sourceSel.set(new Set());
  }
  protected toSource(): void {
    const r = this.moveSelected(this.target(), this.source(), this.targetSel());
    if (!r) return;
    this.setLists({ source: r.to, target: r.from });
    this.targetSel.set(new Set());
  }
  protected allToTarget(): void {
    if (this.source().length === 0) return;
    this.setLists({ source: [], target: [...this.target(), ...this.source()] });
    this.sourceSel.set(new Set());
  }
  protected allToSource(): void {
    if (this.target().length === 0) return;
    this.setLists({ source: [...this.source(), ...this.target()], target: [] });
    this.targetSel.set(new Set());
  }
}
