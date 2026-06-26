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
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-border bg-card text-muted-foreground transition-[background-color,color,transform] duration-[var(--bpdm-duration-fast)] hover:bg-muted hover:text-foreground active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-4";

/** Context handed to a list's item template. */
export interface ListItemContext<T> {
  $implicit: T;
  item: T;
}

/** A function reading the stable key of an item. */
export type ItemKeyFn<T> = (item: T) => ItemKey;
/** A function reading an item's filterable / sortable text. */
export type ItemTextFn<T> = (item: T) => string;
