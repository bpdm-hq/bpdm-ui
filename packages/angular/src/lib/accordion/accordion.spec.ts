import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { type AccordionItemData, BpdmAccordion } from "./accordion";

@Component({
  imports: [BpdmAccordion],
  template: `
    <bpdm-accordion [items]="items()" />
    <ng-template #c>Body C</ng-template>
  `,
})
class Host {
  private readonly c = viewChild<TemplateRef<unknown>>("c");
  readonly items = computed<AccordionItemData[]>(() => {
    const c = this.c();
    return c ? [{ value: "x", title: "Title X", content: c }] : [];
  });
}

describe("BpdmAccordion", () => {
  it("renders the title collapsed, then expands on click", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;
    expect(btn.textContent).toContain("Title X");
    expect(btn.getAttribute("aria-expanded")).toBe("false");

    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(fixture.nativeElement.textContent).toContain("Body C");
  });
});
