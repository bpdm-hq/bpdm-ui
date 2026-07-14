import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelect } from "./multi-select";
import type { SelectItems } from "./select";

const OPTIONS: SelectItems = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry" },
];

const trigger = (name: string) => screen.getByRole("combobox", { name });

describe("MultiSelect", () => {
  it("renders a named combobox trigger with placeholder + haspopup", () => {
    render(<MultiSelect options={OPTIONS} aria-label="Tags" placeholder="Pick some" />);
    const t = trigger("Tags");
    expect(t).toHaveAttribute("aria-haspopup", "listbox");
    expect(t).toHaveAttribute("aria-expanded", "false");
    expect(t).toHaveTextContent("Pick some");
  });

  it("shows chips for the selected values with a translatable remove label", () => {
    render(<MultiSelect options={OPTIONS} aria-label="Tags" value={["a", "b"]} onValueChange={() => {}} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Apple" })).toBeInTheDocument();
  });

  it("removes a chip via its button", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect options={OPTIONS} aria-label="Tags" value={["a", "b"]} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Apple" }));
    expect(onValueChange).toHaveBeenCalledWith(["b"]);
  });

  it("uses a translatable count message when maxDisplay is 0", () => {
    render(
      <MultiSelect
        options={OPTIONS}
        aria-label="Tags"
        value={["a", "b"]}
        maxDisplay={0}
        messages={{ selected: (n) => `${n} choisis` }}
        onValueChange={() => {}}
      />,
    );
    expect(trigger("Tags")).toHaveTextContent("2 choisis");
  });

  it("opens a multi-selectable listbox linked via aria-controls", async () => {
    render(<MultiSelect options={OPTIONS} aria-label="Tags" selectAll={false} />);
    await userEvent.click(trigger("Tags"));
    expect(trigger("Tags")).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(trigger("Tags").getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox).toHaveAttribute("aria-label", "Tags");
  });

  it("marks the active option with the accessible amber indicator (not bg-muted)", async () => {
    // give the virtualized scroll element a real height so the option rows render
    // in jsdom (which otherwise reports 0 → tanstack renders nothing). tanstack
    // measures via offsetWidth/offsetHeight.
    const realW = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    const realH = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 220 });
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 300 });
    try {
      render(<MultiSelect options={OPTIONS} aria-label="Tags" selectAll={false} />);
      await userEvent.click(trigger("Tags"));
      const listbox = screen.getByRole("listbox");
      const active = document.getElementById(listbox.getAttribute("aria-activedescendant")!);
      expect(active).toBeTruthy();
      expect(active!.className).toContain("bg-[var(--bpdm-option-active-bg)]");
      expect(active!.className).toContain("shadow-[inset_2px_0_0_0_var(--bpdm-option-active-bar)]");
      expect(active!.className).toContain("rtl:shadow-[inset_-2px_0_0_0_var(--bpdm-option-active-bar)]");
      // the weak, near-invisible bg-muted active fill is gone
      expect(active!.className).not.toContain("bg-muted");
    } finally {
      if (realW) Object.defineProperty(HTMLElement.prototype, "offsetWidth", realW);
      if (realH) Object.defineProperty(HTMLElement.prototype, "offsetHeight", realH);
    }
  });

  it("exposes Select all as a tri-state checkbox with a translatable label", async () => {
    render(<MultiSelect options={OPTIONS} aria-label="Tags" messages={{ selectAll: "Tout" }} />);
    await userEvent.click(trigger("Tags"));
    const all = screen.getByRole("checkbox", { name: "Tout" });
    expect(all).toHaveAttribute("aria-checked", "false");
  });

  it("is disabled", () => {
    render(<MultiSelect options={OPTIONS} aria-label="Tags" disabled />);
    expect(trigger("Tags")).toHaveAttribute("aria-disabled", "true");
  });

  it("exposes a keyboard-reachable clear-all that clears via Enter", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect options={OPTIONS} aria-label="Tags" value={["a", "b"]} onValueChange={onValueChange} />);
    const clear = screen.getByRole("button", { name: "Clear all" });
    // no longer mouse-only (tabindex=-1) — it's in the tab order
    expect(clear).not.toHaveAttribute("tabindex", "-1");
    clear.focus();
    expect(clear).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("removes the last chip with Backspace on the focused trigger", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect options={OPTIONS} aria-label="Tags" value={["a", "b"]} onValueChange={onValueChange} />);
    trigger("Tags").focus();
    await userEvent.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenCalledWith(["a"]);
  });
});
