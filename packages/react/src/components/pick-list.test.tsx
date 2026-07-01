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
});
