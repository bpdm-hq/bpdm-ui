// Shared list helpers + types for OrderList and PickList.

export type ItemKey = string | number;

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
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

export function sameOrder<T>(a: T[], b: T[], keyOf: (i: T) => ItemKey): boolean {
  return a.length === b.length && a.every((x, i) => keyOf(x) === keyOf(b[i]));
}

/** Shared square icon-button styling for the control columns. */
export const CONTROL_BTN_CLASS =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-border/60 bg-card text-muted-foreground shadow-sm transition-[background-color,color,box-shadow,transform] duration-[var(--bpdm-duration-fast)] hover:bg-muted hover:text-foreground hover:shadow active:scale-90 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none [&_svg]:size-4";

/** Context handed to a list's item template. */
export interface ListItemContext<T> {
  $implicit: T;
  item: T;
}

/** A function reading the stable key of an item. */
export type ItemKeyFn<T> = (item: T) => ItemKey;
/** A function reading an item's filterable / sortable text. */
export type ItemTextFn<T> = (item: T) => string;

/** A control-column move direction, for live-region announcements. */
export type MoveKind = "up" | "top" | "down" | "bottom";

/** Screen-reader announcement per move direction. */
export const MOVE_MESSAGE: Record<MoveKind, string> = {
  up: "Moved up one position",
  top: "Moved to top",
  down: "Moved down one position",
  bottom: "Moved to bottom",
};

// Deterministic per-instance id source for listbox ⇄ option wiring
// (aria-labelledby / aria-activedescendant). Deterministic order → SSR-safe.
let _listUid = 0;
export function nextListId(): string {
  return `bpdm-list-${(_listUid += 1)}`;
}
