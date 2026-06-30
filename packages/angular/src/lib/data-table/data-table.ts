import { NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  type OnDestroy,
  output,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from "@angular/core";
import { cn } from "@bpdm/variants";
import { BpdmButton } from "../button/button";
import { BpdmCheckbox } from "../checkbox/checkbox";
import { BpdmMultiSelect } from "../multi-select/multi-select";
import { BpdmColumnFilterMenu } from "./column-filter-menu";
import { BpdmColumnPinMenu } from "./column-pin-menu";
import {
  type CellContext,
  type ColumnFilter,
  compareValues,
  type DataTableColumn,
  type DataTablePagination,
  type DataTableSort,
  evalRule,
  getSortValue,
  nextDirection,
  pageList,
  type RowClassFn,
  type RowClickFn,
  type RowKeyFn,
  type RowPredicate,
  type SortDirection,
} from "./data-table-types";

type Key = string | number;

const CELL_PAD: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-2.5 text-sm",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};
const ALIGN_CLASS = { left: "text-left", center: "text-center", right: "text-right" } as const;
const JUSTIFY_CLASS = { left: "justify-start", center: "justify-center", right: "justify-end" } as const;
const FOOTER_JUSTIFY = { between: "justify-between", center: "justify-center", end: "justify-end" } as const;

interface RenderRow<T> {
  row: T;
  index: number;
  key: Key;
}

/**
 * `<bpdm-data-table>` — data-driven table. Describe `columns` and pass `data`;
 * density, striping, borders, sticky header, scrolling, empty state, sorting,
 * selection, pagination, expandable rows, frozen columns, a column toggle, global
 * search, per-column filters, virtualization and drag-reordering are all props.
 *
 * Custom cells use an `<ng-template>` referenced from the column's `cell`; plain
 * value columns use `accessor`. Mirrors the React `DataTable`.
 */
@Component({
  selector: "bpdm-data-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block w-full" },
  imports: [NgTemplateOutlet, BpdmButton, BpdmCheckbox, BpdmMultiSelect, BpdmColumnFilterMenu, BpdmColumnPinMenu],
  template: `
    @let cols = orderedColumns();
    @let rows = pageRows();

    @if (showToolbar()) {
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          @if (query() || hasActiveFilters()) {
            <button bpdmButton variant="secondary" appearance="outline" size="sm" class="gap-1.5" (click)="clearAll()">
              <svg viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
                <path d="M2 3.5h12l-4.6 5.4v3.6l-2.8 1.4V8.9L2 3.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
              </svg>
              Clear
            </button>
          }
          @if (orderChanged()) {
            <button bpdmButton variant="secondary" appearance="ghost" size="sm" (click)="resetColumns()">Reset columns</button>
          }
        </div>
        <div class="flex items-center gap-2">
          @if (columnToggle() && toggleable().length > 0) {
            <div class="w-48">
              <bpdm-multi-select
                size="sm"
                [maxDisplay]="0"
                [selectAll]="false"
                searchable
                placeholder="Columns"
                [options]="toggleOptions()"
                [value]="visibleToggleIds()"
                (valueChange)="onToggleColumns($event)"
              />
            </div>
          }
          @if (searchable()) {
            <div class="relative">
              <svg viewBox="0 0 16 16" fill="none" class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" />
                <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              <input
                type="text"
                [value]="query()"
                (input)="query.set($any($event.target).value)"
                [attr.placeholder]="searchPlaceholder()"
                aria-label="Search"
                class="h-9 w-56 rounded-[var(--radius)] border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          }
        </div>
      </div>
    }

    @if (responsive() && isMobile()) {
      <!-- responsive card layout -->
      <div class="space-y-3">
        @if (rows.length === 0) {
          <div class="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">{{ emptyContent() }}</div>
        } @else {
          @for (rr of rows; track rr.key) {
            <div
              [attr.data-selected]="selectedSet().has(rr.key) ? '' : null"
              (click)="clickable() ? onRowClick()!(rr.row, rr.index) : null"
              [class]="cardClass(rr)"
            >
              @if (selectable() || canExpand(rr.row)) {
                <div class="mb-3 flex items-center justify-between" (click)="$event.stopPropagation()">
                  @if (selectable()) {
                    @if (selectionMode() === "single") {
                      <button type="button" role="radio" [attr.aria-checked]="selectedSet().has(rr.key)" aria-label="Select row" (click)="toggleRow(rr.key)" [class]="radioClass(selectedSet().has(rr.key))">
                        @if (selectedSet().has(rr.key)) { <span class="size-2.5 rounded-full bg-primary"></span> }
                      </button>
                    } @else {
                      <bpdm-checkbox size="sm" aria-label="Select row" [checked]="selectedSet().has(rr.key)" (checkedChange)="toggleRow(rr.key)" />
                    }
                  } @else {
                    <span></span>
                  }
                  @if (canExpand(rr.row)) {
                    <button type="button" [attr.aria-label]="expandedSet().has(rr.key) ? 'Collapse' : 'Expand'" [attr.aria-expanded]="expandedSet().has(rr.key)" (click)="toggleExpand(rr.key)" class="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <svg viewBox="0 0 16 16" [class]="'size-4 transition-transform ' + (expandedSet().has(rr.key) ? 'rotate-90' : '')" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                    </button>
                  }
                </div>
              }
              <dl class="grid grid-cols-[minmax(5rem,auto)_1fr] gap-x-3 gap-y-1.5 text-sm">
                @for (col of cols; track col.id) {
                  <dt class="truncate text-muted-foreground">{{ col.header ?? col.id }}</dt>
                  <dd [class]="'min-w-0 text-right ' + (col.numeric ? 'tabular-nums' : '')">
                    @if (col.cell) {
                      <ng-container [ngTemplateOutlet]="col.cell" [ngTemplateOutletContext]="cellCtx(rr)" />
                    } @else {
                      {{ col.accessor ? col.accessor(rr.row) : null }}
                    }
                  </dd>
                }
              </dl>
              @if (expandedSet().has(rr.key) && expandedTemplate()) {
                <div class="mt-3 border-t border-border pt-3">
                  <ng-container [ngTemplateOutlet]="expandedTemplate()!" [ngTemplateOutletContext]="cellCtx(rr)" />
                </div>
              }
            </div>
          }
        }
      </div>
      @if (footerModel()) { <ng-container [ngTemplateOutlet]="footerTpl" /> }
    } @else {
      <div [class]="frameClass()">
        <div
          #scrollEl
          class="overflow-auto"
          [style.max-height]="scrollMaxHeight()"
          (scroll)="onScroll(scrollEl)"
        >
          <table [attr.aria-label]="label() || null" [class]="tableClass()" [style.border-spacing]="rowSpacing() ? '0 ' + rowSpacing() + 'px' : null">
            <thead>
              <tr #headRow>
                @if (reorderableRows()) {
                  <th scope="col" aria-label="Reorder" [class]="leadHeadClass(false)"></th>
                }
                @if (expandable()) {
                  <th scope="col" aria-label="Expand" data-pin-id="__lead_expand"
                    [class]="leadHeadClass(true)"
                    [style.position]="hasLeftPin() || stickyHeader() ? 'sticky' : null"
                    [style.left.px]="hasLeftPin() ? pinPx().left['__lead_expand'] : null"
                    [style.top.px]="stickyHeader() ? 0 : null"></th>
                }
                @if (selectable()) {
                  <th scope="col" data-pin-id="__lead_select"
                    [class]="leadHeadClass(true) + ' text-muted-foreground'"
                    [style.position]="hasLeftPin() || stickyHeader() ? 'sticky' : null"
                    [style.left.px]="hasLeftPin() ? pinPx().left['__lead_select'] : null"
                    [style.top.px]="stickyHeader() ? 0 : null">
                    @if (selectionMode() === "multiple") {
                      <div class="flex justify-center">
                        <bpdm-checkbox size="sm" aria-label="Select all rows" [checked]="allSelected()" [indeterminate]="someSelected()" (checkedChange)="toggleAll()" />
                      </div>
                    }
                  </th>
                }
                @for (col of cols; track col.id; let ci = $index) {
                  <th
                    scope="col"
                    [attr.data-pin-id]="col.id"
                    [attr.draggable]="reorderableColumns() ? true : null"
                    (dragstart)="reorderableColumns() ? dragColId.set(col.id) : null"
                    (dragover)="reorderableColumns() ? $event.preventDefault() : null"
                    (drop)="onColDrop(col.id)"
                    (dragend)="dragColId.set(null)"
                    [attr.aria-sort]="ariaSort(col)"
                    [style.width]="colWidth(col)"
                    [style.position]="thPosition(col)"
                    [style.left.px]="col.pin === 'left' ? pinPx().left[col.id] : null"
                    [style.right.px]="col.pin === 'right' ? pinPx().right[col.id] : null"
                    [style.top.px]="stickyHeader() ? 0 : null"
                    [class]="headCellClass(col)"
                  >
                    <div class="flex items-center gap-1">
                      @if (col.sortable) {
                        <button type="button" (click)="handleSort(col.id, $event.shiftKey)" [class]="sortBtnClass(col)">
                          <span>{{ col.header ?? col.id }}</span>
                          @let dir = dirOf(col.id);
                          @if (dir === null) {
                            <svg viewBox="0 0 16 16" class="size-3.5 shrink-0 opacity-40" fill="none" aria-hidden="true"><path d="M5 6.5 8 3.5l3 3M5 9.5 8 12.5l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                          } @else {
                            <svg viewBox="0 0 16 16" class="size-3.5 shrink-0 text-primary" fill="none" aria-hidden="true"><path [attr.d]="dir === 'asc' ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                          }
                          @if (sortOrder(col.id) > 0) {
                            <span class="grid size-4 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">{{ sortOrder(col.id) }}</span>
                          }
                        </button>
                      } @else {
                        <span [class]="'flex-1 ' + alignClass(col)">{{ col.header ?? col.id }}</span>
                      }
                      @if (col.filterable) {
                        <bpdm-column-filter-menu
                          [type]="col.filterType ?? (col.numeric ? 'number' : 'text')"
                          [options]="filterOptionsFor(col)"
                          [filter]="filters()[col.id]"
                          (apply)="applyFilter(col.id, $event)"
                          (clear)="clearFilter(col.id)"
                        />
                      }
                      @if (pinnable() && !col.disablePinning) {
                        <bpdm-column-pin-menu [pin]="col.pin" (pinChange)="setPin(col.id, $event)" />
                      }
                    </div>
                  </th>
                }
              </tr>
            </thead>

            <tbody>
              @if (rows.length === 0) {
                <tr><td [attr.colspan]="colCount()" [class]="cellPad() + ' text-center text-muted-foreground'">{{ emptyContent() }}</td></tr>
              } @else {
                @if (virtualized() && padTop() > 0) {
                  <tr [style.height.px]="padTop()"><td [attr.colspan]="colCount()"></td></tr>
                }
                @for (rr of rows; track rr.key; let last = $last) {
                  <tr
                    [attr.data-selected]="selectedSet().has(rr.key) ? '' : null"
                    [attr.data-expanded]="expandedSet().has(rr.key) ? '' : null"
                    (dragover)="onRowDragOver($event, rr.key)"
                    (drop)="onRowDrop()"
                    (click)="clickable() ? onRowClick()!(rr.row, rr.index) : null"
                    [attr.tabindex]="clickable() ? 0 : null"
                    (keydown)="onRowKey($event, rr)"
                    [class]="rowClass(rr, last)"
                  >
                    @if (reorderableRows()) {
                      <td [class]="cellPad() + ' w-[1%] ' + (bordered() ? 'border-r border-border ' : '') + (cellClassName() || '')" (click)="$event.stopPropagation()">
                        <div
                          draggable="true"
                          (dragstart)="dragRowKey.set(rr.key)"
                          (dragend)="dragRowKey.set(null); dropTarget.set(null)"
                          aria-label="Drag to reorder"
                          [class]="'grid size-6 cursor-grab place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing ' + (dragRowKey() === rr.key ? 'opacity-40' : '')"
                        >
                          <svg viewBox="0 0 16 16" class="size-4" fill="none" aria-hidden="true"><path d="M5 4h.01M5 8h.01M5 12h.01M11 4h.01M11 8h.01M11 12h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
                        </div>
                      </td>
                    }
                    @if (expandable()) {
                      <td [class]="leadBodyClass()" [style.position]="hasLeftPin() ? 'sticky' : null" [style.left.px]="hasLeftPin() ? pinPx().left['__lead_expand'] : null" (click)="$event.stopPropagation()">
                        @if (canExpand(rr.row)) {
                          <button type="button" [attr.aria-label]="expandedSet().has(rr.key) ? 'Collapse row' : 'Expand row'" [attr.aria-expanded]="expandedSet().has(rr.key)" (click)="toggleExpand(rr.key)" class="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                            <svg viewBox="0 0 16 16" [class]="'size-4 transition-transform ' + (expandedSet().has(rr.key) ? 'rotate-90' : '')" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                          </button>
                        }
                      </td>
                    }
                    @if (selectable()) {
                      <td [class]="leadBodyClass()" [style.position]="hasLeftPin() ? 'sticky' : null" [style.left.px]="hasLeftPin() ? pinPx().left['__lead_select'] : null" (click)="$event.stopPropagation()">
                        <div class="flex justify-center">
                          @if (selectionMode() === "single") {
                            <button type="button" role="radio" [attr.aria-checked]="selectedSet().has(rr.key)" aria-label="Select row" (click)="toggleRow(rr.key)" [class]="radioClass(selectedSet().has(rr.key))">
                              @if (selectedSet().has(rr.key)) { <span class="size-2.5 rounded-full bg-primary"></span> }
                            </button>
                          } @else {
                            <bpdm-checkbox size="sm" aria-label="Select row" [checked]="selectedSet().has(rr.key)" (checkedChange)="toggleRow(rr.key)" />
                          }
                        </div>
                      </td>
                    }
                    @for (col of cols; track col.id) {
                      <td
                        [style.position]="col.pin ? 'sticky' : null"
                        [style.left.px]="col.pin === 'left' ? pinPx().left[col.id] : null"
                        [style.right.px]="col.pin === 'right' ? pinPx().right[col.id] : null"
                        [class]="bodyCellClass(col)"
                      >
                        @if (col.cell) {
                          <ng-container [ngTemplateOutlet]="col.cell" [ngTemplateOutletContext]="cellCtx(rr)" />
                        } @else {
                          {{ col.accessor ? col.accessor(rr.row) : null }}
                        }
                      </td>
                    }
                  </tr>
                  @if (expandedSet().has(rr.key) && expandedTemplate()) {
                    <tr [class]="'bg-muted/30 ' + (divided() ? 'border-t border-border' : '')">
                      <td [attr.colspan]="colCount()" [class]="cellPad()">
                        <ng-container [ngTemplateOutlet]="expandedTemplate()!" [ngTemplateOutletContext]="cellCtx(rr)" />
                      </td>
                    </tr>
                  }
                }
                @if (virtualized() && padBottom() > 0) {
                  <tr [style.height.px]="padBottom()"><td [attr.colspan]="colCount()"></td></tr>
                }
              }
            </tbody>

            @if (hasFooter()) {
              <tfoot>
                <tr>
                  @if (reorderableRows()) {
                    <td [class]="cellPad() + ' w-[1%] bg-muted shadow-[inset_0_1px_0_var(--border)] sticky bottom-0'"></td>
                  }
                  @if (expandable()) {
                    <td [class]="footLeadClass()" [style.position]="hasLeftPin() ? 'sticky' : 'sticky'" [style.left.px]="hasLeftPin() ? pinPx().left['__lead_expand'] : null"></td>
                  }
                  @if (selectable()) {
                    <td [class]="footLeadClass()" [style.position]="'sticky'" [style.left.px]="hasLeftPin() ? pinPx().left['__lead_select'] : null"></td>
                  }
                  @for (col of cols; track col.id) {
                    <td
                      [style.position]="col.pin ? 'sticky' : null"
                      [style.left.px]="col.pin === 'left' ? pinPx().left[col.id] : null"
                      [style.right.px]="col.pin === 'right' ? pinPx().right[col.id] : null"
                      [class]="footCellClass(col)"
                    >
                      @if (isTemplate(col.footer)) {
                        <ng-container [ngTemplateOutlet]="$any(col.footer)" [ngTemplateOutletContext]="{ $implicit: processedRows(), rows: processedRows() }" />
                      } @else {
                        {{ footerText(col) }}
                      }
                    </td>
                  }
                </tr>
              </tfoot>
            }
          </table>
        </div>
        @if (footerModel()) { <ng-container [ngTemplateOutlet]="footerTpl" /> }
      </div>
    }

    <!-- shared pagination footer -->
    <ng-template #footerTpl>
      @let fm = footerModel()!;
      <div [class]="footerClass(fm.align, fm.attached)">
        @if (fm.kind === "numbered") {
          <span class="text-muted-foreground">{{ fm.total === 0 ? "No results" : "Showing " + fm.rangeFrom + "–" + fm.rangeTo + " of " + fm.total }}</span>
          <div class="flex items-center gap-3">
            @if (fm.sizeOptions && fm.onSize) {
              <ng-container [ngTemplateOutlet]="sizeSelect" [ngTemplateOutletContext]="{ value: fm.pageSize, options: fm.sizeOptions, onChange: fm.onSize }" />
            }
            <div class="flex items-center gap-1">
              <button bpdmButton variant="secondary" appearance="ghost" size="iconSm" aria-label="Previous page" [disabled]="fm.page <= 1" (click)="fm.onPage(fm.page - 1)">
                <svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
              @for (p of fm.pages; track $index) {
                @if (p === "ellipsis") {
                  <span class="px-1 text-muted-foreground">…</span>
                } @else {
                  <button bpdmButton [variant]="p === fm.page ? 'primary' : 'secondary'" [appearance]="p === fm.page ? 'solid' : 'ghost'" size="sm" [attr.aria-current]="p === fm.page ? 'page' : null" (click)="fm.onPage($any(p))" class="min-w-8 px-2.5">{{ p }}</button>
                }
              }
              <button bpdmButton variant="secondary" appearance="ghost" size="iconSm" aria-label="Next page" [disabled]="fm.page >= fm.pageCount" (click)="fm.onPage(fm.page + 1)">
                <svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true"><path d="M6.5 3.5 11 8l-4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>
          </div>
        } @else {
          @if (fm.rangeLabel) {
            <span class="text-muted-foreground">{{ fm.rangeLabel }}</span>
          } @else if (fm.align === "between") {
            <span></span>
          }
          <div class="flex items-center gap-2">
            <button bpdmButton variant="secondary" appearance="ghost" size="sm" aria-label="Previous page" [disabled]="!fm.hasPrev" (click)="fm.onPrev()">
              <svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true"><path d="M9.5 3.5 5 8l4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              Prev
            </button>
            <button bpdmButton variant="secondary" appearance="ghost" size="sm" aria-label="Next page" [disabled]="!fm.hasNext" (click)="fm.onNext()">
              Next
              <svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true"><path d="M6.5 3.5 11 8l-4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            @if (fm.sizeOptions && fm.onSize && fm.pageSize !== undefined) {
              <ng-container [ngTemplateOutlet]="sizeSelect" [ngTemplateOutletContext]="{ value: fm.pageSize, options: fm.sizeOptions, onChange: fm.onSize }" />
            }
          </div>
        }
      </div>
    </ng-template>

    <ng-template #sizeSelect let-value="value" let-options="options" let-onChange="onChange">
      <label class="flex items-center gap-2 text-muted-foreground">
        <span>Rows</span>
        <div class="relative">
          <select [value]="value" (change)="onChange(+$any($event.target).value)" class="h-8 cursor-pointer appearance-none rounded-lg border border-input bg-background pl-2.5 pr-7 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            @for (o of options; track o) { <option [value]="o">{{ o }}</option> }
          </select>
          <svg viewBox="0 0 16 16" fill="none" class="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </div>
      </label>
    </ng-template>
  `,
})
export class BpdmDataTable<T = unknown> implements OnDestroy {
  readonly columns = input<DataTableColumn<T>[]>([]);
  readonly data = input<T[]>([]);
  readonly rowKey = input<RowKeyFn<T> | undefined>(undefined);
  readonly size = input<"sm" | "md" | "lg">("md");
  readonly striped = input(false, { transform: booleanAttribute });
  readonly bordered = input(false, { transform: booleanAttribute });
  readonly frame = input(false, { transform: booleanAttribute });
  readonly divided = input(true, { transform: booleanAttribute });
  readonly cellClassName = input<string>("");
  /** Extra classes on every header cell — e.g. to tint/colour the header row. */
  readonly headerClassName = input<string>("");
  readonly rowClassName = input<string | RowClassFn<T> | undefined>(undefined);
  readonly rowSpacing = input<number | undefined>(undefined);
  readonly hoverable = input(true, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly maxHeight = input<number | string | undefined>(undefined);
  readonly emptyContent = input<string>("No data");
  readonly onRowClick = input<RowClickFn<T> | undefined>(undefined);
  readonly multiSort = input(false, { transform: booleanAttribute });
  readonly sort = input<DataTableSort[] | undefined>(undefined);
  readonly defaultSort = input<DataTableSort[]>([]);
  readonly sortChange = output<DataTableSort[]>();
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<"multiple" | "single">("multiple");
  readonly selectedKeys = input<Key[] | undefined>(undefined);
  readonly defaultSelectedKeys = input<Key[]>([]);
  readonly selectionChange = output<{ keys: Key[]; rows: T[] }>();
  readonly pagination = input<DataTablePagination | undefined>(undefined);
  readonly expandedTemplate = input<TemplateRef<CellContext<T>> | undefined>(undefined);
  readonly expandMode = input<"single" | "multiple">("multiple");
  readonly rowExpandable = input<RowPredicate<T> | undefined>(undefined);
  readonly expandedKeys = input<Key[] | undefined>(undefined);
  readonly defaultExpandedKeys = input<Key[]>([]);
  readonly expandedChange = output<Key[]>();
  readonly pinnable = input(false, { transform: booleanAttribute });
  readonly columnPinChange = output<{ id: string; pin: "left" | "right" | undefined }>();
  readonly columnToggle = input(false, { transform: booleanAttribute });
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchPlaceholder = input<string>("Search…");
  readonly responsive = input(false, { transform: booleanAttribute });
  readonly virtualized = input(false, { transform: booleanAttribute });
  readonly reorderableColumns = input(false, { transform: booleanAttribute });
  readonly columnOrderChange = output<string[]>();
  readonly reorderableRows = input(false, { transform: booleanAttribute });
  readonly rowReorder = output<T[]>();
  readonly label = input<string>("");
  readonly classInput = input<string>("", { alias: "class" });

  private readonly headRow = viewChild<ElementRef<HTMLTableRowElement>>("headRow");
  private readonly injector = inject(Injector);

  // --- mutable UI state ---
  protected readonly query = signal("");
  protected readonly filters = signal<Record<string, ColumnFilter>>({});
  // null = "untouched" → fall back to the matching default* input (reactively, so
  // a binding that resolves after construction is still picked up)
  private readonly internalSort = signal<DataTableSort[] | null>(null);
  private readonly internalSelection = signal<Key[] | null>(null);
  private readonly internalExpanded = signal<Key[] | null>(null);
  private readonly hiddenIds = signal<Set<string>>(new Set());
  private readonly runtimePins = signal<Record<string, "left" | "right" | undefined> | null>(null);
  private readonly columnOrder = signal<string[]>([]);
  protected readonly dragColId = signal<string | null>(null);
  private readonly rowOrder = signal<Key[]>([]);
  protected readonly dragRowKey = signal<Key | null>(null);
  protected readonly dropTarget = signal<{ key: Key; pos: "before" | "after" } | null>(null);
  private readonly pageOverride = signal<number | null>(null);
  private readonly pageSizeOverride = signal<number | null>(null);
  protected readonly pinPx = signal<{ left: Record<string, number>; right: Record<string, number> }>({ left: {}, right: {} });
  protected readonly isMobile = signal(false);
  private readonly scrollTop = signal(0);

  private mq?: MediaQueryList;
  private mqHandler = () => this.isMobile.set(!!this.mq?.matches);
  private ro?: ResizeObserver;

  constructor() {
    // responsive media query
    effect(() => {
      const on = this.responsive();
      untracked(() => {
        this.mq?.removeEventListener("change", this.mqHandler);
        this.mq = undefined;
        if (on && typeof window !== "undefined") {
          this.mq = window.matchMedia("(max-width: 639px)");
          this.mq.addEventListener("change", this.mqHandler);
          this.isMobile.set(this.mq.matches);
        } else {
          this.isMobile.set(false);
        }
      });
    });

    // pixel-measured pinning offsets, re-measured on resize
    afterNextRender(() => {
      effect(
        () => {
          const row = this.headRow()?.nativeElement;
          const pinned = this.hasPinned();
          // depend on layout-affecting signals so we re-measure when they change
          this.orderedColumns(); this.pageRows(); this.size(); this.bordered(); this.rowSpacing();
          untracked(() => {
            this.ro?.disconnect();
            this.ro = undefined;
            if (!pinned || !row) { this.pinPx.set({ left: {}, right: {} }); return; }
            const measure = () => this.measurePins(row);
            measure();
            this.ro = new ResizeObserver(measure);
            this.ro.observe(row);
            Array.from(row.children).forEach((c) => this.ro!.observe(c));
          });
        },
        { injector: this.injector },
      );
    });
  }

  ngOnDestroy(): void {
    this.mq?.removeEventListener("change", this.mqHandler);
    this.ro?.disconnect();
  }

  // ---- helpers exposed to the template ----
  protected readonly isTemplate = (v: unknown): v is TemplateRef<unknown> => v instanceof TemplateRef;
  protected cellCtx(rr: RenderRow<T>): CellContext<T> {
    return { $implicit: rr.row, row: rr.row, index: rr.index };
  }
  protected cellPad(): string {
    return CELL_PAD[this.size()];
  }
  protected alignClass(col: DataTableColumn<T>): string {
    return ALIGN_CLASS[col.align ?? (col.numeric ? "right" : "left")];
  }
  protected keyOf(row: T, index: number): Key {
    const rk = this.rowKey();
    return rk ? rk(row, index) : index;
  }
  protected clickable(): boolean {
    return typeof this.onRowClick() === "function";
  }
  protected expandable(): boolean {
    return !!this.expandedTemplate();
  }
  protected canExpand(row: T): boolean {
    const re = this.rowExpandable();
    return this.expandable() && (!re || re(row));
  }

  // ---- derived columns ----
  private readonly orderedBase = computed(() => {
    const cols = this.columns();
    const order = this.columnOrder();
    if (!this.reorderableColumns() || order.length === 0) return cols;
    const idx = new Map(order.map((id, i) => [id, i]));
    return [...cols].sort((a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0));
  });
  private readonly declaredPins = computed(() => {
    const m: Record<string, "left" | "right" | undefined> = {};
    this.columns().forEach((c) => { if (c.pin) m[c.id] = c.pin; });
    return m;
  });
  private readonly effectiveColumns = computed(() => {
    const base = this.orderedBase();
    if (!this.pinnable()) return base;
    const pins = this.runtimePins() ?? this.declaredPins();
    return base.map((c) => ({ ...c, pin: pins[c.id] ?? c.pin }));
  });
  private readonly colById = computed(() => {
    const m = new Map<string, DataTableColumn<T>>();
    this.effectiveColumns().forEach((c) => m.set(c.id, c));
    return m;
  });
  protected readonly orderedColumns = computed(() => {
    const cols = this.effectiveColumns();
    const hidden = this.hiddenIds();
    return [
      ...cols.filter((c) => c.pin === "left"),
      ...cols.filter((c) => !c.pin),
      ...cols.filter((c) => c.pin === "right"),
    ].filter((c) => !(c.hideable !== false && hidden.has(c.id)));
  });
  protected readonly colCount = computed(
    () =>
      this.orderedColumns().length +
      (this.selectable() ? 1 : 0) +
      (this.expandable() ? 1 : 0) +
      (this.reorderableRows() ? 1 : 0),
  );
  protected readonly hasFooter = computed(() => this.orderedColumns().some((c) => c.footer !== undefined));
  protected readonly hasLeftPin = computed(() => this.effectiveColumns().some((c) => c.pin === "left"));
  protected readonly hasRightPin = computed(() => this.effectiveColumns().some((c) => c.pin === "right"));
  protected readonly hasPinned = computed(() => this.hasLeftPin() || this.hasRightPin());
  private readonly lastLeftId = computed(() => {
    const ids = this.orderedColumns().filter((c) => c.pin === "left").map((c) => c.id);
    return ids[ids.length - 1];
  });
  private readonly firstRightId = computed(() => {
    const ids = this.orderedColumns().filter((c) => c.pin === "right").map((c) => c.id);
    return ids[0];
  });

  // ---- sort ----
  private readonly sortState = computed(() => this.sort() ?? this.internalSort() ?? this.defaultSort());
  protected dirOf(id: string): SortDirection | null {
    return this.sortState().find((s) => s.id === id)?.dir ?? null;
  }
  protected sortOrder(id: string): number {
    if (!(this.multiSort() && this.sortState().length > 1)) return 0;
    return this.sortState().findIndex((s) => s.id === id) + 1;
  }
  protected ariaSort(col: DataTableColumn<T>): string | null {
    if (!col.sortable) return null;
    const d = this.dirOf(col.id);
    return d === "asc" ? "ascending" : d === "desc" ? "descending" : "none";
  }
  protected handleSort(colId: string, additive: boolean): void {
    const current = this.sortState().find((s) => s.id === colId)?.dir;
    const dir = nextDirection(current);
    let next: DataTableSort[];
    if (this.multiSort() && additive) {
      const without = this.sortState().filter((s) => s.id !== colId);
      next = dir ? [...without, { id: colId, dir }] : without;
    } else {
      next = dir ? [{ id: colId, dir }] : [];
    }
    if (this.sort() === undefined) this.internalSort.set(next);
    this.sortChange.emit(next);
  }

  // ---- row reorder ----
  private readonly dataOrdered = computed(() => {
    const data = this.data();
    const rk = this.rowKey();
    const order = this.rowOrder();
    if (!this.reorderableRows() || order.length === 0 || !rk) return data;
    const pos = new Map(order.map((k, i) => [k, i]));
    return [...data].sort((a, b) => (pos.get(rk(a, 0)) ?? 0) - (pos.get(rk(b, 0)) ?? 0));
  });
  private moveRow(dragKey: Key | null, overKey: Key, pos: "before" | "after"): void {
    const rk = this.rowKey();
    const data = this.data();
    if (!rk || dragKey == null || dragKey === overKey) return;
    const base = this.rowOrder().length ? this.rowOrder() : data.map((r) => rk(r, 0));
    if (base.indexOf(dragKey) === -1 || base.indexOf(overKey) === -1) return;
    const next = base.filter((k) => k !== dragKey);
    const insert = next.indexOf(overKey) + (pos === "after" ? 1 : 0);
    next.splice(insert, 0, dragKey);
    this.rowOrder.set(next);
    const map = new Map(data.map((r) => [rk(r, 0), r]));
    this.rowReorder.emit(next.map((k) => map.get(k)).filter((r): r is T => r !== undefined));
  }
  protected onRowDragOver(e: DragEvent, key: Key): void {
    if (!this.reorderableRows()) return;
    e.preventDefault();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = e.clientY < r.top + r.height / 2 ? "before" : "after";
    const cur = this.dropTarget();
    if (cur?.key !== key || cur?.pos !== pos) this.dropTarget.set({ key, pos });
  }
  protected onRowDrop(): void {
    if (!this.reorderableRows()) return;
    const t = this.dropTarget();
    if (t) this.moveRow(this.dragRowKey(), t.key, t.pos);
    this.dragRowKey.set(null);
    this.dropTarget.set(null);
  }

  // ---- column reorder ----
  protected onColDrop(overId: string): void {
    if (!this.reorderableColumns()) return;
    const dragId = this.dragColId();
    if (!dragId || dragId === overId) { this.dragColId.set(null); return; }
    const base = this.columnOrder().length ? this.columnOrder() : this.columns().map((c) => c.id);
    const from = base.indexOf(dragId);
    const to = base.indexOf(overId);
    if (from === -1 || to === -1) { this.dragColId.set(null); return; }
    const next = [...base];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    this.columnOrder.set(next);
    this.columnOrderChange.emit(next);
    this.dragColId.set(null);
  }
  protected readonly orderChanged = computed(() => this.reorderableColumns() && this.columnOrder().length > 0);
  protected resetColumns(): void {
    this.columnOrder.set([]);
    this.columnOrderChange.emit([]);
  }

  // ---- filtering + search ----
  protected readonly hasActiveFilters = computed(() =>
    Object.values(this.filters()).some((f) => f.rules.some((r) => r.value !== "")),
  );
  protected applyFilter(id: string, f: ColumnFilter): void {
    this.filters.update((s) => ({ ...s, [id]: f }));
  }
  protected clearFilter(id: string): void {
    this.filters.update((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }
  protected clearAll(): void {
    this.query.set("");
    this.filters.set({});
  }
  protected filterOptionsFor(col: DataTableColumn<T>): { value: string; label: string }[] {
    if (col.filterType !== "select") return [];
    if (col.filterOptions) return col.filterOptions;
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const row of this.data()) {
      const v = getSortValue(col, row);
      if (v == null || v === "") continue;
      const s = String(v);
      if (!seen.has(s)) { seen.add(s); out.push({ value: s, label: s }); }
    }
    return out.sort((a, b) => a.label.localeCompare(b.label));
  }

  private readonly filteredData = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cols = this.effectiveColumns();
    const byId = this.colById();
    const active = Object.entries(this.filters())
      .map(([id, f]) => ({
        col: byId.get(id),
        type: (byId.get(id)?.filterType ?? (byId.get(id)?.numeric ? "number" : "text")) as "text" | "number",
        matchMode: f.matchMode,
        rules: f.rules.filter((r) => r.value !== ""),
      }))
      .filter((f) => f.col && f.rules.length > 0);
    const data = this.dataOrdered();
    if (!q && active.length === 0) return data;
    return data.filter((row) => {
      if (q) {
        const hit = cols.some((col) => {
          const v = getSortValue(col, row);
          return v != null && String(v).toLowerCase().includes(q);
        });
        if (!hit) return false;
      }
      return active.every(({ col, type, matchMode, rules }) => {
        const cell = getSortValue(col!, row);
        const res = rules.map((r) => evalRule(cell, r.op, r.value, type));
        return matchMode === "all" ? res.every(Boolean) : res.some(Boolean);
      });
    });
  });

  protected readonly processedRows = computed(() => {
    const filtered = this.filteredData();
    if (this.sort() !== undefined || this.sortState().length === 0) return filtered;
    const byId = this.colById();
    const active = this.sortState()
      .map((s) => ({ dir: s.dir, col: byId.get(s.id) }))
      .filter((a): a is { dir: SortDirection; col: DataTableColumn<T> } => !!a.col);
    if (active.length === 0) return filtered;
    const decorated = filtered.map((row, i) => ({ row, i, keys: active.map((a) => getSortValue(a.col, row)) }));
    decorated.sort((x, y) => {
      for (let k = 0; k < active.length; k++) {
        const c = compareValues(x.keys[k], y.keys[k]);
        if (c !== 0) return active[k].dir === "asc" ? c : -c;
      }
      return x.i - y.i;
    });
    return decorated.map((d) => d.row);
  });

  // ---- pagination ----
  private readonly pMode = computed<"none" | "client" | "server" | "cursor">(() => {
    const p = this.pagination();
    return !p ? "none" : (p.mode ?? "client");
  });

  protected readonly footerModel = computed(() => {
    const p = this.pagination();
    if (!p || this.virtualized()) return null;
    const attached = this.frame();
    if (this.pMode() === "client") {
      const pg = p as import("./data-table-types").ClientPagination;
      const total = this.processedRows().length;
      const pageSize = pg.pageSizeOptions ? this.effPageSize() : pg.pageSize ?? this.effPageSize();
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      const page = Math.min(Math.max(1, pg.page ?? this.effPage()), pageCount);
      return {
        kind: "numbered" as const,
        page, pageCount, total,
        rangeFrom: total === 0 ? 0 : (page - 1) * pageSize + 1,
        rangeTo: Math.min(page * pageSize, total),
        pages: pageList(page, pageCount),
        pageSize,
        sizeOptions: pg.pageSizeOptions,
        onPage: (np: number) => this.setClientPage(np, pageCount, pg),
        onSize: pg.pageSizeOptions ? (s: number) => this.setClientSize(s, pg) : undefined,
        align: pg.align ?? "between",
        attached,
      };
    }
    if (this.pMode() === "server") {
      const pg = p as import("./data-table-types").ServerPagination;
      const pageCount = Math.max(1, Math.ceil(pg.total / pg.pageSize));
      return {
        kind: "numbered" as const,
        page: pg.page, pageCount, total: pg.total,
        rangeFrom: pg.total === 0 ? 0 : (pg.page - 1) * pg.pageSize + 1,
        rangeTo: Math.min(pg.page * pg.pageSize, pg.total),
        pages: pageList(pg.page, pageCount),
        pageSize: pg.pageSize,
        sizeOptions: pg.pageSizeOptions,
        onPage: (np: number) => pg.onPageChange(Math.min(Math.max(1, np), pageCount)),
        onSize: pg.onPageSizeChange,
        align: pg.align ?? "between",
        attached,
      };
    }
    const pg = p as import("./data-table-types").CursorPagination;
    return {
      kind: "cursor" as const,
      hasPrev: pg.hasPreviousPage,
      hasNext: pg.hasNextPage,
      onPrev: pg.onPreviousPage,
      onNext: pg.onNextPage,
      rangeLabel: pg.rangeLabel,
      pageSize: pg.pageSize,
      sizeOptions: pg.pageSizeOptions,
      onSize: pg.onPageSizeChange,
      align: pg.align ?? "between",
      attached,
    };
  });

  private effPage(): number {
    const p = this.pagination();
    const def = p && this.pMode() === "client" && "defaultPage" in p ? (p as { defaultPage?: number }).defaultPage ?? 1 : 1;
    return this.pageOverride() ?? def;
  }
  private effPageSize(): number {
    const p = this.pagination();
    const def = p && "pageSize" in p && typeof (p as { pageSize?: number }).pageSize === "number" ? (p as { pageSize: number }).pageSize : 10;
    return this.pageSizeOverride() ?? def;
  }
  private setClientPage(np: number, pageCount: number, pg: import("./data-table-types").ClientPagination): void {
    const clamped = Math.min(Math.max(1, np), pageCount);
    if (pg.page === undefined) this.pageOverride.set(clamped);
    pg.onPageChange?.(clamped);
  }
  private setClientSize(s: number, pg: import("./data-table-types").ClientPagination): void {
    this.pageSizeOverride.set(s);
    this.pageOverride.set(1);
    pg.onPageSizeChange?.(s);
  }

  // rows actually rendered (client slice / server-or-cursor as-is / virtual window)
  protected readonly pageRows = computed<RenderRow<T>[]>(() => {
    const sorted = this.processedRows();
    let slice = sorted;
    if (!this.virtualized() && this.pMode() === "client") {
      const fm = this.footerModel();
      if (fm && fm.kind === "numbered") {
        slice = sorted.slice((fm.page - 1) * fm.pageSize, fm.page * fm.pageSize);
      }
    }
    if (this.virtualized()) {
      const w = this.virtualWindow();
      slice = sorted.slice(w.start, w.end);
      return slice.map((row, i) => {
        const index = w.start + i;
        return { row, index, key: this.keyOf(row, index) };
      });
    }
    return slice.map((row, index) => ({ row, index, key: this.keyOf(row, index) }));
  });

  // ---- virtualization ----
  private readonly rowEstimate = computed(() => (this.size() === "sm" ? 38 : this.size() === "lg" ? 54 : 45));
  private readonly viewportH = computed(() => {
    const mh = this.maxHeight();
    return typeof mh === "number" ? mh : 440;
  });
  private readonly virtualWindow = computed(() => {
    const count = this.processedRows().length;
    const est = this.rowEstimate();
    const overscan = 10;
    const start = Math.max(0, Math.floor(this.scrollTop() / est) - overscan);
    const visible = Math.ceil(this.viewportH() / est) + overscan * 2;
    const end = Math.min(count, start + visible);
    return { start, end, count };
  });
  protected readonly padTop = computed(() => this.virtualWindow().start * this.rowEstimate());
  protected readonly padBottom = computed(() => {
    const w = this.virtualWindow();
    return (w.count - w.end) * this.rowEstimate();
  });
  protected onScroll(el: HTMLElement): void {
    if (this.virtualized()) this.scrollTop.set(el.scrollTop);
  }

  // ---- selection ----
  private readonly selectionArr = computed(() => this.selectedKeys() ?? this.internalSelection() ?? this.defaultSelectedKeys());
  protected readonly selectedSet = computed(() => new Set(this.selectionArr()));
  private readonly allKeys = computed(() => this.pageRows().map((rr) => rr.key));
  protected readonly allSelected = computed(() => {
    const keys = this.allKeys();
    const set = this.selectedSet();
    return keys.length > 0 && keys.every((k) => set.has(k));
  });
  protected readonly someSelected = computed(() => {
    const set = this.selectedSet();
    return !this.allSelected() && this.allKeys().some((k) => set.has(k));
  });
  private applySelection(nextKeys: Key[]): void {
    if (this.selectedKeys() === undefined) this.internalSelection.set(nextKeys);
    const set = new Set(nextKeys);
    const rows = this.processedRows().filter((r, i) => set.has(this.keyOf(r, i)));
    this.selectionChange.emit({ keys: nextKeys, rows });
  }
  protected toggleRow(key: Key): void {
    if (this.selectionMode() === "single") { this.applySelection([key]); return; }
    const arr = this.selectionArr();
    this.applySelection(this.selectedSet().has(key) ? arr.filter((k) => k !== key) : [...arr, key]);
  }
  protected toggleAll(): void {
    this.applySelection(this.allSelected() ? [] : this.allKeys());
  }

  // ---- expansion ----
  private readonly expandedArr = computed(() => this.expandedKeys() ?? this.internalExpanded() ?? this.defaultExpandedKeys());
  protected readonly expandedSet = computed(() => new Set(this.expandedArr()));
  private applyExpanded(nextKeys: Key[]): void {
    if (this.expandedKeys() === undefined) this.internalExpanded.set(nextKeys);
    this.expandedChange.emit(nextKeys);
  }
  protected toggleExpand(key: Key): void {
    if (this.expandMode() === "single") {
      this.applyExpanded(this.expandedSet().has(key) ? [] : [key]);
      return;
    }
    const arr = this.expandedArr();
    this.applyExpanded(this.expandedSet().has(key) ? arr.filter((k) => k !== key) : [...arr, key]);
  }

  // ---- column visibility ----
  protected readonly toggleable = computed(() => this.columns().filter((c) => c.hideable !== false));
  protected readonly toggleOptions = computed(() =>
    this.toggleable().map((c) => ({ value: c.id, label: c.header ?? c.id })),
  );
  protected readonly visibleToggleIds = computed(() =>
    this.toggleable().filter((c) => !this.hiddenIds().has(c.id)).map((c) => c.id),
  );
  protected onToggleColumns(ids: string[]): void {
    const next = new Set<string>();
    this.toggleable().forEach((c) => { if (!ids.includes(c.id)) next.add(c.id); });
    this.hiddenIds.set(next);
  }

  // ---- pinning ----
  protected setPin(id: string, side: "left" | "right" | undefined): void {
    const base = this.runtimePins() ?? this.declaredPins();
    this.runtimePins.set({ ...base, [id]: side });
    this.columnPinChange.emit({ id, pin: side });
  }
  private measurePins(row: HTMLElement): void {
    const ths = Array.from(row.children) as HTMLElement[];
    const byId = this.colById();
    const left: Record<string, number> = {};
    let acc = 0;
    for (const th of ths) {
      const id = th.dataset["pinId"];
      const isLead = id === "__lead_select" || id === "__lead_expand";
      const isLeftPin = !!id && byId.get(id)?.pin === "left";
      if ((isLead && this.hasLeftPin()) || isLeftPin) {
        if (id) left[id] = acc;
        acc += th.getBoundingClientRect().width;
      } else break;
    }
    const right: Record<string, number> = {};
    let racc = 0;
    for (let i = ths.length - 1; i >= 0; i--) {
      const id = ths[i].dataset["pinId"];
      if (id && byId.get(id)?.pin === "right") {
        right[id] = racc;
        racc += ths[i].getBoundingClientRect().width;
      } else break;
    }
    this.pinPx.set({ left, right });
  }

  // ---- toolbar visibility ----
  protected readonly showToolbar = computed(
    () =>
      this.searchable() ||
      this.effectiveColumns().some((c) => c.filterable) ||
      this.orderChanged() ||
      (this.columnToggle() && this.toggleable().length > 0),
  );

  // ---- class builders ----
  protected frameClass(): string {
    return cn(
      "w-full",
      // framed = a floating, elevated card: a light hairline border + a soft
      // layered shadow do the lifting (premium panel feel, not a boxed grid)
      this.frame() &&
        "overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_1px_2px_0_rgb(0_0_0/0.04),0_10px_24px_-14px_rgb(0_0_0/0.15)]",
      this.classInput(),
    );
  }
  protected tableClass(): string {
    return cn("w-full text-card-foreground", this.rowSpacing() ? "border-separate" : "border-collapse");
  }
  protected scrollMaxHeight(): string | null {
    const mh = this.maxHeight();
    if (this.virtualized()) return typeof (mh ?? 440) === "number" ? `${mh ?? 440}px` : String(mh);
    if (mh === undefined) return null;
    return typeof mh === "number" ? `${mh}px` : mh;
  }
  protected colWidth(col: DataTableColumn<T>): string | null {
    if (col.width === undefined) return null;
    return typeof col.width === "number" ? `${col.width}px` : col.width;
  }
  protected thPosition(col: DataTableColumn<T>): string | null {
    return col.pin || this.stickyHeader() ? "sticky" : null;
  }
  protected leadHeadClass(canPin: boolean): string {
    return cn(
      this.cellPad(),
      "w-[1%]",
      (this.frame() || (canPin && this.hasLeftPin()) || this.stickyHeader()) ? "bg-card" : "bg-transparent",
      "shadow-[inset_0_-1px_0_var(--border)]",
      canPin && this.bordered() && "border-r border-border",
      canPin && this.hasLeftPin() ? "z-20" : this.stickyHeader() && "z-10",
      this.headerClassName(),
    );
  }
  protected headCellClass(col: DataTableColumn<T>): string {
    const align = col.align ?? (col.numeric ? "right" : "left");
    return cn(
      this.cellPad(),
      ALIGN_CLASS[align],
      // strong, readable header — confident dark sentence-case label
      // (size inherited from density), distinct from the body weight
      "whitespace-nowrap font-semibold text-foreground",
      this.reorderableColumns() && "cursor-grab active:cursor-grabbing",
      this.dragColId() === col.id && "opacity-40",
      // framed/pinned/sticky headers sit on the card surface (clean header +
      // divider, not a heavy grey band) and stay opaque so scrolling rows never
      // bleed through; otherwise transparent
      this.frame() || col.pin || this.stickyHeader() ? "bg-card" : "bg-transparent",
      "shadow-[inset_0_-1px_0_var(--border)]",
      this.bordered() && "border-r border-border/55 last:border-r-0",
      col.pin ? "z-20" : this.stickyHeader() && "z-10",
      col.id === this.lastLeftId() && "border-r border-border",
      col.id === this.firstRightId() && "border-l border-border",
      this.headerClassName(),
      col.className,
    );
  }
  protected sortBtnClass(col: DataTableColumn<T>): string {
    const align = col.align ?? (col.numeric ? "right" : "left");
    return cn(
      "flex flex-1 cursor-pointer items-center gap-1.5 select-none transition-colors hover:text-foreground",
      JUSTIFY_CLASS[align],
      // keep the active-sort LABEL dark/strong (enterprise-restrained);
      // the small amber arrow + order badge signal the sort
      this.dirOf(col.id) && "text-foreground",
    );
  }
  private readonly pinnedBg = computed(() =>
    cn(
      "bg-card",
      this.hoverable() && "group-hover:bg-[color-mix(in_srgb,var(--primary)_4%,var(--card))]",
      "group-data-[selected]:bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]",
    ),
  );
  protected leadBodyClass(): string {
    return cn(this.cellPad(), "w-[1%]", this.bordered() && "border-r border-border", this.hasLeftPin() && `z-10 ${this.pinnedBg()}`, this.cellClassName());
  }
  protected bodyCellClass(col: DataTableColumn<T>): string {
    const align = col.align ?? (col.numeric ? "right" : "left");
    return cn(
      this.cellPad(),
      ALIGN_CLASS[align],
      col.numeric && "tabular-nums",
      this.bordered() && "border-r border-border/55 last:border-r-0",
      col.pin && `z-10 ${this.pinnedBg()}`,
      col.id === this.lastLeftId() && "border-r border-border",
      col.id === this.firstRightId() && "border-l border-border",
      this.cellClassName(),
      col.className,
    );
  }
  protected footLeadClass(): string {
    return cn(this.cellPad(), "w-[1%] bg-muted shadow-[inset_0_1px_0_var(--border)]", this.bordered() && "border-r border-border", "bottom-0", this.hasLeftPin() && "z-20");
  }
  protected footCellClass(col: DataTableColumn<T>): string {
    const align = col.align ?? (col.numeric ? "right" : "left");
    return cn(
      this.cellPad(),
      ALIGN_CLASS[align],
      col.numeric && "tabular-nums",
      "sticky bottom-0 bg-muted font-medium text-foreground shadow-[inset_0_1px_0_var(--border)]",
      this.bordered() && "border-r border-border/55 last:border-r-0",
      col.pin ? "z-20" : "z-10",
      col.id === this.lastLeftId() && "border-r border-border",
      col.id === this.firstRightId() && "border-l border-border",
      col.className,
    );
  }
  protected footerText(col: DataTableColumn<T>): string {
    const f = col.footer;
    if (typeof f === "function") return (f as (rows: T[]) => string)(this.processedRows());
    return (f as string) ?? "";
  }
  protected rowClass(rr: RenderRow<T>, isLast = false): string {
    const rc = this.rowClassName();
    const extra = typeof rc === "function" ? rc(rr.row, rr.index) : rc;
    const t = this.dropTarget();
    return cn(
      "transition-colors",
      this.hasPinned() && "group",
      this.divided() && !this.rowSpacing() && "border-t border-border",
      // borderless tables get a closing rule under the last row
      // (framed tables are closed by the container border)
      this.divided() && !this.rowSpacing() && !this.frame() && isLast && "border-b border-border",
      this.rowSpacing() && "bg-muted/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg",
      this.striped() && "even:bg-muted/40",
      // bpdm signature: a warm amber focus language — soft amber hover, and
      // selected rows get an amber tint + a left accent bar
      this.hoverable() && "hover:bg-primary/[0.04]",
      this.selectedSet().has(rr.key) && "bg-primary/10 shadow-[inset_3px_0_0_0_var(--primary)]",
      this.hoverable() && this.selectedSet().has(rr.key) && "hover:bg-primary/[0.14]",
      t?.key === rr.key && t.pos === "before" && "shadow-[inset_0_2px_0_var(--primary)]",
      t?.key === rr.key && t.pos === "after" && "shadow-[inset_0_-2px_0_var(--primary)]",
      this.clickable() && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
      extra,
    );
  }
  protected cardClass(rr: RenderRow<T>): string {
    const rc = this.rowClassName();
    const extra = typeof rc === "function" ? rc(rr.row, rr.index) : rc;
    return cn(
      "rounded-xl border border-border bg-card p-4",
      this.selectedSet().has(rr.key) && "ring-1 ring-primary",
      this.clickable() && "cursor-pointer",
      extra,
    );
  }
  protected radioClass(checked: boolean): string {
    return cn(
      "grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      checked ? "border-primary" : "border-muted-foreground/60",
    );
  }
  protected footerClass(align: "between" | "center" | "end", attached: boolean): string {
    return cn("flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm", FOOTER_JUSTIFY[align], attached ? "border-t border-border" : "pt-4");
  }
  protected onRowKey(e: KeyboardEvent, rr: RenderRow<T>): void {
    if (!this.clickable()) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.onRowClick()!(rr.row, rr.index);
    }
  }
}
