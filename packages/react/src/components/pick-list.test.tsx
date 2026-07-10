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

  it("moves everything back to the source with move-all", async () => {
    const onChange = vi.fn();
    render(
      <PickList
        defaultValue={{ source: ["Analytics"], target: ["Billing", "Webhooks"] }}
        onChange={onChange}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Move all to source" }));
    expect(onChange).toHaveBeenLastCalledWith({ source: ["Analytics", "Billing", "Webhooks"], target: [] });
  });

  it("labels each pane as a listbox — by header, or by a fallback name", () => {
    setup();
    // headers are strings here, so the panes are labelled by them
    expect(screen.getByRole("listbox", { name: "Available" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Enabled" })).toBeTruthy();
  });

  it("gives unlabelled panes distinct source/target accessible names", () => {
    render(
      <PickList defaultValue={{ source: FEATURES, target: [] }} itemKey={(s: string) => s} renderItem={(s) => s} />,
    );
    expect(screen.getByRole("listbox", { name: "source list" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "target list" })).toBeTruthy();
  });

  it("exposes the transfer controls as labelled buttons inside a labelled group", () => {
    setup();
    const group = screen.getByRole("group", { name: "Transfer between lists" });
    expect(group).toBeTruthy();
    ["Move to target", "Move all to target", "Move to source", "Move all to source"].forEach((label) =>
      expect(screen.getByRole("button", { name: label })).toBeTruthy(),
    );
  });

  it("marks a selected item with aria-selected and multiselectable panes", async () => {
    setup();
    expect(screen.getByRole("listbox", { name: "Available" })).toHaveAttribute("aria-multiselectable", "true");
    const billing = screen.getByText("Billing").closest('[role="option"]')!;
    expect(billing).toHaveAttribute("aria-selected", "false");
    await userEvent.click(billing);
    expect(billing).toHaveAttribute("aria-selected", "true");
  });

  it("routes every user-facing string through the messages override", async () => {
    render(
      <PickList
        defaultValue={{ source: FEATURES, target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        messages={{
          transferGroup: "Transférer",
          moveToTarget: "Vers la cible",
          moveAllToTarget: "Tout vers la cible",
          sourceLabel: "liste source",
          transferAnnouncement: (n, list) => `${n} déplacé(s) vers ${list}`,
        }}
      />,
    );
    expect(screen.getByRole("group", { name: "Transférer" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tout vers la cible" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "liste source" })).toBeTruthy();
    await userEvent.click(screen.getByText("Billing"));
    await userEvent.click(screen.getByRole("button", { name: "Vers la cible" }));
    // fallback target label ("target list") is used when no header/override given
    expect(screen.getByRole("status").textContent).toContain("1 déplacé(s) vers target list");
  });

  it("overrides empty-state text through messages", () => {
    render(
      <PickList
        defaultValue={{ source: [], target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        messages={{ sourceEmpty: "Rien ici", targetEmpty: "Vide" }}
      />,
    );
    expect(screen.getByText("Rien ici")).toBeTruthy();
    expect(screen.getByText("Vide")).toBeTruthy();
  });

  it("lets the dedicated *EmptyText props win over messages", () => {
    render(
      <PickList
        defaultValue={{ source: [], target: [] }}
        itemKey={(s: string) => s}
        renderItem={(s) => s}
        sourceEmptyText="Explicit source"
        messages={{ sourceEmpty: "From messages" }}
      />,
    );
    expect(screen.getByText("Explicit source")).toBeTruthy();
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
