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

  describe("listbox keyboard (APG)", () => {
    // The list is virtualized (option DOM isn't materialized under jsdom), so the
    // active option is asserted via aria-activedescendant, whose id ends in the
    // row index (`…-opt-<index>`). OPTIONS is flat → row index === option index.
    const activeIndex = () => {
      const id = screen.getByRole("listbox").getAttribute("aria-activedescendant") ?? "";
      const m = id.match(/-opt-(\d+)$/);
      return m ? Number(m[1]) : -1;
    };

    it("type-ahead jumps to the first option starting with the typed character", async () => {
      render(<Select options={OPTIONS} aria-label="Country" />);
      await userEvent.click(combobox("Country"));
      expect(activeIndex()).toBe(0); // opens on United States
      await userEvent.keyboard("j");
      expect(activeIndex()).toBe(2); // Japan
    });

    it("accumulates rapid keystrokes to disambiguate a longer prefix", async () => {
      render(
        <Select
          options={[
            { value: "c", label: "Cherry" },
            { value: "g", label: "Grape" },
            { value: "gf", label: "Grapefruit" },
          ]}
          aria-label="Fruit"
        />,
      );
      await userEvent.click(combobox("Fruit"));
      // a lone "g" would stop at Grape (index 1); "grapef" walks on to Grapefruit
      await userEvent.keyboard("grapef");
      expect(activeIndex()).toBe(2);
    });

    it("Home / End jump to the first and last option", async () => {
      render(<Select options={OPTIONS} aria-label="Country" />);
      await userEvent.click(combobox("Country"));
      await userEvent.keyboard("{End}");
      expect(activeIndex()).toBe(2); // Japan
      await userEvent.keyboard("{Home}");
      expect(activeIndex()).toBe(0); // United States
    });

    it("preserves ArrowDown / ArrowUp navigation", async () => {
      render(<Select options={OPTIONS} aria-label="Country" />);
      await userEvent.click(combobox("Country"));
      await userEvent.keyboard("{ArrowDown}");
      expect(activeIndex()).toBe(1); // India
      await userEvent.keyboard("{ArrowUp}");
      expect(activeIndex()).toBe(0); // United States
    });
  });

  it("exposes the full selected-value text via title on the trigger", () => {
    render(<Select options={OPTIONS} aria-label="Country" value="us" onValueChange={() => {}} />);
    expect(screen.getByText("United States")).toHaveAttribute("title", "United States");
  });
});
