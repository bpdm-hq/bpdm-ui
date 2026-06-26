import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmOrderList } from "./order-list";

@Component({
  imports: [BpdmOrderList],
  template: `
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" [selectionMode]="mode" />
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
});
