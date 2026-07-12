import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, type TabItem } from "./tabs";

const ITEMS: TabItem[] = [
  { value: "a", label: "Overview", content: <p>Overview body</p> },
  { value: "b", label: "Activity", content: <p>Activity body</p> },
  { value: "c", label: "Settings", content: <p>Settings body</p>, disabled: true },
];

describe("Tabs", () => {
  it("renders a tab per item and shows the default panel", () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    expect(screen.getAllByRole("tab").length).toBe(3);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Overview body")).toBeTruthy();
  });

  it("switches panel on click", async () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    await userEvent.click(screen.getByRole("tab", { name: "Activity" }));
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Activity body")).toBeTruthy();
  });

  it("marks a disabled tab as disabled", () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    expect(screen.getByRole("tab", { name: "Settings" })).toBeDisabled();
  });

  it("respects the controlled value", () => {
    render(<Tabs items={ITEMS} value="b" onValueChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("names the tablist for screen readers via ariaLabel", () => {
    render(<Tabs items={ITEMS} defaultValue="a" ariaLabel="Account sections" />);
    expect(screen.getByRole("tablist", { name: "Account sections" })).toBeTruthy();
  });

  it("scrolls the tab row horizontally when scrollable", () => {
    render(<Tabs items={ITEMS} defaultValue="a" scrollable />);
    expect(screen.getByRole("tablist").className).toContain("overflow-x-auto");
  });

  it("exposes the orientation on the tablist", () => {
    const { rerender } = render(<Tabs items={ITEMS} defaultValue="a" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
    rerender(<Tabs items={ITEMS} defaultValue="a" orientation="vertical" />);
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("moves selection with the arrow keys (automatic activation)", async () => {
    render(<Tabs items={ITEMS} defaultValue="a" />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });

  it("only moves focus (not selection) under manual activation", async () => {
    render(<Tabs items={ITEMS} defaultValue="a" activationMode="manual" />);
    screen.getByRole("tab", { name: "Overview" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    // focus moved to the next tab, but selection stays until activated
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
  });
});
