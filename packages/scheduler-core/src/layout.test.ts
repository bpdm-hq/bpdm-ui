import { describe, it, expect } from "vitest";
import { packEvents, layoutDay, type Packed } from "./layout";
import { defaultAccessor } from "./types";

const lc = (r: Packed[]): [number, number][] => r.map((p) => [p.lane, p.columns]);

describe("packEvents", () => {
  it("returns nothing for no intervals", () => {
    expect(packEvents([])).toEqual([]);
  });

  it("gives a lone event a single column", () => {
    expect(packEvents([{ start: 0, end: 60 }])).toEqual([{ lane: 0, columns: 1 }]);
  });

  it("treats touching intervals as non-overlapping", () => {
    expect(lc(packEvents([{ start: 0, end: 60 }, { start: 60, end: 120 }]))).toEqual([
      [0, 1],
      [0, 1],
    ]);
  });

  it("splits two overlapping events into two columns", () => {
    expect(lc(packEvents([{ start: 0, end: 60 }, { start: 30, end: 90 }]))).toEqual([
      [0, 2],
      [1, 2],
    ]);
  });

  it("splits a three-way overlap into three columns", () => {
    expect(
      lc(packEvents([{ start: 0, end: 90 }, { start: 15, end: 75 }, { start: 30, end: 90 }])),
    ).toEqual([
      [0, 3],
      [1, 3],
      [2, 3],
    ]);
  });

  it("keeps a transitive chain in one cluster and reuses freed lanes (2 columns)", () => {
    // A[0,120) B[60,180) C[120,240): A–B overlap, B–C overlap, A–C do not
    expect(
      lc(packEvents([{ start: 0, end: 120 }, { start: 60, end: 180 }, { start: 120, end: 240 }])),
    ).toEqual([
      [0, 2],
      [1, 2],
      [0, 2],
    ]);
  });

  it("preserves input order regardless of start time", () => {
    // first item starts later, so it takes lane 1
    expect(lc(packEvents([{ start: 30, end: 90 }, { start: 0, end: 60 }]))).toEqual([
      [1, 2],
      [0, 2],
    ]);
  });
});

describe("layoutDay", () => {
  const day = new Date(2026, 6, 20);
  const at = (h: number, m = 0): Date => {
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const START = 7 * 60;
  const END = 19 * 60;
  const ev = (start: Date, end: Date, id: string) => ({ id, title: id, start, end });

  it("positions a timed event by minutes from the range top", () => {
    const r = layoutDay([ev(at(9), at(10, 30), "a")], day, START, END, defaultAccessor);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ topMinutes: 120, heightMinutes: 90, lane: 0, columns: 1 });
  });

  it("clamps an event that starts before the visible range", () => {
    const r = layoutDay([ev(at(6, 30), at(8), "a")], day, START, END, defaultAccessor);
    expect(r[0]).toMatchObject({ topMinutes: 0, heightMinutes: 60 });
  });

  it("drops an event entirely outside the range", () => {
    const r = layoutDay([ev(at(5), at(6), "a")], day, START, END, defaultAccessor);
    expect(r).toHaveLength(0);
  });

  it("columns overlapping events on the same day", () => {
    const r = layoutDay(
      [ev(at(9), at(11), "a"), ev(at(10), at(12), "b")],
      day,
      START,
      END,
      defaultAccessor,
    );
    expect(r.map((x) => x.columns)).toEqual([2, 2]);
    expect(new Set(r.map((x) => x.lane))).toEqual(new Set([0, 1]));
  });
});
