import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { BpdmCalendar } from "./calendar";
import { BpdmDatePicker } from "./date-picker";
import type { DateRange } from "./date-utils";

@Component({
  imports: [BpdmCalendar],
  template: `<bpdm-calendar [(value)]="value" [disabled]="block" [captionLayout]="layout" />`,
})
class SingleHost {
  readonly value = signal<Date | null>(new Date(2026, 5, 10)); // Wed 10 Jun 2026
  block: ((d: Date) => boolean) | undefined = undefined;
  layout: "buttons" | "dropdown" = "buttons";
}

@Component({
  imports: [BpdmCalendar],
  template: `<bpdm-calendar mode="range" [(value)]="value" />`,
})
class RangeHost {
  readonly value = signal<DateRange>({ from: new Date(2026, 5, 10), to: null });
}

@Component({
  imports: [BpdmCalendar],
  template: `<bpdm-calendar [(value)]="value" locale="de-DE" [messages]="{ previousMonth: 'Zurück' }" />`,
})
class I18nHost {
  readonly value = signal<Date | null>(new Date(2026, 0, 15));
}

@Component({
  imports: [BpdmDatePicker],
  template: `<bpdm-date-picker [(value)]="value" />`,
})
class PickerHost {
  readonly value = signal<Date | null>(new Date(2026, 5, 10));
}

@Component({
  imports: [BpdmDatePicker],
  template: `<bpdm-date-picker [(value)]="value" confirm />`,
})
class ConfirmHost {
  readonly value = signal<Date | null>(new Date(2026, 0, 15));
}

describe("BpdmCalendar", () => {
  const dayButton = (f: { nativeElement: HTMLElement }, text: string) =>
    Array.from(f.nativeElement.querySelectorAll('[role="gridcell"] button')).find(
      (b) => b.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  const focusedDay = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector('[role="gridcell"] button[tabindex="0"]') as HTMLButtonElement | null;

  const press = (f: { nativeElement: HTMLElement }, key: string) => {
    const grid = f.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    grid.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  };

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

  it("wraps months in a group and exposes a per-month WAI-ARIA grid", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="group"]')).toBeTruthy();
    const grid = host.querySelector('[role="grid"]')!;
    expect(grid.getAttribute("aria-label")).toContain("June 2026");
    expect(host.querySelectorAll('[role="columnheader"]').length).toBe(7);
    expect(host.querySelectorAll('[role="gridcell"]').length).toBe(42);
    const day = dayButton(fixture, "15")!;
    expect(day.getAttribute("aria-label")).toMatch(/15/); // full locale date, not just "15"
    expect(day.getAttribute("aria-label")!.length).toBeGreaterThan(2);
  });

  it("marks the selected gridcell aria-selected", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    const cell = dayButton(fixture, "10")!.closest('[role="gridcell"]')!;
    expect(cell.getAttribute("aria-selected")).toBe("true");
  });

  it("uses roving tabindex — only the focused day is tabbable", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    expect(focusedDay(fixture)!.getAttribute("aria-label")).toMatch(/June 10, 2026/);
    expect(dayButton(fixture, "11")!.getAttribute("tabindex")).toBe("-1");
  });

  it("moves the roving tabindex with the arrow keys", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    press(fixture, "ArrowRight");
    fixture.detectChanges();
    expect(focusedDay(fixture)!.getAttribute("aria-label")).toMatch(/June 11, 2026/);
    press(fixture, "ArrowDown");
    fixture.detectChanges();
    expect(focusedDay(fixture)!.getAttribute("aria-label")).toMatch(/June 18, 2026/);
  });

  it("jumps to the week edges with Home and End", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    press(fixture, "Home"); // Monday of that week
    fixture.detectChanges();
    expect(focusedDay(fixture)!.getAttribute("aria-label")).toMatch(/June 8, 2026/);
    press(fixture, "End"); // Sunday of that week
    fixture.detectChanges();
    expect(focusedDay(fixture)!.getAttribute("aria-label")).toMatch(/June 14, 2026/);
  });

  it("changes month on PageDown", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("June 2026");
    press(fixture, "PageDown");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("July 2026");
  });

  it("advertises aria-multiselectable in range mode", () => {
    const fixture = TestBed.createComponent(RangeHost);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="grid"]').getAttribute("aria-multiselectable"),
    ).toBe("true");
  });

  it("keeps the month/year dropdowns OUT of the grid", () => {
    const fixture = TestBed.createComponent(SingleHost);
    fixture.componentInstance.layout = "dropdown";
    fixture.detectChanges();
    const grid = fixture.nativeElement.querySelector('[role="grid"]') as HTMLElement;
    const select = fixture.nativeElement.querySelector("select") as HTMLElement;
    expect(select).toBeTruthy();
    expect(grid.contains(select)).toBe(false);
  });

  it("localises month names + translates nav labels for i18n", () => {
    const fixture = TestBed.createComponent(I18nHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Januar 2026"); // German caption
    expect(fixture.nativeElement.querySelector('[aria-label="Zurück"]')).toBeTruthy();
  });
});

describe("BpdmDatePicker", () => {
  it("shows the formatted value on the trigger", () => {
    const fixture = TestBed.createComponent(PickerHost);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    expect(trigger.textContent).toContain("Jun 10, 2026");
  });

  it("clears via a real, keyboard-reachable clear button", () => {
    const fixture = TestBed.createComponent(PickerHost);
    fixture.detectChanges();
    const clear = fixture.nativeElement.querySelector('[aria-label="Clear"]') as HTMLElement;
    expect(clear.tagName).toBe("BUTTON"); // not a span[role=button]
    expect(clear.getAttribute("tabindex")).not.toBe("-1");
    clear.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });

  const overlay = () => TestBed.inject(OverlayContainer).getContainerElement();
  const findBtn = (root: HTMLElement, text: string) =>
    Array.from(root.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;
  const findDay = (root: HTMLElement, text: string) =>
    Array.from(root.querySelectorAll('[role="gridcell"] button')).find(
      (b) => b.textContent?.trim() === text,
    ) as HTMLButtonElement | undefined;

  it("confirm: buffers the draft and commits only on Apply", () => {
    const fixture = TestBed.createComponent(ConfirmHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click(); // open
    fixture.detectChanges();
    findDay(overlay(), "20")!.click(); // pick a draft day
    fixture.detectChanges();
    expect(fixture.componentInstance.value()!.getDate()).toBe(15); // not committed yet
    findBtn(overlay(), "Apply")!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()!.getDate()).toBe(20);
  });

  it("confirm: Cancel discards the draft", () => {
    const fixture = TestBed.createComponent(ConfirmHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    fixture.detectChanges();
    findDay(overlay(), "20")!.click();
    fixture.detectChanges();
    findBtn(overlay(), "Cancel")!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()!.getDate()).toBe(15); // unchanged
  });
});
