import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmCheckbox } from "./checkbox";

@Component({
  imports: [BpdmCheckbox],
  template: `<bpdm-checkbox [checked]="val()" (checkedChange)="val.set($event)" />`,
})
class HostComponent {
  readonly val = signal(false);
}

@Component({
  imports: [BpdmCheckbox],
  template: `<bpdm-checkbox indeterminate />`,
})
class IndeterminateHost {}

@Component({
  imports: [BpdmCheckbox],
  template: `<bpdm-checkbox aria-invalid="true" />`,
})
class InvalidHost {}

describe("BpdmCheckbox", () => {
  it("toggles checked state on click", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute("data-state")).toBe("unchecked");

    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute("data-state")).toBe("checked");
    expect(fixture.componentInstance.val()).toBe(true);
  });

  it("reports a mixed state when indeterminate", () => {
    const fixture = TestBed.createComponent(IndeterminateHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute("aria-checked")).toBe("mixed");
    expect(btn.getAttribute("data-state")).toBe("indeterminate");
  });

  it("forwards aria-invalid to the inner control (red error styling)", () => {
    const fixture = TestBed.createComponent(InvalidHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute("aria-invalid")).toBe("true");
  });
});
