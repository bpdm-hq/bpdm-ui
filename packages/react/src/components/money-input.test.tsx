import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoneyInput } from "./money-input";

const textbox = () => screen.getByRole("textbox") as HTMLInputElement;

describe("MoneyInput", () => {
  it("shows the currency symbol and the locale-grouped value at rest", () => {
    render(<MoneyInput defaultValue="1234.5" />);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(textbox().value).toBe("1,234.5"); // en-US grouping
  });

  it("groups per locale (en-IN → lakh grouping)", () => {
    render(<MoneyInput defaultValue="100000" currency="INR" locale="en-IN" />);
    expect(textbox().value).toBe("1,00,000");
  });

  it("uses the currency's fraction digits (JPY → zero)", () => {
    render(<MoneyInput defaultValue="5000" currency="JPY" locale="ja-JP" />);
    expect(textbox().value).toBe("5,000");
  });

  it("marks the currency symbol decorative (aria-hidden)", () => {
    render(<MoneyInput defaultValue="10" />);
    expect(screen.getByText("$")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the raw value on focus and reformats on blur", async () => {
    render(<MoneyInput defaultValue="1234.5" />);
    await userEvent.click(textbox());
    expect(textbox().value).toBe("1234.5"); // raw while editing
    await userEvent.tab();
    expect(textbox().value).toBe("1,234.5"); // regrouped on blur
  });

  it("reports the raw numeric string via onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<MoneyInput onValueChange={onValueChange} />);
    await userEvent.type(textbox(), "50");
    expect(onValueChange).toHaveBeenLastCalledWith("50");
  });

  it("rejects a minus sign unless allowNegative is set", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<MoneyInput onValueChange={onValueChange} />);
    await userEvent.type(textbox(), "-");
    expect(onValueChange).not.toHaveBeenCalledWith("-");

    onValueChange.mockClear();
    rerender(<MoneyInput allowNegative onValueChange={onValueChange} />);
    await userEvent.type(textbox(), "-5");
    expect(onValueChange).toHaveBeenLastCalledWith("-5");
  });

  it("spreads native props onto the input (name, required, aria-label, data-testid)", () => {
    render(<MoneyInput data-testid="amount" name="price" required aria-label="Total" />);
    const el = screen.getByTestId("amount");
    expect(el).toBe(textbox());
    expect(el).toHaveAttribute("name", "price");
    expect(el).toBeRequired();
    expect(el).toHaveAttribute("aria-label", "Total");
  });

  it("reflects aria-invalid onto the input", () => {
    render(<MoneyInput aria-invalid data-testid="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards the ref to the underlying <input>", () => {
    const ref = createRef<HTMLInputElement>();
    render(<MoneyInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("disables the field", () => {
    render(<MoneyInput disabled data-testid="m" />);
    expect(screen.getByTestId("m")).toBeDisabled();
  });
});
