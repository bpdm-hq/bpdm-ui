import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmOrderList } from "./order-list";

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
});
