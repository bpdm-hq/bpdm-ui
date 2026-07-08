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
});
