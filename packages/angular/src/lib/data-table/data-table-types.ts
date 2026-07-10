import type { TemplateRef } from "@angular/core";

/** A value the table can compare when sorting a column. */
export type SortValue = string | number | boolean | Date | null | undefined;

/** Stable per-row key. */
export type RowKeyFn<T> = (row: T, index: number) => string | number;
/** Row click handler (also enables pointer cursor + keyboard activation). */
export type RowClickFn<T> = (row: T, index: number) => void;
/** Predicate over a row (e.g. which rows can expand). */
export type RowPredicate<T> = (row: T) => boolean;
/** Per-row class function for conditional styling. */
export type RowClassFn<T> = (row: T, index: number) => string;

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
  rangeLabel?: string;
  /** Optional page-size selector. */
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export type DataTablePagination = ClientPagination | ServerPagination | CursorPagination;

/** Context handed to a column's `cell` / `footer` template. */
export interface CellContext<T> {
  $implicit: T;
  row: T;
  index: number;
}
export interface FooterContext<T> {
  $implicit: T[];
  rows: T[];
}

/**
 * A single column definition. The table is fully data-driven: you describe the
 * columns once and pass an array of rows.
 */
export interface DataTableColumn<T> {
  /** Unique id — used as the row-tracking key and (if no `header`) the default label. */
  id: string;
  /** Header label. Defaults to `id`. */
  header?: string;
  /** Read a plain value from the row (rendered as text when no `cell` template). */
  accessor?: (row: T) => SortValue;
  /** Custom cell template — `<ng-template let-row let-i="index">`. Overrides `accessor`. */
  cell?: TemplateRef<CellContext<T>>;
  /**
   * Footer/summary cell — a static string, a function given the filtered rows
   * (all pages) to compute an aggregate, or a template. Any column with a
   * `footer` renders a sticky summary row.
   */
  footer?: string | ((rows: T[]) => string) | TemplateRef<FooterContext<T>>;
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
  /** Set false to keep this column always visible (excluded from the toggle). */
  hideable?: boolean;
  /** Show a filter menu on this column's header. */
  filterable?: boolean;
  /**
   * Filter UI: "text" operators, "number" operators, or "select" (pick from the
   * column's distinct values). Defaults to "number" for numeric columns, else "text".
   */
  filterType?: "text" | "number" | "select";
  /** Options for a "select" filter. Omit to derive distinct values from the data. */
  filterOptions?: { value: string; label: string }[];
  /** Allow clicking the header to sort by this column. */
  sortable?: boolean;
  /** Comparable value used when sorting (since `cell` may render a template). */
  sortAccessor?: (row: T) => SortValue;
  /** Extra classes applied to every cell (and the header) in this column. */
  className?: string;
}

// --- per-column filtering ---
export type FilterOperator =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export interface ColumnFilter {
  matchMode: "all" | "any";
  rules: { op: FilterOperator; value: string }[];
}

// Operator lists as value sets — the visible labels are sourced from
// `DataTableMessages.operators` at render time (so they translate). The `label`
// here is the English fallback and matches the message defaults.
export const TEXT_OPS: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
];
export const NUM_OPS: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "=" },
  { value: "notEquals", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
];

// --- i18n --------------------------------------------------------------------

/**
 * All user-facing / screen-reader strings the table renders. Pass a partial
 * `messages` input to translate any subset; the rest fall back to
 * `DEFAULT_DATA_TABLE_MESSAGES` (English). Mirrors the React twin.
 */
export interface DataTableMessages {
  /** aria-label of the global search input. */
  search: string;
  /** Footer text when the filtered result set is empty. */
  noResults: string;
  /** Placeholder of the column-visibility control. */
  columns: string;
  /** "Reset columns" button after a drag reorder. */
  resetColumns: string;
  /** aria-label of the header select-all checkbox. */
  selectAllRows: string;
  /** Base aria-label of a per-row selection control. */
  selectRow: string;
  /** aria-label of a card/expander when collapsed (responsive). */
  expand: string;
  /** aria-label of a card/expander when expanded (responsive). */
  collapse: string;
  /** aria-label of a row expander when collapsed. */
  expandRow: string;
  /** aria-label of a row expander when expanded. */
  collapseRow: string;
  /** aria-label of the row-reorder lead header. */
  reorder: string;
  /** aria-label of a row drag handle. */
  dragToReorder: string;
  /** aria-label of the per-column options (pin) menu trigger. */
  columnOptions: string;
  /** "Pin left" menu item. */
  pinLeft: string;
  /** "Pin right" menu item. */
  pinRight: string;
  /** "Unpin" menu item. */
  unpin: string;
  /** aria-label of the per-column filter menu trigger. */
  filterColumn: string;
  /** "Match all" option in the filter match-mode select. */
  matchAll: string;
  /** "Match any" option in the filter match-mode select. */
  matchAny: string;
  /** Placeholder of a filter rule value input. */
  filterValue: string;
  /** "Add rule" button (rendered with a leading "+"). */
  addRule: string;
  /** "Remove rule" button. */
  removeRule: string;
  /** "Clear" button (filters/search). */
  clear: string;
  /** "Apply" button in a filter menu. */
  apply: string;
  /** Shown when a "select" filter has no distinct values. */
  noValues: string;
  /** aria-label of the previous-page button. */
  previousPage: string;
  /** aria-label of the next-page button. */
  nextPage: string;
  /** Visible text of the cursor-pagination previous button. */
  prev: string;
  /** Visible text of the cursor-pagination next button. */
  next: string;
  /** Label beside the page-size selector. */
  rowsPerPage: string;
  /** aria-label on the pagination <nav>. */
  pagination: string;
  /** Per-operator labels (text ops read words, number ops read symbols). */
  operators: {
    contains: string;
    startsWith: string;
    endsWith: string;
    equals: string;
    notEquals: string;
    gt: string;
    gte: string;
    lt: string;
    lte: string;
  };
  /** aria-label of a numbered page button. */
  goToPage: (page: number) => string;
  /** Numbered footer range text, e.g. "Showing 1–10 of 42". */
  range: (from: number, to: number, total: number) => string;
  /** aria-live announcement when the active sort changes. */
  announceSort: (column: string, direction: "asc" | "desc" | "none") => string;
  /** aria-live announcement when the processed result count changes. */
  announceResults: (count: number) => string;
}

export const DEFAULT_DATA_TABLE_MESSAGES: DataTableMessages = {
  search: "Search",
  noResults: "No results",
  columns: "Columns",
  resetColumns: "Reset columns",
  selectAllRows: "Select all rows",
  selectRow: "Select row",
  expand: "Expand",
  collapse: "Collapse",
  expandRow: "Expand row",
  collapseRow: "Collapse row",
  reorder: "Reorder",
  dragToReorder: "Drag to reorder",
  columnOptions: "Column options",
  pinLeft: "Pin left",
  pinRight: "Pin right",
  unpin: "Unpin",
  filterColumn: "Filter column",
  matchAll: "Match all",
  matchAny: "Match any",
  filterValue: "Value",
  addRule: "Add rule",
  removeRule: "Remove rule",
  clear: "Clear",
  apply: "Apply",
  noValues: "No values",
  previousPage: "Previous page",
  nextPage: "Next page",
  prev: "Prev",
  next: "Next",
  rowsPerPage: "Rows",
  pagination: "Pagination",
  operators: {
    contains: "Contains",
    startsWith: "Starts with",
    endsWith: "Ends with",
    equals: "Equals",
    notEquals: "Not equals",
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
  },
  goToPage: (page) => `Go to page ${page}`,
  range: (from, to, total) => `Showing ${from}–${to} of ${total}`,
  announceSort: (column, direction) =>
    direction === "none"
      ? `Cleared sort on ${column}`
      : `Sorted by ${column} ${direction === "asc" ? "ascending" : "descending"}`,
  announceResults: (count) => `${count} result${count === 1 ? "" : "s"}`,
};

// --- sorting helpers -------------------------------------------------------

// Click cycle on a header: unsorted → asc → desc → unsorted (null = clear).
export function nextDirection(current: SortDirection | undefined): SortDirection | null {
  if (current === undefined) return "asc";
  if (current === "asc") return "desc";
  return null;
}

export function getSortValue<T>(col: DataTableColumn<T>, row: T): SortValue {
  if (col.sortAccessor) return col.sortAccessor(row);
  if (col.accessor) {
    const v = col.accessor(row);
    return typeof v === "string" || typeof v === "number" ? v : undefined;
  }
  return undefined;
}

export function compareValues(a: SortValue, b: SortValue): number {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1; // nullish/empty always sorts last
  if (bEmpty) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function evalRule(
  cell: SortValue,
  op: FilterOperator,
  ruleVal: string,
  type: "text" | "number",
): boolean {
  if (ruleVal === "") return true;
  if (type === "number") {
    const a = Number(cell);
    const b = Number(ruleVal);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (op) {
      case "equals": return a === b;
      case "notEquals": return a !== b;
      case "gt": return a > b;
      case "gte": return a >= b;
      case "lt": return a < b;
      case "lte": return a <= b;
      default: return true;
    }
  }
  const a = String(cell ?? "").toLowerCase();
  const b = ruleVal.toLowerCase();
  switch (op) {
    case "startsWith": return a.startsWith(b);
    case "endsWith": return a.endsWith(b);
    case "equals": return a === b;
    case "notEquals": return a !== b;
    case "contains":
    default: return a.includes(b);
  }
}

// Compact page list with ellipses: 1 … 4 5 6 … 20
export function pageList(current: number, count: number): (number | "ellipsis")[] {
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
