import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "./radio-group";

// Note: arrow-key navigation + roving tabindex are provided by the underlying
// Radix RadioGroup (covered upstream); here we assert our integration surface.
function Plan(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Plan" {...props}>
      <RadioGroupItem value="free" aria-label="Free" />
      <RadioGroupItem value="pro" aria-label="Pro" />
      <RadioGroupItem value="max" aria-label="Max" />
    </RadioGroup>
  );
}

const radios = () => screen.getAllByRole("radio") as HTMLElement[];

describe("RadioGroup", () => {
  it("renders a named radiogroup with radio items", () => {
    render(<Plan />);
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    expect(radios()).toHaveLength(3);
  });

  it("selects on click and reports the value", async () => {
    const onValueChange = vi.fn();
    render(<Plan onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledWith("pro");
  });

  it("reflects a controlled value", () => {
    render(<Plan value="max" onValueChange={() => {}} />);
    expect(screen.getByRole("radio", { name: "Max" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "false");
  });

  it("does not select a disabled item", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Plan" onValueChange={onValueChange}>
        <RadioGroupItem value="free" aria-label="Free" />
        <RadioGroupItem value="pro" aria-label="Pro" disabled />
      </RadioGroup>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("forwards a translated accessible name to the group and items", () => {
    render(
      <RadioGroup aria-label="Forfait">
        <RadioGroupItem value="free" aria-label="Gratuit" />
        <RadioGroupItem value="pro" aria-label="Payant" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup", { name: "Forfait" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gratuit" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Payant" })).toBeInTheDocument();
  });
});
