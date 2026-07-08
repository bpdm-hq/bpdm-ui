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

@Component({
  imports: [BpdmCheckbox],
  template: `<bpdm-checkbox id="terms" aria-label="Accept terms" aria-describedby="hint" [checked]="true" />`,
})
class LabelledHost {}

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

  it("forwards id + accessible-name attributes and hides the glyph", () => {
    const fixture = TestBed.createComponent(LabelledHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLButtonElement;
    expect(btn.getAttribute("id")).toBe("terms");
    expect(btn.getAttribute("aria-label")).toBe("Accept terms");
    expect(btn.getAttribute("aria-describedby")).toBe("hint");
    // the check glyph is decorative
    expect(fixture.nativeElement.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
