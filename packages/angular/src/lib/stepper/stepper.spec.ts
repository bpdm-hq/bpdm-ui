import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmStep,
  BpdmStepItem,
  BpdmStepList,
  BpdmStepPanel,
  BpdmStepPanels,
  BpdmStepper,
} from "./stepper";

@Component({
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel],
  template: `
    <bpdm-stepper defaultValue="1">
      <bpdm-step-list>
        <bpdm-step value="1">One</bpdm-step>
        <bpdm-step value="2">Two</bpdm-step>
      </bpdm-step-list>
      <bpdm-step-panels>
        <bpdm-step-panel value="1">Panel One</bpdm-step-panel>
        <bpdm-step-panel value="2">Panel Two</bpdm-step-panel>
      </bpdm-step-panels>
    </bpdm-stepper>
  `,
})
class Host {}

@Component({
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel],
  template: `
    <bpdm-stepper
      defaultValue="1"
      [messages]="{ ariaLabel: 'Fortschritt', current: 'Aktueller Schritt', upcoming: 'Nicht abgeschlossen', step: 'Schritt {index} von {total}' }"
    >
      <bpdm-step-list>
        <bpdm-step value="1">Eins</bpdm-step>
        <bpdm-step value="2">Zwei</bpdm-step>
      </bpdm-step-list>
      <bpdm-step-panels>
        <bpdm-step-panel value="1">Panel Eins</bpdm-step-panel>
        <bpdm-step-panel value="2">Panel Zwei</bpdm-step-panel>
      </bpdm-step-panels>
    </bpdm-stepper>
  `,
})
class LocalizedHost {}

@Component({
  imports: [BpdmStepper, BpdmStepItem, BpdmStep, BpdmStepPanel],
  template: `
    <bpdm-stepper defaultValue="1" orientation="vertical">
      <bpdm-step-item value="1">
        <bpdm-step>One</bpdm-step>
        <bpdm-step-panel><a href="#one">link one</a></bpdm-step-panel>
      </bpdm-step-item>
      <bpdm-step-item value="2">
        <bpdm-step>Two</bpdm-step>
        <bpdm-step-panel><input aria-label="two input" /></bpdm-step-panel>
      </bpdm-step-item>
    </bpdm-stepper>
  `,
})
class VerticalHost {}

describe("BpdmStepper", () => {
  it("reveals the first step's panel by default (others mounted but hidden)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="region"]');
    expect(panels[0].getAttribute("aria-hidden")).toBe("false");
    expect(panels[0].textContent).toContain("Panel One");
    expect(panels[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("uses the process-steps pattern (list of step buttons), not a tabset", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.querySelector('[role="tablist"]')).toBeNull();
    expect(el.querySelector('[role="tab"]')).toBeNull();
    expect(el.querySelector('[role="tabpanel"]')).toBeNull();
    expect(el.querySelector('[role="list"]')).not.toBeNull();
    // each step is a native <button> so Enter / Space activate it natively
    const steps = el.querySelectorAll("button[aria-controls]");
    expect(steps.length).toBe(2);
    expect(steps[0].tagName).toBe("BUTTON");
    // active step is flagged with aria-current="step" (not aria-selected)
    expect(steps[0].getAttribute("aria-current")).toBe("step");
    expect(steps[0].hasAttribute("aria-selected")).toBe(false);
    expect(steps[1].getAttribute("aria-current")).toBeNull();
  });

  it("activates a step when its header is clicked (non-linear)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const steps = fixture.nativeElement.querySelectorAll("button[aria-controls]");
    steps[1].click();
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="region"]');
    expect(panels[1].getAttribute("aria-hidden")).toBe("false");
    expect(steps[1].getAttribute("aria-current")).toBe("step");
  });

  it("marks inactive panels inert (out of tab order + AT), clears it on the active one", () => {
    const fixture = TestBed.createComponent(VerticalHost);
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="region"]');
    expect(panels[0].getAttribute("aria-hidden")).toBe("false");
    expect(panels[0].hasAttribute("inert")).toBe(false);
    expect(panels[1].getAttribute("aria-hidden")).toBe("true");
    expect(panels[1].hasAttribute("inert")).toBe(true);
    // the input inside the collapsed panel sits under [inert] → skipped by kbd + AT
    const input = fixture.nativeElement.querySelector('input[aria-label="two input"]');
    expect(input.closest("[inert]")).toBe(panels[1]);
  });

  it("announces position + status per step (sr-only)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const sr = fixture.nativeElement.querySelectorAll("button[aria-controls] .sr-only");
    expect(sr[0].textContent).toContain("Step 1 of 2, Current step");
    expect(sr[1].textContent).toContain("Step 2 of 2, Not completed");
  });

  it("gives the step list an accessible name", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="list"]');
    expect(list.getAttribute("aria-label")).toBe("Progress");
  });

  it("wires each step to its panel via aria-controls / aria-labelledby", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const step = fixture.nativeElement.querySelector("button[aria-controls]");
    const panel = fixture.nativeElement.querySelector('[role="region"]');
    expect(step.getAttribute("id")).toBeTruthy();
    expect(step.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(panel.getAttribute("aria-labelledby")).toBe(step.getAttribute("id"));
  });

  it("localizes the aria-label + status words via messages", () => {
    const fixture = TestBed.createComponent(LocalizedHost);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="list"]');
    expect(list.getAttribute("aria-label")).toBe("Fortschritt");
    const sr = fixture.nativeElement.querySelectorAll("button[aria-controls] .sr-only");
    expect(sr[0].textContent).toContain("Schritt 1 von 2, Aktueller Schritt");
    expect(sr[1].textContent).toContain("Schritt 2 von 2, Nicht abgeschlossen");
  });
});
