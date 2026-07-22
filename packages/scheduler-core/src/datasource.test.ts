import { describe, it, expect } from "vitest";
import { InMemoryDataSource } from "./datasource";
import type { CalendarEvent } from "./types";

const ev = (id: string, start: string, end: string, resourceId?: string): CalendarEvent => ({
  id,
  title: id,
  start: new Date(start),
  end: new Date(end),
  ...(resourceId ? { resourceId } : {}),
});

const range = (start: string, end: string) => ({ start: new Date(start), end: new Date(end) });

describe("InMemoryDataSource.fetch", () => {
  const data = new InMemoryDataSource([
    ev("inside", "2026-07-20T09:00", "2026-07-20T10:00"),
    ev("spanning", "2026-07-19T23:00", "2026-07-20T12:00"),
    ev("before", "2026-07-19T08:00", "2026-07-19T09:00"),
    ev("after", "2026-07-21T08:00", "2026-07-21T09:00"),
    ev("touchesStart", "2026-07-19T00:00", "2026-07-20T00:00"),
  ]);

  it("returns events overlapping the window", () => {
    const ids = data.fetch(range("2026-07-20T00:00", "2026-07-21T00:00")).map((e) => e.id);
    expect(ids.sort()).toEqual(["inside", "spanning"]);
  });

  it("excludes events that merely touch the window edge", () => {
    const ids = data.fetch(range("2026-07-20T00:00", "2026-07-21T00:00")).map((e) => e.id);
    expect(ids).not.toContain("touchesStart"); // ends exactly at range start
  });

  it("filters by resource when resourceIds is given", () => {
    const d = new InMemoryDataSource([
      ev("a", "2026-07-20T09:00", "2026-07-20T10:00", "sofia"),
      ev("b", "2026-07-20T09:00", "2026-07-20T10:00", "noah"),
      ev("c", "2026-07-20T09:00", "2026-07-20T10:00"), // no resource
    ]);
    const r = d.fetch(range("2026-07-20T00:00", "2026-07-21T00:00"), { resourceIds: ["sofia"] });
    expect(r.map((e) => e.id)).toEqual(["a"]);
  });
});

describe("InMemoryDataSource write-back", () => {
  it("creates, updates and removes immutably", () => {
    const d = new InMemoryDataSource([ev("a", "2026-07-20T09:00", "2026-07-20T10:00")]);
    d.create(ev("b", "2026-07-20T11:00", "2026-07-20T12:00"));
    expect(d.all().map((e) => e.id).sort()).toEqual(["a", "b"]);

    d.update({ ...ev("a", "2026-07-20T09:00", "2026-07-20T10:00"), title: "renamed" });
    expect(d.all().find((e) => e.id === "a")?.title).toBe("renamed");

    d.remove("b");
    expect(d.all().map((e) => e.id)).toEqual(["a"]);
  });
});
