import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderList, type OrderListProps } from "./order-list";

const STAGES = ["Lint", "Type-check", "Unit tests", "Build", "Deploy"];

function setup(props: Partial<OrderListProps<string>> = {}) {
  const onChange = vi.fn();
  render(
    <OrderList
      defaultValue={STAGES}
      onChange={onChange}
      itemKey={(s) => s}
      renderItem={(s) => s}
      header="Pipeline stages"
      {...props}
    />,
  );
  return onChange;
}

const optionTexts = () => screen.getAllByRole("option").map((o) => o.textContent);
const btn = (name: string) => screen.getByRole("button", { name });

describe("OrderList (component)", () => {
  it("renders one option per item, in order", () => {
    setup();
    expect(optionTexts()).toEqual(STAGES);
  });

  it("clicking an option selects it (aria-selected)", async () => {
    setup();
    const lint = screen.getByText("Lint").closest('[role="option"]')!;
    await userEvent.click(lint);
    expect(lint).toHaveAttribute("aria-selected", "true");
  });

  it("moves the selected item down with the control column and emits the new order", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByText("Lint"));
    await userEvent.click(btn("Move down"));
    expect(onChange).toHaveBeenLastCalledWith(["Type-check", "Lint", "Unit tests", "Build", "Deploy"]);
    expect(optionTexts()).toEqual(["Type-check", "Lint", "Unit tests", "Build", "Deploy"]);
  });

  it("disables every control while nothing is selected", () => {
    setup();
    ["Move up", "Move to top", "Move down", "Move to bottom"].forEach((name) =>
      expect(btn(name)).toBeDisabled(),
    );
  });

  it("disables the up controls when the top item is selected", async () => {
    setup();
    await userEvent.click(screen.getByText("Lint")); // already at top
    expect(btn("Move up")).toBeDisabled();
    expect(btn("Move to top")).toBeDisabled();
    expect(btn("Move down")).not.toBeDisabled();
    expect(btn("Move to bottom")).not.toBeDisabled();
  });

  it("supports the listbox keyboard pattern (arrow nav + Enter to select)", async () => {
    setup();
    const listbox = screen.getByRole("listbox");
    const opts = screen.getAllByRole("option");
    // focusing the listbox activates the first option (WAI-ARIA listbox pattern)
    act(() => listbox.focus());
    expect(listbox).toHaveAttribute("aria-activedescendant", opts[0].id);
    await userEvent.keyboard("{ArrowDown}");
    expect(listbox).toHaveAttribute("aria-activedescendant", opts[1].id);
    await userEvent.keyboard("{Enter}");
    expect(opts[1]).toHaveAttribute("aria-selected", "true");
  });

  it("filters the visible options", async () => {
    setup({ filterBy: (s) => s });
    await userEvent.type(screen.getByRole("textbox"), "Build");
    expect(optionTexts()).toEqual(["Build"]);
  });

  it("keeps several items selected in multiple mode", async () => {
    setup({ selectionMode: "multiple" });
    await userEvent.click(screen.getByText("Lint"));
    await userEvent.click(screen.getByText("Build"));
    const selected = screen
      .getAllByRole("option")
      .filter((o) => o.getAttribute("aria-selected") === "true")
      .map((o) => o.textContent);
    expect(selected).toEqual(["Lint", "Build"]);
  });

  it("names the listbox from the header and omits aria-multiselectable in single mode", () => {
    setup();
    expect(screen.getByRole("listbox", { name: "Pipeline stages" })).toBeTruthy();
    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-multiselectable");
  });

  it("marks the listbox aria-multiselectable in multiple mode", () => {
    setup({ selectionMode: "multiple" });
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
  });

  it("announces a move via a polite live region", async () => {
    setup();
    await userEvent.click(screen.getByText("Lint"));
    await userEvent.click(btn("Move down"));
    expect(screen.getByRole("status").textContent?.trim()).toBe("Moved down one position");
  });
});
