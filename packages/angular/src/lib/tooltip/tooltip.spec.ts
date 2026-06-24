import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTooltip } from "./tooltip";

@Component({
  imports: [BpdmTooltip],
  template: `<button bpdmTooltip="Copy address" [bpdmTooltipDelay]="0" [bpdmTooltipDisabled]="off">Hover</button>`,
})
class Host {
  off = false;
}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));
const getTooltip = () => document.querySelector('[role="tooltip"]') as HTMLElement | null;

describe("BpdmTooltip", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens on hover and wires aria-describedby", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.dispatchEvent(new MouseEvent("mouseenter"));
    await macrotask(); // let the (zero) open delay fire
    TestBed.inject(ApplicationRef).tick(); // render the attached overlay component

    const tip = getTooltip();
    expect(tip?.textContent).toContain("Copy address");
    expect(btn.getAttribute("aria-describedby")).toBe(tip!.id);
  });

  it("stays closed when the tooltip is disabled", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.off = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.dispatchEvent(new MouseEvent("mouseenter"));
    await macrotask();

    expect(getTooltip()).toBeNull();
  });
});
