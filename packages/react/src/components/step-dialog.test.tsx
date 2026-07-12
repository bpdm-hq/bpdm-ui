import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepDialog, type StepDialogStep } from "./step-dialog";

const steps: StepDialogStep[] = [
  { title: "Account", content: <div>Account step content</div> },
  { title: "Profile", content: <div>Profile step content</div> },
  { title: "Review", content: <div>Review step content</div> },
];

function renderStepDialog(props: Partial<React.ComponentProps<typeof StepDialog>> = {}) {
  return render(<StepDialog steps={steps} trigger={<button>Open</button>} {...props} />);
}

describe("StepDialog", () => {
  it("opens from the trigger and shows the first step's content and title", async () => {
    const user = userEvent.setup();
    renderStepDialog();

    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open" }));

    // title defaults to the current step's title → dialog accessible name
    expect(screen.getByRole("dialog", { name: "Account" })).toBeTruthy();
    expect(screen.getByText("Account step content")).toBeTruthy();
  });

  it("advances to the next step with Next (content changes; Back appears)", async () => {
    const user = userEvent.setup();
    renderStepDialog();
    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Profile step content")).toBeTruthy();
    expect(screen.queryByText("Account step content")).toBeNull();
    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
  });

  it("returns to the previous step with Back", async () => {
    const user = userEvent.setup();
    renderStepDialog();
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Profile step content")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Account step content")).toBeTruthy();
  });

  it("shows Finish on the last step; clicking it fires onComplete and closes", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderStepDialog({ onComplete });
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    // last step — no more Next, primary button is Finish
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    const finish = screen.getByRole("button", { name: "Finish" });
    await user.click(finish);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("restarts at the first step when reopened after close", async () => {
    const user = userEvent.setup();
    renderStepDialog();
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Profile step content")).toBeTruthy();

    // close via the inherited X, then reopen
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Account step content")).toBeTruthy();
    expect(screen.getByText("Step 1 of 3")).toBeTruthy();
  });

  it("localizes Back / Next / Finish and the sr-only progress via messages", async () => {
    const user = userEvent.setup();
    renderStepDialog({
      messages: {
        back: "Zurück",
        next: "Weiter",
        finish: "Fertig",
        step: "Schritt {index} von {total}",
      },
    });
    await user.click(screen.getByRole("button", { name: "Open" }));

    // sr-only progress reflects the custom template
    expect(screen.getByText("Schritt 1 von 3")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText("Schritt 2 von 3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zurück" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByRole("button", { name: "Fertig" })).toBeTruthy();
  });

  it("marks the active step's <li> with aria-current='step'", async () => {
    const user = userEvent.setup();
    renderStepDialog();
    await user.click(screen.getByRole("button", { name: "Open" }));

    let active = document.querySelector('li[aria-current="step"]');
    expect(active?.textContent).toContain("Account");

    await user.click(screen.getByRole("button", { name: "Next" }));
    active = document.querySelector('li[aria-current="step"]');
    expect(active?.textContent).toContain("Profile");
    // exactly one active step at a time
    expect(document.querySelectorAll('li[aria-current="step"]').length).toBe(1);
  });

  it("lets the finishText prop override messages.finish", async () => {
    const user = userEvent.setup();
    renderStepDialog({ finishText: "Done", messages: { finish: "Fertig" } });
    await user.click(screen.getByRole("button", { name: "Open" }));

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Done" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Fertig" })).toBeNull();
  });
});
