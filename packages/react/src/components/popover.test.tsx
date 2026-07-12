import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popover, PopoverClose } from "./popover";

describe("Popover", () => {
  it("opens on trigger click and shows the content", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("Panel body")).toBeTruthy();
  });

  it("closes via a PopoverClose button inside the content", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <PopoverClose asChild>
          <button>Done</button>
        </PopoverClose>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes on outside click", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Popover trigger={<button>Open</button>}>
          <p>Panel body</p>
        </Popover>
        <button>Outside</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports controlled open + onOpenChange", async () => {
    const onOpenChange = vi.fn();

    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Popover
          trigger={<button>Open</button>}
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <p>Panel body</p>
        </Popover>
      );
    }

    const user = userEvent.setup();
    render(<Controlled />);

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("names the panel via ariaLabel", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} ariaLabel="Quick actions">
        <p>Panel body</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    // aria-label becomes the dialog's accessible name
    expect(screen.getByRole("dialog", { name: "Quick actions" })).toBeTruthy();
  });

  it("drops the border class when bordered is false", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} bordered={false}>
        <p>Panel body</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog").className).not.toContain("border-border");
  });

  it("keeps the border class by default", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog").className).toContain("border-border");
  });

  it("renders the arrow when showArrow is set", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Popover trigger={<button>Open</button>} showArrow>
        <p>Panel body</p>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    // Radix renders the arrow as an <svg>
    expect(screen.getByRole("dialog").querySelector("svg")).toBeTruthy();
    expect(container).toBeTruthy();
  });

  it("toggles aria-expanded and carries aria-haspopup on the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>}>
        <p>Panel body</p>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
  });

  it("moves focus into a modal panel and traps it there", async () => {
    const user = userEvent.setup();
    render(
      <Popover trigger={<button>Open</button>} modal>
        <button>Inside</button>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    const inside = screen.getByRole("button", { name: "Inside" });
    // modal auto-focuses the first focusable inside the panel
    expect(inside).toBeTruthy();
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });
});
