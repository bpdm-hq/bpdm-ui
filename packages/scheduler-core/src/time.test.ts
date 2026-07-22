import { describe, it, expect } from "vitest";
import {
  startOfDay,
  addDays,
  addMonths,
  isSameDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  minutesFromDayStart,
  clampNumber,
} from "./time";

describe("time", () => {
  it("startOfDay zeroes the clock and does not mutate its input", () => {
    const d = new Date(2026, 6, 20, 15, 30, 10);
    const s = startOfDay(d);
    expect([s.getHours(), s.getMinutes(), s.getSeconds()]).toEqual([0, 0, 0]);
    expect(d.getHours()).toBe(15);
  });

  it("addDays rolls over the month boundary", () => {
    expect(addDays(new Date(2026, 6, 31), 1).getMonth()).toBe(7); // Aug
  });

  it("addMonths advances the month", () => {
    expect(addMonths(new Date(2026, 6, 20), 2).getMonth()).toBe(8); // Sep
  });

  it("isSameDay ignores the time of day", () => {
    expect(isSameDay(new Date(2026, 6, 20, 9), new Date(2026, 6, 20, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 6, 20), new Date(2026, 6, 21))).toBe(false);
  });

  it("startOfWeek defaults to Monday", () => {
    // Wed 2026-07-22 → Mon 2026-07-20
    expect(startOfWeek(new Date(2026, 6, 22)).getDate()).toBe(20);
  });

  it("startOfWeek supports a Sunday start", () => {
    expect(startOfWeek(new Date(2026, 6, 22), 0).getDate()).toBe(19);
  });

  it("startOfMonth and endOfMonth bound the month", () => {
    expect(startOfMonth(new Date(2026, 6, 20)).getDate()).toBe(1);
    expect(endOfMonth(new Date(2026, 6, 20)).getDate()).toBe(31); // July
    expect(endOfMonth(new Date(2026, 1, 10)).getDate()).toBe(28); // Feb 2026
  });

  it("eachDayOfInterval is inclusive of both ends", () => {
    const days = eachDayOfInterval(new Date(2026, 6, 20), new Date(2026, 6, 26));
    expect(days).toHaveLength(7);
    expect(days[0]!.getDate()).toBe(20);
    expect(days[6]!.getDate()).toBe(26);
  });

  it("minutesFromDayStart counts whole minutes", () => {
    const dayStart = new Date(2026, 6, 20, 0, 0, 0, 0);
    expect(minutesFromDayStart(new Date(2026, 6, 20, 9, 30), dayStart)).toBe(570);
  });

  it("clampNumber bounds a value", () => {
    expect(clampNumber(5, 0, 10)).toBe(5);
    expect(clampNumber(-1, 0, 10)).toBe(0);
    expect(clampNumber(11, 0, 10)).toBe(10);
  });
});
