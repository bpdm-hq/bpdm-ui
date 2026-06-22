import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("toggles when uncontrolled", async () => {
    render(<Checkbox aria-label="Accept" />);
    const cb = screen.getByRole("checkbox", { name: "Accept" });
    expect(cb).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(cb);
    expect(cb).toHaveAttribute("data-state", "checked");
  });

  it("fires onCheckedChange", async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Toggle" onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Toggle" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("respects the controlled checked prop", () => {
    render(<Checkbox aria-label="On" checked onCheckedChange={() => {}} />);
    expect(screen.getByRole("checkbox", { name: "On" })).toHaveAttribute("data-state", "checked");
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    render(<Checkbox aria-label="Locked" disabled onCheckedChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Locked" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
