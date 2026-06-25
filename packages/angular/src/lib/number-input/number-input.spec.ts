import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmNumberInput } from "./number-input";

@Component({
  imports: [BpdmNumberInput],
  template: `<bpdm-number-input [(value)]="val" min="0" max="10" />`,
})
class HostComponent {
  readonly val = signal<string>("5");
}

@Component({
  imports: [BpdmNumberInput],
  template: `<bpdm-number-input defaultValue="20" />`,
})
class UncontrolledHost {}

describe("BpdmNumberInput", () => {
  const input = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector("input") as HTMLInputElement;
  const btn = (f: { nativeElement: HTMLElement }, label: string) =>
    f.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

  it("shows the uncontrolled defaultValue", () => {
    const fixture = TestBed.createComponent(UncontrolledHost);
    fixture.detectChanges();
    expect(input(fixture).value).toBe("20");
  });

  it("increments and decrements with precise arithmetic", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    btn(fixture, "Increase").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.val()).toBe("6");
    btn(fixture, "Decrease").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.val()).toBe("5");
  });

  it("clamps to max and disables the increase button at the bound", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.val.set("10");
    fixture.detectChanges();
    expect(btn(fixture, "Increase").disabled).toBe(true);
    btn(fixture, "Decrease").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.val()).toBe("9");
  });

  it("keeps precision for values beyond Number.MAX_SAFE_INTEGER", () => {
    const fixture = TestBed.createComponent(UncontrolledHost);
    fixture.componentRef.setInput("defaultValue", "123456789012345678901234");
    fixture.detectChanges();
    const el = input(fixture);
    el.value = "123456789012345678901234";
    el.dispatchEvent(new Event("input"));
    el.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(input(fixture).value).toBe("123456789012345678901234");
  });
});
