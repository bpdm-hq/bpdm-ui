import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmFloatLabel } from "./float-label";
import { BpdmInput } from "../input/input";

@Component({
  imports: [BpdmFloatLabel, BpdmInput],
  template: `<bpdm-float-label label="Email" htmlFor="email"><input bpdmInput id="email" /></bpdm-float-label>`,
})
class HostComponent {}

describe("BpdmFloatLabel", () => {
  it("renders the label and injects peer + blank placeholder on the control", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable(); // afterNextRender runs the injection

    const host = fixture.nativeElement as HTMLElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    const input = host.querySelector("input") as HTMLInputElement;

    expect(label.textContent).toContain("Email");
    expect(label.getAttribute("for")).toBe("email");
    expect(input.classList.contains("peer")).toBe(true);
    expect(input.getAttribute("placeholder")).toBe(" ");
  });
});
