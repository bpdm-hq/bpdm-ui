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

@Component({
  imports: [BpdmInputOtp],
  template: `
    <bpdm-input-otp
      [length]="4"
      integerOnly
      name="code"
      aria-describedby="hint"
      [(value)]="code"
      (complete)="done.set($event)" />
  `,
})
class CompleteHost {
  readonly code = signal<string>("");
  readonly done = signal<string | null>(null);
}

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

  it("renders 6 cells in two balanced groups with a decorative separator when grouped", () => {
    const fixture = TestBed.createComponent(GroupedHost);
    fixture.detectChanges();
    expect(cells(fixture).length).toBe(6);
    const groups = fixture.nativeElement.querySelectorAll('[role="group"] > div.flex.items-center');
    expect(groups.length).toBe(2);
    expect(fixture.nativeElement.querySelector('span[aria-hidden="true"]')).toBeTruthy();
  });

  it("fires (complete), forwards name via a hidden input, and links aria-describedby", () => {
    const fixture = TestBed.createComponent(CompleteHost);
    fixture.detectChanges();
    const inputs = cells(fixture);
    ["1", "2", "3", "4"].forEach((ch, i) => {
      type(inputs[i], ch);
      fixture.detectChanges();
    });
    expect(fixture.componentInstance.code()).toBe("1234");
    expect(fixture.componentInstance.done()).toBe("1234");

    const hidden = fixture.nativeElement.querySelector(
      'input[type="hidden"][name="code"]',
    ) as HTMLInputElement;
    expect(hidden.value).toBe("1234");
    expect(fixture.nativeElement.querySelector('[role="group"]').getAttribute("aria-describedby")).toBe(
      "hint",
    );
  });
});
