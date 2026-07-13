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
import { useControllable } from "@/lib/use-controllable";

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
  /** Whether more than one option can be selected (drives `aria-multiselectable`). */
  multiselectable?: boolean;
  /** Accessible name for the listbox when there is no visible `header`. */
  ariaLabel?: string;
  /** Predicate marking an item as disabled — not selectable, draggable, or keyboard-active. */
  isItemDisabled?: (item: T) => boolean;
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
  multiselectable = false,
  ariaLabel,
  isItemDisabled,
  className,
}: SelectableListProps<T>) {
  const isDisabled = (item: T) => !!isItemDisabled?.(item);
  const [query, setQuery] = React.useState("");
  const [dragKey, setDragKey] = React.useState<ItemKey | null>(null);
  const [overKey, setOverKey] = React.useState<ItemKey | null>(null);
  // roving "active" option for the WAI-ARIA listbox keyboard pattern
  const [activeKey, setActiveKey] = React.useState<ItemKey | null>(null);

  const baseId = React.useId();
  const headerId = header ? `${baseId}-label` : undefined;
  const optionId = (k: ItemKey) => `${baseId}-opt-${String(k)}`;

  const filtering = !!filterBy && query.trim() !== "";
  const shown = filtering
    ? items.filter((i) => filterBy!(i).toLowerCase().includes(query.trim().toLowerCase()))
    : items;
  const canDrag = !!onReorder && !filtering;

  // first / next enabled option in a direction (keyboard nav skips disabled rows)
  const findEnabled = (start: number, dir: 1 | -1) => {
    for (let i = start; i >= 0 && i < shown.length; i += dir) {
      if (!isDisabled(shown[i])) return i;
    }
    return -1;
  };

  // keep the active option within what's currently visible + enabled (e.g. after filtering)
  React.useEffect(() => {
    const ok = activeKey != null && shown.some((i) => keyOf(i) === activeKey && !isDisabled(i));
    if (!ok) {
      const first = findEnabled(0, 1);
      setActiveKey(first >= 0 ? keyOf(shown[first]) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, activeKey, keyOf]);

  const activeIndex = activeKey == null ? -1 : shown.findIndex((i) => keyOf(i) === activeKey);

  // keep the active option visible: with the aria-activedescendant pattern the
  // browser does not auto-scroll (focus stays on the listbox), so a keyboard user
  // could drive the active item off-screen in the scrollable body.
  React.useEffect(() => {
    if (activeKey == null || typeof document === "undefined") return;
    document.getElementById(optionId(activeKey))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const setActiveTo = (idx: number) => {
    if (idx >= 0) setActiveKey(keyOf(shown[idx]));
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveTo(findEnabled(activeIndex < 0 ? 0 : activeIndex + 1, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveTo(findEnabled(activeIndex < 0 ? shown.length - 1 : activeIndex - 1, -1));
        break;
      case "Home":
        e.preventDefault();
        setActiveTo(findEnabled(0, 1));
        break;
      case "End":
        e.preventDefault();
        setActiveTo(findEnabled(shown.length - 1, -1));
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0 && !isDisabled(shown[activeIndex])) {
          e.preventDefault();
          const it = shown[activeIndex];
          onToggle(keyOf(it), it);
        }
        break;
    }
  };

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
      {header && (
        <div id={headerId} className="border-b border-border px-3 py-2 text-sm font-semibold">
          {header}
        </div>
      )}

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

      <div
        role="listbox"
        aria-multiselectable={multiselectable || undefined}
        aria-labelledby={headerId}
        aria-label={headerId ? undefined : (ariaLabel ?? "Orderable list")}
        tabIndex={0}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeKey as ItemKey) : undefined}
        onFocus={() => {
          if (activeIndex < 0) setActiveTo(findEnabled(0, 1));
        }}
        onKeyDown={onListKeyDown}
        // Focus lives on the container (aria-activedescendant); the keyboard-active
        // accent shows only while the container is :focus-visible (see below).
        className="group/lb min-h-0 flex-1 overflow-y-auto p-1 outline-none"
        style={{ maxHeight: scrollHeight }}
      >
        {shown.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          shown.map((item) => {
            const key = keyOf(item);
            const itemDisabled = isDisabled(item);
            const isSel = selected.has(key);
            const isActive = key === activeKey;
            const draggable = canDrag && !itemDisabled;
            // only while a drag is actually in progress — never a stray top line
            const isOver = dragKey !== null && overKey === key && dragKey !== key;
            return (
              <div
                key={key}
                id={optionId(key)}
                role="option"
                aria-selected={isSel}
                aria-disabled={itemDisabled || undefined}
                draggable={draggable}
                onClick={() => {
                  if (itemDisabled) return;
                  setActiveKey(key);
                  onToggle(key, item);
                }}
                onDragStart={() => draggable && setDragKey(key)}
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
                  "group relative flex items-center gap-2 overflow-hidden rounded-[calc(var(--radius)-3px)] px-2.5 py-2 text-sm transition-[background-color,transform] duration-[var(--bpdm-duration-fast)]",
                  // gentle settle-in when an item is added / transferred into this list
                  "animate-[bpdm-list-in_var(--bpdm-duration-base)_var(--bpdm-ease-out)] motion-reduce:animate-none",
                  // on-brand: a primary inline-start accent bar marks the selection, the
                  // keyboard-active option, AND the drag drop-target — full-height, RTL-safe.
                  "before:absolute before:inset-y-0 before:start-0 before:w-1 before:rounded-s-[calc(var(--radius)-3px)] before:bg-primary before:transition-opacity",
                  itemDisabled
                    ? "cursor-not-allowed text-muted-foreground opacity-60 before:opacity-0"
                    : cn(
                        "cursor-pointer active:scale-[0.99]",
                        isSel
                          ? "bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-foreground"
                          : "text-foreground hover:bg-muted",
                        // selection + drop-target: bar always; keyboard-active: bar only
                        // while the list is :focus-visible, so a mouse deselect leaves none
                        isSel || isOver ? "before:opacity-100" : "before:opacity-0",
                        isActive && !isSel && !isOver && "group-focus-visible/lb:before:opacity-100",
                      ),
                  dragKey === key && "opacity-50",
                )}
              >
                {draggable && (
                  <GripVertical
                    aria-hidden
                    className="size-4 shrink-0 cursor-grab text-muted-foreground/50 transition-colors active:cursor-grabbing group-hover:text-muted-foreground"
                  />
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
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-border/60 bg-card text-muted-foreground shadow-sm transition-[background-color,color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] hover:bg-muted hover:text-foreground hover:shadow active:scale-90 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none [&_svg]:size-4"
    >
      {children}
    </button>
  );
}

function sameOrder<T>(a: T[], b: T[], keyOf: (i: T) => ItemKey) {
  return a.length === b.length && a.every((x, i) => keyOf(x) === keyOf(b[i]));
}

export type MoveKind = "up" | "top" | "down" | "bottom";

/** Translatable labels for the reorder control column. */
export interface ReorderControlLabels {
  /** Accessible name for the control group. */
  group: string;
  up: string;
  top: string;
  down: string;
  bottom: string;
}

const DEFAULT_REORDER_LABELS: ReorderControlLabels = {
  group: "Reorder",
  up: "Move up",
  top: "Move to top",
  down: "Move down",
  bottom: "Move to bottom",
};

// ── ReorderControls — the up/top/down/bottom column (used by OrderList + PickList)
export function ReorderControls<T>({
  items,
  itemKey,
  selected,
  onChange,
  onMoved,
  labels,
  className,
}: {
  items: T[];
  itemKey: (item: T) => ItemKey;
  selected: Set<ItemKey>;
  onChange: (next: T[]) => void;
  /** Called after a move actually changes the order (drives live-region announcements). */
  onMoved?: (kind: MoveKind) => void;
  /** Translatable button + group labels. Defaults to English. */
  labels?: Partial<ReorderControlLabels>;
  className?: string;
}) {
  const l = { ...DEFAULT_REORDER_LABELS, ...labels };
  const groupRef = React.useRef<HTMLDivElement>(null);

  const move = (
    kind: MoveKind,
    fn: (a: T[], k: (i: T) => ItemKey, s: Set<ItemKey>) => T[],
  ) => {
    const next = fn(items, itemKey, selected);
    if (sameOrder(next, items, itemKey)) return;
    onChange(next);
    onMoved?.(kind);
    // If the button we just pressed becomes disabled (e.g. "Move to top" once at
    // the top), the browser drops focus to <body>. Keep focus inside the group.
    if (typeof requestAnimationFrame !== "function") return;
    requestAnimationFrame(() => {
      const grp = groupRef.current;
      if (!grp) return;
      const active = document.activeElement as HTMLElement | null;
      const lost = !active || active === document.body || (active as HTMLButtonElement).disabled;
      if (lost) grp.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
    });
  };
  const can = (fn: (a: T[], k: (i: T) => ItemKey, s: Set<ItemKey>) => T[]) =>
    selected.size > 0 && !sameOrder(fn(items, itemKey, selected), items, itemKey);

  return (
    <div ref={groupRef} role="group" aria-label={l.group} className={cn("flex flex-row gap-1.5 sm:flex-col", className)}>
      <ControlButton label={l.up} disabled={!can(moveSelectedUp)} onClick={() => move("up", moveSelectedUp)}>
        <ChevronUp aria-hidden />
      </ControlButton>
      <ControlButton label={l.top} disabled={!can(moveSelectedTop)} onClick={() => move("top", moveSelectedTop)}>
        <ChevronsUp aria-hidden />
      </ControlButton>
      <ControlButton label={l.down} disabled={!can(moveSelectedDown)} onClick={() => move("down", moveSelectedDown)}>
        <ChevronDown aria-hidden />
      </ControlButton>
      <ControlButton label={l.bottom} disabled={!can(moveSelectedBottom)} onClick={() => move("bottom", moveSelectedBottom)}>
        <ChevronsDown aria-hidden />
      </ControlButton>
    </div>
  );
}

/**
 * Every screen-reader string OrderList renders — pass a partial to translate.
 * Defaults are English; merge once with {@link DEFAULT_ORDER_LIST_MESSAGES}.
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
  /** Accessible name for the list when there is no visible `header`. */
  ariaLabel?: string;
  /** Predicate marking an item as disabled — not selectable, movable, or draggable. */
  isItemDisabled?: (item: T) => boolean;
  /** Override the built-in screen-reader strings for i18n. */
  messages?: Partial<OrderListMessages>;
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
  ariaLabel,
  isItemDisabled,
  messages,
  className,
}: OrderListProps<T>) {
  const [items, setItems] = useControllable<T[]>(valueProp, defaultValue, onChange);
  const [selected, setSelected] = React.useState<Set<ItemKey>>(new Set());
  const [message, setMessage] = React.useState("");
  const flip = React.useRef(false);

  // Merge the i18n strings once, then derive the label + announcement maps.
  const t = React.useMemo(() => ({ ...DEFAULT_ORDER_LIST_MESSAGES, ...messages }), [messages]);
  const reorderLabels = React.useMemo<ReorderControlLabels>(
    () => ({ group: t.reorderGroup, up: t.moveUp, top: t.moveToTop, down: t.moveDown, bottom: t.moveToBottom }),
    [t],
  );
  const movedText = React.useMemo<Record<MoveKind, string>>(
    () => ({ up: t.movedUp, top: t.movedToTop, down: t.movedDown, bottom: t.movedToBottom }),
    [t],
  );

  // Toggle a trailing space so an identical action (e.g. two "Move to top"s in a
  // row) still changes the text node and is re-announced by the live region.
  const announce = React.useCallback(
    (kind: MoveKind) => {
      flip.current = !flip.current;
      setMessage(movedText[kind] + (flip.current ? "" : " "));
    },
    [movedText],
  );

  const toggle = React.useCallback(
    (key: ItemKey) =>
      setSelected((prev) => {
        if (selectionMode === "single") {
          // toggle a single selection: re-click clears it
          return prev.has(key) && prev.size === 1 ? new Set() : new Set([key]);
        }
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
    [selectionMode],
  );

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      <ReorderControls
        items={items}
        itemKey={itemKey}
        selected={selected}
        onChange={setItems}
        onMoved={announce}
        labels={reorderLabels}
      />

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
        multiselectable={selectionMode === "multiple"}
        ariaLabel={ariaLabel ?? t.listLabel}
        emptyText={t.empty}
        isItemDisabled={isItemDisabled}
      />

      <div role="status" aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  );
}
