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

  it("reports a mixed state when indeterminate", () => {
    render(<Checkbox aria-label="Mixed" checked="indeterminate" onCheckedChange={() => {}} />);
    const cb = screen.getByRole("checkbox", { name: "Mixed" });
    expect(cb).toHaveAttribute("aria-checked", "mixed");
    expect(cb).toHaveAttribute("data-state", "indeterminate");
  });

  it("hides the decorative check glyph from assistive tech", () => {
    render(<Checkbox aria-label="On" checked onCheckedChange={() => {}} />);
    const svg = screen.getByRole("checkbox", { name: "On" }).querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a ≥3:1 unchecked border (full muted-foreground, no opacity)", () => {
    render(<Checkbox aria-label="Accept" />);
    const cls = screen.getByRole("checkbox", { name: "Accept" }).className;
    expect(cls).toMatch(/(^|\s)border-muted-foreground(\s|$)/);
    expect(cls).not.toMatch(/border-muted-foreground\//);
  });
});
