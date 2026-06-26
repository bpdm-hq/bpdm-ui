import { ChangeDetectionStrategy, Component, computed, input, model, signal, TemplateRef } from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  type ItemKey,
  type ItemKeyFn,
  type ItemTextFn,
  type ListItemContext,
} from "./list-internals";
import { BpdmReorderControls } from "./reorder-controls";
import { BpdmSelectableList } from "./selectable-list";

/**
 * `<bpdm-order-list>` — reorder a collection: select one or more items, then move
 * them up / to top / down / to bottom with the control column, or drag to reorder.
 * Controlled (`[(value)]`) or uncontrolled (`defaultValue`); filterable; responsive
 * (the controls sit beside the list and stack above it on small screens).
 *
 * ```html
 * <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" />
 * <ng-template #tpl let-item>{{ item }}</ng-template>
 * ```
 */
@Component({
  selector: "bpdm-order-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  imports: [BpdmReorderControls, BpdmSelectableList],
  template: `
    <div [class]="rootClass()">
      <bpdm-reorder-controls
        [items]="items()"
        [itemKey]="itemKey()"
        [selected]="selected()"
        (reorder)="setItems($event)"
      />
      <bpdm-selectable-list
        class="flex-1"
        [items]="items()"
        [keyOf]="itemKey()"
        [itemTemplate]="itemTemplate()"
        [selected]="selected()"
        [reorderable]="dragdrop()"
        [header]="header()"
        [filterBy]="filterBy()"
        [filterPlaceholder]="filterPlaceholder()"
        [scrollHeight]="scrollHeight()"
        (toggle)="onToggle($event.key)"
        (reorder)="setItems($event)"
      />
    </div>
  `,
})
export class BpdmOrderList<T = unknown> {
  /** Controlled / uncontrolled ordered list — `[(value)]`. */
  readonly value = model<T[] | undefined>(undefined);
  readonly defaultValue = input<T[]>([]);
  readonly itemKey = input.required<ItemKeyFn<T>>();
  readonly itemTemplate = input.required<TemplateRef<ListItemContext<T>>>();
  readonly header = input<string>("");
  readonly filterBy = input<ItemTextFn<T> | undefined>(undefined);
  readonly filterPlaceholder = input<string>("Filter");
  /** Enable drag-and-drop reordering. Default true. */
  readonly dragdrop = input(true);
  /** "single" (default) or "multiple" — move several together with the controls. */
  readonly selectionMode = input<"single" | "multiple">("single");
  readonly scrollHeight = input<string>("18rem");
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly selected = signal<Set<ItemKey>>(new Set());
  protected readonly items = computed<T[]>(() => this.value() ?? this.defaultValue());
  protected readonly rootClass = computed(() =>
    cn("flex flex-col gap-2 sm:flex-row sm:items-start", this.classInput()),
  );

  protected setItems(next: T[]): void {
    this.value.set(next);
  }

  protected onToggle(key: ItemKey): void {
    this.selected.update((prev) => {
      if (this.selectionMode() === "single") {
        return prev.has(key) && prev.size === 1 ? new Set() : new Set([key]);
      }
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
}
