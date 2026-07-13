import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderList } from "./order-list";

// Controlled host so tests can assert the reordered value.
function Host({
  initial = ["Alpha", "Bravo", "Charlie", "Delta"],
  ...props
}: {
  initial?: string[];
} & Partial<React.ComponentProps<typeof OrderList<string>>>) {
  const [value, setValue] = React.useState(initial);
  return (
    <OrderList<string>
      value={value}
      onChange={setValue}
      itemKey={(w) => w}
      renderItem={(w) => w}
      {...props}
    />
  );
}

const optionLabels = () =>
  screen.getAllByRole("option").map((o) => o.textContent?.trim());

describe("OrderList", () => {
  it("renders one option per item, in order", () => {
    render(<Host />);
    expect(optionLabels()).toEqual(["Alpha", "Bravo", "Charlie", "Delta"]);
  });

  it("moves the selected item down with the control column", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Alpha" }));
    await user.click(screen.getByRole("button", { name: "Move down" }));
    expect(optionLabels()).toEqual(["Bravo", "Alpha", "Charlie", "Delta"]);
  });

  it("moves the selected item up with the control column", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Charlie" }));
    await user.click(screen.getByRole("button", { name: "Move up" }));
    expect(optionLabels()).toEqual(["Alpha", "Charlie", "Bravo", "Delta"]);
  });

  it("moves the selected item to top", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Charlie" }));
    await user.click(screen.getByRole("button", { name: "Move to top" }));
    expect(optionLabels()).toEqual(["Charlie", "Alpha", "Bravo", "Delta"]);
  });

  it("moves the selected item to the bottom", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Bravo" }));
    await user.click(screen.getByRole("button", { name: "Move to bottom" }));
    expect(optionLabels()).toEqual(["Alpha", "Charlie", "Delta", "Bravo"]);
  });

  it("keeps a single selection in single mode (default)", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Alpha" }));
    await user.click(screen.getByRole("option", { name: "Bravo" }));
    const selected = screen
      .getAllByRole("option")
      .filter((o) => o.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent?.trim()).toBe("Bravo");
  });

  it("allows several selections in multiple mode and moves them together", async () => {
    const user = userEvent.setup();
    render(<Host selectionMode="multiple" />);

    const listbox = screen.getByRole("listbox");
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");

    await user.click(screen.getByRole("option", { name: "Charlie" }));
    await user.click(screen.getByRole("option", { name: "Delta" }));
    const selected = screen
      .getAllByRole("option")
      .filter((o) => o.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Move up" }));
    expect(optionLabels()).toEqual(["Alpha", "Charlie", "Delta", "Bravo"]);
  });

  it("narrows the visible items via the filter", async () => {
    const user = userEvent.setup();
    render(<Host filterBy={(w) => w} filterPlaceholder="Filter stages" />);
    expect(screen.getAllByRole("option")).toHaveLength(4);

    await user.type(screen.getByRole("textbox", { name: "Filter stages" }), "a");
    // "Alpha", "Bravo", "Charlie", "Delta" all contain an "a"
    expect(optionLabels()).toEqual(["Alpha", "Bravo", "Charlie", "Delta"]);

    await user.clear(screen.getByRole("textbox", { name: "Filter stages" }));
    await user.type(screen.getByRole("textbox", { name: "Filter stages" }), "del");
    expect(optionLabels()).toEqual(["Delta"]);
  });

  it("exposes default English accessible names on the reorder controls", () => {
    render(<Host />);
    const group = screen.getByRole("group", { name: "Reorder" });
    expect(within(group).getByRole("button", { name: "Move up" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Move to top" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Move down" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Move to bottom" })).toBeInTheDocument();
  });

  it("localizes the reorder control names via messages", () => {
    render(
      <Host
        messages={{
          reorderGroup: "Réordonner",
          moveUp: "Monter",
          moveToTop: "Mettre en haut",
          moveDown: "Descendre",
          moveToBottom: "Mettre en bas",
        }}
      />,
    );
    const group = screen.getByRole("group", { name: "Réordonner" });
    expect(within(group).getByRole("button", { name: "Monter" })).toBeInTheDocument();
    expect(within(group).getByRole("button", { name: "Descendre" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move up" })).not.toBeInTheDocument();
  });

  it("disables the controls until an item is selected", async () => {
    const user = userEvent.setup();
    render(<Host />);
    expect(screen.getByRole("button", { name: "Move up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move down" })).toBeDisabled();

    await user.click(screen.getByRole("option", { name: "Alpha" }));
    // "Alpha" is first → can move down but not up
    expect(screen.getByRole("button", { name: "Move up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move down" })).toBeEnabled();
  });

  it("reorder controls are native buttons operable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Alpha" }));

    const down = screen.getByRole("button", { name: "Move down" });
    down.focus();
    expect(down).toHaveFocus();
    // Space activates a focused native button
    await user.keyboard("[Space]");
    expect(optionLabels()).toEqual(["Bravo", "Alpha", "Charlie", "Delta"]);
  });

  it("announces a move through the polite live region", async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole("option", { name: "Alpha" }));
    await user.click(screen.getByRole("button", { name: "Move down" }));
    const status = screen.getByRole("status");
    expect(status.textContent?.trim()).toBe("Moved down one position");
  });
});
