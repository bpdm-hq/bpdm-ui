import { ApplicationRef, Component, signal } from "@angular/core";
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

@Component({
  imports: [BpdmPopover, BpdmPopoverClose],
  template: `
    <button
      [bpdmPopover]="tpl"
      [bpdmPopoverAriaLabel]="ariaLabel()"
      [bpdmPopoverModal]="modal()"
      [bpdmPopoverBordered]="bordered()"
      [bpdmPopoverShowArrow]="showArrow()"
    >
      Open
    </button>
    <ng-template #tpl>
      <p>Panel body</p>
      <button bpdmPopoverClose>Close</button>
    </ng-template>
  `,
})
class ConfigHost {
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly modal = signal(false);
  readonly bordered = signal(true);
  readonly showArrow = signal(false);
}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;
const getBackdrop = () =>
  document.querySelector(".cdk-overlay-backdrop") as HTMLElement | null;

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

  it("closes on Escape", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();
    expect(getDialog()).not.toBeNull();

    btn.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await macrotask(200);
    TestBed.inject(ApplicationRef).tick();

    expect(getDialog()).toBeNull();
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("toggles aria-controls on the trigger between the panel id and null", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
    expect(btn.getAttribute("aria-controls")).toBeNull();

    btn.click();
    await settle();

    const controls = btn.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    expect(getDialog()!.getAttribute("id")).toBe(controls);
  });

  it("names the panel via bpdmPopoverAriaLabel", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.ariaLabel.set("Quick actions");
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getDialog()!.getAttribute("aria-label")).toBe("Quick actions");
  });

  it("leaves the panel unnamed when no aria-label is set", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getDialog()!.getAttribute("aria-label")).toBeNull();
  });

  it("renders a backdrop when modal", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.modal.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getBackdrop()).not.toBeNull();
  });

  it("has no backdrop when non-modal", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getBackdrop()).toBeNull();
  });

  it("drops the border class when bordered is false", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.bordered.set(false);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getDialog()!.className).not.toContain("border-border");
  });

  it("keeps the border class by default", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getDialog()!.className).toContain("border-border");
  });

  it("renders the arrow when showArrow is set", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.showArrow.set(true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector("button") as HTMLElement;

    btn.click();
    await settle();

    expect(getDialog()!.querySelector("svg")).not.toBeNull();
  });
});
