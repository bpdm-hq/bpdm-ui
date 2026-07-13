import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { BpdmOrderList, type OrderListMessages } from "./order-list";

@Component({
  imports: [BpdmOrderList],
  template: `
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" [selectionMode]="mode" header="Stages" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class Host {
  readonly items = signal<string[]>(["A", "B", "C", "D"]);
  readonly key = (w: string) => w;
  mode: "single" | "multiple" = "single";
}

// host with no header + configurable messages (i18n / empty-state coverage)
@Component({
  imports: [BpdmOrderList],
  template: `
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" [messages]="messages" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class MsgHost {
  readonly items = signal<string[]>(["A", "B", "C"]);
  readonly key = (w: string) => w;
  messages: Partial<OrderListMessages> = {};
}

describe("BpdmOrderList", () => {
  const setup = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  };
  const options = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
  const ctrl = (f: { nativeElement: HTMLElement }, label: string) =>
    f.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
  const listbox = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector('[role="listbox"]') as HTMLElement;

  it("renders one option per item", () => {
    const fixture = setup();
    expect(options(fixture).map((o) => o.textContent?.trim())).toEqual(["A", "B", "C", "D"]);
  });

  it("moves the selected item down with the control column", () => {
    const fixture = setup();
    options(fixture)[0].click(); // select "A"
    fixture.detectChanges();
    ctrl(fixture, "Move down").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(["B", "A", "C", "D"]);
  });

  it("moves the selected item up", () => {
    const fixture = setup();
    options(fixture)[1].click(); // select "B"
    fixture.detectChanges();
    ctrl(fixture, "Move up").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(["B", "A", "C", "D"]);
  });

  it("moves the selected item to the top", () => {
    const fixture = setup();
    options(fixture)[2].click(); // select "C"
    fixture.detectChanges();
    ctrl(fixture, "Move to top").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(["C", "A", "B", "D"]);
  });

  it("moves the selected item to the bottom", () => {
    const fixture = setup();
    options(fixture)[0].click();
    fixture.detectChanges();
    ctrl(fixture, "Move to bottom").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.items()).toEqual(["B", "C", "D", "A"]);
  });

  it("disables the move controls when nothing is selected", () => {
    const fixture = setup();
    expect(ctrl(fixture, "Move up").disabled).toBe(true);
    expect(ctrl(fixture, "Move down").disabled).toBe(true);
  });

  it("single mode keeps only one item selected", () => {
    const fixture = setup();
    options(fixture)[0].click();
    options(fixture)[1].click();
    fixture.detectChanges();
    const selected = options(fixture).filter((o) => o.getAttribute("aria-selected") === "true");
    expect(selected.length).toBe(1);
    expect(selected[0].textContent?.trim()).toBe("B");
  });

  it("names the listbox from the header via aria-labelledby", () => {
    const fixture = setup();
    const lb = listbox(fixture);
    const labelId = lb.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(fixture.nativeElement.querySelector(`#${labelId}`)?.textContent?.trim()).toBe("Stages");
  });

  it("omits aria-multiselectable in single mode and sets it in multiple mode", () => {
    const single = setup();
    expect(listbox(single).hasAttribute("aria-multiselectable")).toBe(false);

    const multi = TestBed.createComponent(Host);
    multi.componentInstance.mode = "multiple"; // set before first change-detection
    multi.detectChanges();
    expect(listbox(multi).getAttribute("aria-multiselectable")).toBe("true");
  });

  it("follows the listbox keyboard pattern (focus + arrows + Enter)", () => {
    const fixture = setup();
    const lb = listbox(fixture);
    lb.dispatchEvent(new Event("focus"));
    fixture.detectChanges();
    // focusing activates the first option
    expect(lb.getAttribute("aria-activedescendant")).toBe(options(fixture)[0].id);

    lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    fixture.detectChanges();
    expect(lb.getAttribute("aria-activedescendant")).toBe(options(fixture)[1].id);

    lb.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();
    expect(options(fixture)[1].getAttribute("aria-selected")).toBe("true");
  });

  it("announces a control-column move via a live region", () => {
    const fixture = setup();
    options(fixture)[0].click();
    fixture.detectChanges();
    ctrl(fixture, "Move down").click();
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.textContent?.trim()).toBe("Moved down one position");
  });

  it("translates the move announcement via the messages input", () => {
    const fixture = TestBed.createComponent(MsgHost);
    fixture.componentInstance.messages = { movedDown: "Déplacé vers le bas" };
    fixture.detectChanges();
    const opt = fixture.nativeElement.querySelectorAll('[role="option"]')[0] as HTMLElement;
    opt.click();
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button[aria-label="Move down"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.textContent?.trim()).toBe("Déplacé vers le bas");
  });

  it("shows a translated empty-state and names the listbox from messages", () => {
    const fixture = TestBed.createComponent(MsgHost);
    fixture.componentInstance.messages = { empty: "Rien à trier", listLabel: "Étapes" };
    fixture.componentInstance.items.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Rien à trier");
    const lb = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
    expect(lb.getAttribute("aria-label")).toBe("Étapes");
  });

  it("scrolls the active option into view when the active key changes", () => {
    // jsdom has no scrollIntoView — install a spy for the duration of the test
    const original = Element.prototype.scrollIntoView;
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    try {
      const fixture = setup();
      const lb = listbox(fixture);
      lb.dispatchEvent(new Event("focus")); // activates the first option
      fixture.detectChanges();
      lb.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" })); // active moves
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });
});
