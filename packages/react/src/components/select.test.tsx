import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, type SelectItems } from "./select";

const OPTIONS: SelectItems = [
  { value: "us", label: "United States" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
];

const combobox = (name: string) => screen.getByRole("combobox", { name });

describe("Select", () => {
  it("renders a named combobox trigger with placeholder + haspopup", () => {
    render(<Select options={OPTIONS} aria-label="Country" placeholder="Pick one" />);
    const trigger = combobox("Country");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("Pick one");
  });

  it("shows the selected option's label (controlled)", () => {
    render(<Select options={OPTIONS} aria-label="Country" value="in" onValueChange={() => {}} />);
    expect(combobox("Country")).toHaveTextContent("India");
  });

  it("opens and links the trigger to a labelled listbox via aria-controls", async () => {
    render(<Select options={OPTIONS} aria-label="Country" />);
    await userEvent.click(combobox("Country"));
    const trigger = combobox("Country");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    expect(trigger.getAttribute("aria-controls")).toBe(listbox.id);
    expect(listbox).toHaveAttribute("aria-label", "Country");
  });

  it("renders a searchable editable-combobox filter box", async () => {
    render(<Select options={OPTIONS} aria-label="Country" searchable searchPlaceholder="Filter" />);
    await userEvent.click(combobox("Country"));
    const search = combobox("Filter"); // the filter input, distinct from the trigger
    expect(search).toHaveAttribute("aria-autocomplete", "list");
    expect(search).toHaveAttribute("aria-controls", screen.getByRole("listbox").id);
  });

  it("shows translated empty text when there are no options", async () => {
    render(<Select options={[]} aria-label="Country" emptyText="Aucun résultat" />);
    await userEvent.click(combobox("Country"));
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("is disabled", () => {
    render(<Select options={OPTIONS} aria-label="Country" disabled />);
    expect(combobox("Country")).toBeDisabled();
  });
});
