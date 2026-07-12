import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DialogProvider, useDialog, type DialogOptions } from "./dynamic-dialog";
import { type DialogMessages } from "./dialog";

/**
 * Test harness: a button that opens a dialog with a `close`-driven content
 * function. The content itself carries another "Open" button so a second dialog
 * can be stacked from inside the first (the outer trigger goes `aria-hidden`
 * behind the modal, so nested triggering is the realistic path).
 */
function Harness({ options }: { options?: DialogOptions }) {
  const dialog = useDialog();
  const open = () =>
    dialog.open(
      ({ close }) => (
        <div>
          Hi
          <button onClick={open}>Open</button>
          <button onClick={close}>x</button>
        </div>
      ),
      options,
    );
  return <button onClick={open}>Open</button>;
}

function renderDialog(props: {
  options?: DialogOptions;
  messages?: Partial<DialogMessages>;
} = {}) {
  return render(
    <DialogProvider messages={props.messages}>
      <Harness options={props.options} />
    </DialogProvider>,
  );
}

describe("DialogProvider / useDialog", () => {
  it("opens a dialog with the title and content", async () => {
    const user = userEvent.setup();
    renderDialog({ options: { title: "Edit" } });

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = screen.getByRole("dialog", { name: "Edit" });
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain("Hi");
  });

  it("closes when the content's `close` callback runs", async () => {
    const user = userEvent.setup();
    renderDialog({ options: { title: "Edit" } });

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "x" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("stacks dialogs and closing the top leaves the first open", async () => {
    const user = userEvent.setup();
    renderDialog({ options: { title: "Edit" } });

    // count via the DOM: the lower dialog is `aria-hidden` behind the top one,
    // so role-based queries only ever surface the topmost dialog.
    const dialogCount = () => document.querySelectorAll('[role="dialog"]').length;

    await user.click(screen.getByRole("button", { name: "Open" }));
    // the nested "Open" (inside the first dialog) stacks a second dialog
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(dialogCount()).toBe(2);

    // the topmost dialog is the accessible one — close it via its `x`
    await user.click(screen.getByRole("button", { name: "x" }));
    expect(dialogCount()).toBe(1);
  });

  it("localizes the close-button aria-label via the Provider `messages` prop", async () => {
    const user = userEvent.setup();
    renderDialog({ options: { title: "Edit" }, messages: { close: "Schließen" } });

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("throws when useDialog is used outside a DialogProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Harness />)).toThrow(/DialogProvider/);
    spy.mockRestore();
  });
});
