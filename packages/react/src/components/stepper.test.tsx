import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper, StepList, Step, StepItem, StepPanels, StepPanel, useStepper } from "./stepper";

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

function VerticalWizard() {
  return (
    <Stepper defaultValue="1" orientation="vertical">
      <StepItem value="1">
        <Step>Account</Step>
        <StepPanel>
          <a href="#account">account link</a>
        </StepPanel>
      </StepItem>
      <StepItem value="2">
        <Step>Workspace</Step>
        <StepPanel>
          <input aria-label="workspace name" />
        </StepPanel>
      </StepItem>
    </Stepper>
  );
}

describe("Stepper", () => {
  it("renders a step button per step (process-steps pattern) and shows only the active panel", () => {
    render(<Wizard />);
    // process-steps pattern: buttons in a list, no tab/tablist roles
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.getByRole("list", { name: "Progress" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Account/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Workspace/ })).toBeTruthy();
    // active step marked with aria-current="step" (not aria-selected)
    expect(screen.getByRole("button", { name: /Account/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Workspace/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Account panel")).toBeTruthy();
    expect(screen.queryByText("Workspace panel")).toBeNull();
  });

  it("activates a step with Enter / Space when focused", async () => {
    render(<Wizard />);
    screen.getByRole("button", { name: /Workspace/ }).focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Workspace panel")).toBeTruthy();

    screen.getByRole("button", { name: /Account/ }).focus();
    await userEvent.keyboard(" ");
    expect(screen.getByText("Account panel")).toBeTruthy();
  });

  it("makes inactive vertical panels inert + aria-hidden, and keeps their content out of the a11y tree", () => {
    render(<VerticalWizard />);
    // only the active (step 1) panel is exposed; the inactive one is aria-hidden
    expect(screen.getAllByRole("region")).toHaveLength(1);
    const all = screen.getAllByRole("region", { hidden: true });
    const active = all.find((r) => r.getAttribute("aria-hidden") === "false")!;
    const inactive = all.find((r) => r.getAttribute("aria-hidden") === "true")!;
    expect(active.hasAttribute("inert")).toBe(false);
    expect(inactive.hasAttribute("inert")).toBe(true);
    // the input inside the collapsed panel sits under [inert] → out of tab order + AT;
    // the active panel's content is not inert.
    expect(screen.getByLabelText("workspace name").closest("[inert]")).toBe(inactive);
    expect(screen.getByRole("link", { name: "account link" }).closest("[inert]")).toBeNull();
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
    expect(screen.getByRole("button", { name: /Workspace/ })).toBeDisabled();
  });

  it("announces position + status per step (sr-only)", () => {
    render(<Wizard />);
    // active step 1 of 2 = current; step 2 = not completed
    expect(screen.getByText("Step 1 of 2, Current step")).toBeTruthy();
    expect(screen.getByText("Step 2 of 2, Not completed")).toBeTruthy();
  });

  it("gives the step list an accessible name", () => {
    render(<Wizard />);
    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("aria-label", "Progress");
  });

  it("wires each step to its panel via aria-controls / aria-labelledby", () => {
    render(<Wizard />);
    const step = screen.getByRole("button", { name: /Account/ });
    const panel = screen.getByRole("region");
    expect(step.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(panel.getAttribute("aria-labelledby")).toBe(step.getAttribute("id"));
    expect(step.getAttribute("id")).toBeTruthy();
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
    expect(screen.getByRole("list")).toHaveAttribute("aria-label", "Fortschritt");
    expect(screen.getByText("Schritt 1 von 2, Aktueller Schritt")).toBeTruthy();
    expect(screen.getByText("Schritt 2 von 2, Nicht abgeschlossen")).toBeTruthy();
  });
});
