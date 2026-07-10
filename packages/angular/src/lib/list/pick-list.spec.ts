import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmPickList, type PickListMessages, type PickListValue } from "./pick-list";

@Component({
  imports: [BpdmPickList],
  template: `
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [reorder]="reorder"
      [isItemDisabled]="isDisabled"
      [sourceHeader]="sourceHeader"
      [targetHeader]="targetHeader"
      [messages]="messages"
      (transfer)="lastTransfer = $event"
    />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class Host {
  readonly lists = signal<PickListValue<string>>({ source: ["A", "B", "C"], target: ["Z"] });
  readonly key = (w: string) => w;
  reorder = true;
  isDisabled: (w: string) => boolean = () => false;
  sourceHeader = "";
  targetHeader = "";
  messages: Partial<PickListMessages> = {};
  lastTransfer: { moved: string[]; to: "source" | "target" } | null = null;
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

  it("emits (transfer) with the moved items and destination", () => {
    const fixture = setup();
    optionsIn(lists(fixture)[0])[1].click(); // select "B"
    fixture.detectChanges();
    ctrl(fixture, "Move to target").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastTransfer).toEqual({ moved: ["B"], to: "target" });
  });

  it("moves everything back to the source with move-all", () => {
    const fixture = setup();
    ctrl(fixture, "Move all to source").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists()).toEqual({ source: ["A", "B", "C", "Z"], target: [] });
  });

  it("labels both panes and the transfer group for screen readers", () => {
    const fixture = setup();
    const boxes = lists(fixture);
    // no headers here → distinct fallback source/target names
    expect(boxes[0].getAttribute("aria-label")).toBe("source list");
    expect(boxes[1].getAttribute("aria-label")).toBe("target list");
    expect(boxes[0].getAttribute("aria-multiselectable")).toBe("true");
    const group = fixture.nativeElement.querySelector('[data-transfer-group]') as HTMLElement;
    expect(group.getAttribute("aria-label")).toBe("Transfer between lists");
  });

  it("labels a pane by its header when one is given", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.sourceHeader = "Available";
    fixture.componentInstance.targetHeader = "Enabled";
    fixture.detectChanges();
    const boxes = lists(fixture);
    // header drives aria-labelledby, so aria-label is dropped
    expect(boxes[0].getAttribute("aria-label")).toBeNull();
    expect(boxes[0].getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("marks a selected option with aria-selected", () => {
    const fixture = setup();
    const b = optionsIn(lists(fixture)[0])[1];
    expect(b.getAttribute("aria-selected")).toBe("false");
    b.click();
    fixture.detectChanges();
    expect(b.getAttribute("aria-selected")).toBe("true");
  });

  it("announces a transfer through the polite live region", () => {
    const fixture = setup();
    optionsIn(lists(fixture)[0])[1].click(); // select "B"
    fixture.detectChanges();
    ctrl(fixture, "Move to target").click();
    fixture.detectChanges();
    const live = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(live.textContent).toContain("1 item moved to target list");
  });

  it("routes every user-facing string through the messages override", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.messages = {
      transferGroup: "Transférer",
      moveToTarget: "Vers la cible",
      sourceLabel: "liste source",
      transferAnnouncement: (n, list) => `${n} vers ${list}`,
    };
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('[data-transfer-group]') as HTMLElement;
    expect(group.getAttribute("aria-label")).toBe("Transférer");
    expect(ctrl(fixture, "Vers la cible")).toBeTruthy();
    expect(lists(fixture)[0].getAttribute("aria-label")).toBe("liste source");
    optionsIn(lists(fixture)[0])[1].click(); // select "B"
    fixture.detectChanges();
    ctrl(fixture, "Vers la cible").click();
    fixture.detectChanges();
    const live = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(live.textContent).toContain("1 vers target list");
  });

  it("overrides empty-state text through messages", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.lists.set({ source: [], target: [] });
    fixture.componentInstance.messages = { sourceEmpty: "Rien ici", targetEmpty: "Vide" };
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain("Rien ici");
    expect(text).toContain("Vide");
  });

  it("locks a disabled item — not selectable, and left behind on move-all", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.isDisabled = (w) => w === "B";
    fixture.detectChanges();
    const source = lists(fixture)[0];
    const b = optionsIn(source)[1];
    expect(b.getAttribute("aria-disabled")).toBe("true");
    b.click(); // ignored
    fixture.detectChanges();
    expect(b.getAttribute("aria-selected")).toBe("false");
    ctrl(fixture, "Move all to target").click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lists()).toEqual({ source: ["B"], target: ["Z", "A", "C"] });
  });
});
