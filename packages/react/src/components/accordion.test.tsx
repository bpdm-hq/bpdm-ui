import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, type AccordionItemData } from "./accordion";

const ITEMS: AccordionItemData[] = [
  { value: "a", title: "First", content: "First body" },
  { value: "b", title: "Second", content: "Second body" },
  { value: "c", title: "Third", content: "Third body", disabled: true },
];

describe("Accordion", () => {
  it("renders a trigger button per item", () => {
    render(<Accordion items={ITEMS} />);
    ITEMS.forEach((i) => expect(screen.getByRole("button", { name: i.title as string })).toBeTruthy());
  });

  it("opens the defaultValue section", () => {
    render(<Accordion items={ITEMS} defaultValue="a" />);
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "false");
  });

  it("toggles a section on click", async () => {
    render(<Accordion items={ITEMS} />);
    const second = screen.getByRole("button", { name: "Second" });
    expect(second).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps only one open in single mode", async () => {
    render(<Accordion items={ITEMS} defaultValue="a" />);
    await userEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps several open in multiple mode", async () => {
    render(<Accordion type="multiple" items={ITEMS} defaultValue={["a"]} />);
    await userEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
  });

  it("disables a disabled item's trigger", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByRole("button", { name: "Third" })).toBeDisabled();
  });

  it("wires each trigger to its panel (aria-controls / aria-labelledby)", () => {
    render(<Accordion items={ITEMS} defaultValue="a" />);
    const first = screen.getByRole("button", { name: "First" });
    const region = screen.getByRole("region");
    expect(first.getAttribute("aria-controls")).toBe(region.id);
    expect(region.getAttribute("aria-labelledby")).toBe(first.id);
  });

  it("wraps each header in a heading at the default level (3)", () => {
    const { container } = render(<Accordion items={ITEMS} />);
    const headings = container.querySelectorAll('[role="heading"]');
    expect(headings.length).toBe(ITEMS.length);
    expect(headings[0].getAttribute("aria-level")).toBe("3");
  });

  it("supports a custom heading level for the document outline", () => {
    const { container } = render(<Accordion items={ITEMS} headingLevel={2} />);
    const headings = container.querySelectorAll('[role="heading"]');
    expect(headings.length).toBe(ITEMS.length);
    expect(headings[0].getAttribute("aria-level")).toBe("2");
  });

  it("aligns headers with a logical (RTL-safe) start alignment", () => {
    render(<Accordion items={ITEMS} />);
    expect(screen.getByRole("button", { name: "First" }).className).toContain("text-start");
  });

  it("keeps a collapsed panel's content out of the DOM (hidden from AT)", () => {
    render(<Accordion items={ITEMS} />); // nothing open by default
    expect(screen.queryByText("First body")).toBeNull();
  });

  it("moves focus between headers with the arrow keys", async () => {
    render(<Accordion items={ITEMS} />);
    screen.getByRole("button", { name: "First" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
  });
});
