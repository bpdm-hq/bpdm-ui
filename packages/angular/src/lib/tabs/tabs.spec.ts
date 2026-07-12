import { Component, computed, signal, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmTabs,
  type TabItem,
  type TabsActivationMode,
  type TabsOrientation,
} from "./tabs";

@Component({
  imports: [BpdmTabs],
  template: `
    <bpdm-tabs
      [items]="items()"
      [orientation]="orientation"
      [activationMode]="activationMode"
      [ariaLabel]="ariaLabel"
      [dir]="dir"
      [scrollable]="scrollable"
    />
    <ng-template #a><p>Panel A</p></ng-template>
    <ng-template #b><p>Panel B</p></ng-template>
    <ng-template #c><p>Panel C</p></ng-template>
  `,
})
class Host {
  private readonly a = viewChild<TemplateRef<unknown>>("a");
  private readonly b = viewChild<TemplateRef<unknown>>("b");
  private readonly c = viewChild<TemplateRef<unknown>>("c");
  orientation: TabsOrientation = "horizontal";
  activationMode: TabsActivationMode = "automatic";
  ariaLabel = "";
  dir: "" | "ltr" | "rtl" = "";
  scrollable = false;
  readonly disabledC = signal(false);
  readonly items = computed<TabItem[]>(() => {
    const a = this.a();
    const b = this.b();
    const c = this.c();
    return a && b && c
      ? [
          { value: "a", label: "A", content: a },
          { value: "b", label: "B", content: b },
          { value: "c", label: "C", content: c, disabled: this.disabledC() },
        ]
      : [];
  });
}

describe("BpdmTabs", () => {
  const create = (setup?: (h: Host) => void) => {
    const fixture = TestBed.createComponent(Host);
    if (setup) setup(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  };
  const tabs = (f: { nativeElement: HTMLElement }) =>
    Array.from(f.nativeElement.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
  const tablist = (f: { nativeElement: HTMLElement }) =>
    f.nativeElement.querySelector('[role="tablist"]') as HTMLElement;
  const key = (el: HTMLElement, k: string) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));

  it("shows the first tab's panel by default", () => {
    const f = create();
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true");
    expect(f.nativeElement.textContent).toContain("Panel A");
  });

  it("switches content when another tab is clicked", () => {
    const f = create();
    tabs(f)[1].click();
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain("Panel B");
    expect(tabs(f)[1].getAttribute("aria-selected")).toBe("true");
  });

  it("wires the tablist name + orientation for assistive tech", () => {
    const f = create((h) => {
      h.ariaLabel = "Account sections";
      h.orientation = "vertical";
    });
    const tl = tablist(f);
    expect(tl.getAttribute("aria-label")).toBe("Account sections");
    expect(tl.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("defaults to a horizontal orientation", () => {
    expect(tablist(create()).getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("scrolls the tab row horizontally when scrollable", () => {
    const f = create((h) => (h.scrollable = true));
    expect(tablist(f).className).toContain("overflow-x-auto");
  });

  it("makes the active panel focusable (tabindex 0)", () => {
    const f = create();
    expect(f.nativeElement.querySelector('[role="tabpanel"]')?.getAttribute("tabindex")).toBe("0");
  });

  it("keeps only the active tab in the tab order (roving tabindex)", () => {
    const f = create();
    const [a, b] = tabs(f);
    expect(a.getAttribute("tabindex")).toBe("0");
    expect(b.getAttribute("tabindex")).toBe("-1");
  });

  it("navigates with arrow keys + Home/End (automatic activation, wraps)", () => {
    const f = create();
    const tl = tablist(f);
    key(tl, "ArrowRight");
    f.detectChanges();
    expect(tabs(f)[1].getAttribute("aria-selected")).toBe("true"); // A → B
    key(tl, "ArrowLeft");
    f.detectChanges();
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true"); // B → A
    key(tl, "ArrowLeft");
    f.detectChanges();
    expect(tabs(f)[2].getAttribute("aria-selected")).toBe("true"); // A → wraps to C
    key(tl, "Home");
    f.detectChanges();
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true");
    key(tl, "End");
    f.detectChanges();
    expect(tabs(f)[2].getAttribute("aria-selected")).toBe("true");
  });

  it("mirrors horizontal arrow keys under RTL", () => {
    const f = create((h) => (h.dir = "rtl"));
    const tl = tablist(f);
    // active = A; in RTL, Right arrow goes to the PREVIOUS tab → wraps to C
    key(tl, "ArrowRight");
    f.detectChanges();
    expect(tabs(f)[2].getAttribute("aria-selected")).toBe("true");
    // Left arrow goes to the NEXT tab → from C wraps to A
    key(tl, "ArrowLeft");
    f.detectChanges();
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true");
  });

  it("uses Up/Down (not Left/Right) for a vertical orientation", () => {
    const f = create((h) => (h.orientation = "vertical"));
    const tl = tablist(f);
    key(tl, "ArrowRight"); // ignored in vertical
    f.detectChanges();
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true"); // unchanged
    key(tl, "ArrowDown");
    f.detectChanges();
    expect(tabs(f)[1].getAttribute("aria-selected")).toBe("true"); // A → B
  });

  it("skips disabled tabs while navigating", () => {
    const f = create((h) => h.disabledC.set(true));
    const tl = tablist(f);
    // enabled = [A, B]; End → last enabled = B (C is disabled/skipped)
    key(tl, "End");
    f.detectChanges();
    expect(tabs(f)[1].getAttribute("aria-selected")).toBe("true");
  });

  it("only moves focus (not selection) under manual activation", () => {
    const f = create((h) => (h.activationMode = "manual"));
    const tl = tablist(f);
    key(tl, "ArrowRight");
    f.detectChanges();
    // selection stays on A; roving tab order moved to B
    expect(tabs(f)[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs(f)[1].getAttribute("tabindex")).toBe("0");
    expect(tabs(f)[0].getAttribute("tabindex")).toBe("-1");
    // activating (native button click) selects it
    tabs(f)[1].click();
    f.detectChanges();
    expect(tabs(f)[1].getAttribute("aria-selected")).toBe("true");
  });
});
