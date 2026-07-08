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

@Component({
  imports: [BpdmSwitch],
  template: `<bpdm-switch id="notif" aria-label="Notifications" aria-describedby="hint" icon [checked]="true" />`,
})
class LabelledHost {}

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

  it("forwards id + accessible-name attributes and hides the glyphs", () => {
    const fixture = TestBed.createComponent(LabelledHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('[role="switch"]') as HTMLButtonElement;
    expect(btn.getAttribute("id")).toBe("notif");
    expect(btn.getAttribute("aria-label")).toBe("Notifications");
    expect(btn.getAttribute("aria-describedby")).toBe("hint");
    const svgs = fixture.nativeElement.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((s: SVGElement) => expect(s.getAttribute("aria-hidden")).toBe("true"));
  });
});
