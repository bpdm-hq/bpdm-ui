import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmPopover, BpdmPopoverClose } from "./popover";

@Component({
  imports: [BpdmPopover, BpdmPopoverClose],
  template: `
    <button [bpdmPopover]="tpl">Open</button>
    <ng-template #tpl>
      <p>Panel body</p>
      <button bpdmPopoverClose>Close</button>
    </ng-template>
  `,
})
class Host {}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

describe("BpdmPopover", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens on trigger click and renders the panel content", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    const dialog = getDialog();
    expect(dialog?.textContent).toContain("Panel body");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("closes via a bpdmPopoverClose button inside the content", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();
    const closeBtn = getDialog()!.querySelector("button") as HTMLElement;

    closeBtn.click();
    await macrotask(200); // let the close animation timer flush the teardown
    TestBed.inject(ApplicationRef).tick();

    expect(getDialog()).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
});
