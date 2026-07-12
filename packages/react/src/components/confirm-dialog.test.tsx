import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfirmProvider,
  useConfirm,
  DEFAULT_CONFIRM_MESSAGES,
  type ConfirmOptions,
} from "./confirm-dialog";

/** Test harness: a button that runs `confirm(options)` and records the result. */
function Harness({ options }: { options?: ConfirmOptions }) {
  const confirm = useConfirm();
  const [result, setResult] = React.useState<string>("");
  return (
    <>
      <button onClick={async () => setResult(String(await confirm(options)))}>Ask</button>
      <output data-testid="result">{result}</output>
    </>
  );
}

function renderConfirm(props: {
  options?: ConfirmOptions;
  messages?: React.ComponentProps<typeof ConfirmProvider>["messages"];
}) {
  return render(
    <ConfirmProvider messages={props.messages}>
      <Harness options={props.options} />
    </ConfirmProvider>,
  );
}

describe("ConfirmProvider / useConfirm", () => {
  it("opens the dialog with the default title and Cancel/Confirm buttons", async () => {
    const user = userEvent.setup();
    renderConfirm({});

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByRole("dialog", { name: DEFAULT_CONFIRM_MESSAGES.title })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  it("resolves true when Confirm is clicked", async () => {
    const user = userEvent.setup();
    renderConfirm({});

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(screen.getByTestId("result").textContent).toBe("true");
  });

  it("resolves false when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderConfirm({});

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByTestId("result").textContent).toBe("false");
  });

  it("renders the per-call confirmText override", async () => {
    const user = userEvent.setup();
    renderConfirm({ options: { confirmText: "Delete", destructive: true } });

    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByRole("button", { name: "Delete" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Confirm" })).toBeNull();
  });

  it("localizes the defaults via the Provider `messages` prop", async () => {
    const user = userEvent.setup();
    renderConfirm({
      messages: { confirm: "Bestätigen", cancel: "Abbrechen", title: "Sicher?" },
    });

    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByRole("dialog", { name: "Sicher?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bestätigen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abbrechen" })).toBeTruthy();
  });

  it("lets per-call options win over Provider `messages`", async () => {
    const user = userEvent.setup();
    renderConfirm({
      options: { confirmText: "OK" },
      messages: { confirm: "Bestätigen" },
    });

    await user.click(screen.getByRole("button", { name: "Ask" }));

    expect(screen.getByRole("button", { name: "OK" })).toBeTruthy();
  });

  it("throws when useConfirm is used outside a ConfirmProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Harness />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });
});
