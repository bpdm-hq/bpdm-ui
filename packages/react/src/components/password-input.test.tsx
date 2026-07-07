import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput, scorePassword } from "./password-input";

// type="password" exposes no `textbox` role, so grab the input by its test id.
const field = () => screen.getByTestId("pw") as HTMLInputElement;
const toggle = (name: "Show password" | "Hide password") => screen.getByRole("button", { name });

describe("scorePassword", () => {
  it("scores from length + variety, capped at 4", () => {
    expect(scorePassword("")).toBe(0);
    expect(scorePassword("abc")).toBe(0);
    expect(scorePassword("Abcd1234!xyz")).toBe(4);
  });
});

describe("PasswordInput", () => {
  it("renders a hidden password field with a reveal toggle", () => {
    render(<PasswordInput data-testid="pw" feedback={false} />);
    expect(field()).toHaveAttribute("type", "password");
    expect(toggle("Show password")).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles visibility and the toggle's label + pressed state", async () => {
    render(<PasswordInput data-testid="pw" feedback={false} />);
    await userEvent.click(toggle("Show password"));
    expect(field()).toHaveAttribute("type", "text");
    expect(toggle("Hide password")).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(toggle("Hide password"));
    expect(field()).toHaveAttribute("type", "password");
  });

  it("spreads native props onto the input and forwards the ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <PasswordInput ref={ref} data-testid="pw" name="pw" required autoComplete="new-password" feedback={false} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(field()).toHaveAttribute("name", "pw");
    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute("autocomplete", "new-password");
  });

  it("is controllable and reports changes via onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<PasswordInput data-testid="pw" onValueChange={onValueChange} feedback={false} />);
    await userEvent.type(field(), "hunter2");
    expect(onValueChange).toHaveBeenLastCalledWith("hunter2");
  });

  it("shows a strength label linked to the field via aria-describedby", async () => {
    render(<PasswordInput data-testid="pw" />);
    await userEvent.type(field(), "Abcd1234!xyz"); // score 4 → "Strong"
    const id = field().getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id as string)).toHaveTextContent("Strong");
  });

  it("hides the meter (and drops aria-describedby) when feedback is off", () => {
    render(<PasswordInput data-testid="pw" defaultValue="Abcd1234!xyz" feedback={false} />);
    expect(screen.queryByText("Strong")).not.toBeInTheDocument();
    expect(field()).not.toHaveAttribute("aria-describedby");
  });

  it("honours custom levels + labels", () => {
    render(
      <PasswordInput
        data-testid="pw"
        levels={3}
        labels={["Low", "Mid", "High"]}
        defaultValue="Abcd1234!xyz"
      />,
    );
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("preserves a caller-supplied aria-describedby alongside the meter", async () => {
    render(<PasswordInput data-testid="pw" aria-describedby="hint" />);
    await userEvent.type(field(), "Abcd1234!xyz");
    expect(field().getAttribute("aria-describedby")).toMatch(/^hint /);
  });

  it("disables the field and the toggle", () => {
    render(<PasswordInput data-testid="pw" disabled feedback={false} />);
    expect(field()).toBeDisabled();
    expect(toggle("Show password")).toBeDisabled();
  });

  it("allows translating the reveal-toggle label via messages", () => {
    render(<PasswordInput data-testid="pw" feedback={false} messages={{ show: "Afficher" }} />);
    expect(screen.getByRole("button", { name: "Afficher" })).toBeInTheDocument();
  });
});
