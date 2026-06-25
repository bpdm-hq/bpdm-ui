import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmInputOtp } from "./input-otp";

@Component({
  imports: [BpdmInputOtp],
  template: `<bpdm-input-otp [length]="4" integerOnly [(value)]="code" />`,
})
class HostComponent {
  readonly code = signal<string>("");
}

@Component({
  imports: [BpdmInputOtp],
  template: `<bpdm-input-otp [length]="6" grouped />`,
})
class GroupedHost {}

describe("BpdmInputOtp", () => {
  const cells = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll("input")) as HTMLInputElement[];

  const type = (el: HTMLInputElement, ch: string) => {
    el.value = ch;
    el.dispatchEvent(new Event("input"));
  };

  it("auto-advances focus to the next cell on entry", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs = cells(fixture);
    type(inputs[0], "1");
    fixture.detectChanges();
    expect(fixture.componentInstance.code()).toBe("1");
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("rejects non-digits when integerOnly", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputs = cells(fixture);
    type(inputs[0], "a");
    fixture.detectChanges();
    expect(fixture.componentInstance.code()).toBe("");
  });

  it("clears the previous cell on backspace when empty", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.code.set("12");
    fixture.detectChanges();
    const inputs = cells(fixture);
    inputs[2].dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.code()).toBe("1");
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("renders 6 cells in two balanced groups when grouped", () => {
    const fixture = TestBed.createComponent(GroupedHost);
    fixture.detectChanges();
    expect(cells(fixture).length).toBe(6);
    const groups = fixture.nativeElement.querySelectorAll('[role="group"] > div.flex.items-center');
    expect(groups.length).toBe(2);
  });
});
