import { ApplicationRef, Component, EventEmitter } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Directionality, type Direction } from "@angular/cdk/bidi";
import { Overlay } from "@angular/cdk/overlay";
import { BpdmTooltip } from "./tooltip";

@Component({
  imports: [BpdmTooltip],
  template: `<button bpdmTooltip="Copy address" [bpdmTooltipDelay]="0" [bpdmTooltipDisabled]="off">Hover</button>`,
})
class Host {
  off = false;
}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
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

  it("stays open when the pointer moves onto the bubble (WCAG 1.4.13 hoverable)", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.dispatchEvent(new MouseEvent("mouseenter"));
    await macrotask();
    TestBed.inject(ApplicationRef).tick();
    const tip = getTooltip();
    expect(tip).toBeTruthy();

    // leave the trigger (schedules the hide) then land on the bubble before the
    // ~110ms teardown — the keep-alive must cancel the pending hide.
    btn.dispatchEvent(new MouseEvent("mouseleave"));
    tip!.dispatchEvent(new MouseEvent("mouseenter"));
    await macrotask(160); // well past the teardown window
    TestBed.inject(ApplicationRef).tick();
    expect(getTooltip()).toBeTruthy();

    // leaving the bubble finally tears it down
    tip!.dispatchEvent(new MouseEvent("mouseleave"));
    await macrotask(160);
    TestBed.inject(ApplicationRef).tick();
    expect(getTooltip()).toBeNull();
  });

  it("passes the ambient text direction to the overlay (RTL-aware alignment)", async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Directionality, useValue: { value: "rtl" as Direction, change: new EventEmitter<Direction>() } },
      ],
    });

    const overlay = TestBed.inject(Overlay);
    const createSpy = vi.spyOn(overlay, "create");

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.dispatchEvent(new MouseEvent("mouseenter"));
    await macrotask();
    TestBed.inject(ApplicationRef).tick();

    expect(createSpy).toHaveBeenCalled();
    const config = createSpy.mock.calls[0][0];
    expect(config?.direction).toBeDefined();
    expect((config!.direction as Directionality).value).toBe("rtl");
  });
});
