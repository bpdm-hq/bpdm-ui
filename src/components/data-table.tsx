import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "./button";
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

/** Where the footer controls sit. Default "between". */
export type PaginationAlign = "between" | "center" | "end";

/** Client-side paging — the table slices `data` itself. */
export interface ClientPagination {
  mode?: "client";
  align?: PaginationAlign;
  /** Rows per page. Default 10. */
  pageSize?: number;
  /** Offer these page sizes in a selector (omit to hide it). */
  pageSizeOptions?: number[];
  /** Controlled current page (1-based); leave unset to let the table track it. */
  page?: number;
  /** Initial page for the uncontrolled case. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

/** Server-side offset paging — `data` is already the current page. */
export interface ServerPagination {
  mode: "server";
  align?: PaginationAlign;
  /** Current page (1-based). */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** Total rows on the server — drives the page count. */
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

/**
 * Server-side cursor paging — there are no page numbers, only prev/next, since
 * cursors can't jump to an arbitrary page.
 */
export interface CursorPagination {
  mode: "cursor";
  align?: PaginationAlign;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  /** Optional label shown beside the buttons, e.g. "Showing 20 results". */
  rangeLabel?: React.ReactNode;
  /** Optional page-size selector. */
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export type DataTablePagination =
  | ClientPagination
  | ServerPagination
  | CursorPagination;

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
  /**
   * Pin this column to an edge while the table scrolls horizontally. Give pinned
   * columns a numeric `width`, and place left-pinned columns first / right-pinned
   * last in the array.
   */
  pin?: "left" | "right";
  /** Hide the per-column pin menu for this column even when `pinnable` is on. */
  disablePinning?: boolean;
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
  /** Outer border + rounded container. Default true; set false for a bare table. */
  frame?: boolean;
  /** Horizontal dividers between rows. Default true. */
  divided?: boolean;
  /** Extra classes on every body cell — e.g. "py-4" for taller rows. */
  cellClassName?: string;
  /** Extra classes per body row — a string, or a fn for conditional styling. */
  rowClassName?: string | ((row: T, index: number) => string);
  /**
   * Vertical gap (px) between rows. Renders rows as separated filled blocks
   * (rounded, no dividers). Each row gets a default `bg-muted/50` fill —
   * override the colour with `rowClassName`.
   */
  rowSpacing?: number;
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
  /** Pagination config — client, server (offset), or cursor. Omit for no paging. */
  pagination?: DataTablePagination;
  /** Render an expandable detail panel under a row. Presence enables expansion. */
  renderExpanded?: (row: T, index: number) => React.ReactNode;
  /** Only one row open at a time, or many. Default "multiple". */
  expandMode?: "single" | "multiple";
  /** Hide the expander for rows where this returns false. */
  rowExpandable?: (row: T) => boolean;
  /** Controlled expanded row keys. */
  expandedKeys?: React.Key[];
  /** Initial expanded rows for the uncontrolled case. */
  defaultExpandedKeys?: React.Key[];
  /** Fired when the set of expanded rows changes. */
  onExpandedChange?: (keys: React.Key[]) => void;
  /** Show a per-column header menu to pin/unpin columns at runtime. */
  pinnable?: boolean;
  /** Fired when a column is pinned/unpinned via the header menu. */
  onColumnPinChange?: (id: string, pin: "left" | "right" | undefined) => void;
  /** Accessible name for the table (maps to `aria-label`). */
  label?: string;
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

function DotsIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <circle cx="8" cy="3.5" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="12.5" r="1.3" fill="currentColor" />
    </svg>
  );
}

function PinArrow({ side }: { side: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 text-muted-foreground" fill="none" aria-hidden>
      <path
        d={side === "left" ? "M10 4 6 8l4 4" : "M6 4l4 4-4 4"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const pinMenuItem =
  "flex cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-4px)] px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-40";

// per-column header menu: pin left / pin right / unpin (interactive freezing)
function ColumnPinMenu({
  pin,
  onPin,
}: {
  pin?: "left" | "right";
  onPin: (p: "left" | "right" | undefined) => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Column options"
          onClick={(e) => e.stopPropagation()}
          className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <DotsIcon />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[9rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-[bpdm-pop-in_120ms_ease-out]"
        >
          <DropdownMenu.Item className={pinMenuItem} disabled={pin === "left"} onSelect={() => onPin("left")}>
            <PinArrow side="left" /> Pin left
          </DropdownMenu.Item>
          <DropdownMenu.Item className={pinMenuItem} disabled={pin === "right"} onSelect={() => onPin("right")}>
            <PinArrow side="right" /> Pin right
          </DropdownMenu.Item>
          <DropdownMenu.Item className={pinMenuItem} disabled={!pin} onSelect={() => onPin(undefined)}>
            <span className="size-3.5" /> Unpin
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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

// Compact page list with ellipses: 1 … 4 5 6 … 20
function pageList(current: number, count: number): (number | "ellipsis")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);
  if (start > 2) out.push("ellipsis");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 1) out.push("ellipsis");
  out.push(count);
  return out;
}

const footerBar = "flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm";
const footerJustify = {
  between: "justify-between",
  center: "justify-center",
  end: "justify-end",
} as const;

// shared wrapper: alignment + attached (border-t) vs detached (top gap)
function footerClass(align: PaginationAlign, attached: boolean) {
  return cn(
    footerBar,
    footerJustify[align],
    attached ? "border-t border-border" : "pt-4",
  );
}

// dogfoods the library's own Button — icon-only when there is no text label
function ChevronButton({
  dir,
  label,
  text,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  text?: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const path = dir === "left" ? "M9.5 3.5 5 8l4.5 4.5" : "M6.5 3.5 11 8l-4.5 4.5";
  const icon = (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <Button
      variant="ghost"
      size={text ? "sm" : "iconSm"}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {dir === "left" && icon}
      {text}
      {dir === "right" && icon}
    </Button>
  );
}

function PageSizeSelect({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (n: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-muted-foreground">
      <span>Rows</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 cursor-pointer rounded-lg border border-input bg-background px-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberedFooter({
  page,
  pageCount,
  total,
  rangeFrom,
  rangeTo,
  onPage,
  sizeOptions,
  pageSize,
  onSize,
  align,
  attached,
}: {
  page: number;
  pageCount: number;
  total: number;
  rangeFrom: number;
  rangeTo: number;
  onPage: (p: number) => void;
  sizeOptions?: number[];
  pageSize: number;
  onSize?: (n: number) => void;
  align: PaginationAlign;
  attached: boolean;
}) {
  return (
    <div className={footerClass(align, attached)}>
      <span className="text-muted-foreground">
        {total === 0 ? "No results" : `Showing ${rangeFrom}–${rangeTo} of ${total}`}
      </span>
      <div className="flex items-center gap-3">
        {sizeOptions && onSize && (
          <PageSizeSelect value={pageSize} options={sizeOptions} onChange={onSize} />
        )}
        <div className="flex items-center gap-1">
          <ChevronButton dir="left" label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} />
          {pageList(page, pageCount).map((p, i) =>
            p === "ellipsis" ? (
              <span key={`e${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "primary" : "ghost"}
                size="sm"
                aria-current={p === page ? "page" : undefined}
                onClick={() => onPage(p)}
                className="min-w-8 px-2.5"
              >
                {p}
              </Button>
            ),
          )}
          <ChevronButton dir="right" label="Next page" disabled={page >= pageCount} onClick={() => onPage(page + 1)} />
        </div>
      </div>
    </div>
  );
}

function CursorFooter({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  rangeLabel,
  align,
  attached,
  sizeOptions,
  pageSize,
  onSize,
}: {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  rangeLabel?: React.ReactNode;
  align: PaginationAlign;
  attached: boolean;
  sizeOptions?: number[];
  pageSize?: number;
  onSize?: (n: number) => void;
}) {
  return (
    <div className={footerClass(align, attached)}>
      {rangeLabel ? (
        <span className="text-muted-foreground">{rangeLabel}</span>
      ) : align === "between" ? (
        <span />
      ) : null}
      <div className="flex items-center gap-2">
        <ChevronButton dir="left" label="Previous page" text="Prev" disabled={!hasPrev} onClick={onPrev} />
        <ChevronButton dir="right" label="Next page" text="Next" disabled={!hasNext} onClick={onNext} />
        {sizeOptions && onSize && pageSize !== undefined && (
          <PageSizeSelect value={pageSize} options={sizeOptions} onChange={onSize} />
        )}
      </div>
    </div>
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
  frame = true,
  divided = true,
  cellClassName,
  rowClassName,
  rowSpacing,
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
  pagination,
  renderExpanded,
  expandMode = "multiple",
  rowExpandable,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  pinnable = false,
  onColumnPinChange,
  label,
  className,
}: DataTableProps<T>) {
  const clickable = typeof onRowClick === "function";
  const isControlled = sort !== undefined;

  const [internalSort, setInternalSort] = React.useState<DataTableSort[]>(
    defaultSort ?? [],
  );
  const sortState = isControlled ? sort! : internalSort;

  // interactive pinning: runtime pin state seeded from the columns' declared pin
  const [pinState, setPinState] = React.useState<
    Record<string, "left" | "right" | undefined>
  >(() => {
    const m: Record<string, "left" | "right" | undefined> = {};
    columns.forEach((c) => {
      if (c.pin) m[c.id] = c.pin;
    });
    return m;
  });
  const setPin = (id: string, side: "left" | "right" | undefined) => {
    setPinState((s) => ({ ...s, [id]: side }));
    onColumnPinChange?.(id, side);
  };
  // when `pinnable`, the runtime pin state overrides the declared `pin`
  const effectiveColumns = React.useMemo(
    () => (pinnable ? columns.map((c) => ({ ...c, pin: pinState[c.id] ?? c.pin })) : columns),
    [columns, pinnable, pinState],
  );

  const colById = React.useMemo(() => {
    const m = new Map<string, DataTableColumn<T>>();
    effectiveColumns.forEach((c) => m.set(c.id, c));
    return m;
  }, [effectiveColumns]);

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
  const sortedRows = React.useMemo(() => {
    if (isControlled || sortState.length === 0) return data;
    // resolve the active sort columns once
    const active = sortState
      .map((s) => ({ dir: s.dir, col: colById.get(s.id) }))
      .filter((a): a is { dir: SortDirection; col: DataTableColumn<T> } => !!a.col);
    if (active.length === 0) return data;
    // decorate → sort → undecorate: read each row's sort values ONCE (O(n)),
    // then compare the cached values. Avoids calling accessors inside the
    // O(n log n) comparator, which is the difference between snappy and sluggish
    // on large client-side datasets.
    const decorated = data.map((row, i) => ({
      row,
      i,
      keys: active.map((a) => getSortValue(a.col, row)),
    }));
    decorated.sort((x, y) => {
      for (let k = 0; k < active.length; k++) {
        const c = compareValues(x.keys[k], y.keys[k]);
        if (c !== 0) return active[k].dir === "asc" ? c : -c;
      }
      return x.i - y.i; // stable tie-break
    });
    return decorated.map((d) => d.row);
  }, [data, sortState, colById, isControlled]);

  const showSortOrder = multiSort && sortState.length > 1;

  // --- pagination (client slices; server/cursor leave order to the parent) ---
  const pMode = !pagination ? "none" : (pagination.mode ?? "client");
  const [internalPage, setInternalPage] = React.useState(
    pagination && pMode === "client" && "defaultPage" in pagination
      ? (pagination.defaultPage ?? 1)
      : 1,
  );
  const [internalPageSize, setInternalPageSize] = React.useState(
    pagination && "pageSize" in pagination && typeof pagination.pageSize === "number"
      ? pagination.pageSize
      : 10,
  );

  let rows = sortedRows;
  let footer: React.ReactNode = null;

  if (pMode === "client") {
    const pg = pagination as ClientPagination;
    const pageSize = pg.pageSizeOptions ? internalPageSize : pg.pageSize ?? internalPageSize;
    const total = sortedRows.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, pg.page ?? internalPage), pageCount);
    const setPage = (p: number) => {
      const np = Math.min(Math.max(1, p), pageCount);
      if (pg.page === undefined) setInternalPage(np);
      pg.onPageChange?.(np);
    };
    const setSize = (s: number) => {
      setInternalPageSize(s);
      setInternalPage(1);
      pg.onPageSizeChange?.(s);
    };
    rows = sortedRows.slice((page - 1) * pageSize, page * pageSize);
    footer = (
      <NumberedFooter
        page={page}
        pageCount={pageCount}
        total={total}
        rangeFrom={total === 0 ? 0 : (page - 1) * pageSize + 1}
        rangeTo={Math.min(page * pageSize, total)}
        onPage={setPage}
        sizeOptions={pg.pageSizeOptions}
        pageSize={pageSize}
        onSize={pg.pageSizeOptions ? setSize : undefined}
        align={pg.align ?? "between"}
        attached={frame}
      />
    );
  } else if (pMode === "server") {
    const pg = pagination as ServerPagination;
    const pageCount = Math.max(1, Math.ceil(pg.total / pg.pageSize));
    footer = (
      <NumberedFooter
        page={pg.page}
        pageCount={pageCount}
        total={pg.total}
        rangeFrom={pg.total === 0 ? 0 : (pg.page - 1) * pg.pageSize + 1}
        rangeTo={Math.min(pg.page * pg.pageSize, pg.total)}
        onPage={(p) => pg.onPageChange(Math.min(Math.max(1, p), pageCount))}
        sizeOptions={pg.pageSizeOptions}
        pageSize={pg.pageSize}
        onSize={pg.onPageSizeChange}
        align={pg.align ?? "between"}
        attached={frame}
      />
    );
  } else if (pMode === "cursor") {
    const pg = pagination as CursorPagination;
    footer = (
      <CursorFooter
        hasPrev={pg.hasPreviousPage}
        hasNext={pg.hasNextPage}
        onPrev={pg.onPreviousPage}
        onNext={pg.onNextPage}
        rangeLabel={pg.rangeLabel}
        align={pg.align ?? "between"}
        attached={frame}
        sizeOptions={pg.pageSizeOptions}
        pageSize={pg.pageSize}
        onSize={pg.onPageSizeChange}
      />
    );
  }

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
    // resolve against all rows (not just the current page) so cross-page
    // selections are reported in full
    onSelectionChange?.(
      nextKeys,
      sortedRows.filter((r, i) => set.has(keyOf(r, i))),
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

  // --- expandable rows (keyed by rowKey, like selection) ---
  const expandable = typeof renderExpanded === "function";
  const isExpandControlled = expandedKeys !== undefined;
  const [internalExpanded, setInternalExpanded] = React.useState<React.Key[]>(
    defaultExpandedKeys ?? [],
  );
  const expandedArr = isExpandControlled ? expandedKeys! : internalExpanded;
  const expandedSet = React.useMemo(() => new Set(expandedArr), [expandedArr]);

  const applyExpanded = (nextKeys: React.Key[]) => {
    if (!isExpandControlled) setInternalExpanded(nextKeys);
    onExpandedChange?.(nextKeys);
  };
  const toggleExpand = (key: React.Key) => {
    if (expandMode === "single") {
      applyExpanded(expandedSet.has(key) ? [] : [key]);
      return;
    }
    applyExpanded(
      expandedSet.has(key)
        ? expandedArr.filter((k) => k !== key)
        : [...expandedArr, key],
    );
  };

  const colCount =
    columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0);

  // Pinned columns auto-move to the edges (left-pinned first, right-pinned last),
  // keeping their relative order — so authors never have to hand-order them and
  // the pinned blocks are always contiguous (no gaps).
  const orderedColumns = React.useMemo(
    () => [
      ...effectiveColumns.filter((c) => c.pin === "left"),
      ...effectiveColumns.filter((c) => !c.pin),
      ...effectiveColumns.filter((c) => c.pin === "right"),
    ],
    [effectiveColumns],
  );

  // --- frozen columns ---
  const hasLeftPin = effectiveColumns.some((c) => c.pin === "left");
  const hasRightPin = effectiveColumns.some((c) => c.pin === "right");
  const hasPinned = hasLeftPin || hasRightPin;

  const leftPinIds = orderedColumns.filter((c) => c.pin === "left").map((c) => c.id);
  const lastLeftId = leftPinIds[leftPinIds.length - 1]; // scroll-facing edge
  const rightPinIds = orderedColumns.filter((c) => c.pin === "right").map((c) => c.id);
  const firstRightId = rightPinIds[0];

  // Sticky offsets are measured from the ACTUAL rendered header-cell widths —
  // declared widths drift from reality (padding, content, the narrow selection
  // column), which would leave gaps that the scrolling cells bleed through.
  // Re-measured on resize.
  const headRef = React.useRef<HTMLTableRowElement>(null);
  const [pinPx, setPinPx] = React.useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>({ left: {}, right: {} });

  React.useLayoutEffect(() => {
    const row = headRef.current;
    if (!hasPinned || !row) return;
    const measure = () => {
      const ths = Array.from(row.children) as HTMLElement[];
      const left: Record<string, number> = {};
      let acc = 0;
      for (const th of ths) {
        const id = th.dataset.pinId;
        const isLead = id === "__lead_select" || id === "__lead_expand";
        const isLeftPin = !!id && colById.get(id)?.pin === "left";
        if ((isLead && hasLeftPin) || isLeftPin) {
          if (id) left[id] = acc;
          acc += th.getBoundingClientRect().width;
        } else break; // the left-pinned block is contiguous at the start
      }
      const right: Record<string, number> = {};
      let racc = 0;
      for (let i = ths.length - 1; i >= 0; i--) {
        const id = ths[i].dataset.pinId;
        if (id && colById.get(id)?.pin === "right") {
          right[id] = racc;
          racc += ths[i].getBoundingClientRect().width;
        } else break;
      }
      setPinPx({ left, right });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    Array.from(row.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPinned, hasLeftPin, colById, orderedColumns, data, selectable, expandable, size, bordered, rowSpacing]);

  const expanderLeft = pinPx.left["__lead_expand"];
  const selectionLeft = pinPx.left["__lead_select"];

  // pinned body cells must be OPAQUE (a sticky cell with a translucent bg would
  // let the scrolling cells show through). Base card + opaque color-mix tints for
  // hover/selected, reflected from the row via `group`. Raw tokens (not --color-*)
  // so they resolve under @theme inline.
  const pinnedBg = cn(
    "bg-card",
    hoverable && "group-hover:bg-[color-mix(in_srgb,var(--muted)_60%,var(--card))]",
    "group-data-[selected]:bg-[color-mix(in_srgb,var(--primary)_10%,var(--card))]",
  );

  // sticky positioning for a data column (used by both th and td)
  const pinStyleFor = (col: DataTableColumn<T>): React.CSSProperties => {
    if (col.pin === "left") return { position: "sticky", left: pinPx.left[col.id] };
    if (col.pin === "right") return { position: "sticky", right: pinPx.right[col.id] };
    return {};
  };

  return (
    <div
      className={cn(
        "w-full",
        frame && "overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <div
        className="overflow-auto"
        style={maxHeight !== undefined ? { maxHeight } : undefined}
      >
      <table
        aria-label={label}
        className={cn(
          "w-full text-card-foreground",
          rowSpacing ? "border-separate" : "border-collapse",
        )}
        style={rowSpacing ? { borderSpacing: `0 ${rowSpacing}px` } : undefined}
      >
        <thead>
          <tr ref={headRef}>
            {expandable && (
              <th
                scope="col"
                aria-label="Expand"
                data-pin-id="__lead_expand"
                style={{
                  ...(hasLeftPin ? { position: "sticky", left: expanderLeft } : {}),
                  ...(stickyHeader ? { position: "sticky", top: 0 } : {}),
                }}
                className={cn(
                  cellPad({ size }),
                  "w-[1%]",
                  frame || hasLeftPin ? "bg-muted" : "bg-transparent",
                  "shadow-[inset_0_-1px_0_var(--border)]",
                  bordered && "border-r border-border",
                  hasLeftPin ? "z-20" : stickyHeader && "z-10",
                )}
              />
            )}
            {selectable && (
              <th
                scope="col"
                data-pin-id="__lead_select"
                style={{
                  ...(hasLeftPin ? { position: "sticky", left: selectionLeft } : {}),
                  ...(stickyHeader ? { position: "sticky", top: 0 } : {}),
                }}
                className={cn(
                  cellPad({ size }),
                  "w-[1%]",
                  "text-muted-foreground shadow-[inset_0_-1px_0_var(--border)]",
                  frame || hasLeftPin ? "bg-muted" : "bg-transparent",
                  bordered && "border-r border-border",
                  hasLeftPin ? "z-20" : stickyHeader && "z-10",
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
            {orderedColumns.map((col, ci) => {
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
                  data-pin-id={col.id}
                  aria-sort={
                    !col.sortable
                      ? undefined
                      : dir === "asc"
                        ? "ascending"
                        : dir === "desc"
                          ? "descending"
                          : "none"
                  }
                  style={{
                    ...(col.width !== undefined ? { width: col.width } : {}),
                    ...pinStyleFor(col),
                    ...(stickyHeader ? { position: "sticky", top: 0 } : {}),
                  }}
                  className={cn(
                    cellPad({ size }),
                    alignClass[align],
                    "font-medium whitespace-nowrap text-muted-foreground",
                    // framed/pinned headers get the muted band; borderless headers
                    // stay transparent (page-coloured) for a lighter, elegant look
                    frame || col.pin ? "bg-muted" : "bg-transparent",
                    // keep a divider line under the header even when it is sticky
                    "shadow-[inset_0_-1px_0_var(--border)]",
                    // borderless: thin separators between header labels
                    !frame && !col.pin && ci > 0 && "border-l border-border/60",
                    bordered && "border-r border-border last:border-r-0",
                    col.pin ? "z-20" : stickyHeader && "z-10",
                    col.id === lastLeftId && "border-r border-border",
                    col.id === firstRightId && "border-l border-border",
                    col.className,
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={(e) => handleSort(col.id, e.shiftKey)}
                        className={cn(
                          "flex flex-1 cursor-pointer items-center gap-1.5 select-none transition-colors hover:text-foreground",
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
                      <span className={cn("flex-1", alignClass[align])}>
                        {col.header ?? col.id}
                      </span>
                    )}
                    {pinnable && !col.disablePinning && (
                      <ColumnPinMenu pin={col.pin} onPin={(p) => setPin(col.id, p)} />
                    )}
                  </div>
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
              const expanded = expandable && expandedSet.has(key);
              const canExpand = expandable && (!rowExpandable || rowExpandable(row));
              return (
              <React.Fragment key={key}>
              <tr
                data-selected={selected || undefined}
                data-expanded={expanded || undefined}
                onClick={clickable ? () => onRowClick!(row, rowIndex) : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick!(row, rowIndex);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "transition-colors",
                  // `group` lets pinned cells mirror the row's hover/selected state
                  hasPinned && "group",
                  divided && !rowSpacing && "border-t border-border",
                  rowSpacing &&
                    "bg-muted/50 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg",
                  striped && "even:bg-muted/40",
                  hoverable && "hover:bg-muted/60",
                  selected && "bg-primary/10",
                  clickable &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName,
                )}
              >
                {expandable && (
                  <td
                    style={
                      hasLeftPin
                        ? { position: "sticky", left: expanderLeft }
                        : undefined
                    }
                    className={cn(
                      cellPad({ size }),
                      "w-[1%]",
                      bordered && "border-r border-border",
                      hasLeftPin && `z-10 ${pinnedBg}`,
                      cellClassName,
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canExpand && (
                      <button
                        type="button"
                        aria-label={expanded ? "Collapse row" : "Expand row"}
                        aria-expanded={expanded}
                        onClick={() => toggleExpand(key)}
                        className="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className={cn("size-4 transition-transform", expanded && "rotate-90")}
                          fill="none"
                          aria-hidden
                        >
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
                {selectable && (
                  <td
                    style={
                      hasLeftPin
                        ? { position: "sticky", left: selectionLeft }
                        : undefined
                    }
                    className={cn(
                      cellPad({ size }),
                      "w-[1%]",
                      bordered && "border-r border-border",
                      hasLeftPin && `z-10 ${pinnedBg}`,
                      cellClassName,
                    )}
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
                {orderedColumns.map((col) => {
                  const align = col.align ?? (col.numeric ? "right" : "left");
                  return (
                    <td
                      key={col.id}
                      style={col.pin ? pinStyleFor(col) : undefined}
                      className={cn(
                        cellPad({ size }),
                        alignClass[align],
                        col.numeric && "tabular-nums",
                        bordered && "border-r border-border last:border-r-0",
                        col.pin && `z-10 ${pinnedBg}`,
                        col.id === lastLeftId && "border-r border-border",
                        col.id === firstRightId && "border-l border-border",
                        cellClassName,
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
              {expanded && (
                <tr className={cn("bg-muted/30", divided && "border-t border-border")}>
                  <td colSpan={colCount} className={cellPad({ size })}>
                    {renderExpanded!(row, rowIndex)}
                  </td>
                </tr>
              )}
              </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
      </div>
      {footer}
    </div>
  );
}
