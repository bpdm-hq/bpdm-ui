import { ApplicationRef, Component, computed, TemplateRef, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmStepDialog, BpdmStepDialogTrigger, type StepDialogStep } from "./step-dialog";

@Component({
  imports: [BpdmStepDialog, BpdmStepDialogTrigger],
  template: `
    <bpdm-step-dialog title="Wizard" [steps]="steps()">
      <button bpdmStepDialogTrigger>Start</button>
    </bpdm-step-dialog>
    <ng-template #a><p>Step A body</p></ng-template>
    <ng-template #b><p>Step B body</p></ng-template>
  `,
})
class Host {
  private readonly a = viewChild<TemplateRef<unknown>>("a");
  private readonly b = viewChild<TemplateRef<unknown>>("b");
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
});
