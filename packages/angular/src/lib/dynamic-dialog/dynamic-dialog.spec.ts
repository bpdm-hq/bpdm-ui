import { ApplicationRef, Component, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmDialogService, provideBpdmDynamicDialogMessages } from "./dynamic-dialog";

@Component({
  template: `<ng-template #tpl let-d
    ><p>Dynamic body</p>
    <button (click)="d.close()">Close</button></ng-template
  >`,
})
class Host {
  readonly tpl = viewChild.required<TemplateRef<unknown>>("tpl");
}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

describe("BpdmDialogService", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
    // safety net: clear any inert/aria-hidden a test left behind
    document.body.querySelectorAll("[inert]").forEach((el) => {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
  });

  it("opens with the title and renders the content template", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(BpdmDialogService);

    service.open(fixture.componentInstance.tpl(), { title: "Edit" });
    await settle();

    const dialog = getDialog();
    expect(dialog?.textContent).toContain("Edit");
    expect(dialog?.textContent).toContain("Dynamic body");
  });

  it("closes via the ref returned by open()", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(BpdmDialogService);

    const ref = service.open(fixture.componentInstance.tpl());
    await settle();
    expect(getDialog()).toBeTruthy();

    ref.close();
    await macrotask(250);
    TestBed.inject(ApplicationRef).tick();

    expect(getDialog()).toBeNull();
  });

  it("makes the app background inert + aria-hidden while a dialog is open, and restores it on close", async () => {
    const appBg = document.createElement("div");
    appBg.id = "app-bg";
    document.body.appendChild(appBg);
    try {
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const service = TestBed.inject(BpdmDialogService);

      const ref = service.open(fixture.componentInstance.tpl(), { title: "Edit" });
      await settle();

      // background is hidden from AT + non-interactive; the overlay container is not
      expect(appBg.hasAttribute("inert")).toBe(true);
      expect(appBg.getAttribute("aria-hidden")).toBe("true");
      const container = document.querySelector(".cdk-overlay-container")!;
      expect(container.hasAttribute("inert")).toBe(false);

      ref.close();
      await macrotask(250);
      TestBed.inject(ApplicationRef).tick();

      expect(appBg.hasAttribute("inert")).toBe(false);
      expect(appBg.hasAttribute("aria-hidden")).toBe(false);
    } finally {
      appBg.remove();
    }
  });

  it("inerts the lower dialog when a second dialog stacks on top", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(BpdmDialogService);

    const ref1 = service.open(fixture.componentInstance.tpl(), { title: "One" });
    await settle();
    const ref2 = service.open(fixture.componentInstance.tpl(), { title: "Two" });
    await settle();

    const panes = Array.from(document.querySelectorAll(".cdk-overlay-pane"));
    expect(panes.length).toBe(2);
    // only the topmost (last) panel is perceivable/trappable; the lower is inert
    expect(panes[0].hasAttribute("inert")).toBe(true);
    expect(panes[0].getAttribute("aria-hidden")).toBe("true");
    expect(panes[1].hasAttribute("inert")).toBe(false);

    // closing the top restores the one beneath it
    ref2.close();
    await macrotask(250);
    TestBed.inject(ApplicationRef).tick();
    expect(panes[0].hasAttribute("inert")).toBe(false);

    ref1.close();
    await macrotask(250);
    TestBed.inject(ApplicationRef).tick();
  });

  it("localizes the close-button aria-label via provideBpdmDynamicDialogMessages", async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideBpdmDynamicDialogMessages({ close: "Schließen" })],
    });

    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const service = TestBed.inject(BpdmDialogService);

    service.open(fixture.componentInstance.tpl(), { title: "Edit" });
    await settle();

    const closeButton = document.querySelector('[aria-label="Schließen"]');
    expect(closeButton).toBeTruthy();
  });
});
