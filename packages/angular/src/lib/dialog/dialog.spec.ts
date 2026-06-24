import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmDialog,
  BpdmDialogBody,
  BpdmDialogClose,
  BpdmDialogFooter,
  BpdmDialogTrigger,
} from "./dialog";

@Component({
  imports: [BpdmDialog, BpdmDialogTrigger, BpdmDialogClose, BpdmDialogBody, BpdmDialogFooter],
  template: `
    <bpdm-dialog title="Edit project">
      <button bpdmDialogTrigger>Open</button>
      <ng-template bpdmDialogBody><p>Body content</p></ng-template>
      <ng-template bpdmDialogFooter><button bpdmDialogClose>Close</button></ng-template>
    </bpdm-dialog>
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

describe("BpdmDialog", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens from a trigger and renders title + projected body", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const dialog = getDialog();
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.textContent).toContain("Edit project");
    expect(dialog?.textContent).toContain("Body content");
  });

  it("closes via a bpdmDialogClose button", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const closeBtn = Array.from(getDialog()!.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Close"),
    ) as HTMLElement;
    closeBtn.click();
    await macrotask(250); // let the close animation timer dispose the overlay
    TestBed.inject(ApplicationRef).tick();

    expect(getDialog()).toBeNull();
  });
});
