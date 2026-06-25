import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmSecureField } from "./secure-field";

@Component({
  imports: [BpdmSecureField],
  template: `<bpdm-secure-field format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />`,
})
class GroupedHost {}

describe("BpdmSecureField", () => {
  const input = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector("input") as HTMLInputElement;

  it("masks at rest, keeping the last 4 visible, grouped 4-4-4-4", () => {
    const fixture = TestBed.createComponent(GroupedHost);
    fixture.detectChanges();
    expect(input(fixture).value).toBe("•••• •••• •••• 0066");
  });

  it("reveals the full grouped value on focus", () => {
    const fixture = TestBed.createComponent(GroupedHost);
    fixture.detectChanges();
    const el = input(fixture);
    el.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    expect(el.value).toBe("4821 0955 1247 0066");
  });

  it("toggles full reveal with the eye button", () => {
    const fixture = TestBed.createComponent(GroupedHost);
    fixture.detectChanges();
    const reveal = fixture.nativeElement.querySelector(
      'button[aria-label="Reveal"]',
    ) as HTMLButtonElement;
    reveal.click();
    fixture.detectChanges();
    expect(input(fixture).value).toBe("4821 0955 1247 0066");
  });
});
