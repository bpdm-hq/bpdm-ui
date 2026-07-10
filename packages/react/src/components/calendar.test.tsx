import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar, DatePicker, type DateRange } from "./calendar";

const JAN_2026 = new Date(2026, 0, 15); // Thursday 15 Jan 2026

describe("Calendar", () => {
  it("wraps the months in a labelled group with a per-month WAI-ARIA grid", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    expect(screen.getByRole("group", { name: "Calendar" })).toBeInTheDocument();
    // one grid for the (single) visible month, labelled by its caption
    expect(screen.getByRole("grid", { name: /January 2026/ })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    expect(screen.getAllByRole("gridcell")).toHaveLength(42);
  });

  it("gives each day a full, locale-formatted accessible name", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    // en-US default: "January 15, 2026" (not just "15")
    expect(screen.getByRole("button", { name: /January 15, 2026/ })).toBeInTheDocument();
  });

  it("marks the selected day's gridcell aria-selected", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    const cell = screen.getByRole("button", { name: /January 15, 2026/ }).closest('[role="gridcell"]');
    expect(cell).toHaveAttribute("aria-selected", "true");
  });

  it("uses roving tabindex — only the focused day is tabbable", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    expect(screen.getByRole("button", { name: /January 15, 2026/ })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: /January 16, 2026/ })).toHaveAttribute("tabindex", "-1");
  });

  it("selects a day and reports the Date", async () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={JAN_2026} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /January 20, 2026/ }));
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(0);
    expect(picked.getDate()).toBe(20);
  });

  it("completes a range, ordered, on the second click", async () => {
    const onChange = vi.fn();
    render(
      <Calendar mode="range" defaultValue={{ from: new Date(2026, 0, 10), to: null }} onChange={onChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /January 20, 2026/ }));
    const r = onChange.mock.calls[0][0] as DateRange;
    expect(r.from?.getDate()).toBe(10);
    expect(r.to?.getDate()).toBe(20);
  });

  it("advertises aria-multiselectable in range mode only", () => {
    const { rerender } = render(<Calendar defaultValue={JAN_2026} />);
    expect(screen.getByRole("grid", { name: /January 2026/ })).not.toHaveAttribute("aria-multiselectable");
    rerender(<Calendar mode="range" defaultValue={{ from: JAN_2026, to: null }} />);
    expect(screen.getByRole("grid", { name: /January 2026/ })).toHaveAttribute("aria-multiselectable", "true");
  });

  it("moves roving focus with the arrow keys", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    const grid = screen.getByRole("grid", { name: /January 2026/ });
    const day15 = screen.getByRole("button", { name: /January 15, 2026/ });
    day15.focus();
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: /January 16, 2026/ })).toHaveFocus();
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: /January 23, 2026/ })).toHaveFocus();
  });

  it("jumps to the week edges with Home and End", () => {
    render(<Calendar defaultValue={JAN_2026} />);
    const grid = screen.getByRole("grid", { name: /January 2026/ });
    screen.getByRole("button", { name: /January 15, 2026/ }).focus();
    fireEvent.keyDown(grid, { key: "Home" }); // Monday of that week
    expect(screen.getByRole("button", { name: /January 12, 2026/ })).toHaveFocus();
    fireEvent.keyDown(grid, { key: "End" }); // Sunday of that week
    expect(screen.getByRole("button", { name: /January 18, 2026/ })).toHaveFocus();
  });

  it("selects the focused day with Enter", () => {
    const onChange = vi.fn();
    render(<Calendar defaultValue={JAN_2026} onChange={onChange} />);
    const grid = screen.getByRole("grid", { name: /January 2026/ });
    screen.getByRole("button", { name: /January 15, 2026/ }).focus();
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    fireEvent.keyDown(grid, { key: "Enter" });
    const calls = onChange.mock.calls;
    const picked = calls[calls.length - 1][0] as Date;
    expect(picked.getDate()).toBe(16);
  });

  it("localises month + weekday names via the locale prop", () => {
    render(<Calendar defaultValue={JAN_2026} locale="de-DE" />);
    expect(screen.getByText(/Januar 2026/)).toBeInTheDocument(); // caption in German
  });

  it("translates the navigation labels via messages", () => {
    render(<Calendar defaultValue={JAN_2026} messages={{ previousMonth: "Zurück", nextMonth: "Weiter" }} />);
    expect(screen.getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
  });

  it("navigates months", async () => {
    render(<Calendar defaultValue={JAN_2026} />);
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText(/February 2026/)).toBeInTheDocument();
  });

  it("disables days outside min/max", () => {
    render(<Calendar defaultValue={JAN_2026} min={new Date(2026, 0, 10)} />);
    expect(screen.getByRole("button", { name: /January 5, 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /January 15, 2026/ })).not.toBeDisabled();
  });

  it("disables days matched by the `disabled` predicate", () => {
    render(<Calendar defaultValue={JAN_2026} disabled={(d) => d.getDate() === 20} />);
    expect(screen.getByRole("button", { name: /January 20, 2026/ })).toBeDisabled();
  });

  it("keeps the month/year dropdowns OUT of the grid so their keys aren't hijacked", () => {
    render(<Calendar defaultValue={JAN_2026} captionLayout="dropdown" />);
    const grid = screen.getByRole("grid", { name: /January 2026/ });
    const monthSelect = screen.getByRole("combobox", { name: "Month" });
    expect(monthSelect).not.toBeDisabled();
    expect(grid.contains(monthSelect)).toBe(false);
  });
});

function PickerHost() {
  const [v, setV] = useState<Date | null>(new Date(2026, 0, 15));
  return <DatePicker value={v} onChange={(x) => setV(x as Date | null)} />;
}

describe("DatePicker", () => {
  it("shows the formatted value on the trigger", () => {
    render(<PickerHost />);
    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
  });

  it("clears via a real, keyboard-reachable clear button", async () => {
    render(<PickerHost />);
    const clear = screen.getByRole("button", { name: "Clear" });
    expect(clear.tagName).toBe("BUTTON"); // not a nested span[role=button]
    expect(clear).not.toHaveAttribute("tabindex", "-1");
    await userEvent.click(clear);
    expect(screen.getByText("Pick a date")).toBeInTheDocument(); // placeholder returns
  });

  it("confirm: buffers the draft and commits only on Apply", async () => {
    const onChange = vi.fn();
    render(<DatePicker confirm defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);
    await userEvent.click(screen.getByText("Jan 15, 2026")); // open the popover
    await userEvent.click(screen.getByRole("button", { name: /January 20, 2026/ }));
    expect(onChange).not.toHaveBeenCalled(); // still a draft
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    const picked = onChange.mock.calls[0][0] as Date;
    expect(picked.getDate()).toBe(20);
  });

  it("confirm: Cancel discards the draft", async () => {
    const onChange = vi.fn();
    render(<DatePicker confirm defaultValue={new Date(2026, 0, 15)} onChange={onChange} />);
    await userEvent.click(screen.getByText("Jan 15, 2026"));
    await userEvent.click(screen.getByRole("button", { name: /January 20, 2026/ }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
