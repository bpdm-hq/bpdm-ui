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
});

describe("LoadingOverlay", () => {
  it("renders a busy status region when shown", () => {
    render(<LoadingOverlay />);
    // both the overlay and its inner spinner carry role=status; the overlay is aria-busy
    const overlay = screen.getAllByRole("status").find((el) => el.getAttribute("aria-busy") === "true");
    expect(overlay).toBeDefined();
    expect(overlay).toHaveAttribute("aria-live", "polite");
  });

  it("renders nothing when show is false", () => {
    render(<LoadingOverlay show={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a visible message only when label is set", () => {
    const { rerender } = render(<LoadingOverlay />);
    // no visible paragraph, but the inner spinner still announces "Loading"
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Saving")).not.toBeInTheDocument();

    rerender(<LoadingOverlay label="Saving" />);
    // label renders both as visible <p> and inner sr-only label → two matches
    expect(screen.getAllByText("Saving").length).toBeGreaterThanOrEqual(1);
  });

  it("resolves the inner spinner label from messages when no label is given", () => {
    render(<LoadingOverlay messages={{ loading: "Cargando" }} />);
    expect(screen.getByText("Cargando")).toBeInTheDocument();
  });

  it("a per-instance label wins over messages for the inner spinner", () => {
    render(<LoadingOverlay label="Saving" messages={{ loading: "Cargando" }} />);
    // "Saving" appears twice: the visible <p> and the inner spinner's sr-only label
    expect(screen.getAllByText("Saving").length).toBe(2);
    expect(screen.queryByText("Cargando")).not.toBeInTheDocument();
  });
});
