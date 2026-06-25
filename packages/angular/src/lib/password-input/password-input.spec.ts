import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmPasswordInput, scorePassword } from "./password-input";

@Component({
  imports: [BpdmPasswordInput],
  template: `<bpdm-password-input defaultValue="abc" />`,
})
class WeakHost {}

@Component({
  imports: [BpdmPasswordInput],
  template: `<bpdm-password-input defaultValue="Abcd1234!" />`,
})
class StrongHost {}

@Component({
  imports: [BpdmPasswordInput],
  template: `<bpdm-password-input [feedback]="false" defaultValue="abc" />`,
})
class NoFeedbackHost {}

describe("scorePassword", () => {
  it("scores from length + variety, capped at 4", () => {
    expect(scorePassword("")).toBe(0);
    expect(scorePassword("abc")).toBe(0);
    expect(scorePassword("Abcd1234!")).toBe(4);
    expect(scorePassword("Abcd1234!xyz")).toBe(4);
  });
});

describe("BpdmPasswordInput", () => {
  it("starts hidden and toggles to text on reveal", () => {
    const fixture = TestBed.createComponent(WeakHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    const toggle = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(input.type).toBe("password");
    toggle.click();
    fixture.detectChanges();
    expect(input.type).toBe("text");
  });

  it("shows the strength meter with a label when feedback is on", () => {
    const fixture = TestBed.createComponent(StrongHost);
    fixture.detectChanges();
    const meter = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(meter).toBeTruthy();
    expect(meter.textContent?.trim()).toBe("Strong");
  });

  it("hides the meter when feedback is off", () => {
    const fixture = TestBed.createComponent(NoFeedbackHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-live="polite"]')).toBeNull();
  });
});
