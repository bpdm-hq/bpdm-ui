import * as React from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
  GripVertical,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── shared list helpers (also used by PickList later) ────────────────────────
export type ItemKey = string | number;

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

function partition<T>(arr: T[], keyOf: (i: T) => ItemKey, sel: Set<ItemKey>) {
  const picked: T[] = [];
  const rest: T[] = [];
  for (const it of arr) (sel.has(keyOf(it)) ? picked : rest).push(it);
  return { picked, rest };
}

/** Move selected items toward the start by one (stable). */
export function moveSelectedUp<T>(arr: T[], keyOf: (i: T) => ItemKey, sel: Set<ItemKey>): T[] {
  const next = arr.slice();
  for (let i = 1; i < next.length; i++) {
    if (sel.has(keyOf(next[i])) && !sel.has(keyOf(next[i - 1]))) {
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
    }
  }
  return next;
}
export function moveSelectedDown<T>(arr: T[], keyOf: (i: T) => ItemKey, sel: Set<ItemKey>): T[] {
  const next = arr.slice();
  for (let i = next.length - 2; i >= 0; i--) {
    if (sel.has(keyOf(next[i])) && !sel.has(keyOf(next[i + 1]))) {
      [next[i + 1], next[i]] = [next[i], next[i + 1]];
    }
  }
  return next;
}
export function moveSelectedTop<T>(arr: T[], keyOf: (i: T) => ItemKey, sel: Set<ItemKey>): T[] {
  const { picked, rest } = partition(arr, keyOf, sel);
  return [...picked, ...rest];
}
export function moveSelectedBottom<T>(arr: T[], keyOf: (i: T) => ItemKey, sel: Set<ItemKey>): T[] {
  const { picked, rest } = partition(arr, keyOf, sel);
  return [...rest, ...picked];
}

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (v: T) => void) {
  const [internal, setInternal] = React.useState(fallback);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : internal;
  const set = React.useCallback(
    (v: T) => {
      if (!isControlled) setInternal(v);
      onChange?.(v);
    },
    [isControlled, onChange],
  );
  return [value, set] as const;
}

// ── SelectableList — scrollable, selectable, filterable, optionally drag-sortable
// (PickList will reuse this for both panes) ──────────────────────────────────
export interface SelectableListProps<T> {
  items: T[];
  keyOf: (item: T) => ItemKey;
  renderItem: (item: T) => React.ReactNode;
  selected: Set<ItemKey>;
  onToggle: (key: ItemKey, item: T) => void;
  /** Reorder via drag (provide to enable). Disabled while a filter is active. */
  onReorder?: (next: T[]) => void;
  header?: React.ReactNode;
  /** Filter input: match each item's text via this accessor. */
  filterBy?: (item: T) => string;
  filterPlaceholder?: string;
  /** Max body height before scrolling, e.g. "18rem". */
  scrollHeight?: string;
  emptyText?: string;
  className?: string;
}

export function SelectableList<T>({
  items,
  keyOf,
  renderItem,
  selected,
  onToggle,
  onReorder,
  header,
  filterBy,
  filterPlaceholder = "Filter",
  scrollHeight = "18rem",
  emptyText = "No items",
  className,
}: SelectableListProps<T>) {
  const [query, setQuery] = React.useState("");
  const [dragKey, setDragKey] = React.useState<ItemKey | null>(null);
  const [overKey, setOverKey] = React.useState<ItemKey | null>(null);

  const filtering = !!filterBy && query.trim() !== "";
  const shown = filtering
    ? items.filter((i) => filterBy!(i).toLowerCase().includes(query.trim().toLowerCase()))
    : items;
  const canDrag = !!onReorder && !filtering;

  const handleDrop = (targetKey: ItemKey) => {
    if (dragKey != null && dragKey !== targetKey && onReorder) {
      const from = items.findIndex((i) => keyOf(i) === dragKey);
      const to = items.findIndex((i) => keyOf(i) === targetKey);
      if (from > -1 && to > -1) onReorder(moveItem(items, from, to));
    }
    setDragKey(null); // always reset, even on a no-op drop
    setOverKey(null);
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-card",
        className,
      )}
    >
      {header && <div className="border-b border-border px-3 py-2 text-sm font-semibold">{header}</div>}

      {filterBy && (
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={filterPlaceholder}
            aria-label={filterPlaceholder}
            className="h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      )}

      <div role="listbox" aria-multiselectable className="overflow-y-auto p-1" style={{ maxHeight: scrollHeight }}>
        {shown.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          shown.map((item) => {
            const key = keyOf(item);
            const isSel = selected.has(key);
            // only while a drag is actually in progress — never a stray top line
            const isOver = dragKey !== null && overKey === key && dragKey !== key;
            return (
              <div
                key={key}
                role="option"
                aria-selected={isSel}
                tabIndex={0}
                draggable={canDrag}
                onClick={() => onToggle(key, item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(key, item);
                  }
                }}
                onDragStart={() => canDrag && setDragKey(key)}
                onDragOver={(e) => {
                  if (!canDrag) return;
                  e.preventDefault();
                  setOverKey(key);
                }}
                onDragLeave={() => setOverKey((k) => (k === key ? null : k))}
                onDragEnd={() => {
                  setDragKey(null);
                  setOverKey(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(key);
                }}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-[calc(var(--radius)-3px)] px-2.5 py-2 text-sm outline-none transition-[background-color,transform] duration-[var(--bpdm-duration-fast)] active:scale-[0.99]",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  // on-brand: a primary left accent + tint marks the selection.
                  // full-height, with the left corners curved to match the row.
                  "before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-[calc(var(--radius)-3px)] before:bg-primary before:transition-opacity",
                  isSel
                    ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-foreground before:opacity-100"
                    : "text-foreground hover:bg-muted before:opacity-0",
                  dragKey === key && "opacity-50",
                )}
                style={isOver ? { boxShadow: "inset 0 2px 0 0 var(--primary)" } : undefined}
              >
                {canDrag && (
                  <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/50 transition-colors active:cursor-grabbing group-hover:text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">{renderItem(item)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── shared square icon button for the control columns ───────────────────────
export function ControlButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground transition-[background-color,color,transform] duration-[var(--bpdm-duration-fast)] hover:bg-muted hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

function sameOrder<T>(a: T[], b: T[], keyOf: (i: T) => ItemKey) {
  return a.length === b.length && a.every((x, i) => keyOf(x) === keyOf(b[i]));
}

// ── ReorderControls — the up/top/down/bottom column (used by OrderList + PickList)
export function ReorderControls<T>({
  items,
  itemKey,
  selected,
  onChange,
  className,
}: {
  items: T[];
  itemKey: (item: T) => ItemKey;
  selected: Set<ItemKey>;
  onChange: (next: T[]) => void;
  className?: string;
}) {
  const move = (fn: (a: T[], k: (i: T) => ItemKey, s: Set<ItemKey>) => T[]) => {
    const next = fn(items, itemKey, selected);
    if (!sameOrder(next, items, itemKey)) onChange(next);
  };
  const can = (fn: (a: T[], k: (i: T) => ItemKey, s: Set<ItemKey>) => T[]) =>
    selected.size > 0 && !sameOrder(fn(items, itemKey, selected), items, itemKey);

  return (
    <div className={cn("flex flex-row gap-1.5 sm:flex-col", className)}>
      <ControlButton label="Move up" disabled={!can(moveSelectedUp)} onClick={() => move(moveSelectedUp)}>
        <ChevronUp />
      </ControlButton>
      <ControlButton label="Move to top" disabled={!can(moveSelectedTop)} onClick={() => move(moveSelectedTop)}>
        <ChevronsUp />
      </ControlButton>
      <ControlButton label="Move down" disabled={!can(moveSelectedDown)} onClick={() => move(moveSelectedDown)}>
        <ChevronDown />
      </ControlButton>
      <ControlButton label="Move to bottom" disabled={!can(moveSelectedBottom)} onClick={() => move(moveSelectedBottom)}>
        <ChevronsDown />
      </ControlButton>
    </div>
  );
}

// ── OrderList — SelectableList + a reorder control column ─────────────────────
export interface OrderListProps<T> {
  value?: T[];
  defaultValue?: T[];
  onChange?: (value: T[]) => void;
  /** Stable id for each item (dataKey). */
  itemKey: (item: T) => ItemKey;
  renderItem: (item: T) => React.ReactNode;
  header?: React.ReactNode;
  /** Enable filtering by matching this accessor. */
  filterBy?: (item: T) => string;
  filterPlaceholder?: string;
  /** Enable drag-and-drop reordering. Default true. */
  dragdrop?: boolean;
  /**
   * "single" (default) — one item at a time, so the controls and drag stay
   * consistent. "multiple" — select several and move them together with the
   * control column (drag still moves one item).
   */
  selectionMode?: "single" | "multiple";
  scrollHeight?: string;
  className?: string;
}

/**
 * Reorder a collection: select one or more items, then move them up / to top /
 * down / to bottom with the control column, or drag to reorder. Controlled
 * (`value`) or uncontrolled (`defaultValue`); filterable; responsive (the controls
 * sit beside the list, and stack above it on small screens).
 */
export function OrderList<T>({
  value: valueProp,
  defaultValue = [],
  onChange,
  itemKey,
  renderItem,
  header,
  filterBy,
  filterPlaceholder,
  dragdrop = true,
  selectionMode = "single",
  scrollHeight,
  className,
}: OrderListProps<T>) {
  const [items, setItems] = useControllable<T[]>(valueProp, defaultValue, onChange);
  const [selected, setSelected] = React.useState<Set<ItemKey>>(new Set());

  const toggle = (key: ItemKey) =>
    setSelected((prev) => {
      if (selectionMode === "single") {
        // toggle a single selection: re-click clears it
        return prev.has(key) && prev.size === 1 ? new Set() : new Set([key]);
      }
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-start", className)}>
      <ReorderControls items={items} itemKey={itemKey} selected={selected} onChange={setItems} />

      <SelectableList
        className="flex-1"
        items={items}
        keyOf={itemKey}
        renderItem={renderItem}
        selected={selected}
        onToggle={toggle}
        onReorder={dragdrop ? setItems : undefined}
        header={header}
        filterBy={filterBy}
        filterPlaceholder={filterPlaceholder}
        scrollHeight={scrollHeight}
      />
    </div>
  );
}
