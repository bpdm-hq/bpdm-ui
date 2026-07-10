import { ChangeDetectionStrategy, Component, computed, input, model, signal, TemplateRef } from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  type ItemKey,
  type ItemKeyFn,
  type ItemTextFn,
  type ListItemContext,
  type MoveKind,
} from "./list-internals";
import { BpdmReorderControls } from "./reorder-controls";
import { BpdmSelectableList } from "./selectable-list";

/**
 * Every screen-reader string OrderList renders — pass a partial to translate.
 * Defaults are English; merged once with {@link DEFAULT_ORDER_LIST_MESSAGES}.
 */
export interface OrderListMessages {
  /** Accessible name for the reorder control group. */
  reorderGroup: string;
  /** Reorder button labels (aria-label + tooltip). */
  moveUp: string;
  moveToTop: string;
  moveDown: string;
  moveToBottom: string;
  /** Live-region text announced after each successful move. */
  movedUp: string;
  movedToTop: string;
  movedDown: string;
  movedToBottom: string;
  /** Empty-state text. */
  empty: string;
  /** Accessible name for the list when there's no visible `header`. */
  listLabel: string;
}

export const DEFAULT_ORDER_LIST_MESSAGES: OrderListMessages = {
  reorderGroup: "Reorder",
  moveUp: "Move up",
  moveToTop: "Move to top",
  moveDown: "Move down",
  moveToBottom: "Move to bottom",
  movedUp: "Moved up one position",
  movedToTop: "Moved to top",
  movedDown: "Moved down one position",
  movedToBottom: "Moved to bottom",
  empty: "No items",
  listLabel: "Orderable list",
};

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
        [labels]="{ group: t().reorderGroup, up: t().moveUp, top: t().moveToTop, down: t().moveDown, bottom: t().moveToBottom }"
        (reorder)="setItems($event)"
        (moved)="announce($event)"
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
        [multiselectable]="selectionMode() === 'multiple'"
        [ariaLabel]="ariaLabel() || t().listLabel"
        [emptyText]="t().empty"
        [isItemDisabled]="isItemDisabled()"
        (toggle)="onToggle($event.key)"
        (reorder)="setItems($event)"
      />

      <div role="status" aria-live="polite" class="sr-only">{{ message() }}</div>
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
  /** Accessible name for the list when there is no visible `header`. */
  readonly ariaLabel = input<string>("");
  /** Predicate marking an item as disabled — not selectable, movable, or draggable. */
  readonly isItemDisabled = input<((item: T) => boolean) | undefined>(undefined);
  /** Override the built-in screen-reader strings for i18n. */
  readonly messages = input<Partial<OrderListMessages>>({});
  readonly classInput = input<string>("", { alias: "class" });

  protected readonly selected = signal<Set<ItemKey>>(new Set());
  protected readonly items = computed<T[]>(() => this.value() ?? this.defaultValue());
  protected readonly message = signal("");
  protected readonly t = computed<OrderListMessages>(() => ({
    ...DEFAULT_ORDER_LIST_MESSAGES,
    ...this.messages(),
  }));
  private flip = false;
  protected readonly rootClass = computed(() =>
    cn("flex flex-col gap-2 sm:flex-row sm:items-center", this.classInput()),
  );

  protected setItems(next: T[]): void {
    this.value.set(next);
  }

  // Toggle a trailing space so repeating the same action still changes the text
  // node and is re-announced by the polite live region.
  protected announce(kind: MoveKind): void {
    this.flip = !this.flip;
    const t = this.t();
    const moved: Record<MoveKind, string> = {
      up: t.movedUp,
      top: t.movedToTop,
      down: t.movedDown,
      bottom: t.movedToBottom,
    };
    this.message.set(moved[kind] + (this.flip ? "" : " "));
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
