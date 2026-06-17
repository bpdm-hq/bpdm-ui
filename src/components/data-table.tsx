import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

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

/**
 * Data-driven table. Describe `columns` and pass `data`; everything else
 * (density, striping, borders, sticky header, vertical/horizontal scroll, empty
 * state) is a prop. The outer wrapper scrolls horizontally on narrow screens, so
 * it is responsive out of the box.
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
  className,
}: DataTableProps<T>) {
  const clickable = typeof onRowClick === "function";

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
            {columns.map((col) => {
              const align = col.align ?? (col.numeric ? "right" : "left");
              return (
                <th
                  key={col.id}
                  scope="col"
                  style={col.width !== undefined ? { width: col.width } : undefined}
                  className={cn(
                    cellPad({ size }),
                    alignClass[align],
                    "bg-muted font-medium whitespace-nowrap text-muted-foreground",
                    // keep a divider line under the header even when it is sticky
                    "shadow-[inset_0_-1px_0_var(--border)]",
                    bordered &&
                      "border-r border-border last:border-r-0",
                    stickyHeader && "sticky top-0 z-10",
                    col.className,
                  )}
                >
                  {col.header ?? col.id}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn(
                  cellPad({ size }),
                  "text-center text-muted-foreground",
                )}
              >
                {emptyContent}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowKey ? rowKey(row, rowIndex) : rowIndex}
                onClick={clickable ? () => onRowClick!(row, rowIndex) : undefined}
                className={cn(
                  "border-t border-border transition-colors",
                  striped && "even:bg-muted/40",
                  hoverable && "hover:bg-muted/60",
                  clickable && "cursor-pointer",
                )}
              >
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
