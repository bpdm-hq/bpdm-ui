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
  nextListId,
} from "./list-internals";

/**
 * `<bpdm-selectable-list>` — scrollable, selectable, filterable, optionally
 * drag-sortable list body. Shared by `OrderList` and `PickList`. Items render
 * through an `itemTemplate` (`<ng-template let-item>`).
 *
 * Implements the WAI-ARIA listbox keyboard pattern: the listbox is the single
 * tab stop, a roving `aria-activedescendant` tracks the active option, and
 * Up/Down/Home/End move it while Enter/Space toggle selection.
 */
@Component({
  selector: "bpdm-selectable-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: "flex min-w-0 flex-1" },
  template: `
    <div class="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card">
      @if (header()) {
        <div [id]="headerId()" class="border-b border-border px-3 py-2 text-sm font-semibold">{{ header() }}</div>
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

      <div
        role="listbox"
        [attr.aria-multiselectable]="multiselectable() ? true : null"
        [attr.aria-labelledby]="headerId()"
        [attr.aria-label]="listAriaLabel()"
        tabindex="0"
        [attr.aria-activedescendant]="activeDescendant()"
        (focus)="onFocus()"
        (blur)="focused.set(false)"
        (keydown)="onListKey($event)"
        class="group/lb min-h-0 flex-1 overflow-y-auto p-1 outline-none"
        [style.max-height]="scrollHeight()"
      >
        @if (shown().length === 0) {
          <div class="px-3 py-6 text-center text-sm text-muted-foreground">{{ emptyText() }}</div>
        } @else {
          @for (item of shown(); track keyOf()(item)) {
            @let key = keyOf()(item);
            <div
              [id]="optionId(key)"
              role="option"
              [attr.aria-selected]="selected().has(key)"
              [attr.aria-disabled]="isDisabled(item) ? true : null"
              [attr.draggable]="canDrag() && !isDisabled(item) ? true : null"
              (click)="onOptionClick(key, item)"
              (dragstart)="canDrag() && !isDisabled(item) ? dragKey.set(key) : null"
              (dragover)="onDragOver($event, key)"
              (dragleave)="onDragLeave(key)"
              (dragend)="dragKey.set(null); overKey.set(null)"
              (drop)="onDrop($event, key)"
              [class]="rowClass(key, item)"
            >
              @if (canDrag() && !isDisabled(item)) {
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
  /** Whether more than one option can be selected (drives `aria-multiselectable`). */
  readonly multiselectable = input(false, { transform: booleanAttribute });
  /** Accessible name for the listbox when there is no visible `header`. */
  readonly ariaLabel = input<string>("");
  /** Predicate marking an item as disabled — not selectable, draggable, or keyboard-active. */
  readonly isItemDisabled = input<((item: T) => boolean) | undefined>(undefined);

  readonly toggle = output<{ key: ItemKey; item: T }>();
  readonly reorder = output<T[]>();

  protected readonly query = signal("");
  protected readonly dragKey = signal<ItemKey | null>(null);
  protected readonly overKey = signal<ItemKey | null>(null);
  // roving active option for the listbox keyboard pattern
  protected readonly activeKey = signal<ItemKey | null>(null);
  protected readonly focused = signal(false);

  private readonly baseId = nextListId();
  protected optionId(k: ItemKey): string {
    return `${this.baseId}-opt-${String(k)}`;
  }
  protected readonly headerId = computed(() => (this.header() ? `${this.baseId}-label` : null));
  protected readonly listAriaLabel = computed(() =>
    this.header() ? null : this.ariaLabel() || "Orderable list",
  );

  private readonly filtering = computed(() => !!this.filterBy() && this.query().trim() !== "");
  protected readonly canDrag = computed(() => this.reorderable() && !this.filtering());
  protected readonly shown = computed(() => {
    const fb = this.filterBy();
    if (!this.filtering() || !fb) return this.items();
    const q = this.query().trim().toLowerCase();
    return this.items().filter((i) => fb(i).toLowerCase().includes(q));
  });

  protected readonly activeIndex = computed(() => {
    const ak = this.activeKey();
    if (ak == null) return -1;
    const k = this.keyOf();
    return this.shown().findIndex((i) => k(i) === ak);
  });
  protected readonly activeDescendant = computed(() => {
    const idx = this.activeIndex();
    if (idx < 0) return null;
    return this.optionId(this.keyOf()(this.shown()[idx]));
  });

  protected isOver(key: ItemKey): boolean {
    return this.dragKey() !== null && this.overKey() === key && this.dragKey() !== key;
  }

  protected isDisabled(item: T): boolean {
    const fn = this.isItemDisabled();
    return !!fn && fn(item);
  }

  // first / next enabled option in a direction (keyboard nav skips disabled rows)
  private findEnabled(start: number, dir: 1 | -1): number {
    const list = this.shown();
    for (let i = start; i >= 0 && i < list.length; i += dir) {
      if (!this.isDisabled(list[i])) return i;
    }
    return -1;
  }
  private setActiveTo(idx: number): void {
    if (idx >= 0) this.activeKey.set(this.keyOf()(this.shown()[idx]));
  }

  protected rowClass(key: ItemKey, item: T): string {
    const disabled = this.isDisabled(item);
    const isSel = this.selected().has(key);
    const isActive = this.activeKey() === key;
    const over = this.isOver(key);
    // selection + drop-target keep the bar always; the keyboard-active bar shows
    // ONLY while the list is keyboard-focused (:focus-visible), so a mouse
    // click/deselect never leaves a lingering accent on a non-selected row.
    const solidAccent = !disabled && (isSel || over);
    const kbdAccent = !disabled && isActive && !isSel && !over;
    return cn(
      "group relative flex items-center gap-2 overflow-hidden rounded-[calc(var(--radius)-3px)] px-2.5 py-2 text-sm transition-[background-color,transform] duration-[var(--bpdm-duration-fast)]",
      // gentle settle-in when an item is added / transferred into this list
      "animate-[bpdm-list-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] motion-reduce:animate-none",
      // primary inline-start accent bar is the single visual language — it marks the
      // selection, the keyboard-active option, AND the drag drop-target. RTL-safe.
      "before:absolute before:inset-y-0 before:start-0 before:w-1 before:rounded-s-[calc(var(--radius)-3px)] before:bg-primary before:transition-opacity",
      disabled
        ? "cursor-not-allowed text-muted-foreground opacity-60"
        : cn(
            "cursor-pointer active:scale-[0.99]",
            isSel
              ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-foreground"
              : "text-foreground hover:bg-muted",
          ),
      solidAccent ? "before:opacity-100" : "before:opacity-0",
      // keyboard-active accent: only when the listbox itself is focus-visible
      kbdAccent && "group-focus-visible/lb:before:opacity-100",
      this.dragKey() === key && "opacity-50",
    );
  }

  protected onOptionClick(key: ItemKey, item: T): void {
    if (this.isDisabled(item)) return;
    this.activeKey.set(key);
    this.toggle.emit({ key, item });
  }

  protected onFocus(): void {
    this.focused.set(true);
    if (this.activeIndex() < 0) this.setActiveTo(this.findEnabled(0, 1));
  }

  protected onListKey(e: KeyboardEvent): void {
    const idx = this.activeIndex();
    const len = this.shown().length;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.setActiveTo(this.findEnabled(idx < 0 ? 0 : idx + 1, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        this.setActiveTo(this.findEnabled(idx < 0 ? len - 1 : idx - 1, -1));
        break;
      case "Home":
        e.preventDefault();
        this.setActiveTo(this.findEnabled(0, 1));
        break;
      case "End":
        e.preventDefault();
        this.setActiveTo(this.findEnabled(len - 1, -1));
        break;
      case "Enter":
      case " ": {
        if (idx < 0) break;
        const it = this.shown()[idx];
        if (this.isDisabled(it)) break;
        e.preventDefault();
        this.toggle.emit({ key: this.keyOf()(it), item: it });
        break;
      }
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
