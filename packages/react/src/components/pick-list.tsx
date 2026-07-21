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

/**
 * Every user-facing / screen-reader string in the Pick List, for i18n. Pass a
 * `Partial<PickListMessages>` via the `messages` prop to override any subset;
 * the rest fall back to {@link defaultPickListMessages} (English).
 */
export interface PickListMessages {
  /** `aria-label` for the middle transfer-control group. */
  transferGroup: string;
  /** Move-selected → target button (aria-label + tooltip). */
  moveToTarget: string;
  /** Move-all ⇒ target button. */
  moveAllToTarget: string;
  /** Move-selected ← source button. */
  moveToSource: string;
  /** Move-all ⇐ source button. */
  moveAllToSource: string;
  /** Empty-state text for the source list. */
  sourceEmpty: string;
  /** Empty-state text for the target list. */
  targetEmpty: string;
  /** Placeholder + aria-label for the filter box (both lists). */
  filterPlaceholder: string;
  /** Fallback accessible name for the source list when it has no visible header. */
  sourceLabel: string;
  /** Fallback accessible name for the target list when it has no visible header. */
  targetLabel: string;
  /** Live-region announcement built after each transfer. */
  transferAnnouncement: (count: number, listLabel: string) => string;
}

/** English defaults for {@link PickListMessages}. */
export const defaultPickListMessages: PickListMessages = {
  transferGroup: "Transfer between lists",
  moveToTarget: "Move to target",
  moveAllToTarget: "Move all to target",
  moveToSource: "Move to source",
  moveAllToSource: "Move all to source",
  sourceEmpty: "No items",
  targetEmpty: "Nothing here yet",
  filterPlaceholder: "Filter",
  sourceLabel: "source list",
  targetLabel: "target list",
  transferAnnouncement: (count, listLabel) =>
    `${count} ${count === 1 ? "item" : "items"} moved to ${listLabel}`,
};

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
  /** Filter box placeholder. Overrides `messages.filterPlaceholder` when set. */
  filterPlaceholder?: string;
  /** Show the up/top/down/bottom reorder controls beside each list + drag. Default true. */
  reorder?: boolean;
  scrollHeight?: string;
  /** Empty-state text for the source list. Overrides `messages.sourceEmpty` when set. */
  sourceEmptyText?: string;
  /** Empty-state text for the target list. Overrides `messages.targetEmpty` when set. */
  targetEmptyText?: string;
  /** Fired after a transfer, with the moved items and which list they landed in. */
  onTransfer?: (moved: T[], to: "source" | "target") => void;
  /** Predicate marking an item as disabled — not selectable, transferable, or draggable. */
  isItemDisabled?: (item: T) => boolean;
  /** Override any user-facing / screen-reader string for i18n. */
  messages?: Partial<PickListMessages>;
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
  sourceEmptyText,
  targetEmptyText,
  onTransfer,
  isItemDisabled,
  messages,
  className,
}: PickListProps<T>) {
  const t = React.useMemo(
    () => ({ ...defaultPickListMessages, ...messages }),
    [messages],
  );
  const isDisabled = (item: T) => !!isItemDisabled?.(item);
  const [message, setMessage] = React.useState("");
  const flip = React.useRef(false);
  const transferRef = React.useRef<HTMLDivElement>(null);

  const listLabel = (to: "source" | "target") => {
    const h = to === "target" ? targetHeader : sourceHeader;
    if (typeof h === "string" && h) return h;
    return to === "target" ? t.targetLabel : t.sourceLabel;
  };
  // announce transfers to screen readers, and keep keyboard focus inside the
  // transfer group if the button just pressed becomes disabled.
  const afterTransfer = (moving: T[], to: "source" | "target") => {
    onTransfer?.(moving, to);
    flip.current = !flip.current;
    setMessage(t.transferAnnouncement(moving.length, listLabel(to)) + (flip.current ? "" : " "));
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
      data-bpdm="" data-bpdm-slot="pick-list"
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
        ariaLabel={t.sourceLabel}
        filterBy={filterBy}
        filterPlaceholder={filterPlaceholder ?? t.filterPlaceholder}
        scrollHeight={scrollHeight}
        emptyText={sourceEmptyText ?? t.sourceEmpty}
        multiselectable
        isItemDisabled={isItemDisabled}
      />

      {/* transfer controls — a row on mobile, a column on lg+. The horizontal
          arrows flip under RTL so "toward target" always points at the target. */}
      <div ref={transferRef} role="group" aria-label={t.transferGroup} data-bpdm-slot="pick-list-transfer" className="flex flex-row justify-center gap-1.5 lg:flex-col lg:justify-start lg:self-center">
        <ControlButton label={t.moveToTarget} disabled={sourceSel.size === 0} onClick={toTarget}>
          <ChevronRight className="rtl:-scale-x-100" />
        </ControlButton>
        <ControlButton label={t.moveAllToTarget} disabled={!source.some((i) => !isDisabled(i))} onClick={allToTarget}>
          <ChevronsRight className="rtl:-scale-x-100" />
        </ControlButton>
        <ControlButton label={t.moveToSource} disabled={targetSel.size === 0} onClick={toSource}>
          <ChevronLeft className="rtl:-scale-x-100" />
        </ControlButton>
        <ControlButton label={t.moveAllToSource} disabled={!target.some((i) => !isDisabled(i))} onClick={allToSource}>
          <ChevronsLeft className="rtl:-scale-x-100" />
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
        ariaLabel={t.targetLabel}
        filterBy={filterBy}
        filterPlaceholder={filterPlaceholder ?? t.filterPlaceholder}
        scrollHeight={scrollHeight}
        emptyText={targetEmptyText ?? t.targetEmpty}
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
