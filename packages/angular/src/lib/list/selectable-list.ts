import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  TemplateRef,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import {
  type ItemKey,
  type ItemKeyFn,
  type ItemTextFn,
  type ListItemContext,
  moveItem,
} from "./list-internals";

/**
 * `<bpdm-selectable-list>` — scrollable, selectable, filterable, optionally
 * drag-sortable list body. Shared by `OrderList` and `PickList`. Items render
 * through an `itemTemplate` (`<ng-template let-item>`).
 */
@Component({
  selector: "bpdm-selectable-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: "flex min-w-0 flex-1" },
  template: `
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card">
      @if (header()) {
        <div class="border-b border-border px-3 py-2 text-sm font-semibold">{{ header() }}</div>
      }

      @if (filterBy()) {
        <div class="flex items-center gap-2 border-b border-border px-3">
          <svg viewBox="0 0 16 16" fill="none" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" />
            <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          </svg>
          <input
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            [attr.placeholder]="filterPlaceholder()"
            [attr.aria-label]="filterPlaceholder()"
            class="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      }

      <div role="listbox" aria-multiselectable="true" class="overflow-y-auto p-1" [style.max-height]="scrollHeight()">
        @if (shown().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          @for (item of shown(); track keyOf()(item)) {
            @let key = keyOf()(item);
            <div
              role="option"
              [attr.aria-selected]="selected().has(key)"
              tabindex="0"
              [attr.draggable]="canDrag() ? true : null"
              (click)="toggle.emit({ key, item })"
              (keydown)="onKey($event, key, item)"
              (dragstart)="canDrag() ? dragKey.set(key) : null"
              (dragover)="onDragOver($event, key)"
              (dragleave)="onDragLeave(key)"
              (dragend)="dragKey.set(null); overKey.set(null)"
              (drop)="onDrop($event, key)"
              [class]="rowClass(key)"
              [style.box-shadow]="isOver(key) ? 'inset 0 2px 0 0 var(--primary)' : null"
            >
              @if (canDrag()) {
                <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 cursor-grab text-muted-foreground/50 transition-colors active:cursor-grabbing group-hover:text-muted-foreground" aria-hidden="true">
                  <circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="18" r="1" fill="currentColor" />
                  <circle cx="15" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" />
                </svg>
              }
              <div class="min-w-0 flex-1">
                <ng-container [ngTemplateOutlet]="itemTemplate()" [ngTemplateOutletContext]="{ $implicit: item, item }" />
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class BpdmSelectableList<T = unknown> {
  readonly items = input<T[]>([]);
  readonly keyOf = input.required<ItemKeyFn<T>>();
  readonly itemTemplate = input.required<TemplateRef<ListItemContext<T>>>();
  readonly selected = input<Set<ItemKey>>(new Set());
  /** Enable drag reordering (the parent emits the new order). Off while filtering. */
  readonly reorderable = input(false, { transform: booleanAttribute });
  readonly header = input<string>("");
  readonly filterBy = input<ItemTextFn<T> | undefined>(undefined);
  readonly filterPlaceholder = input<string>("Filter");
  readonly scrollHeight = input<string>("18rem");
  readonly emptyText = input<string>("No items");

  readonly toggle = output<{ key: ItemKey; item: T }>();
  readonly reorder = output<T[]>();

  protected readonly query = signal("");
  protected readonly dragKey = signal<ItemKey | null>(null);
  protected readonly overKey = signal<ItemKey | null>(null);

  private readonly filtering = computed(() => !!this.filterBy() && this.query().trim() !== "");
  protected readonly canDrag = computed(() => this.reorderable() && !this.filtering());
  protected readonly shown = computed(() => {
    const fb = this.filterBy();
    if (!this.filtering() || !fb) return this.items();
    const q = this.query().trim().toLowerCase();
    return this.items().filter((i) => fb(i).toLowerCase().includes(q));
  });

  protected isOver(key: ItemKey): boolean {
    return this.dragKey() !== null && this.overKey() === key && this.dragKey() !== key;
  }

  protected rowClass(key: ItemKey): string {
    const isSel = this.selected().has(key);
    return cn(
      "group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-[calc(var(--radius)-3px)] px-2.5 py-2 text-sm outline-none transition-[background-color,transform] duration-[var(--bpdm-duration-fast)] active:scale-[0.99]",
      "focus-visible:ring-2 focus-visible:ring-ring",
      "before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[calc(var(--radius)-3px)] before:bg-primary before:transition-opacity",
      isSel
        ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-foreground before:opacity-100"
        : "text-foreground hover:bg-muted before:opacity-0",
      this.dragKey() === key && "opacity-50",
    );
  }

  protected onKey(e: KeyboardEvent, key: ItemKey, item: T): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggle.emit({ key, item });
    }
  }

  protected onDragOver(e: DragEvent, key: ItemKey): void {
    if (!this.canDrag()) return;
    e.preventDefault();
    this.overKey.set(key);
  }
  protected onDragLeave(key: ItemKey): void {
    if (this.overKey() === key) this.overKey.set(null);
  }
  protected onDrop(e: DragEvent, targetKey: ItemKey): void {
    e.preventDefault();
    const dragKey = this.dragKey();
    if (dragKey != null && dragKey !== targetKey) {
      const items = this.items();
      const k = this.keyOf();
      const from = items.findIndex((i) => k(i) === dragKey);
      const to = items.findIndex((i) => k(i) === targetKey);
      if (from > -1 && to > -1) this.reorder.emit(moveItem(items, from, to));
    }
    this.dragKey.set(null);
    this.overKey.set(null);
  }
}
