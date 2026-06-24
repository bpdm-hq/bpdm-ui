import { Component, computed, TemplateRef, viewChild } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import { BpdmStepDialog, BpdmStepDialogTrigger, type StepDialogStep } from "./step-dialog";

@Component({
  selector: "demo-step-dialog",
  imports: [BpdmStepDialog, BpdmStepDialogTrigger, BpdmButton, BpdmInput],
  template: `
    <bpdm-step-dialog title="Set up workspace" [steps]="steps()" (complete)="done()">
      <button bpdmButton bpdmStepDialogTrigger>Get started</button>
    </bpdm-step-dialog>

    <ng-template #account>
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Full name</label>
          <input bpdmInput value="Marco Rossi" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Email</label>
          <input bpdmInput value="marco@example.com" />
        </div>
      </div>
    </ng-template>
    <ng-template #workspace>
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Workspace name</label>
          <input bpdmInput value="Acme" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">URL slug</label>
          <input bpdmInput value="acme" />
        </div>
      </div>
    </ng-template>
    <ng-template #review>
      <p class="text-sm text-muted-foreground">
        Everything looks good. Click <strong>Finish</strong> to create your workspace.
      </p>
    </ng-template>
  `,
})
class StepDemo {
  private readonly account = viewChild<TemplateRef<unknown>>("account");
  private readonly workspace = viewChild<TemplateRef<unknown>>("workspace");
  private readonly review = viewChild<TemplateRef<unknown>>("review");

  protected readonly steps = computed<StepDialogStep[]>(() => {
    const a = this.account();
    const w = this.workspace();
    const r = this.review();
    if (!a || !w || !r) return [];
    return [
      { title: "Account", description: "Tell us about you.", content: a },
      { title: "Workspace", description: "Name your workspace.", content: w },
      { title: "Review", description: "Confirm and finish.", content: r },
    ];
  });

  protected done(): void {
    window.alert("Workspace created ✓");
  }
}

const usage = `
Multi-step "wizard" dialog — a progress stepper, per-step content, and
Back / Next / Finish navigation. Built on \`<bpdm-dialog>\`; the step resets when
closed, and \`(complete)\` fires on Finish.

\`\`\`html
<bpdm-step-dialog title="Set up workspace" [steps]="steps" (complete)="save()">
  <button bpdmButton bpdmStepDialogTrigger>Get started</button>
</bpdm-step-dialog>
\`\`\`
`;

const meta: Meta = {
  title: "Overlay/StepDialog",
  component: BpdmStepDialog,
  decorators: [moduleMetadata({ imports: [StepDemo] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
};
export default meta;

type Story = StoryObj;

/** A three-step setup wizard. */
export const Wizard: Story = {
  render: () => ({ template: `<demo-step-dialog />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmButton, BpdmInput, BpdmStepDialog, BpdmStepDialogTrigger, StepDialogStep } from '@bpdm/ng';

@Component({
  selector: 'app-setup-wizard',
  imports: [BpdmButton, BpdmInput, BpdmStepDialog, BpdmStepDialogTrigger],
  template: \`
    <bpdm-step-dialog title="Set up workspace" [steps]="steps()" (complete)="createWorkspace()">
      <button bpdmButton bpdmStepDialogTrigger>Get started</button>
    </bpdm-step-dialog>

    <ng-template #account>
      <div class="space-y-1.5"><label class="text-sm font-medium">Full name</label><input bpdmInput /></div>
    </ng-template>
    <ng-template #workspace>
      <div class="space-y-1.5"><label class="text-sm font-medium">Workspace name</label><input bpdmInput /></div>
    </ng-template>
    <ng-template #review><p>Everything looks good. Click Finish to create it.</p></ng-template>
  \`,
})
export class SetupWizardComponent {
  private account = viewChild<TemplateRef<unknown>>('account');
  private workspace = viewChild<TemplateRef<unknown>>('workspace');
  private review = viewChild<TemplateRef<unknown>>('review');

  steps = computed<StepDialogStep[]>(() => {
    const a = this.account(), w = this.workspace(), r = this.review();
    if (!a || !w || !r) return [];
    return [
      { title: 'Account', description: 'Your details', content: a },
      { title: 'Workspace', description: 'Name it', content: w },
      { title: 'Review', content: r },
    ];
  });

  createWorkspace() {}
}`,
      },
    },
  },
};
