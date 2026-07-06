import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper, StepList, Step, StepPanels, StepPanel, useStepper } from "./stepper";

function Nav() {
  const { next, back, isFirst, isLast } = useStepper();
  return (
    <div>
      <button onClick={back} disabled={isFirst}>Back</button>
      <button onClick={next} disabled={isLast}>Next</button>
    </div>
  );
}

function Wizard({ linear = false }: { linear?: boolean }) {
  return (
    <Stepper defaultValue="1" linear={linear}>
      <StepList>
        <Step value="1">Account</Step>
        <Step value="2">Workspace</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1">Account panel</StepPanel>
        <StepPanel value="2">Workspace panel</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}

describe("Stepper", () => {
  it("renders a tab per step and shows only the active panel", () => {
    render(<Wizard />);
    expect(screen.getByRole("tab", { name: /Account/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Workspace/ })).toBeTruthy();
    expect(screen.getByRole("tab", { name: /Account/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Account panel")).toBeTruthy();
    expect(screen.queryByText("Workspace panel")).toBeNull();
  });

  it("advances and goes back with the useStepper hook", async () => {
    render(<Wizard />);
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Workspace panel")).toBeTruthy();
    expect(screen.queryByText("Account panel")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Account panel")).toBeTruthy();
  });

  it("disables Back on the first step", () => {
    render(<Wizard />);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("locks future steps when linear", () => {
    render(<Wizard linear />);
    expect(screen.getByRole("tab", { name: /Workspace/ })).toBeDisabled();
  });
});
