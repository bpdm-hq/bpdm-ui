import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmSecureField } from "./secure-field";

@Component({
  imports: [BpdmSecureField],
  template: `<bpdm-secure-field format="grouped" [unmaskedTail]="4" defaultValue="4821095512470066" />`,
})
class GroupedHost {}

@Component({
  imports: [BpdmSecureField],
  template: `
    <bpdm-secure-field
      name="key"
      aria-label="API key"
      aria-describedby="hint"
      copyable
      defaultValue="ak_live_secret" />
  `,
})
class PassthroughHost {}

@Component({
  imports: [BpdmSecureField],
  template: `<bpdm-secure-field aria-invalid defaultValue="secret" />`,
})
class InvalidHost {}

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

  it("forwards name / aria-label / aria-describedby and exposes a copy status region", () => {
    const fixture = TestBed.createComponent(PassthroughHost);
    fixture.detectChanges();
    const el = input(fixture);
    expect(el.getAttribute("name")).toBe("key");
    expect(el.getAttribute("aria-label")).toBe("API key");
    expect(el.getAttribute("aria-describedby")).toBe("hint");
    // a polite status region backs the copy button for screen-reader feedback
    expect(fixture.nativeElement.querySelector('[role="status"][aria-live="polite"]')).toBeTruthy();
  });

  it("gives the reveal + copy buttons their own focus-visible ring", () => {
    const fixture = TestBed.createComponent(PassthroughHost); // copyable + revealable
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll("button")) as HTMLButtonElement[];
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((b) => expect(b.className).toContain("focus-visible:ring-2"));
  });

  it("sets aria-invalid on the input (the widget), not on the wrapper div", () => {
    const fixture = TestBed.createComponent(InvalidHost);
    fixture.detectChanges();
    const el = input(fixture);
    const wrapper = fixture.nativeElement.querySelector("div") as HTMLElement;
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(wrapper.hasAttribute("aria-invalid")).toBe(false);
  });
});
