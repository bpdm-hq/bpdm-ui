import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PickList } from "./pick-list";

const FEATURES = ["Analytics", "Billing", "Webhooks"];

function setup(onChange = vi.fn()) {
  render(
    <PickList
      defaultValue={{ source: FEATURES, target: [] }}
      onChange={onChange}
      itemKey={(s) => s}
      renderItem={(s) => s}
      sourceHeader="Available"
      targetHeader="Enabled"
    />,
  );
  return onChange;
}

describe("PickList", () => {
  it("renders the source items and an empty target", () => {
    setup();
    FEATURES.forEach((f) => expect(screen.getByText(f)).toBeTruthy());
  });

  it("moves all items to the target", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByRole("button", { name: "Move all to target" }));
    expect(onChange).toHaveBeenLastCalledWith({ source: [], target: FEATURES });
  });

  it("transfers the selected item to the target", async () => {
    const onChange = setup();
    await userEvent.click(screen.getByText("Billing")); // select it
    await userEvent.click(screen.getByRole("button", { name: "Move to target" }));
    expect(onChange).toHaveBeenLastCalledWith({ source: ["Analytics", "Webhooks"], target: ["Billing"] });
  });

  it("disables the move controls when there is nothing to move", () => {
    render(<PickList defaultValue={{ source: [], target: [] }} itemKey={(s: string) => s} renderItem={(s) => s} />);
    expect(screen.getByRole("button", { name: "Move all to target" })).toBeDisabled();
  });

  it("announces a transfer via a polite live region", async () => {
    render(
      <PickList
        defaultValue={{ source: FEATURES, target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        sourceHeader="Available"
        targetHeader="Enabled"
      />,
    );
    await userEvent.click(screen.getByText("Billing"));
    await userEvent.click(screen.getByRole("button", { name: "Move to target" }));
    expect(screen.getByRole("status").textContent).toContain("1 item moved to Enabled");
  });

  it("fires onTransfer with the moved items and destination", async () => {
    const onTransfer = vi.fn();
    render(
      <PickList
        defaultValue={{ source: FEATURES, target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        onTransfer={onTransfer}
      />,
    );
    await userEvent.click(screen.getByText("Billing"));
    await userEvent.click(screen.getByRole("button", { name: "Move to target" }));
    expect(onTransfer).toHaveBeenCalledWith(["Billing"], "target");
  });

  it("renders custom empty-state text for each list", () => {
    render(
      <PickList
        defaultValue={{ source: [], target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        sourceEmptyText="No features"
        targetEmptyText="Add some"
      />,
    );
    expect(screen.getByText("No features")).toBeTruthy();
    expect(screen.getByText("Add some")).toBeTruthy();
  });

  it("never selects or transfers a disabled (locked) item", async () => {
    const onChange = vi.fn();
    render(
      <PickList
        defaultValue={{ source: FEATURES, target: [] }}
        onChange={onChange}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        isItemDisabled={(s) => s === "Billing"}
      />,
    );
    const billing = screen.getByText("Billing").closest('[role="option"]')!;
    expect(billing).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(billing);
    expect(billing).toHaveAttribute("aria-selected", "false");
    // move-all leaves the locked item behind in the source
    await userEvent.click(screen.getByRole("button", { name: "Move all to target" }));
    expect(onChange).toHaveBeenLastCalledWith({ source: ["Billing"], target: ["Analytics", "Webhooks"] });
  });
});
