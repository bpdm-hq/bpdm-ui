import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmStatusTimeline, type TimelineAlign, type TimelineItem } from "./status-timeline";

@Component({
  imports: [BpdmStatusTimeline],
  template: `
    <bpdm-status-timeline
      [items]="items"
      [layout]="layout"
      [align]="align"
      [interactive]="interactive"
      (itemClick)="lastClick = $event"
    />
  `,
})
class Host {
  layout: "vertical" | "horizontal" = "vertical";
  align: TimelineAlign = "left";
  interactive = false;
  lastClick: { item: TimelineItem; index: number } | null = null;
  items: TimelineItem[] = [
    { title: "Build queued", status: "complete", timestamp: "09:41" },
    { title: "Running tests", status: "current", timestamp: "09:42", description: "412 of 980 passed" },
    { title: "Deploy", status: "failed" },
    { title: "Verify" }, // defaults to pending
  ];
}

@Component({
  imports: [BpdmStatusTimeline],
  template: `
    <bpdm-status-timeline [items]="items" [contentTemplate]="c" [oppositeTemplate]="o" [markerTemplate]="m">
      <ng-template #c let-item><span class="custom-content">{{ item.title }}</span></ng-template>
      <ng-template #o let-item><span class="custom-opp">{{ item.timestamp }}</span></ng-template>
      <ng-template #m let-item let-status="status"><span class="custom-marker">{{ status }}</span></ng-template>
    </bpdm-status-timeline>
  `,
})
class TemplateHost {
  items: TimelineItem[] = [{ title: "Alpha", status: "complete", timestamp: "now" }];
}

describe("BpdmStatusTimeline", () => {
  const create = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
  };

  it("renders one list item per timeline entry", () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelectorAll("li").length).toBe(4);
  });

  it("renders a check for complete, a cross for failed, and a pulse for current", () => {
    const fixture = create();
    const items = Array.from(fixture.nativeElement.querySelectorAll("li")) as HTMLElement[];
    // complete → check path
    expect(items[0].querySelector('path[d="M3.5 8.5l3 3 6-7"]')).toBeTruthy();
    // current → pinging overlay
    expect(items[1].querySelector(".animate-\\[bpdm-ping_1\\.8s_var\\(--bpdm-ease-out\\)_infinite\\]")).toBeTruthy();
    // failed → cross path
    expect(items[2].querySelector('path[d="M4.5 4.5l7 7M11.5 4.5l-7 7"]')).toBeTruthy();
  });

  it("shows timestamp and description when provided", () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain("09:42");
    expect(fixture.nativeElement.textContent).toContain("412 of 980 passed");
  });

  it("defaults a status-less item to pending (muted title)", () => {
    const fixture = create();
    const last = (fixture.nativeElement.querySelectorAll("li")[3]) as HTMLElement;
    const title = last.querySelector("p") as HTMLElement;
    expect(title.className).toContain("text-muted-foreground");
  });

  it("draws no connector line after the last item", () => {
    const fixture = create();
    const last = (fixture.nativeElement.querySelectorAll("li")[3]) as HTMLElement;
    expect(last.querySelector('[aria-hidden="true"].absolute.w-px')).toBeNull();
  });

  it("uses a centered grid for align='alternate'", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.align = "alternate"; // set before first change-detection
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("li.grid").length).toBe(4);
  });

  it("renders opposite content across a centered line", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.items = [
      { title: "Ordered", status: "complete", opposite: "15 Oct" },
      { title: "Shipped", status: "current", opposite: "16 Oct" },
    ];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("15 Oct");
    expect(fixture.nativeElement.querySelector("li.grid")).toBeTruthy();
  });

  it("emits (itemClick) when interactive, via click and keyboard", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.interactive = true;
    fixture.detectChanges();
    const first = fixture.nativeElement.querySelector("li") as HTMLElement;
    expect(first.getAttribute("role")).toBe("button");
    first.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastClick?.index).toBe(0);
    first.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();
    expect(fixture.componentInstance.lastClick?.item.title).toBe("Build queued");
  });

  it("names the list and marks the current step with aria-current", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.items = [
      { title: "A", status: "complete" },
      { title: "B", status: "current" },
    ];
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('[aria-current="step"]').length).toBe(1);
  });

  it("renders a horizontal layout as a flex row of steps", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.layout = "horizontal";
    fixture.detectChanges();
    const ol = fixture.nativeElement.querySelector("ol") as HTMLElement;
    expect(ol.className).toContain("flex");
    expect(fixture.nativeElement.querySelectorAll("li").length).toBe(4);
  });

  it("applies a custom marker colour", () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.items = [{ title: "Step", status: "complete", color: "rgb(1, 2, 3)" }];
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('span[style*="background"]') as HTMLElement;
    expect(dot.style.backgroundColor).toBe("rgb(1, 2, 3)");
  });

  it("renders custom marker / content / opposite templates", () => {
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector(".custom-content")?.textContent).toContain("Alpha");
    expect(el.querySelector(".custom-opp")?.textContent).toContain("now");
    expect(el.querySelector(".custom-marker")?.textContent).toContain("complete");
    // default glyph is bypassed by the marker template
    expect(el.querySelector('path[d="M3.5 8.5l3 3 6-7"]')).toBeNull();
  });
});
