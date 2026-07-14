import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner, LoadingOverlay } from "./spinner";

describe("Spinner", () => {
  it("renders a status role with a polite live region", () => {
    render(<Spinner />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("accessible label defaults to Loading", () => {
    render(<Spinner />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("messages.loading overrides the default label", () => {
    render(<Spinner messages={{ loading: "Wird geladen" }} />);
    expect(screen.getByText("Wird geladen")).toBeInTheDocument();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("a per-instance label wins over messages", () => {
    render(<Spinner label="Please wait" messages={{ loading: "Wird geladen" }} />);
    expect(screen.getByText("Please wait")).toBeInTheDocument();
    expect(screen.queryByText("Wird geladen")).not.toBeInTheDocument();
  });

  it("does not leak the messages prop onto the DOM", () => {
    render(<Spinner messages={{ loading: "X" }} />);
    expect(screen.getByRole("status")).not.toHaveAttribute("messages");
  });

  it("renders the ring variant with the spinning arc shape", () => {
    const { container } = render(<Spinner variant="ring" />);
    expect(container.querySelector(".animate-spin.border-t-current")).toBeInTheDocument();
  });

  it("renders the dots variant with three staggered dots", () => {
    const { container } = render(<Spinner variant="dots" />);
    const dots = container.querySelectorAll('span[style*="animation-delay"]');
    expect(dots.length).toBe(3);
  });

  it("renders the bars variant with four staggered bars", () => {
    const { container } = render(<Spinner variant="bars" />);
    const bars = container.querySelectorAll('span[style*="animation-delay"]');
    expect(bars.length).toBe(4);
  });

  it("marks the decorative shape as aria-hidden", () => {
    const { container } = render(<Spinner variant="ring" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("drops its live region and sr-only label when announce is false", () => {
    render(<Spinner announce={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });
});

describe("LoadingOverlay", () => {
  it("renders a busy status region when shown", () => {
    render(<LoadingOverlay />);
    // the overlay is the single live region; the inner spinner drops its own
    // role=status so screen readers announce once, not twice.
    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(1);
    const overlay = statuses[0];
    expect(overlay).toHaveAttribute("aria-busy", "true");
    expect(overlay).toHaveAttribute("aria-live", "polite");
  });

  it("renders nothing when show is false", () => {
    render(<LoadingOverlay show={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a visible message only when label is set", () => {
    const { rerender } = render(<LoadingOverlay />);
    // no visible paragraph — the overlay announces via an sr-only fallback "Loading"
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();

    rerender(<LoadingOverlay label="Saving" />);
    // the label renders once, as the visible <p> (no duplicate sr-only label)
    expect(screen.getAllByText("Saving")).toHaveLength(1);
  });

  it("announces via an sr-only fallback from messages when no label is given", () => {
    render(<LoadingOverlay messages={{ loading: "Cargando" }} />);
    expect(screen.getByText("Cargando")).toBeInTheDocument();
  });

  it("uses the visible label (not the messages fallback) when a label is given", () => {
    render(<LoadingOverlay label="Saving" messages={{ loading: "Cargando" }} />);
    // "Saving" is the single announced/visible text; the fallback is not rendered
    expect(screen.getAllByText("Saving")).toHaveLength(1);
    expect(screen.queryByText("Cargando")).not.toBeInTheDocument();
  });
});
