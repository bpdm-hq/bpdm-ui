import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmSwitch } from "./switch";

@Component({
  imports: [BpdmSwitch],
  template: `<bpdm-switch [checked]="on()" (checkedChange)="on.set($event)" />`,
})
class HostComponent {
  readonly on = signal(false);
}

describe("BpdmSwitch", () => {
  it("toggles on click and exposes role=switch + aria-checked", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute("aria-checked")).toBe("false");
    expect(btn.getAttribute("data-state")).toBe("unchecked");

    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute("aria-checked")).toBe("true");
    expect(btn.getAttribute("data-state")).toBe("checked");
    expect(fixture.componentInstance.on()).toBe(true);
  });
});
