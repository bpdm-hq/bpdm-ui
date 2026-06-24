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
});
