import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { MultiSelect } from "./multi-select";
import { Popover } from "./popover";

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
  /**
   * Footer/summary cell — a static node, or a function given the filtered rows
   * (all pages) to compute an aggregate (sum, average, count…). Any column with a
   * `footer` renders a sticky summary row.
   */
  footer?: React.ReactNode | ((rows: T[]) => React.ReactNode);
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
  /** Show a "Columns" control above the table to show/hide columns. */
  columnToggle?: boolean;
  /** Show a global search box that filters rows across all columns. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** On narrow screens, stack each row into a label/value card instead of scrolling. */
  responsive?: boolean;
  /**
   * Virtualize rows for large datasets (10k+) — only visible rows are in the DOM.
   * Renders all rows in a scroll area (uses `maxHeight`, default 440) and ignores
   * pagination. Best with uniform row heights.
   */
  virtualized?: boolean;
  /** Let users drag column headers to reorder columns. */
  reorderableColumns?: boolean;
  /** Fired with the new column-id order after a drag reorder. */
  onColumnOrderChange?: (order: string[]) => void;
  /** Let users drag a row handle (☰) to reorder rows. Requires `rowKey`. */
  reorderableRows?: boolean;
  /** Fired with the reordered data after a row drag. */
  onRowReorder?: (rows: T[]) => void;
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

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FunnelGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
      <path
        d="M2 3.5h12l-4.6 5.4v3.6l-2.8 1.4V8.9L2 3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GripGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
      <path d="M5 4h.01M5 8h.01M5 12h.01M11 4h.01M11 8h.01M11 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden>
      <path
        d="M3 4.5h10M6.5 4.5V3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M5 4.5l.5 8a1 1 0 0 0 1 .9h3a1 1 0 0 0 1-.9l.5-8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

const TEXT_OPS: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
];
const NUM_OPS: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "=" },
  { value: "notEquals", label: "≠" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
];

function evalRule(
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

const filterField =
  "h-9 w-full rounded-[var(--radius)] border border-input bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring";

// native select with the browser arrow hidden + our own chevron (with breathing room)
function FilterSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(filterField, "cursor-pointer appearance-none pr-8", className)}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ColumnFilterMenu({
  type,
  options,
  filter,
  onApply,
  onClear,
}: {
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  filter?: ColumnFilter;
  onApply: (f: ColumnFilter) => void;
  onClear: () => void;
}) {
  const ops = type === "number" ? NUM_OPS : TEXT_OPS;
  const emptyDraft = (): ColumnFilter => ({
    matchMode: "all",
    rules: [{ op: ops[0].value, value: "" }],
  });
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ColumnFilter>(filter ?? emptyDraft());
  // "select" filters track a set of chosen values instead of operator rules
  const [selected, setSelected] = React.useState<string[]>(
    () => filter?.rules.map((r) => r.value) ?? [],
  );
  React.useEffect(() => {
    if (!open) return;
    setDraft(filter ?? emptyDraft());
    setSelected(filter?.rules.map((r) => r.value) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const active = !!filter && filter.rules.some((r) => r.value !== "");

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      trigger={
        <button
          type="button"
          aria-label="Filter column"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "grid size-6 shrink-0 cursor-pointer place-items-center rounded-md transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "text-primary" : "text-muted-foreground/70",
          )}
        >
          <FunnelGlyph />
        </button>
      }
    >
      {type === "select" ? (
        <div className="w-56 space-y-2">
          <div className="max-h-56 space-y-0.5 overflow-y-auto">
            {(options ?? []).map((o) => {
              const checked = selected.includes(o.value);
              return (
                <label
                  key={o.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <Checkbox
                    size="sm"
                    checked={checked}
                    onCheckedChange={() =>
                      setSelected((s) =>
                        checked ? s.filter((v) => v !== o.value) : [...s, o.value],
                      )
                    }
                  />
                  <span className="truncate">{o.label}</span>
                </label>
              );
            })}
            {(options ?? []).length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No values</p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onApply({
                  matchMode: "any",
                  rules: selected.map((v) => ({ op: "equals" as FilterOperator, value: v })),
                });
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      ) : (
      <div className="w-64 space-y-2.5">
        {draft.rules.length > 1 && (
          <FilterSelect
            value={draft.matchMode}
            onChange={(v) => setDraft((d) => ({ ...d, matchMode: v as "all" | "any" }))}
            className="font-medium"
          >
            <option value="all">Match all</option>
            <option value="any">Match any</option>
          </FilterSelect>
        )}
        {draft.rules.map((rule, i) => (
          <div key={i} className="space-y-2">
            <FilterSelect
              value={rule.op}
              onChange={(v) =>
                setDraft((d) => {
                  const rules = [...d.rules];
                  rules[i] = { ...rules[i], op: v as FilterOperator };
                  return { ...d, rules };
                })
              }
            >
              {ops.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>
            <input
              type={type === "number" ? "number" : "text"}
              value={rule.value}
              placeholder="Value"
              onChange={(e) =>
                setDraft((d) => {
                  const rules = [...d.rules];
                  rules[i] = { ...rules[i], value: e.target.value };
                  return { ...d, rules };
                })
              }
              className={filterField}
            />
            {draft.rules.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    rules: d.rules.filter((_, j) => j !== i),
                  }))
                }
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <TrashGlyph />
                Remove rule
              </button>
            )}
            {i < draft.rules.length - 1 && (
              <div className="border-t border-border" />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDraft((d) => ({
              ...d,
              rules: [...d.rules, { op: ops[0].value, value: "" }],
            }))
          }
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius)] border border-dashed border-border py-1.5 text-sm text-primary transition-colors hover:bg-primary/5"
        >
          + Add rule
        </button>
        <div className="flex items-center justify-between pt-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </div>
      )}
    </Popover>
  );
}

// matches a media query (SSR-safe — defaults to false until mounted)
function useMediaQuery(query: string, enabled: boolean) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query, enabled]);
  return matches;
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
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-8 cursor-pointer appearance-none rounded-lg border border-input bg-background pl-2.5 pr-7 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
  columnToggle = false,
  searchable = false,
  searchPlaceholder = "Search…",
  responsive = false,
  virtualized = false,
  reorderableColumns = false,
  onColumnOrderChange,
  reorderableRows = false,
  onRowReorder,
  label,
  className,
}: DataTableProps<T>) {
  const clickable = typeof onRowClick === "function";
  const isControlled = sort !== undefined;

  const [internalSort, setInternalSort] = React.useState<DataTableSort[]>(
    defaultSort ?? [],
  );
  const sortState = isControlled ? sort! : internalSort;

  // global search query
  const [query, setQuery] = React.useState("");

  // per-column filters (id → matchMode + rules)
  const [filters, setFilters] = React.useState<Record<string, ColumnFilter>>({});

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
  // drag-to-reorder column order (ids); empty until the user reorders
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [dragColId, setDragColId] = React.useState<string | null>(null);
  const orderedBase = React.useMemo(() => {
    if (!reorderableColumns || columnOrder.length === 0) return columns;
    const idx = new Map(columnOrder.map((id, i) => [id, i]));
    return [...columns].sort(
      (a, b) => (idx.get(a.id) ?? 0) - (idx.get(b.id) ?? 0),
    );
  }, [columns, reorderableColumns, columnOrder]);
  const moveColumn = (dragId: string | null, overId: string) => {
    if (!dragId || dragId === overId) return;
    const base = columnOrder.length ? columnOrder : columns.map((c) => c.id);
    const from = base.indexOf(dragId);
    const to = base.indexOf(overId);
    if (from === -1 || to === -1) return;
    // insert at the target's ORIGINAL index → correct for both drag directions
    const next = [...base];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setColumnOrder(next);
    onColumnOrderChange?.(next);
  };

  const effectiveColumns = React.useMemo(
    () =>
      pinnable
        ? orderedBase.map((c) => ({ ...c, pin: pinState[c.id] ?? c.pin }))
        : orderedBase,
    [orderedBase, pinnable, pinState],
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
  // global search filters rows across every column's comparable value (the same
  // value sorting uses) before sorting/paging — so totals + pages reflect it.
  // drag-to-reorder row order (keys); requires rowKey for stable identity
  const [rowOrder, setRowOrder] = React.useState<React.Key[]>([]);
  const [dragRowKey, setDragRowKey] = React.useState<React.Key | null>(null);
  // live drop target + side, so we can show an insertion line and drop exactly there
  const [dropTarget, setDropTarget] = React.useState<{
    key: React.Key;
    pos: "before" | "after";
  } | null>(null);
  const dataOrdered = React.useMemo(() => {
    if (!reorderableRows || rowOrder.length === 0 || !rowKey) return data;
    const pos = new Map(rowOrder.map((k, i) => [k, i]));
    return [...data].sort(
      (a, b) => (pos.get(rowKey(a, 0)) ?? 0) - (pos.get(rowKey(b, 0)) ?? 0),
    );
  }, [data, reorderableRows, rowOrder, rowKey]);
  const moveRow = (
    dragKey: React.Key | null,
    overKey: React.Key,
    pos: "before" | "after",
  ) => {
    if (!rowKey || dragKey == null || dragKey === overKey) return;
    const base = rowOrder.length ? rowOrder : data.map((r) => rowKey(r, 0));
    if (base.indexOf(dragKey) === -1 || base.indexOf(overKey) === -1) return;
    const next = base.filter((k) => k !== dragKey);
    // insert relative to the target's position AFTER removing the dragged row
    const insert = next.indexOf(overKey) + (pos === "after" ? 1 : 0);
    next.splice(insert, 0, dragKey);
    setRowOrder(next);
    if (onRowReorder) {
      const map = new Map(data.map((r) => [rowKey(r, 0), r]));
      onRowReorder(next.map((k) => map.get(k)).filter(Boolean) as T[]);
    }
  };

  const filteredData = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    // resolve active column filters once (skip empty-value rule sets)
    const active = Object.entries(filters)
      .map(([id, f]) => ({
        col: colById.get(id),
        type: (colById.get(id)?.filterType ??
          (colById.get(id)?.numeric ? "number" : "text")) as "text" | "number",
        matchMode: f.matchMode,
        rules: f.rules.filter((r) => r.value !== ""),
      }))
      .filter((f) => f.col && f.rules.length > 0);

    if (!q && active.length === 0) return dataOrdered;

    return dataOrdered.filter((row) => {
      if (q) {
        const hit = effectiveColumns.some((col) => {
          const v = getSortValue(col, row);
          return v != null && String(v).toLowerCase().includes(q);
        });
        if (!hit) return false;
      }
      // every filtered column must pass (AND); rules within a column use matchMode
      return active.every(({ col, type, matchMode, rules }) => {
        const cell = getSortValue(col!, row);
        const res = rules.map((r) => evalRule(cell, r.op, r.value, type));
        return matchMode === "all" ? res.every(Boolean) : res.some(Boolean);
      });
    });
  }, [dataOrdered, query, filters, effectiveColumns, colById]);

  const sortedRows = React.useMemo(() => {
    if (isControlled || sortState.length === 0) return filteredData;
    // resolve the active sort columns once
    const active = sortState
      .map((s) => ({ dir: s.dir, col: colById.get(s.id) }))
      .filter((a): a is { dir: SortDirection; col: DataTableColumn<T> } => !!a.col);
    if (active.length === 0) return filteredData;
    // decorate → sort → undecorate: read each row's sort values ONCE (O(n)),
    // then compare the cached values. Avoids calling accessors inside the
    // O(n log n) comparator, which is the difference between snappy and sluggish
    // on large client-side datasets.
    const decorated = filteredData.map((row, i) => ({
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
  }, [filteredData, sortState, colById, isControlled]);

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

  // virtualization renders ALL filtered rows in a scroll area (no paging)
  if (virtualized) {
    rows = sortedRows;
    footer = null;
  }

  // scroll element (callback ref + state so the virtualizer re-measures on mount)
  const [scrollEl, setScrollEl] = React.useState<HTMLDivElement | null>(null);
  const rowEstimate = size === "sm" ? 38 : size === "lg" ? 54 : 45;
  const virtualizer = useVirtualizer({
    count: virtualized ? rows.length : 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => rowEstimate,
    overscan: 10,
  });
  const virtualItems = virtualized ? virtualizer.getVirtualItems() : [];
  const padTop = virtualItems.length ? virtualItems[0].start : 0;
  const padBottom = virtualItems.length
    ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

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

  // --- column visibility (toggle) ---
  const [hiddenIds, setHiddenIds] = React.useState<Set<string>>(new Set());

  // Pinned columns auto-move to the edges (left-pinned first, right-pinned last),
  // keeping their relative order — so authors never have to hand-order them and
  // the pinned blocks are always contiguous (no gaps). Hidden columns drop out.
  const orderedColumns = React.useMemo(
    () =>
      [
        ...effectiveColumns.filter((c) => c.pin === "left"),
        ...effectiveColumns.filter((c) => !c.pin),
        ...effectiveColumns.filter((c) => c.pin === "right"),
      ].filter((c) => !(c.hideable !== false && hiddenIds.has(c.id))),
    [effectiveColumns, hiddenIds],
  );

  const colCount =
    orderedColumns.length +
    (selectable ? 1 : 0) +
    (expandable ? 1 : 0) +
    (reorderableRows ? 1 : 0);
  const hasFooter = orderedColumns.some((c) => c.footer !== undefined);

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

  const toggleable = columns.filter((c) => c.hideable !== false);
  const visibleToggleIds = toggleable
    .filter((c) => !hiddenIds.has(c.id))
    .map((c) => c.id);

  // distinct values for a "select" filter (derived from data unless provided)
  const getFilterOptions = (col: DataTableColumn<T>) => {
    const seen = new Set<string>();
    const out: { value: string; label: string }[] = [];
    for (const row of data) {
      const v = getSortValue(col, row);
      if (v == null || v === "") continue;
      const s = String(v);
      if (!seen.has(s)) {
        seen.add(s);
        out.push({ value: s, label: s });
      }
    }
    return out.sort((a, b) => a.label.localeCompare(b.label));
  };

  const isMobile = useMediaQuery("(max-width: 639px)", responsive);
  const renderCell = (col: DataTableColumn<T>, row: T, i: number) =>
    col.cell ? col.cell(row, i) : col.accessor ? col.accessor(row) : null;

  const hasFilterableCols = effectiveColumns.some((c) => c.filterable);
  const hasActiveFilters = Object.values(filters).some((f) =>
    f.rules.some((r) => r.value !== ""),
  );
  const orderChanged = reorderableColumns && columnOrder.length > 0;
  const showToolbar =
    searchable ||
    hasFilterableCols ||
    orderChanged ||
    (columnToggle && toggleable.length > 0);

  return (
    <div className="w-full">
      {showToolbar && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(query || hasActiveFilters) && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setQuery("");
                  setFilters({});
                }}
              >
                <FunnelGlyph />
                Clear
              </Button>
            )}
            {orderChanged && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setColumnOrder([]);
                  onColumnOrderChange?.([]);
                }}
              >
                Reset columns
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {columnToggle && toggleable.length > 0 && (
              <div className="w-48">
                <MultiSelect
                  size="sm"
                  maxDisplay={0}
                  selectAll={false}
                  searchable
                  placeholder="Columns"
                  options={toggleable.map((c) => ({
                    value: c.id,
                    label: typeof c.header === "string" ? c.header : c.id,
                  }))}
                  value={visibleToggleIds}
                  onValueChange={(ids) => {
                    const next = new Set<string>();
                    toggleable.forEach((c) => {
                      if (!ids.includes(c.id)) next.add(c.id);
                    });
                    setHiddenIds(next);
                  }}
                />
              </div>
            )}
            {searchable && (
              <div className="relative">
                <SearchGlyph className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                  className="h-9 w-56 rounded-[var(--radius)] border border-input bg-background pl-8 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {responsive && isMobile ? (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
              {emptyContent}
            </div>
          ) : (
            rows.map((row, rowIndex) => {
              const key = keyOf(row, rowIndex);
              const selected = selectedSet.has(key);
              const expanded = expandable && expandedSet.has(key);
              const canExpand = expandable && (!rowExpandable || rowExpandable(row));
              return (
                <div
                  key={key}
                  data-selected={selected || undefined}
                  onClick={clickable ? () => onRowClick!(row, rowIndex) : undefined}
                  className={cn(
                    "rounded-xl border border-border bg-card p-4",
                    selected && "ring-1 ring-primary",
                    clickable && "cursor-pointer",
                    typeof rowClassName === "function"
                      ? rowClassName(row, rowIndex)
                      : rowClassName,
                  )}
                >
                  {(selectable || canExpand) && (
                    <div
                      className="mb-3 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {selectable ? (
                        selectionMode === "single" ? (
                          <RowRadio checked={selected} onSelect={() => toggleRow(key)} label="Select row" />
                        ) : (
                          <Checkbox size="sm" aria-label="Select row" checked={selected} onCheckedChange={() => toggleRow(key)} />
                        )
                      ) : (
                        <span />
                      )}
                      {canExpand && (
                        <button
                          type="button"
                          aria-label={expanded ? "Collapse" : "Expand"}
                          aria-expanded={expanded}
                          onClick={() => toggleExpand(key)}
                          className="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <svg viewBox="0 0 16 16" className={cn("size-4 transition-transform", expanded && "rotate-90")} fill="none" aria-hidden>
                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                  <dl className="grid grid-cols-[minmax(5rem,auto)_1fr] gap-x-3 gap-y-1.5 text-sm">
                    {orderedColumns.map((col) => (
                      <React.Fragment key={col.id}>
                        <dt className="truncate text-muted-foreground">
                          {col.header ?? col.id}
                        </dt>
                        <dd className={cn("min-w-0 text-right", col.numeric && "tabular-nums")}>
                          {renderCell(col, row, rowIndex)}
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                  {expanded && (
                    <div className="mt-3 border-t border-border pt-3">
                      {renderExpanded!(row, rowIndex)}
                    </div>
                  )}
                </div>
              );
            })
          )}
          {footer}
        </div>
      ) : (
      <div
        className={cn(
          "w-full",
          frame && "overflow-hidden rounded-xl border border-border bg-card",
          className,
        )}
      >
      <div
        ref={setScrollEl}
        className="overflow-auto"
        style={
          virtualized
            ? { maxHeight: maxHeight ?? 440 }
            : maxHeight !== undefined
              ? { maxHeight }
              : undefined
        }
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
            {reorderableRows && (
              <th
                scope="col"
                aria-label="Reorder"
                className={cn(
                  cellPad({ size }),
                  "w-[1%]",
                  frame ? "bg-muted" : "bg-transparent",
                  "shadow-[inset_0_-1px_0_var(--border)]",
                  stickyHeader && "sticky top-0 z-10",
                )}
              />
            )}
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
                  draggable={reorderableColumns || undefined}
                  onDragStart={
                    reorderableColumns ? () => setDragColId(col.id) : undefined
                  }
                  onDragOver={
                    reorderableColumns ? (e) => e.preventDefault() : undefined
                  }
                  onDrop={
                    reorderableColumns
                      ? () => {
                          moveColumn(dragColId, col.id);
                          setDragColId(null);
                        }
                      : undefined
                  }
                  onDragEnd={reorderableColumns ? () => setDragColId(null) : undefined}
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
                    reorderableColumns && "cursor-grab active:cursor-grabbing",
                    dragColId === col.id && "opacity-40",
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
                    {col.filterable && (
                      <ColumnFilterMenu
                        type={col.filterType ?? (col.numeric ? "number" : "text")}
                        options={
                          col.filterType === "select"
                            ? col.filterOptions ?? getFilterOptions(col)
                            : undefined
                        }
                        filter={filters[col.id]}
                        onApply={(f) => setFilters((s) => ({ ...s, [col.id]: f }))}
                        onClear={() =>
                          setFilters((s) => {
                            const next = { ...s };
                            delete next[col.id];
                            return next;
                          })
                        }
                      />
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
            <>
            {virtualized && padTop > 0 && (
              <tr style={{ height: padTop }}>
                <td colSpan={colCount} />
              </tr>
            )}
            {(virtualized
              ? virtualItems.map((v) => v.index)
              : rows.map((_, i) => i)
            ).map((rowIndex) => {
              const row = rows[rowIndex];
              const key = keyOf(row, rowIndex);
              const selected = selectedSet.has(key);
              const expanded = expandable && expandedSet.has(key);
              const canExpand = expandable && (!rowExpandable || rowExpandable(row));
              return (
              <React.Fragment key={key}>
              <tr
                data-selected={selected || undefined}
                data-expanded={expanded || undefined}
                onDragOver={
                  reorderableRows
                    ? (e) => {
                        e.preventDefault();
                        const r = e.currentTarget.getBoundingClientRect();
                        const pos = e.clientY < r.top + r.height / 2 ? "before" : "after";
                        if (dropTarget?.key !== key || dropTarget?.pos !== pos)
                          setDropTarget({ key, pos });
                      }
                    : undefined
                }
                onDrop={
                  reorderableRows
                    ? () => {
                        if (dropTarget) moveRow(dragRowKey, dropTarget.key, dropTarget.pos);
                        setDragRowKey(null);
                        setDropTarget(null);
                      }
                    : undefined
                }
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
                  // insertion line while reordering rows
                  dropTarget?.key === key &&
                    dropTarget.pos === "before" &&
                    "shadow-[inset_0_2px_0_var(--primary)]",
                  dropTarget?.key === key &&
                    dropTarget.pos === "after" &&
                    "shadow-[inset_0_-2px_0_var(--primary)]",
                  clickable &&
                    "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  typeof rowClassName === "function"
                    ? rowClassName(row, rowIndex)
                    : rowClassName,
                )}
              >
                {reorderableRows && (
                  <td
                    className={cn(cellPad({ size }), "w-[1%]", bordered && "border-r border-border", cellClassName)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      draggable
                      onDragStart={() => setDragRowKey(key)}
                      onDragEnd={() => {
                        setDragRowKey(null);
                        setDropTarget(null);
                      }}
                      aria-label="Drag to reorder"
                      className={cn(
                        "grid size-6 cursor-grab place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing",
                        dragRowKey === key && "opacity-40",
                      )}
                    >
                      <GripGlyph />
                    </div>
                  </td>
                )}
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
            })}
            {virtualized && padBottom > 0 && (
              <tr style={{ height: padBottom }}>
                <td colSpan={colCount} />
              </tr>
            )}
            </>
          )}
        </tbody>
        {hasFooter && (
          <tfoot>
            <tr>
              {reorderableRows && (
                <td className={cn(cellPad({ size }), "w-[1%] bg-muted shadow-[inset_0_1px_0_var(--border)] sticky bottom-0")} />
              )}
              {expandable && (
                <td
                  style={
                    hasLeftPin
                      ? { position: "sticky", left: pinPx.left["__lead_expand"] }
                      : undefined
                  }
                  className={cn(
                    cellPad({ size }),
                    "w-[1%] bg-muted shadow-[inset_0_1px_0_var(--border)]",
                    bordered && "border-r border-border",
                    hasLeftPin ? "sticky z-20" : "sticky",
                    "bottom-0",
                  )}
                />
              )}
              {selectable && (
                <td
                  style={
                    hasLeftPin
                      ? { position: "sticky", left: pinPx.left["__lead_select"] }
                      : undefined
                  }
                  className={cn(
                    cellPad({ size }),
                    "w-[1%] bg-muted shadow-[inset_0_1px_0_var(--border)]",
                    bordered && "border-r border-border",
                    "sticky bottom-0",
                    hasLeftPin && "z-20",
                  )}
                />
              )}
              {orderedColumns.map((col) => {
                const align = col.align ?? (col.numeric ? "right" : "left");
                const content =
                  typeof col.footer === "function" ? col.footer(sortedRows) : col.footer;
                return (
                  <td
                    key={col.id}
                    style={col.pin ? pinStyleFor(col) : undefined}
                    className={cn(
                      cellPad({ size }),
                      alignClass[align],
                      col.numeric && "tabular-nums",
                      "sticky bottom-0 bg-muted font-medium text-foreground",
                      "shadow-[inset_0_1px_0_var(--border)]",
                      bordered && "border-r border-border last:border-r-0",
                      col.pin ? "z-20" : "z-10",
                      col.id === lastLeftId && "border-r border-border",
                      col.id === firstRightId && "border-l border-border",
                      col.className,
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
      </div>
      {footer}
      </div>
      )}
    </div>
  );
}
