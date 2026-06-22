import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useControllable } from "./use-controllable";

describe("useControllable", () => {
  it("manages state internally when uncontrolled", () => {
    const { result } = renderHook(() => useControllable<string>(undefined, "a"));
    expect(result.current[0]).toBe("a");
    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
  });

  it("reflects the controlled value and never overrides it internally", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ v }) => useControllable<string>(v, "x", onChange),
      { initialProps: { v: "a" } },
    );
    expect(result.current[0]).toBe("a");
    // setValue fires onChange but does not change the displayed (controlled) value
    act(() => result.current[1]("b"));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(result.current[0]).toBe("a");
    // parent re-renders with the new value
    rerender({ v: "b" });
    expect(result.current[0]).toBe("b");
  });

  it("fires onChange when uncontrolled too", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllable<number>(undefined, 0, onChange));
    act(() => result.current[1](5));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(result.current[0]).toBe(5);
  });
});
