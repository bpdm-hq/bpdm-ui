import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "./number-input";

const textbox = () => screen.getByRole("spinbutton") as HTMLInputElement;
const stepper = (name: "Increase" | "Decrease") => screen.getByRole("button", { name });

describe("NumberInput", () => {
  it("renders the (uncontrolled) default value", () => {
    render(<NumberInput defaultValue="8" />);
    expect(textbox().value).toBe("8");
  });

  it("increments and decrements via the stepper buttons", async () => {
    render(<NumberInput defaultValue="8" />);
    await userEvent.click(stepper("Increase"));
    expect(textbox().value).toBe("9");
    await userEvent.click(stepper("Decrease"));
    expect(textbox().value).toBe("8");
  });

  it("respects step", async () => {
    render(<NumberInput defaultValue="0" step="5" />);
    await userEvent.click(stepper("Increase"));
    expect(textbox().value).toBe("5");
  });

  it("clamps to max and disables the Increase button at the bound", () => {
    render(<NumberInput defaultValue="10" max="10" />);
    expect(stepper("Increase")).toBeDisabled();
  });

  it("keeps precision beyond Number.MAX_SAFE_INTEGER", async () => {
    render(<NumberInput defaultValue="9007199254740992" />);
    await userEvent.click(stepper("Increase"));
    expect(textbox().value).toBe("9007199254740993"); // a float would stay ...992
  });

  it("renders a prefix / suffix", () => {
    render(<NumberInput defaultValue="50" suffix="GB" prefix="~" />);
    expect(screen.getByText("GB")).toBeInTheDocument();
    expect(screen.getByText("~")).toBeInTheDocument();
  });

  it("is controllable and reports changes via onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<NumberInput value="5" onValueChange={onValueChange} />);
    await userEvent.click(stepper("Increase"));
    expect(onValueChange).toHaveBeenCalledWith("6");
  });

  it("uses a decimal input mode and forwards ref + attributes", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput ref={ref} data-testid="qty" defaultValue="1" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByTestId("qty")).toHaveAttribute("inputmode", "decimal");
  });

  it("disables the field and both steppers", () => {
    render(<NumberInput disabled defaultValue="1" />);
    expect(textbox()).toBeDisabled();
    expect(stepper("Increase")).toBeDisabled();
    expect(stepper("Decrease")).toBeDisabled();
  });

  it("allows translating the stepper labels via messages", () => {
    render(<NumberInput messages={{ increase: "Augmenter", decrease: "Diminuer" }} />);
    expect(screen.getByRole("button", { name: "Augmenter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diminuer" })).toBeInTheDocument();
  });

  it("exposes spinbutton semantics (role + aria-value*)", () => {
    render(<NumberInput defaultValue="5" min="0" max="10" />);
    const field = textbox();
    expect(field).toHaveAttribute("role", "spinbutton");
    expect(field).toHaveAttribute("aria-valuenow", "5");
    expect(field).toHaveAttribute("aria-valuemin", "0");
    expect(field).toHaveAttribute("aria-valuemax", "10");
  });

  it("reflects prefix/suffix in aria-valuetext", () => {
    render(<NumberInput defaultValue="50" prefix="~" suffix="GB" />);
    expect(textbox()).toHaveAttribute("aria-valuetext", "~50 GB");
  });

  it("steps with ArrowUp / ArrowDown and respects the clamp", async () => {
    render(<NumberInput defaultValue="9" min="0" max="10" />);
    textbox().focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(textbox().value).toBe("10");
    await userEvent.keyboard("{ArrowUp}"); // already at max — no change
    expect(textbox().value).toBe("10");
    await userEvent.keyboard("{ArrowDown}");
    expect(textbox().value).toBe("9");
  });

  it("forwards aria-label and aria-describedby to the field", () => {
    render(<NumberInput defaultValue="1" aria-label="Quantity" aria-describedby="hint" />);
    expect(textbox()).toHaveAttribute("aria-label", "Quantity");
    expect(textbox()).toHaveAttribute("aria-describedby", "hint");
  });

  it("still allows manual typing", async () => {
    render(<NumberInput defaultValue="" />);
    await userEvent.type(textbox(), "42");
    expect(textbox().value).toBe("42");
  });
});
