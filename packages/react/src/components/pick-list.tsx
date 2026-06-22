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
  className,
}: PickListProps<T>) {
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

  const moveSelected = (from: T[], to: T[], sel: Set<ItemKey>) => {
    const moving = from.filter((i) => sel.has(itemKey(i)));
    if (moving.length === 0) return null;
    return { from: from.filter((i) => !sel.has(itemKey(i))), to: [...to, ...moving] };
  };

  const toTarget = () => {
    const r = moveSelected(source, target, sourceSel);
    if (!r) return;
    setLists({ source: r.from, target: r.to });
    setSourceSel(new Set());
  };
  const toSource = () => {
    const r = moveSelected(target, source, targetSel);
    if (!r) return;
    setLists({ source: r.to, target: r.from });
    setTargetSel(new Set());
  };
  const allToTarget = () => {
    if (source.length === 0) return;
    setLists({ source: [], target: [...target, ...source] });
    setSourceSel(new Set());
  };
  const allToSource = () => {
    if (target.length === 0) return;
    setLists({ source: [...source, ...target], target: [] });
    setTargetSel(new Set());
  };

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 lg:flex-row lg:items-start",
        className,
      )}
    >
      {reorder && (
        <ReorderControls
          items={source}
          itemKey={itemKey}
          selected={sourceSel}
          onChange={(next) => setLists({ source: next, target })}
          className="self-center lg:self-start"
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
        emptyText="No items"
      />

      {/* transfer controls — a row on mobile, a column on lg+ */}
      <div className="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <ControlButton label="Move to target" disabled={sourceSel.size === 0} onClick={toTarget}>
          <ChevronRight />
        </ControlButton>
        <ControlButton label="Move all to target" disabled={source.length === 0} onClick={allToTarget}>
          <ChevronsRight />
        </ControlButton>
        <ControlButton label="Move to source" disabled={targetSel.size === 0} onClick={toSource}>
          <ChevronLeft />
        </ControlButton>
        <ControlButton label="Move all to source" disabled={target.length === 0} onClick={allToSource}>
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
        emptyText="Nothing here yet"
      />

      {reorder && (
        <ReorderControls
          items={target}
          itemKey={itemKey}
          selected={targetSel}
          onChange={(next) => setLists({ source, target: next })}
          className="self-center lg:self-start"
        />
      )}
    </div>
  );
}
