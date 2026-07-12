import { ApplicationRef, Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmDrawer,
  BpdmDrawerBody,
  BpdmDrawerClose,
  BpdmDrawerFooter,
  BpdmDrawerTrigger,
  type DrawerMessages,
  type DrawerSide,
  type DrawerSize,
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

@Component({
  imports: [BpdmDrawer, BpdmDrawerTrigger],
  template: `
    <bpdm-drawer
      [side]="side()"
      [size]="size()"
      [title]="title()"
      [showClose]="showClose()"
      [messages]="messages()"
    >
      <button bpdmDrawerTrigger>Open</button>
    </bpdm-drawer>
  `,
})
class ConfigHost {
  readonly side = signal<DrawerSide>("right");
  readonly size = signal<DrawerSize>("md");
  readonly title = signal("");
  readonly showClose = signal(true);
  readonly messages = signal<Partial<DrawerMessages>>({});
}

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

  it("applies side + size panel classes (right / md → w-96)", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const drawer = getDrawer();
    expect(drawer?.className).toContain("h-dvh"); // left/right span full height
    expect(drawer?.className).toContain("w-96"); // md width
  });

  it("applies height sizing for a bottom drawer (bottom / md → h-[50dvh])", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.side.set("bottom");
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const drawer = getDrawer();
    expect(drawer?.className).toContain("w-dvw"); // top/bottom span full width
    expect(drawer?.className).toContain("h-[50dvh]"); // md height
  });

  it("closes via Escape", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const drawer = getDrawer()!;
    drawer.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await macrotask(300);
    TestBed.inject(ApplicationRef).tick();

    expect(getDrawer()).toBeNull();
  });

  it("closes via a backdrop click", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const backdrop = document.querySelector(".cdk-overlay-backdrop") as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    await macrotask(300);
    TestBed.inject(ApplicationRef).tick();

    expect(getDrawer()).toBeNull();
  });

  it("hides the close button when showClose is false", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.showClose.set(false);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const closeBtn = getDrawer()!.querySelector('button[aria-label]');
    expect(closeBtn).toBeNull();
  });

  it("localizes the close button and fallback title via messages", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.componentInstance.messages.set({ close: "Schließen", drawerLabel: "Seitenleiste" });
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const drawer = getDrawer()!;
    // localized close button aria-label
    expect(drawer.querySelector('button[aria-label="Schließen"]')).toBeTruthy();
    // with no visible title, the sr-only heading uses the fallback label
    const heading = drawer.querySelector("h2");
    expect(heading?.textContent?.trim()).toBe("Seitenleiste");
    expect(heading?.className).toContain("sr-only");
  });

  it("propagates live message changes to an open drawer", async () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    expect(getDrawer()!.querySelector('button[aria-label="Close"]')).toBeTruthy();

    // change the label while the drawer stays open
    fixture.componentInstance.messages.set({ close: "Fermer" });
    await settle();

    expect(getDrawer()!.querySelector('button[aria-label="Fermer"]')).toBeTruthy();
    expect(getDrawer()!.querySelector('button[aria-label="Close"]')).toBeNull();
  });
});
