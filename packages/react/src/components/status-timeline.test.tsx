import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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
    ITEMS.forEach((i) => expect(screen.getByText(i.title)).toBeTruthy());
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
});
