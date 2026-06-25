import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmCalendar } from "./calendar";
import { BpdmDatePicker } from "./date-picker";
import type { DateRange } from "./date-utils";

@Component({
  imports: [BpdmCalendar],
  template: `<bpdm-calendar [(value)]="value" [disabled]="block" />`,
})
class SingleHost {
  readonly value = signal<Date | null>(new Date(2026, 5, 10));
  block: ((d: Date) => boolean) | undefined = undefined;
}

@Component({
  imports: [BpdmCalendar],
  template: `<bpdm-calendar mode="range" [(value)]="value" />`,
})
class RangeHost {
  readonly value = signal<DateRange>({ from: new Date(2026, 5, 10), to: null });
}

@Component({
  imports: [BpdmDatePicker],
  template: `<bpdm-date-picker [(value)]="value" />`,
})
class PickerHost {
  readonly value = signal<Date | null>(new Date(2026, 5, 10));
}

describe("BpdmCalendar", () => {
  const dayButton = (f: { nativeElement: HTMLElement }, text: string) =>
    Array.from(f.nativeElement.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === text && b.getAttribute("aria-label") === null,
    ) as HTMLButtonElement | undefined;

  it("selects a single day on click", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    dayButton(fixture, "15")!.click();
    fixture.detectChanges();
    const v = fixture.componentInstance.value();
    expect(v?.getDate()).toBe(15);
    expect(v?.getMonth()).toBe(5);
  });

  it("completes a range, ordered, on the second click", () => {
    const fixture = TestBed.createComponent(RangeHost);
    fixture.detectChanges();
    dayButton(fixture, "20")!.click();
    fixture.detectChanges();
    const v = fixture.componentInstance.value();
    expect(v.from?.getDate()).toBe(10);
    expect(v.to?.getDate()).toBe(20);
  });

  it("disables days matched by the predicate", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.componentInstance.block = (d) => d.getDate() === 15;
    fixture.detectChanges();
    expect(dayButton(fixture, "15")!.disabled).toBe(true);
  });

  it("changes month on PageDown", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    expect(fixture.nativeElement.textContent).toContain("June 2026");
    grid.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("July 2026");
  });
});

describe("BpdmDatePicker", () => {
  it("shows the formatted value on the trigger", () => {
    const fixture = TestBed.createComponent(PickerHost);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Jun 10, 2026");
  });

  it("clears the value via the clear button", () => {
    const fixture = TestBed.createComponent(PickerHost);
    fixture.detectChanges();
    const clear = fixture.nativeElement.querySelector(
      '[aria-label="Clear"]',
    ) as HTMLElement;
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
