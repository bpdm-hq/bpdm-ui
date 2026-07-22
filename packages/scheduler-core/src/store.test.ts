import { describe, it, expect, vi } from "vitest";
import { createSchedulerStore } from "./store";

describe("createSchedulerStore", () => {
  it("defaults to the week view at the start of today", () => {
    const s = createSchedulerStore({ date: new Date(2026, 6, 20, 15, 30) });
    expect(s.getState().view).toBe("week");
    expect(s.getState().date.getHours()).toBe(0);
    expect(s.getState().date.getDate()).toBe(20);
  });

  it("honors initial overrides", () => {
    const s = createSchedulerStore({ view: "month", date: new Date(2026, 6, 20) });
    expect(s.getState().view).toBe("month");
  });

  it("notifies subscribers on change and stops after unsubscribe", () => {
    const s = createSchedulerStore({ date: new Date(2026, 6, 20) });
    const spy = vi.fn();
    const off = s.subscribe(spy);
    s.setView("day");
    expect(spy).toHaveBeenCalledTimes(1);
    off();
    s.setView("month");
    expect(spy).toHaveBeenCalledTimes(1); // no further calls
  });

  it("setDate normalizes to the start of day", () => {
    const s = createSchedulerStore({ date: new Date(2026, 6, 20) });
    s.setDate(new Date(2026, 6, 22, 18, 45));
    expect(s.getState().date.getHours()).toBe(0);
    expect(s.getState().date.getDate()).toBe(22);
  });

  it("steps by the right period per view", () => {
    const at = () => new Date(2026, 6, 20);

    const day = createSchedulerStore({ view: "day", date: at() });
    day.next();
    expect(day.getState().date.getDate()).toBe(21);

    const week = createSchedulerStore({ view: "week", date: at() });
    week.next();
    expect(week.getState().date.getDate()).toBe(27); // +7

    const month = createSchedulerStore({ view: "month", date: at() });
    month.next();
    expect(month.getState().date.getMonth()).toBe(7); // Aug

    const year = createSchedulerStore({ view: "year", date: at() });
    year.previous();
    expect(year.getState().date.getFullYear()).toBe(2025);
  });

  it("today jumps to the given now's start of day", () => {
    const s = createSchedulerStore({ date: new Date(2026, 0, 1) });
    s.today(new Date(2026, 6, 20, 11, 20));
    expect(s.getState().date.getMonth()).toBe(6);
    expect(s.getState().date.getDate()).toBe(20);
    expect(s.getState().date.getHours()).toBe(0);
  });

  it("replaces state immutably (does not mutate the previous object)", () => {
    const s = createSchedulerStore({ view: "day", date: new Date(2026, 6, 20) });
    const before = s.getState();
    s.setView("month");
    expect(before.view).toBe("day"); // old snapshot untouched
    expect(s.getState()).not.toBe(before);
  });
});
