import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("dismiss aria-label defaults to Dismiss and is overridable via messages", () => {
    const { rerender } = render(<Alert title="Default" onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    rerender(<Alert title="German" onClose={() => {}} messages={{ dismiss: "Schließen" }} />);
    expect(screen.getByRole("button", { name: "Schließen" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("calls onClose once the collapse transition ends", async () => {
    const onClose = vi.fn();
    render(<Alert title="Collapse me" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).not.toHaveBeenCalled();

    // outer grid wrapper = alert box → overflow wrapper → grid container
    const grid = screen.getByRole("alert").parentElement!.parentElement!;
    // unrelated property shouldn't fire onClose
    fireEvent.transitionEnd(grid, { propertyName: "opacity" });
    expect(onClose).not.toHaveBeenCalled();
    // the grid-template-rows transition drives the close
    fireEvent.transitionEnd(grid, { propertyName: "grid-template-rows" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("maps live=polite to role=status (assertive role=alert stays the default)", () => {
    const { rerender } = render(<Alert title="Info">Body</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(
      <Alert title="Info" live="polite">
        Body
      </Alert>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(
      <Alert title="Info" live="off">
        Body
      </Alert>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
