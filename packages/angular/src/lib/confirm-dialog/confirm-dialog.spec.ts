import { ApplicationRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmConfirm, provideBpdmConfirmMessages } from "./confirm-dialog";

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

function buttonWithText(text: string): HTMLElement {
  return Array.from(getDialog()!.querySelectorAll("button")).find((b) =>
    b.textContent?.includes(text),
  ) as HTMLElement;
}

describe("BpdmConfirm", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens with the title and resolves true on confirm", async () => {
    const service = TestBed.inject(BpdmConfirm);
    const result = service.confirm({ title: "Delete project?", confirmText: "Delete" });
    await settle();

    expect(getDialog()?.textContent).toContain("Delete project?");
    buttonWithText("Delete").click();

    expect(await result).toBe(true);
  });

  it("resolves false on cancel", async () => {
    const service = TestBed.inject(BpdmConfirm);
    const result = service.confirm({ cancelText: "Cancel" });
    await settle();

    buttonWithText("Cancel").click();

    expect(await result).toBe(false);
  });

  it("localizes the default title and buttons via provideBpdmConfirmMessages", async () => {
    TestBed.configureTestingModule({
      providers: [
        provideBpdmConfirmMessages({ confirm: "Bestätigen", cancel: "Abbrechen", title: "Sicher?" }),
      ],
    });

    const service = TestBed.inject(BpdmConfirm);
    const result = service.confirm();
    await settle();

    expect(getDialog()?.textContent).toContain("Sicher?");
    expect(buttonWithText("Bestätigen")).toBeTruthy();
    expect(buttonWithText("Abbrechen")).toBeTruthy();

    buttonWithText("Bestätigen").click();
    expect(await result).toBe(true);
  });
});
