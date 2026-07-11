import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  type AccordionHeadingLevel,
  type AccordionItemData,
  type AccordionType,
  BpdmAccordion,
} from "./accordion";

@Component({
  imports: [BpdmAccordion],
  template: `
    <bpdm-accordion
      [items]="items()"
      [type]="type"
      [headingLevel]="headingLevel"
      [defaultValue]="defaultValue"
    />
    <ng-template #a>Body A</ng-template>
    <ng-template #b>Body B</ng-template>
    <ng-template #c>Body C</ng-template>
  `,
})
class Host {
  private readonly a = viewChild<TemplateRef<unknown>>("a");
  private readonly b = viewChild<TemplateRef<unknown>>("b");
  private readonly c = viewChild<TemplateRef<unknown>>("c");
  type: AccordionType = "single";
  headingLevel: AccordionHeadingLevel = 3;
  defaultValue: string | string[] = "";
  readonly items = computed<AccordionItemData[]>(() => {
    const a = this.a();
    const b = this.b();
    const c = this.c();
    return a && b && c
      ? [
          { value: "a", title: "Title A", content: a },
          { value: "b", title: "Title B", content: b },
          { value: "c", title: "Title C", content: c, disabled: true },
        ]
      : [];
  });
}

describe("BpdmAccordion", () => {
  const create = (setup?: (h: Host) => void) => {
    const fixture = TestBed.createComponent(Host);
    if (setup) setup(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  };
  const buttons = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(fixture.nativeElement.querySelectorAll("button")) as HTMLButtonElement[];

  it("renders the title collapsed, then expands on click", () => {
    const fixture = create();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;
    expect(btn.textContent).toContain("Title A");
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(fixture.nativeElement.textContent).toContain("Body A");
  });

  it("wires each trigger to its panel (ids + aria-controls / aria-labelledby)", () => {
    const fixture = create();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    expect(btn.id).toBeTruthy();
    expect(region.id).toBeTruthy();
    expect(btn.getAttribute("aria-controls")).toBe(region.id);
    expect(region.getAttribute("aria-labelledby")).toBe(btn.id);
  });

  it("wraps each header in a heading at the configured level", () => {
    const fixture = create();
    const headings = Array.from(
      fixture.nativeElement.querySelectorAll('[role="heading"]'),
    ) as HTMLElement[];
    expect(headings.length).toBe(3);
    expect(headings[0].getAttribute("aria-level")).toBe("3");
  });

  it("supports a custom heading level for the document outline", () => {
    const fixture = create((h) => (h.headingLevel = 2));
    const heading = fixture.nativeElement.querySelector('[role="heading"]') as HTMLElement;
    expect(heading.getAttribute("aria-level")).toBe("2");
  });

  it("marks a collapsed panel inert, and clears it when open", () => {
    const fixture = create();
    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    expect(region.hasAttribute("inert")).toBe(true); // collapsed → out of tab order + AT
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    fixture.detectChanges();
    expect(region.hasAttribute("inert")).toBe(false); // open → interactive
  });

  it("moves focus between enabled headers with Arrow / Home / End keys", () => {
    const fixture = create();
    const btns = buttons(fixture); // [A, B, C(disabled)]
    btns[0].focus();
    btns[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    expect(document.activeElement).toBe(btns[1]);
    // End lands on the last ENABLED trigger (C is disabled → stays on B)
    btns[1].dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    expect(document.activeElement).toBe(btns[1]);
    btns[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
    expect(document.activeElement).toBe(btns[0]);
    btns[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    expect(document.activeElement).toBe(btns[0]); // no wrap past the first
  });

  it("opens the defaultValue panel", () => {
    const fixture = create((h) => (h.defaultValue = "b"));
    const btns = buttons(fixture);
    expect(btns[0].getAttribute("aria-expanded")).toBe("false");
    expect(btns[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps only one panel open in single mode", () => {
    const fixture = create((h) => (h.defaultValue = "a"));
    const btns = buttons(fixture);
    btns[1].click();
    fixture.detectChanges();
    expect(btns[0].getAttribute("aria-expanded")).toBe("false");
    expect(btns[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps several panels open in multiple mode", () => {
    const fixture = create((h) => {
      h.type = "multiple";
      h.defaultValue = ["a"];
    });
    const btns = buttons(fixture);
    btns[1].click();
    fixture.detectChanges();
    expect(btns[0].getAttribute("aria-expanded")).toBe("true");
    expect(btns[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("does not toggle a disabled item", () => {
    const fixture = create();
    const btns = buttons(fixture);
    expect(btns[2].disabled).toBe(true);
    btns[2].click();
    fixture.detectChanges();
    expect(btns[2].getAttribute("aria-expanded")).toBe("false");
  });
});
