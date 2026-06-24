import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmDrawer,
  BpdmDrawerBody,
  BpdmDrawerClose,
  BpdmDrawerFooter,
  BpdmDrawerTrigger,
} from "./drawer";

@Component({
  imports: [BpdmDrawer, BpdmDrawerTrigger, BpdmDrawerClose, BpdmDrawerBody, BpdmDrawerFooter],
  template: `
    <bpdm-drawer side="left" title="Filters">
      <button bpdmDrawerTrigger>Open</button>
      <ng-template bpdmDrawerBody><p>Body content</p></ng-template>
      <ng-template bpdmDrawerFooter><button bpdmDrawerClose>Close</button></ng-template>
    </bpdm-drawer>
  `,
})
class Host {}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDrawer = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

describe("BpdmDrawer", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens from a trigger and renders title + projected body", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const drawer = getDrawer();
    expect(drawer).toBeTruthy();
    expect(drawer?.getAttribute("aria-modal")).toBe("true");
    expect(drawer?.textContent).toContain("Filters");
    expect(drawer?.textContent).toContain("Body content");
    // left drawer is full-height
    expect(drawer?.className).toContain("h-dvh");
  });

  it("closes via a bpdmDrawerClose button", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const closeBtn = Array.from(getDrawer()!.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Close"),
    ) as HTMLElement;
    closeBtn.click();
    await macrotask(300); // let the close animation timer dispose the overlay
    TestBed.inject(ApplicationRef).tick();

    expect(getDrawer()).toBeNull();
  });
});
