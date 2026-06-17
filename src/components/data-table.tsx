import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Checkbox } from "./checkbox";

/** A value the table can compare when sorting a column. */
export type SortValue = string | number | boolean | Date | null | undefined;

/** One column's sort direction. */
export type SortDirection = "asc" | "desc";

/** Active sort state: an ordered list (first entry = primary sort). */
export interface DataTableSort {
  id: string;
  dir: SortDirection;
}

/**
 * A single column definition. The table is fully data-driven: you describe the
 * columns once and pass an array of rows — no markup per cell.
 */
export interface DataTableColumn<T> {
  /** Unique id — used as the React key and (if no `header`) the default label. */
  id: string;
  /** Header label / node. Defaults to `id`. */
  header?: React.ReactNode;
  /** Read a plain value from the row (used when `cell` is not given). */
  accessor?: (row: T) => React.ReactNode;
  /** Full custom cell renderer — overrides `accessor`. */
  cell?: (row: T, rowIndex: number) => React.ReactNode;
  /** Horizontal alignment of header + cells. Default "left". */
  align?: "left" | "center" | "right";
  /** Fixed column width, e.g. 120 or "20%". */
  width?: number | string;
  /** Right-align and use tabular figures — for money / counts. */
  numeric?: boolean;
  /** Allow clicking the header to sort by this column. */
  sortable?: boolean;
  /**
   * Comparable value used when sorting (since `cell`/`accessor` may return
   * nodes). Falls back to a primitive `accessor` result when omitted.
   */
  sortAccessor?: (row: T) => SortValue;
  /** Extra classes applied to every cell (and the header) in this column. */
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable row key. Defaults to the row index. */
  rowKey?: (row: T, index: number) => React.Key;
  /** Cell density. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Zebra striping on alternate rows. */
  striped?: boolean;
  /** Vertical dividers between columns. */
  bordered?: boolean;
  /** Highlight the row under the cursor. Default true. */
  hoverable?: boolean;
  /** Keep the header visible while the body scrolls (pair with `maxHeight`). */
  stickyHeader?: boolean;
  /** Cap the height → the body scrolls vertically inside the table. */
  maxHeight?: number | string;
  /** Shown when `data` is empty. Default: "No data". */
  emptyContent?: React.ReactNode;
  /** Called when a row is clicked (also enables a pointer cursor + hover). */
  onRowClick?: (row: T, index: number) => void;
  /** Allow sorting by more than one column (Shift+click adds a column). */
  multiSort?: boolean;
  /** Controlled sort state — when set, the parent owns row order (e.g. server-side). */
  sort?: DataTableSort[];
  /** Initial sort for the uncontrolled case. */
  defaultSort?: DataTableSort[];
  /** Fired whenever the sort changes (both controlled and uncontrolled). */
  onSortChange?: (sort: DataTableSort[]) => void;
  /** Show a selection column (checkboxes, or radios in single mode). */
  selectable?: boolean;
  /** "multiple" (checkbox + select-all) or "single" (radio). Default "multiple". */
  selectionMode?: "multiple" | "single";
  /** Controlled selected row keys (use with `rowKey` for stable identity). */
  selectedKeys?: React.Key[];
  /** Initial selection for the uncontrolled case. */
  defaultSelectedKeys?: React.Key[];
  /** Fired when the selection changes — gives the keys and the selected rows. */
  onSelectionChange?: (keys: React.Key[], rows: T[]) => void;
  className?: string;
}

// Cell padding + text size per density. Header and body share the padding so
// columns line up exactly.
const cellPad = cva("", {
  variants: {
    size: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3.5 text-base",
    },
  },
  defaultVariants: { size: "md" },
});

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const justifyClass = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

// --- sorting helpers -------------------------------------------------------

// Click cycle on a header: unsorted → asc → desc → unsorted (null = clear).
function nextDirection(current: SortDirection | undefined): SortDirection | null {
  if (current === undefined) return "asc";
  if (current === "asc") return "desc";
  return null;
}

function getSortValue<T>(col: DataTableColumn<T>, row: T): SortValue {
  if (col.sortAccessor) return col.sortAccessor(row);
  if (col.accessor) {
    const v = col.accessor(row);
    return typeof v === "string" || typeof v === "number" ? v : undefined;
  }
  return undefined;
}

function compareValues(a: SortValue, b: SortValue): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1; // nullish/empty always sorts last
  if (bEmpty) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function SortIcon({ dir }: { dir: SortDirection | null }) {
  if (dir === null) {
    // sortable but inactive — faint up/down hint
    return (
      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 opacity-40" fill="none" aria-hidden>
        <path d="M5 6.5 8 3.5l3 3M5 9.5 8 12.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-foreground" fill="none" aria-hidden>
      <path d={dir === "asc" ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Lightweight radio for single-select mode (no extra dependency).
function RowRadio({
  checked,
  onSelect,
  label,
}: {
  checked: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "border-primary" : "border-muted-foreground/60",
      )}
    >
      {checked && <span className="size-2.5 rounded-full bg-primary" />}
    </button>
  );
}

/**
 * Data-driven table. Describe `columns` and pass `data`; everything else
 * (density, striping, borders, sticky header, vertical/horizontal scroll, empty
 * state, sorting) is a prop. The outer wrapper scrolls horizontally on narrow
 * screens, so it is responsive out of the box.
 *
 * Sorting: mark a column `sortable`. Clicking its header cycles
 * unsorted → asc → desc → unsorted. With `multiSort`, Shift+click sorts by
 * several columns. Leave `sort` unset to let the table sort internally, or pass
 * `sort` + `onSortChange` to own the order yourself (e.g. server-side).
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  size = "md",
  striped = false,
  bordered = false,
  hoverable = true,
  stickyHeader = false,
  maxHeight,
  emptyContent = "No data",
  onRowClick,
  multiSort = false,
  sort,
  defaultSort,
  onSortChange,
  selectable = false,
  selectionMode = "multiple",
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const clickable = typeof onRowClick === "function";
  const isControlled = sort !== undefined;

  const [internalSort, setInternalSort] = React.useState<DataTableSort[]>(
    defaultSort ?? [],
  );
  const sortState = isControlled ? sort! : internalSort;

  const colById = React.useMemo(() => {
    const m = new Map<string, DataTableColumn<T>>();
    columns.forEach((c) => m.set(c.id, c));
    return m;
  }, [columns]);

  const applySort = (next: DataTableSort[]) => {
    if (!isControlled) setInternalSort(next);
    onSortChange?.(next);
  };

  const handleSort = (colId: string, additive: boolean) => {
    const current = sortState.find((s) => s.id === colId)?.dir;
    const dir = nextDirection(current);

    if (multiSort && additive) {
      const without = sortState.filter((s) => s.id !== colId);
      applySort(dir ? [...without, { id: colId, dir }] : without);
    } else {
      applySort(dir ? [{ id: colId, dir }] : []);
    }
  };

  // Only sort internally in the uncontrolled case — a controlled parent owns order.
  const rows = React.useMemo(() => {
    if (isControlled || sortState.length === 0) return data;
    const indexed = data.map((row, i) => ({ row, i }));
    indexed.sort((a, b) => {
      for (const s of sortState) {
        const col = colById.get(s.id);
        if (!col) continue;
        const c = compareValues(getSortValue(col, a.row), getSortValue(col, b.row));
        if (c !== 0) return s.dir === "asc" ? c : -c;
      }
      return a.i - b.i; // stable tie-break
    });
    return indexed.map((x) => x.row);
  }, [data, sortState, colById, isControlled]);

  const showSortOrder = multiSort && sortState.length > 1;

  // --- selection (keyed by rowKey so it survives sorting) ---
  const keyOf = (row: T, index: number): React.Key =>
    rowKey ? rowKey(row, index) : index;

  const isSelectionControlled = selectedKeys !== undefined;
  const [internalSelection, setInternalSelection] = React.useState<React.Key[]>(
    defaultSelectedKeys ?? [],
  );
  const selectionArr = isSelectionControlled ? selectedKeys! : internalSelection;
  const selectedSet = React.useMemo(() => new Set(selectionArr), [selectionArr]);

  const allKeys = React.useMemo(
    () => rows.map((r, i) => keyOf(r, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, rowKey],
  );
  const allSelected = rows.length > 0 && allKeys.every((k) => selectedSet.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selectedSet.has(k));
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
      ? "indeterminate"
      : false;

  const applySelection = (nextKeys: React.Key[]) => {
    if (!isSelectionControlled) setInternalSelection(nextKeys);
    const set = new Set(nextKeys);
    onSelectionChange?.(
      nextKeys,
      rows.filter((r, i) => set.has(keyOf(r, i))),
    );
  };

  const toggleRow = (key: React.Key) => {
    if (selectionMode === "single") {
      applySelection([key]);
      return;
    }
    const next = selectedSet.has(key)
      ? selectionArr.filter((k) => k !== key)
      : [...selectionArr, key];
    applySelection(next);
  };

  const toggleAll = () => applySelection(allSelected ? [] : allKeys);

  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={cn(
        "w-full overflow-auto rounded-xl border border-border bg-card",
        className,
      )}
      style={maxHeight !== undefined ? { maxHeight } : undefined}
    >
      <table className="w-full border-collapse text-card-foreground">
        <thead>
          <tr>
            {selectable && (
              <th
                scope="col"
                className={cn(
                  cellPad({ size }),
                  "w-[1%] bg-muted text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
                  bordered && "border-r border-border",
                  stickyHeader && "sticky top-0 z-10",
                )}
              >
                {selectionMode === "multiple" && (
                  <div className="flex justify-center">
                    <Checkbox
                      size="sm"
                      aria-label="Select all rows"
                      checked={headerChecked}
                      onCheckedChange={toggleAll}
                    />
                  </div>
                )}
              </th>
            )}
            {columns.map((col) => {
              const align = col.align ?? (col.numeric ? "right" : "left");
              const entry = sortState.find((s) => s.id === col.id);
              const dir = entry?.dir ?? null;
              const order = showSortOrder
                ? sortState.findIndex((s) => s.id === col.id) + 1
                : 0;
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    !col.sortable
                      ? undefined
                      : dir === "asc"
                        ? "ascending"
                        : dir === "desc"
                          ? "descending"
                          : "none"
                  }
                  style={col.width !== undefined ? { width: col.width } : undefined}
                  className={cn(
                    cellPad({ size }),
                    alignClass[align],
                    "bg-muted font-medium whitespace-nowrap text-muted-foreground",
                    // keep a divider line under the header even when it is sticky
                    "shadow-[inset_0_-1px_0_var(--border)]",
                    bordered && "border-r border-border last:border-r-0",
                    stickyHeader && "sticky top-0 z-10",
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={(e) => handleSort(col.id, e.shiftKey)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-1.5 select-none transition-colors hover:text-foreground",
                        justifyClass[align],
                        dir && "text-foreground",
                      )}
                    >
                      <span>{col.header ?? col.id}</span>
                      <SortIcon dir={dir} />
                      {order > 0 && (
                        <span className="grid size-4 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                          {order}
                        </span>
                      )}
                    </button>
                  ) : (
                    (col.header ?? col.id)
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className={cn(
                  cellPad({ size }),
                  "text-center text-muted-foreground",
                )}
              >
                {emptyContent}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const key = keyOf(row, rowIndex);
              const selected = selectedSet.has(key);
              return (
              <tr
                key={key}
                data-selected={selected || undefined}
                onClick={clickable ? () => onRowClick!(row, rowIndex) : undefined}
                className={cn(
                  "border-t border-border transition-colors",
                  striped && "even:bg-muted/40",
                  hoverable && "hover:bg-muted/60",
                  selected && "bg-primary/10",
                  clickable && "cursor-pointer",
                )}
              >
                {selectable && (
                  <td
                    className={cn(cellPad({ size }), "w-[1%]", bordered && "border-r border-border")}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center">
                      {selectionMode === "single" ? (
                        <RowRadio
                          checked={selected}
                          onSelect={() => toggleRow(key)}
                          label="Select row"
                        />
                      ) : (
                        <Checkbox
                          size="sm"
                          aria-label="Select row"
                          checked={selected}
                          onCheckedChange={() => toggleRow(key)}
                        />
                      )}
                    </div>
                  </td>
                )}
                {columns.map((col) => {
                  const align = col.align ?? (col.numeric ? "right" : "left");
                  return (
                    <td
                      key={col.id}
                      className={cn(
                        cellPad({ size }),
                        alignClass[align],
                        col.numeric && "tabular-nums",
                        bordered && "border-r border-border last:border-r-0",
                        col.className,
                      )}
                    >
                      {col.cell
                        ? col.cell(row, rowIndex)
                        : col.accessor
                          ? col.accessor(row)
                          : null}
                    </td>
                  );
                })}
              </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
