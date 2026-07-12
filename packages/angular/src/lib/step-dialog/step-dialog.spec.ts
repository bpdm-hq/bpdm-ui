import { ApplicationRef, Component, computed, signal, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmStepDialog,
  BpdmStepDialogTrigger,
  type StepDialogMessages,
  type StepDialogStep,
} from "./step-dialog";

@Component({
  imports: [BpdmStepDialog, BpdmStepDialogTrigger],
  template: `
    <bpdm-step-dialog
      title="Wizard"
      [steps]="steps()"
      [messages]="messages()"
      [finishText]="finishText()"
    >
      <button bpdmStepDialogTrigger>Start</button>
    </bpdm-step-dialog>
    <ng-template #a><p>Step A body</p></ng-template>
    <ng-template #b><p>Step B body</p></ng-template>
  `,
})
class Host {
  private readonly a = viewChild<TemplateRef<unknown>>("a");
  private readonly b = viewChild<TemplateRef<unknown>>("b");
  readonly messages = signal<Partial<StepDialogMessages>>({});
  readonly finishText = signal("");
  readonly steps = computed<StepDialogStep[]>(() => {
    const a = this.a();
    const b = this.b();
    return a && b
      ? [
          { title: "A", content: a },
          { title: "B", content: b },
        ]
      : [];
  });
}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));
const getDialog = () => document.querySelector('[role="dialog"]') as HTMLElement | null;

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

function dialogButton(text: string): HTMLElement {
  return Array.from(getDialog()!.querySelectorAll("button")).find((b) =>
    b.textContent?.includes(text),
  ) as HTMLElement;
}

describe("BpdmStepDialog", () => {
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("opens at the first step and advances with Next", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    expect(getDialog()?.textContent).toContain("Step A body");
    dialogButton("Next").click();
    await settle();

    expect(getDialog()?.textContent).toContain("Step B body");
    // last step shows Finish
    expect(dialogButton("Finish")).toBeTruthy();
  });

  it("localizes Back / Next / Finish and the sr-only progress via messages", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.messages.set({
      back: "Zurück",
      next: "Weiter",
      finish: "Fertig",
      step: "Schritt {index} von {total}",
    });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    expect(getDialog()?.textContent).toContain("Schritt 1 von 2");
    dialogButton("Weiter").click();
    await settle();

    expect(getDialog()?.textContent).toContain("Schritt 2 von 2");
    expect(dialogButton("Zurück")).toBeTruthy();
    expect(dialogButton("Fertig")).toBeTruthy();
  });

  it("interpolates the sr-only progress text as the step changes", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    const progress = () => getDialog()!.querySelector(".sr-only")?.textContent?.trim();
    expect(progress()).toBe("Step 1 of 2");

    dialogButton("Next").click();
    await settle();
    expect(progress()).toBe("Step 2 of 2");
  });

  it("marks the active step's <li> with aria-current='step'", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    let active = getDialog()!.querySelector('li[aria-current="step"]');
    expect(active?.textContent).toContain("A");
    expect(getDialog()!.querySelectorAll('li[aria-current="step"]').length).toBe(1);

    dialogButton("Next").click();
    await settle();
    active = getDialog()!.querySelector('li[aria-current="step"]');
    expect(active?.textContent).toContain("B");
  });

  it("lets the finishText input override messages.finish", async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.finishText.set("Done");
    fixture.componentInstance.messages.set({ finish: "Fertig" });
    fixture.detectChanges();

    (fixture.nativeElement.querySelector("button") as HTMLElement).click();
    await settle();

    dialogButton("Next").click();
    await settle();

    expect(dialogButton("Done")).toBeTruthy();
    expect(dialogButton("Fertig")).toBeFalsy();
  });
});
