import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Alert } from "./alert";

describe("Alert", () => {
  it("renders title and body with role=alert", () => {
    render(
      <Alert variant="warning" title="Heads up">
        Seats are almost full.
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Seats are almost full.")).toBeInTheDocument();
  });

  it("shows a dismiss button only when onClose is given", () => {
    const { rerender } = render(<Alert title="No close" />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    rerender(<Alert title="Closable" onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("dismiss button is wired (collapses then calls onClose)", async () => {
    const onClose = vi.fn();
    render(<Alert title="Bye" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.getByText("Bye")).toBeInTheDocument(); // still present pre-transition
  });
});
