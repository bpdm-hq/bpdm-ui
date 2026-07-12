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

  it("announces position + status per step (sr-only)", () => {
    render(<Wizard />);
    // active step 1 of 2 = current; step 2 = not completed
    expect(screen.getByText("Step 1 of 2, Current step")).toBeTruthy();
    expect(screen.getByText("Step 2 of 2, Not completed")).toBeTruthy();
  });

  it("gives the step list an accessible name + orientation", () => {
    render(<Wizard />);
    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("aria-label", "Progress");
    expect(list).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("wires each tab to its panel via aria-controls / aria-labelledby", () => {
    render(<Wizard />);
    const tab = screen.getByRole("tab", { name: /Account/ });
    const panel = screen.getByRole("tabpanel");
    expect(tab.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.getAttribute("id"));
    expect(tab.getAttribute("id")).toBeTruthy();
    expect(panel.getAttribute("id")).toBeTruthy();
  });

  it("localizes the aria-label + status words via messages", () => {
    render(
      <Stepper
        defaultValue="1"
        messages={{ ariaLabel: "Fortschritt", current: "Aktueller Schritt", upcoming: "Nicht abgeschlossen", step: "Schritt {index} von {total}" }}
      >
        <StepList>
          <Step value="1">Konto</Step>
          <Step value="2">Arbeitsbereich</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="1">Konto-Panel</StepPanel>
          <StepPanel value="2">Arbeitsbereich-Panel</StepPanel>
        </StepPanels>
      </Stepper>,
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Fortschritt");
    expect(screen.getByText("Schritt 1 von 2, Aktueller Schritt")).toBeTruthy();
    expect(screen.getByText("Schritt 2 von 2, Nicht abgeschlossen")).toBeTruthy();
  });
});
