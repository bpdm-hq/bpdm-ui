import { describe, it, expect } from "vitest";
import {
  moveSelectedUp,
  moveSelectedDown,
  moveSelectedTop,
  moveSelectedBottom,
} from "./order-list";

const k = (x: string) => x;
const base = ["a", "b", "c", "d"];

describe("order-list reorder helpers", () => {
  it("moveSelectedUp moves a selected item up one (collision-aware)", () => {
    expect(moveSelectedUp(base, k, new Set(["c"]))).toEqual(["a", "c", "b", "d"]);
    // already at top → unchanged
    expect(moveSelectedUp(base, k, new Set(["a"]))).toEqual(base);
  });

  it("moveSelectedDown moves a selected item down one", () => {
    expect(moveSelectedDown(base, k, new Set(["b"]))).toEqual(["a", "c", "b", "d"]);
    expect(moveSelectedDown(base, k, new Set(["d"]))).toEqual(base);
  });

  it("moveSelectedTop gathers selected to the front, preserving order", () => {
    expect(moveSelectedTop(base, k, new Set(["c", "d"]))).toEqual(["c", "d", "a", "b"]);
  });

  it("moveSelectedBottom gathers selected to the end", () => {
    expect(moveSelectedBottom(base, k, new Set(["a", "b"]))).toEqual(["c", "d", "a", "b"]);
  });

  it("handles non-contiguous selection", () => {
    const arr = ["a", "b", "c", "d", "e", "f"];
    const sel = new Set(["a", "b", "f"]);
    expect(moveSelectedTop(arr, k, sel)).toEqual(["a", "b", "f", "c", "d", "e"]);
    expect(moveSelectedBottom(arr, k, sel)).toEqual(["c", "d", "e", "a", "b", "f"]);
  });

  it("does not mutate the input array", () => {
    const arr = [...base];
    moveSelectedTop(arr, k, new Set(["c"]));
    expect(arr).toEqual(base);
  });
});
