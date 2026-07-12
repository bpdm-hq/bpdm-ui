import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "./drawer";

describe("Drawer", () => {
  it("opens from the trigger and shows title, description and body", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<button>Open</button>}
        title="Filters"
        description="Refine the results."
      >
        <p>Body content</p>
      </Drawer>,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));

    // aria-labelledby → title is the accessible name; description is announced too
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
    expect(screen.getByText("Refine the results.")).toBeTruthy();
    expect(screen.getByText("Body content")).toBeTruthy();
  });

  it("applies the side + size panel classes (right / md → right-0 w-96)", async () => {
    const user = userEvent.setup();
    render(<Drawer trigger={<button>Open</button>} title="Filters" side="right" size="md" />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const panel = screen.getByRole("dialog");
    expect(panel.className).toContain("right-0");
    expect(panel.className).toContain("w-96");
  });

  it("applies width sizing for a left drawer (left / md → left-0 w-96)", async () => {
    const user = userEvent.setup();
    render(<Drawer trigger={<button>Open</button>} title="Filters" side="left" size="md" />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    const panel = screen.getByRole("dialog");
    expect(panel.className).toContain("left-0");
    expect(panel.className).toContain("w-96");
  });

  it("closes via the close (X) button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer trigger={<button>Open</button>} title="Filters" onOpenChange={onOpenChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer trigger={<button>Open</button>} title="Filters" onOpenChange={onOpenChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on backdrop / outside click", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { baseElement } = render(
      <Drawer trigger={<button>Open</button>} title="Filters" onOpenChange={onOpenChange} />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    // the overlay is the full-screen backdrop behind the panel
    const overlay = baseElement.querySelector(".fixed.inset-0") as HTMLElement;
    expect(overlay).toBeTruthy();
    await user.click(overlay);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("supports controlled open + onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    const { rerender } = render(
      <Drawer open={false} onOpenChange={onOpenChange} title="Filters">
        <p>Body content</p>
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();

    rerender(
      <Drawer open onOpenChange={onOpenChange} title="Filters">
        <p>Body content</p>
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides the close button when showClose is false", async () => {
    const user = userEvent.setup();
    render(<Drawer trigger={<button>Open</button>} title="Filters" showClose={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("localizes the close button and the sr-only fallback title via messages", async () => {
    const user = userEvent.setup();
    render(
      <Drawer
        trigger={<button>Open</button>}
        messages={{ close: "Schließen", drawerLabel: "Seitenleiste" }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    // localized close button
    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();

    // with no visible title, the sr-only fallback is the accessible name
    expect(screen.getByRole("dialog", { name: "Seitenleiste" })).toBeTruthy();
  });
});
