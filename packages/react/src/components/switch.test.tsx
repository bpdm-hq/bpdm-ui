import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

const sw = (name: string) => screen.getByRole("switch", { name });

describe("Switch", () => {
  it("renders a named switch, off by default", () => {
    render(<Switch aria-label="Notifications" />);
    expect(sw("Notifications")).toHaveAttribute("aria-checked", "false");
  });

  it("toggles on click and reports the state", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Wifi" onCheckedChange={onCheckedChange} />);
    await userEvent.click(sw("Wifi"));
    expect(sw("Wifi")).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("reflects a controlled checked prop", () => {
    render(<Switch aria-label="Dark" checked onCheckedChange={() => {}} />);
    expect(sw("Dark")).toHaveAttribute("aria-checked", "true");
  });

  it("does not toggle when disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Locked" disabled onCheckedChange={onCheckedChange} />);
    await userEvent.click(sw("Locked"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("hides the decorative ✓ / ✗ glyphs from assistive tech", () => {
    render(<Switch aria-label="Sound" icon defaultChecked />);
    const svgs = sw("Sound").querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((s) => expect(s).toHaveAttribute("aria-hidden", "true"));
  });

  it("forwards native props (id, data-testid) onto the control", () => {
    render(<Switch aria-label="X" id="notif" data-testid="notif" />);
    expect(sw("X")).toBe(screen.getByTestId("notif"));
    expect(sw("X")).toHaveAttribute("id", "notif");
  });
});
