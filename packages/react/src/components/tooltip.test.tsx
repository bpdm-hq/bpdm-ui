import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("renders the trigger untouched", () => {
    render(
      <Tooltip content="Copy address">
        <button>Copy</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    // nothing shown until hover/focus
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows the content on focus and wires aria-describedby to the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copy address" delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );

    await user.tab(); // move focus onto the trigger
    const trigger = screen.getByRole("button", { name: "Copy" });
    expect(trigger).toHaveFocus();

    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Copy address");
    // Radix points the trigger at the tooltip content for assistive tech
    expect(trigger.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("shows the content on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hovered" delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Copy" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Hovered");
  });

  it("hides the content on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copy address" delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("hides the content on blur", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Copy address" delayDuration={0}>
          <button>Copy</button>
        </Tooltip>
        <button>Other</button>
      </>,
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toBeInTheDocument();

    await user.tab(); // focus moves to the next button
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("accepts a non-default side without breaking the tooltip", async () => {
    // jsdom has no layout, so Radix never resolves the collision-aware
    // `data-side`; we assert the side prop is accepted and the tooltip still
    // opens with its content intact.
    const user = userEvent.setup();
    render(
      <Tooltip content="On the right" side="right" delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );

    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("On the right");
  });

  it("renders the trigger with no tooltip when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copy address" disabled delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );

    await user.hover(screen.getByRole("button", { name: "Copy" }));
    // give the (zero) delay a chance to fire — nothing should appear
    await Promise.resolve();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("keeps a disabled trigger reachable via a focusable wrapper", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="You need the Admin role" delayDuration={0}>
        <button disabled>Publish</button>
      </Tooltip>,
    );

    // the disabled button itself can't take focus, but the wrapper span can
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("You need the Admin role");
  });

  it("renders no tooltip when content is empty", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="" delayDuration={0}>
        <button>Copy</button>
      </Tooltip>,
    );
    await user.tab();
    await Promise.resolve();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
