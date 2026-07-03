import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusTimeline, type TimelineItem } from "./status-timeline";

const ITEMS: TimelineItem[] = [
  { title: "Build", status: "complete", timestamp: "11:02" },
  { title: "Tests", status: "current", timestamp: "11:05" },
  { title: "Deploy", status: "pending" },
  { title: "Rollback", status: "failed", timestamp: "11:09", description: "2 specs failed" },
];

describe("StatusTimeline", () => {
  it("renders one list item per step with its title", () => {
    const { container } = render(<StatusTimeline items={ITEMS} />);
    expect(container.querySelectorAll("ol > li").length).toBe(4);
    ITEMS.forEach((i) => expect(screen.getByText(i.title as string)).toBeTruthy());
  });

  it("renders timestamps and descriptions", () => {
    render(<StatusTimeline items={ITEMS} />);
    expect(screen.getByText("11:02")).toBeTruthy();
    expect(screen.getByText("2 specs failed")).toBeTruthy();
  });

  it("uses a semantic ordered list", () => {
    render(<StatusTimeline items={ITEMS} />);
    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getAllByRole("listitem").length).toBe(4);
  });

  it("disables the current-step pulse under reduced motion", () => {
    const { container } = render(<StatusTimeline items={[{ title: "Now", status: "current" }]} />);
    // the pulsing overlay opts out of animation when the user prefers reduced motion
    expect(container.querySelector(".motion-reduce\\:animate-none")).toBeTruthy();
  });

  it("centers the line and renders opposite content across it", () => {
    const items: TimelineItem[] = [
      { title: "Ordered", status: "complete", opposite: "15 Oct" },
      { title: "Shipped", status: "current", opposite: "16 Oct" },
    ];
    const { container } = render(<StatusTimeline items={items} />);
    expect(screen.getByText("15 Oct")).toBeTruthy();
    // opposite present → rows use the centered 3-column grid
    expect(container.querySelector("li.grid")).toBeTruthy();
  });

  it("switches to a centered grid for align='alternate'", () => {
    const { container } = render(<StatusTimeline items={ITEMS} align="alternate" />);
    expect(container.querySelectorAll("li.grid").length).toBe(4);
  });

  it("keeps the simple flex layout for the default left align", () => {
    const { container } = render(<StatusTimeline items={ITEMS} />);
    expect(container.querySelector("li.grid")).toBeNull();
    expect(container.querySelector("li.flex")).toBeTruthy();
  });

  it("renders a custom marker icon instead of the default status glyph", () => {
    const { container } = render(
      <StatusTimeline items={[{ title: "Step", status: "complete", icon: <span data-testid="star">★</span> }]} />,
    );
    expect(screen.getByTestId("star")).toBeTruthy();
    expect(container.querySelector('path[d="M3.5 8.5l3 3 6-7"]')).toBeNull(); // no default check
  });

  it("applies a custom marker colour", () => {
    const { container } = render(
      <StatusTimeline items={[{ title: "Step", status: "complete", color: "rgb(1, 2, 3)" }]} />,
    );
    const dot = container.querySelector('[style*="background"]') as HTMLElement;
    expect(dot.style.backgroundColor).toBe("rgb(1, 2, 3)");
  });

  it("makes steps interactive with onItemClick (click + keyboard)", async () => {
    const onItemClick = vi.fn();
    render(<StatusTimeline items={ITEMS} onItemClick={onItemClick} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(ITEMS.length);
    await userEvent.click(buttons[1]);
    expect(onItemClick).toHaveBeenLastCalledWith(ITEMS[1], 1);
    buttons[2].focus();
    await userEvent.keyboard("{Enter}");
    expect(onItemClick).toHaveBeenLastCalledWith(ITEMS[2], 2);
  });
});
