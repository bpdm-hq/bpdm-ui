import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders a textarea", () => {
    render(<Textarea placeholder="Bio" />);
    expect(screen.getByPlaceholderText("Bio")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("defaults to md size and vertical resize", () => {
    render(<Textarea data-testid="t" />);
    const el = screen.getByTestId("t");
    expect(el).toHaveClass("min-h-20"); // md
    expect(el).toHaveClass("resize-y"); // vertical
  });

  it("forwards native attributes (data-testid, name, aria-invalid, rows)", () => {
    render(<Textarea data-testid="bio" name="bio" aria-invalid rows={5} />);
    const el = screen.getByTestId("bio");
    expect(el).toHaveAttribute("name", "bio");
    expect(el).toHaveAttribute("aria-invalid", "true");
    expect(el).toHaveAttribute("rows", "5");
  });

  it("forwards the ref to the underlying <textarea>", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("merges a custom className", () => {
    render(<Textarea className="custom-cls" data-testid="t" />);
    expect(screen.getByTestId("t")).toHaveClass("custom-cls");
  });

  it("applies size and disables manual resize when autoResize", () => {
    const { rerender } = render(<Textarea size="lg" data-testid="t" />);
    expect(screen.getByTestId("t")).toHaveClass("min-h-24"); // lg
    rerender(<Textarea autoResize data-testid="t" />);
    expect(screen.getByTestId("t")).toHaveClass("resize-none"); // autoResize disables manual resize
  });

  it("is controllable and fires onChange", async () => {
    const onChange = vi.fn();
    render(<Textarea value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows a character counter linked to the field via aria-describedby", () => {
    render(<Textarea showCount maxLength={100} defaultValue="ab" data-testid="t" />);
    const el = screen.getByTestId("t");
    const id = el.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id as string)).toHaveTextContent("2 / 100");
  });

  it("respects disabled", () => {
    render(<Textarea disabled data-testid="t" />);
    expect(screen.getByTestId("t")).toBeDisabled();
  });
});
