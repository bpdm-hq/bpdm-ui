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
