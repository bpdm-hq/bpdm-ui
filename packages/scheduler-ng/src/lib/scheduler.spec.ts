import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { describe, it, expect, vi, afterEach } from "vitest";
import { BpdmScheduler } from "./scheduler";
import type { CalendarEvent } from "@bpdm/scheduler-core";

const now = new Date(2026, 6, 20, 11, 20); // Mon 20 Jul 2026
const events: CalendarEvent[] = [
  { id: "a", title: "Sprint planning", start: new Date(2026, 6, 20, 9, 0), end: new Date(2026, 6, 20, 10, 30), category: "amber" },
  { id: "b", title: "Design review", start: new Date(2026, 6, 21, 11, 0), end: new Date(2026, 6, 21, 12, 30), category: "teal" },
];

function mount(inputs: Record<string, unknown> = {}): ComponentFixture<BpdmScheduler> {
  const fixture = TestBed.createComponent(BpdmScheduler);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  fixture.detectChanges();
  return fixture;
}
const text = (f: ComponentFixture<unknown>): string => f.nativeElement.textContent ?? "";
const tab = (f: ComponentFixture<unknown>, name: string): HTMLElement =>
  (Array.from(f.nativeElement.querySelectorAll('[role="tab"]')) as HTMLElement[]).find(
    (b) => b.textContent?.trim() === name,
  )!;

afterEach(() => vi.unstubAllGlobals());

describe("BpdmScheduler", () => {
  it("renders the week view with its events", () => {
    const f = mount({ events, defaultDate: now, now });
    expect(text(f)).toContain("Sprint planning");
    expect(text(f)).toContain("Design review");
  });

  it("switches to the day view and shows only that day", () => {
    const f = mount({ events, defaultDate: now, now, views: ["day", "week"] });
    tab(f, "Day").click();
    f.detectChanges();
    expect(tab(f, "Day").getAttribute("aria-selected")).toBe("true");
    expect(text(f)).toContain("Sprint planning"); // Monday
    expect(text(f)).not.toContain("Design review"); // Tuesday, out of a Monday day-view
  });

  it("navigates forward a week with Next", () => {
    const f = mount({ events, defaultDate: now, now });
    expect(text(f)).toContain("Sprint planning");
    (f.nativeElement.querySelector('[aria-label="Next"]') as HTMLElement).click();
    f.detectChanges();
    expect(text(f)).not.toContain("Sprint planning"); // next week has no events
  });

  it("collapses a week to a compact day + strip below collapseToDayBelow, and restores on widen", () => {
    let roCb: ResizeObserverCallback | null = null;
    class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        roCb = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);

    const f = mount({ events, defaultDate: now, now, defaultView: "week", collapseToDayBelow: 480 });
    const fire = (width: number): void => {
      roCb?.([{ contentRect: { width } }] as unknown as ResizeObserverEntry[], {} as ResizeObserver);
      f.detectChanges();
    };

    // wide by default: the full week shows both days
    expect(text(f)).toContain("Sprint planning");
    expect(text(f)).toContain("Design review");
    // narrow → compact to the (Monday) day: Tuesday's event drops out of range
    fire(400);
    expect(text(f)).toContain("Sprint planning");
    expect(text(f)).not.toContain("Design review");
    // widen → the full week returns, nothing lost
    fire(800);
    expect(text(f)).toContain("Design review");
  });

  it("shows a '+N more' overflow in the month view when a day exceeds monthMaxChips", () => {
    const many: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `m${i}`,
      title: `Meeting ${i}`,
      start: new Date(2026, 6, 20, 9 + i, 0),
      end: new Date(2026, 6, 20, 10 + i, 0),
    }));
    const f = mount({ events: many, defaultDate: now, now, defaultView: "month", monthMaxChips: 2 });
    expect(text(f)).toContain("more"); // "+3 more"
  });
});

@Component({
  standalone: true,
  imports: [BpdmScheduler],
  template: `
    <bpdm-scheduler [events]="events" [defaultDate]="now" [now]="now" (create)="created = $event">
      <ng-template #createForm let-slot="slot" let-submit="submit">
        <button type="button" class="do-create" (click)="submit({ title: 'Kickoff', category: 'blue' })">Create</button>
      </ng-template>
    </bpdm-scheduler>
  `,
})
class CreateHost {
  readonly events: CalendarEvent[] = [];
  readonly now = now;
  created: CalendarEvent | null = null;
}

describe("BpdmScheduler create flow", () => {
  it("opens the projected create form on a slot click and creates on submit", () => {
    const f = TestBed.createComponent(CreateHost);
    f.detectChanges();
    // click an empty day column background → selects a slot (target === currentTarget)
    (f.nativeElement.querySelector(".bpdm-sch-col") as HTMLElement).click();
    f.detectChanges();
    const createBtn = f.nativeElement.querySelector(".do-create") as HTMLElement;
    expect(createBtn).toBeTruthy(); // the create dialog rendered the projected form
    createBtn.click();
    f.detectChanges();
    expect(f.componentInstance.created?.title).toBe("Kickoff");
  });
});

@Component({
  standalone: true,
  imports: [BpdmScheduler],
  template: `
    <bpdm-scheduler [events]="events" [defaultDate]="now" [now]="now" [views]="['day']" defaultView="day"
      (eventChange)="changed = $event" />
  `,
})
class EditableHost {
  readonly events: CalendarEvent[] = [
    { id: "a", title: "Sprint planning", start: new Date(2026, 6, 20, 9, 0), end: new Date(2026, 6, 20, 10, 0) },
  ];
  readonly now = now;
  changed: CalendarEvent | null = null;
}

describe("BpdmScheduler keyboard editing (WCAG 2.1.1 / 2.5.7)", () => {
  it("picks up an event with Space and moves it later with ArrowDown", () => {
    const f = TestBed.createComponent(EditableHost);
    f.detectChanges();
    const ev = f.nativeElement.querySelector('[data-event-id="a"]') as HTMLElement;
    ev.focus();
    ev.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true })); // grab
    f.detectChanges();
    ev.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); // move later
    f.detectChanges();
    const changed = f.componentInstance.changed;
    expect(changed).toBeTruthy();
    expect(changed!.start.getTime()).toBeGreaterThan(new Date(2026, 6, 20, 9, 0).getTime());
  });
});
