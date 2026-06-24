import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTabs, type TabItem } from "./tabs";

@Component({
  imports: [BpdmTabs],
  template: `
    <bpdm-tabs [items]="items()" />
    <ng-template #a><p>Panel A</p></ng-template>
    <ng-template #b><p>Panel B</p></ng-template>
  `,
})
class Host {
  private readonly a = viewChild<TemplateRef<unknown>>("a");
  private readonly b = viewChild<TemplateRef<unknown>>("b");
  readonly items = computed<TabItem[]>(() => {
    const a = this.a();
    const b = this.b();
    return a && b
      ? [
          { value: "a", label: "A", content: a },
          { value: "b", label: "B", content: b },
        ]
      : [];
  });
}

describe("BpdmTabs", () => {
  it("shows the first tab's panel by default", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(fixture.nativeElement.textContent).toContain("Panel A");
  });

  it("switches content when another tab is clicked", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Panel B");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
  });
});
