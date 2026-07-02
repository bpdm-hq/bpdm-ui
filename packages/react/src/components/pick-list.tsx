import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/use-controllable";
import {
  ControlButton,
  ReorderControls,
  SelectableList,
  type ItemKey,
} from "./order-list";

export interface PickListValue<T> {
  source: T[];
  target: T[];
}

export interface PickListProps<T> {
  /** Controlled lists. */
  value?: PickListValue<T>;
  defaultValue?: PickListValue<T>;
  onChange?: (value: PickListValue<T>) => void;
  itemKey: (item: T) => ItemKey;
  renderItem: (item: T) => React.ReactNode;
  sourceHeader?: React.ReactNode;
  targetHeader?: React.ReactNode;
  /** Enable filtering in both lists by matching this accessor. */
  filterBy?: (item: T) => string;
  filterPlaceholder?: string;
  /** Show the up/top/down/bottom reorder controls beside each list + drag. Default true. */
  reorder?: boolean;
  scrollHeight?: string;
  /** Empty-state text for the source list (default "No items"). */
  sourceEmptyText?: string;
  /** Empty-state text for the target list (default "Nothing here yet"). */
  targetEmptyText?: string;
  /** Fired after a transfer, with the moved items and which list they landed in. */
  onTransfer?: (moved: T[], to: "source" | "target") => void;
  /** Predicate marking an item as disabled — not selectable, transferable, or draggable. */
  isItemDisabled?: (item: T) => boolean;
  className?: string;
}

/**
 * Move items between two lists. Select items on either side and transfer them with
 * the middle controls (move / move all, each way); optionally reorder within each
 * list (drag or the side controls). Controlled (`value`) or uncontrolled, filterable,
 * responsive — the two lists stack on small screens. Reuses `SelectableList`.
 */
export function PickList<T>({
  value: valueProp,
  defaultValue = { source: [], target: [] },
  onChange,
  itemKey,
  renderItem,
  sourceHeader,
  targetHeader,
  filterBy,
  filterPlaceholder,
  reorder = true,
  scrollHeight,
  sourceEmptyText = "No items",
  targetEmptyText = "Nothing here yet",
  onTransfer,
  isItemDisabled,
  className,
}: PickListProps<T>) {
  const isDisabled = (item: T) => !!isItemDisabled?.(item);
  const [message, setMessage] = React.useState("");
  const flip = React.useRef(false);
  const transferRef = React.useRef<HTMLDivElement>(null);

  const listLabel = (to: "source" | "target") => {
    const h = to === "target" ? targetHeader : sourceHeader;
    return typeof h === "string" && h ? h : `${to} list`;
  };
  // announce transfers to screen readers, and keep keyboard focus inside the
  // transfer group if the button just pressed becomes disabled.
  const afterTransfer = (moving: T[], to: "source" | "target") => {
    onTransfer?.(moving, to);
    flip.current = !flip.current;
    const noun = moving.length === 1 ? "item" : "items";
    setMessage(`${moving.length} ${noun} moved to ${listLabel(to)}` + (flip.current ? "" : " "));
    if (typeof requestAnimationFrame !== "function") return;
    requestAnimationFrame(() => {
      const grp = transferRef.current;
      if (!grp) return;
      const active = document.activeElement as HTMLElement | null;
      const lost = !active || active === document.body || (active as HTMLButtonElement).disabled;
      if (lost) grp.querySelector<HTMLButtonElement>("button:not([disabled])")?.focus();
    });
  };
  const [lists, setLists] = useControllable<PickListValue<T>>(valueProp, defaultValue, onChange);
  const { source, target } = lists;
  const [sourceSel, setSourceSel] = React.useState<Set<ItemKey>>(new Set());
  const [targetSel, setTargetSel] = React.useState<Set<ItemKey>>(new Set());

  const toggle = (setSel: React.Dispatch<React.SetStateAction<Set<ItemKey>>>) => (key: ItemKey) =>
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toTarget = () => {
    const moving = source.filter((i) => sourceSel.has(itemKey(i)) && !isDisabled(i));
    if (moving.length === 0) return;
    const movingKeys = new Set(moving.map(itemKey));
    setLists({ source: source.filter((i) => !movingKeys.has(itemKey(i))), target: [...target, ...moving] });
    setSourceSel(new Set());
    afterTransfer(moving, "target");
  };
  const toSource = () => {
    const moving = target.filter((i) => targetSel.has(itemKey(i)) && !isDisabled(i));
    if (moving.length === 0) return;
    const movingKeys = new Set(moving.map(itemKey));
    setLists({ source: [...source, ...moving], target: target.filter((i) => !movingKeys.has(itemKey(i))) });
    setTargetSel(new Set());
    afterTransfer(moving, "source");
  };
  const allToTarget = () => {
    const moving = source.filter((i) => !isDisabled(i)); // locked items stay put
    if (moving.length === 0) return;
    setLists({ source: source.filter(isDisabled), target: [...target, ...moving] });
    setSourceSel(new Set());
    afterTransfer(moving, "target");
  };
  const allToSource = () => {
    const moving = target.filter((i) => !isDisabled(i));
    if (moving.length === 0) return;
    setLists({ source: [...source, ...moving], target: target.filter(isDisabled) });
    setTargetSel(new Set());
    afterTransfer(moving, "source");
  };

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch",
        className,
      )}
    >
      {reorder && (
        <ReorderControls
          items={source}
          itemKey={itemKey}
          selected={sourceSel}
          onChange={(next) => setLists({ source: next, target })}
          className="self-center"
        />
      )}

      <SelectableList
        className="flex-1"
        items={source}
        keyOf={itemKey}
        renderItem={renderItem}
        selected={sourceSel}
        onToggle={toggle(setSourceSel)}
        onReorder={reorder ? (next) => setLists({ source: next, target }) : undefined}
        header={sourceHeader}
        filterBy={filterBy}
        filterPlaceholder={filterPlaceholder}
        scrollHeight={scrollHeight}
        emptyText={sourceEmptyText}
        multiselectable
        isItemDisabled={isItemDisabled}
      />

      {/* transfer controls — a row on mobile, a column on lg+ */}
      <div ref={transferRef} role="group" aria-label="Transfer between lists" className="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <ControlButton label="Move to target" disabled={sourceSel.size === 0} onClick={toTarget}>
          <ChevronRight />
        </ControlButton>
        <ControlButton label="Move all to target" disabled={!source.some((i) => !isDisabled(i))} onClick={allToTarget}>
          <ChevronsRight />
        </ControlButton>
        <ControlButton label="Move to source" disabled={targetSel.size === 0} onClick={toSource}>
          <ChevronLeft />
        </ControlButton>
        <ControlButton label="Move all to source" disabled={!target.some((i) => !isDisabled(i))} onClick={allToSource}>
          <ChevronsLeft />
        </ControlButton>
      </div>

      <SelectableList
        className="flex-1"
        items={target}
        keyOf={itemKey}
        renderItem={renderItem}
        selected={targetSel}
        onToggle={toggle(setTargetSel)}
        onReorder={reorder ? (next) => setLists({ source, target: next }) : undefined}
        header={targetHeader}
        filterBy={filterBy}
        filterPlaceholder={filterPlaceholder}
        scrollHeight={scrollHeight}
        emptyText={targetEmptyText}
        multiselectable
        isItemDisabled={isItemDisabled}
      />

      {reorder && (
        <ReorderControls
          items={target}
          itemKey={itemKey}
          selected={targetSel}
          onChange={(next) => setLists({ source, target: next })}
          className="self-center"
        />
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {message}
      </div>
    </div>
  );
}
