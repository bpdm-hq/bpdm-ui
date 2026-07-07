import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  it("renders a text input", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("defaults to the outline variant and md size", () => {
    render(<Input data-testid="i" />);
    const input = screen.getByTestId("i");
    expect(input).toHaveClass("border"); // outline box
    expect(input).toHaveClass("h-10"); // md
  });

  it("forwards native attributes (data-testid, name, aria-*, maxLength)", () => {
    render(<Input data-testid="email" name="email" aria-invalid maxLength={5} />);
    const input = screen.getByTestId("email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("maxlength", "5");
  });

  it("forwards the ref to the underlying <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("merges a custom className", () => {
    render(<Input className="custom-cls" data-testid="i" />);
    expect(screen.getByTestId("i")).toHaveClass("custom-cls");
  });

  it("applies the size + variant", () => {
    render(<Input size="lg" variant="underline" data-testid="i" />);
    const input = screen.getByTestId("i");
    expect(input).toHaveClass("h-12"); // lg
    expect(input).toHaveClass("border-b"); // underline
    expect(input).not.toHaveClass("border"); // not the outline box border
  });

  it("is controllable and fires onChange", async () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("respects disabled", () => {
    render(<Input disabled data-testid="i" />);
    expect(screen.getByTestId("i")).toBeDisabled();
  });

  it("renders start/end icons (aria-hidden) and pads the input to clear them", () => {
    render(
      <Input
        data-testid="i"
        startIcon={<svg data-testid="start" />}
        endIcon={<svg data-testid="end" />}
      />,
    );
    const input = screen.getByTestId("i");
    expect(input).toHaveClass("pl-9");
    expect(input).toHaveClass("pr-9");
    // decorative icon wrappers are removed from the accessibility tree
    expect(screen.getByTestId("start").closest("span")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("end").closest("span")).toHaveAttribute("aria-hidden", "true");
  });
});
