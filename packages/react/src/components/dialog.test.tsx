import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";

describe("Dialog", () => {
  it("opens from the trigger and exposes role=dialog", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={<button>Open</button>} title="Edit project" />);

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("names and describes the dialog from title + description", async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        trigger={<button>Open</button>}
        title="Edit project"
        description="Update the project details."
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    // aria-labelledby → title is the accessible name
    expect(screen.getByRole("dialog", { name: "Edit project" })).toBeTruthy();
    expect(screen.getByText("Update the project details.")).toBeTruthy();
  });

  it("labels the close button 'Close' by default", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={<button>Open</button>} title="Edit project" />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("localizes the close button via messages", async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        trigger={<button>Open</button>}
        title="Edit project"
        messages={{ close: "Schließen" }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("button", { name: "Schließen" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("hides the close button when showClose is false", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={<button>Open</button>} title="Edit project" showClose={false} />);
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={<button>Open</button>} title="Edit project" />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
