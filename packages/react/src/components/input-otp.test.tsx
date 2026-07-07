import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputOtp } from "./input-otp";

const cells = () => screen.getAllByRole("textbox") as HTMLInputElement[];

describe("InputOtp", () => {
  it("renders `length` cells inside a labelled group", () => {
    render(<InputOtp />);
    expect(screen.getByRole("group", { name: "One-time code" })).toBeInTheDocument();
    expect(cells()).toHaveLength(6);
    expect(cells()[0]).toHaveAttribute("aria-label", "Character 1 of 6");
  });

  it("honours length + a custom aria-label", () => {
    render(<InputOtp length={4} aria-label="PIN" />);
    expect(screen.getByRole("group", { name: "PIN" })).toBeInTheDocument();
    expect(cells()).toHaveLength(4);
  });

  it("auto-advances focus and joins the value on entry", async () => {
    const onValueChange = vi.fn();
    render(<InputOtp integerOnly onValueChange={onValueChange} />);
    await userEvent.type(cells()[0], "1");
    expect(cells()[1]).toHaveFocus();
    await userEvent.type(cells()[1], "2");
    expect(onValueChange).toHaveBeenLastCalledWith("12");
  });

  it("rejects non-digits when integerOnly and sets inputmode=numeric", async () => {
    render(<InputOtp integerOnly />);
    expect(cells()[0]).toHaveAttribute("inputmode", "numeric");
    await userEvent.type(cells()[0], "a");
    expect(cells()[0]).toHaveValue("");
  });

  it("fills every cell on paste and fires onComplete", async () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();
    render(<InputOtp integerOnly onValueChange={onValueChange} onComplete={onComplete} />);
    cells()[0].focus();
    await userEvent.paste("123456");
    expect(onValueChange).toHaveBeenLastCalledWith("123456");
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("does not fire onComplete until every cell is filled", async () => {
    const onComplete = vi.fn();
    render(<InputOtp integerOnly onComplete={onComplete} />);
    await userEvent.type(cells()[0], "1");
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("puts one-time-code autocomplete on the first cell only", () => {
    render(<InputOtp />);
    expect(cells()[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(cells()[1]).toHaveAttribute("autocomplete", "off");
  });

  it("emits the joined value via a hidden input when `name` is set", () => {
    const { container } = render(<InputOtp name="code" defaultValue="12" />);
    const hidden = container.querySelector('input[type="hidden"][name="code"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.value).toBe("12");
  });

  it("renders a decorative separator when grouped", () => {
    render(<InputOtp grouped />); // 6 → 3-3
    const sep = screen.getByText("−");
    expect(sep).toHaveAttribute("aria-hidden", "true");
  });

  it("focuses the first cell with autoFocus", () => {
    render(<InputOtp autoFocus />);
    expect(cells()[0]).toHaveFocus();
  });

  it("links a description to the group via aria-describedby", () => {
    render(<InputOtp aria-describedby="hint" />);
    expect(screen.getByRole("group", { name: "One-time code" })).toHaveAttribute(
      "aria-describedby",
      "hint",
    );
  });

  it("disables every cell", () => {
    render(<InputOtp disabled />);
    cells().forEach((c) => expect(c).toBeDisabled());
  });

  it("allows translating the group + per-cell labels for i18n", () => {
    render(
      <InputOtp length={4} aria-label="Code de vérification" cellLabel={(i, n) => `Chiffre ${i + 1}/${n}`} />,
    );
    expect(screen.getByRole("group", { name: "Code de vérification" })).toBeInTheDocument();
    expect(cells()[0]).toHaveAttribute("aria-label", "Chiffre 1/4");
  });
});
