import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmPickList, type PickListValue } from "./pick-list";

@Component({
  imports: [BpdmPickList],
  template: `
    <bpdm-pick-list [(value)]="lists" [itemKey]="key" [itemTemplate]="tpl" [reorder]="reorder" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class Host {
  readonly lists = signal<PickListValue<string>>({ source: ["A", "B", "C"], target: ["Z"] });
  readonly key = (w: string) => w;
  reorder = true;
}

describe("BpdmPickList", () => {
  const setup = (reorder = true) => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.reorder = reorder;
    fixture.detectChanges();
    return fixture;
  };
  const lists = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll('[role="listbox"]')) as HTMLElement[];
  const optionsIn = (box: HTMLElement) =>
    Array.from(box.querySelectorAll('[role="option"]')) as HTMLElement[];
  const ctrl = (f: { nativeElement: HTMLElement }, label: string) =>
    f.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

  it("renders the source and target lists", () => {
    const fixture = setup();
    const [source, target] = lists(fixture);
    expect(optionsIn(source).map((o) => o.textContent?.trim())).toEqual(["A", "B", "C"]);
    expect(optionsIn(target).map((o) => o.textContent?.trim())).toEqual(["Z"]);
  });

  it("moves a selected source item to the target", () => {
    const fixture = setup();
    optionsIn(lists(fixture)[0])[1].click(); // select "B"
    fixture.detectChanges();
    ctrl(fixture, "Move to target").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists()).toEqual({ source: ["A", "C"], target: ["Z", "B"] });
  });

  it("moves everything to the target with move-all", () => {
    const fixture = setup();
    ctrl(fixture, "Move all to target").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists()).toEqual({ source: [], target: ["Z", "A", "B", "C"] });
  });

  it("moves a selected target item back to the source", () => {
    const fixture = setup();
    optionsIn(lists(fixture)[1])[0].click(); // select "Z" in target
    fixture.detectChanges();
    ctrl(fixture, "Move to source").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists()).toEqual({ source: ["A", "B", "C", "Z"], target: [] });
  });

  it("hides the reorder controls when reorder is false", () => {
    const fixture = setup(false);
    expect(ctrl(fixture, "Move up")).toBeNull();
    expect(ctrl(fixture, "Move to target")).toBeTruthy(); // transfer controls remain
  });
});
