import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmStep,
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

describe("BpdmStepper", () => {
  it("reveals the first step's panel by default (others mounted but hidden)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].getAttribute("aria-hidden")).toBe("false");
    expect(panels[0].textContent).toContain("Panel One");
    expect(panels[1].getAttribute("aria-hidden")).toBe("true");
  });

  it("activates a step when its header is clicked (non-linear)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const steps = fixture.nativeElement.querySelectorAll('[role="tab"]');
    steps[1].click();
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll('[role="tabpanel"]');
    expect(panels[1].getAttribute("aria-hidden")).toBe("false");
    expect(steps[1].getAttribute("aria-selected")).toBe("true");
  });

  it("announces position + status per step (sr-only)", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const sr = fixture.nativeElement.querySelectorAll('[role="tab"] .sr-only');
    expect(sr[0].textContent).toContain("Step 1 of 2, Current step");
    expect(sr[1].textContent).toContain("Step 2 of 2, Not completed");
  });

  it("gives the step list an accessible name + orientation", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="tablist"]');
    expect(list.getAttribute("aria-label")).toBe("Progress");
    expect(list.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("wires each tab to its panel via aria-controls / aria-labelledby", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tab = fixture.nativeElement.querySelector('[role="tab"]');
    const panel = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(tab.getAttribute("id")).toBeTruthy();
    expect(tab.getAttribute("aria-controls")).toBe(panel.getAttribute("id"));
    expect(panel.getAttribute("aria-labelledby")).toBe(tab.getAttribute("id"));
  });

  it("localizes the aria-label + status words via messages", () => {
    const fixture = TestBed.createComponent(LocalizedHost);
    fixture.detectChanges();
    const list = fixture.nativeElement.querySelector('[role="tablist"]');
    expect(list.getAttribute("aria-label")).toBe("Fortschritt");
    const sr = fixture.nativeElement.querySelectorAll('[role="tab"] .sr-only');
    expect(sr[0].textContent).toContain("Schritt 1 von 2, Aktueller Schritt");
    expect(sr[1].textContent).toContain("Schritt 2 von 2, Nicht abgeschlossen");
  });
});
