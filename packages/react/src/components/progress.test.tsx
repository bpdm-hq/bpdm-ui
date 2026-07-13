import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./progress";

describe("ProgressBar", () => {
  it("renders an accessible determinate progressbar with aria-value*", () => {
    render(<ProgressBar value={50} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuetext", "50%");
    expect(bar).not.toHaveAttribute("aria-busy");
  });

  it("clamps value into [0, max] for the value text", () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "100%");
    rerender(<ProgressBar value={-20} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "0%");
  });

  it("uses max for the percentage in the value text", () => {
    render(<ProgressBar value={25} max={50} />);
    // 25/50 = 50%
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "50%");
  });

  it("format drives the header value and the valuetext", () => {
    render(<ProgressBar value={3} max={10} format={(v, m) => `${v}/${m}`} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuetext", "3/10");
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("uses a string label as the accessible name", () => {
    render(<ProgressBar value={40} label="Uploading" showValue />);
    expect(screen.getByRole("progressbar", { name: "Uploading" })).toBeInTheDocument();
  });

  it("falls back to the default accessible name, overridable via messages", () => {
    const { rerender } = render(<ProgressBar value={40} />);
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeInTheDocument();
    rerender(<ProgressBar value={40} messages={{ label: "Fortschritt" }} />);
    expect(screen.getByRole("progressbar", { name: "Fortschritt" })).toBeInTheDocument();
  });

  it("indeterminate omits valuenow, sets loading valuetext + aria-busy (overridable)", () => {
    const { rerender } = render(<ProgressBar indeterminate />);
    let bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).not.toHaveAttribute("aria-valuemax");
    expect(bar).toHaveAttribute("aria-valuetext", "Loading");
    expect(bar).toHaveAttribute("aria-busy", "true");

    rerender(<ProgressBar indeterminate messages={{ loading: "Wird geladen" }} />);
    bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuetext", "Wird geladen");
  });

  it("renders the value when showValue / valuePosition=inside", () => {
    const { rerender } = render(<ProgressBar value={60} showValue />);
    expect(screen.getByText("60%")).toBeInTheDocument();
    rerender(<ProgressBar value={60} valuePosition="inside" />);
    // inside renders the value text (base layer + clipped fill layer)
    expect(screen.getAllByText("60%").length).toBeGreaterThan(0);
  });

  it("does not leak the messages prop onto the DOM element", () => {
    const { container } = render(<ProgressBar value={10} messages={{ label: "x" }} />);
    expect((container.firstChild as HTMLElement).getAttribute("messages")).toBeNull();
  });
});
