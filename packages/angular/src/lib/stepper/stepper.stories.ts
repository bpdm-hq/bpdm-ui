import { Component, inject, input, output, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import {
  BpdmStep,
  BpdmStepItem,
  BpdmStepList,
  BpdmStepPanel,
  BpdmStepPanels,
  BpdmStepper,
} from "./stepper";

/** Shared Back/Next/Finish bar — drives the enclosing stepper via DI. */
@Component({
  selector: "demo-step-nav",
  imports: [BpdmButton],
  template: `
    <div class="mt-4 flex items-center justify-between">
      <button bpdmButton variant="ghost" size="sm" (click)="s.back()" [disabled]="s.isFirst()">
        Back
      </button>
      @if (s.isLast()) {
        <button bpdmButton size="sm" (click)="finish()">Finish</button>
      } @else {
        <button bpdmButton size="sm" (click)="s.next()" [disabled]="!canNext()">Next</button>
      }
    </div>
  `,
})
class StepNav {
  protected readonly s = inject(BpdmStepper);
  readonly canNext = input(true);
  readonly finished = output<void>();
  protected finish(): void {
    this.s.complete();
    this.finished.emit();
  }
}

const BOX = "rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground";

@Component({
  selector: "demo-stepper-horizontal",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav],
  template: `
    <div class="w-full max-w-2xl">
      <bpdm-stepper defaultValue="1" [linear]="linear()">
        <bpdm-step-list>
          <bpdm-step value="1">Account</bpdm-step>
          <bpdm-step value="2">Workspace</bpdm-step>
          <bpdm-step value="3">Review</bpdm-step>
        </bpdm-step-list>
        <bpdm-step-panels>
          <bpdm-step-panel value="1"><div class="${BOX}">Tell us who you are — name and email.</div></bpdm-step-panel>
          <bpdm-step-panel value="2"><div class="${BOX}">Name your workspace and pick a URL.</div></bpdm-step-panel>
          <bpdm-step-panel value="3"><div class="${BOX}">Everything looks good — review and finish.</div></bpdm-step-panel>
        </bpdm-step-panels>
        <demo-step-nav (finished)="done()" />
      </bpdm-stepper>
    </div>
  `,
})
class HorizontalDemo {
  readonly linear = input(false);
  protected done(): void {
    window.alert("Done ✓");
  }
}

@Component({
  selector: "demo-stepper-vertical",
  imports: [BpdmStepper, BpdmStepItem, BpdmStep, BpdmStepPanel, StepNav],
  template: `
    <div class="w-full max-w-xl">
      <bpdm-stepper orientation="vertical" defaultValue="1">
        <bpdm-step-item value="1">
          <bpdm-step>Account</bpdm-step>
          <bpdm-step-panel><div class="${BOX}">Tell us who you are — name and email.</div><demo-step-nav /></bpdm-step-panel>
        </bpdm-step-item>
        <bpdm-step-item value="2">
          <bpdm-step>Workspace</bpdm-step>
          <bpdm-step-panel><div class="${BOX}">Name your workspace and pick a URL.</div><demo-step-nav /></bpdm-step-panel>
        </bpdm-step-item>
        <bpdm-step-item value="3">
          <bpdm-step>Review</bpdm-step>
          <bpdm-step-panel><div class="${BOX}">Everything looks good — review and finish.</div><demo-step-nav (finished)="done()" /></bpdm-step-panel>
        </bpdm-step-item>
      </bpdm-stepper>
    </div>
  `,
})
class VerticalDemo {
  protected done(): void {
    window.alert("Done ✓");
  }
}

@Component({
  selector: "demo-stepper-validated",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav, BpdmInput],
  template: `
    <div class="w-full max-w-xl">
      <bpdm-stepper defaultValue="account" linear lockIndicator>
        <bpdm-step-list>
          <bpdm-step value="account">Account</bpdm-step>
          <bpdm-step value="workspace">Workspace</bpdm-step>
          <bpdm-step value="review">Review</bpdm-step>
        </bpdm-step-list>
        <bpdm-step-panels>
          <bpdm-step-panel value="account">
            <div class="space-y-3 py-2">
              <input bpdmInput placeholder="Full name" [value]="name()" (input)="name.set($any($event.target).value)" />
              <input bpdmInput placeholder="Email" type="email" [value]="email()" (input)="email.set($any($event.target).value)" />
              <p class="text-xs text-muted-foreground">
                {{ valid() ? "Looks good — you can continue." : "Enter your name and a valid email to continue." }}
              </p>
            </div>
            <demo-step-nav [canNext]="valid()" />
          </bpdm-step-panel>
          <bpdm-step-panel value="workspace">
            <div class="${BOX}">Name your workspace and pick a URL.</div>
            <demo-step-nav [canNext]="true" />
          </bpdm-step-panel>
          <bpdm-step-panel value="review">
            <div class="${BOX}">Everything looks good — review and finish.</div>
            <demo-step-nav [canNext]="true" (finished)="done()" />
          </bpdm-step-panel>
        </bpdm-step-panels>
      </bpdm-stepper>
    </div>
  `,
})
class ValidatedDemo {
  protected readonly name = signal("");
  protected readonly email = signal("");
  protected valid(): boolean {
    return this.name().trim().length > 0 && /.+@.+\..+/.test(this.email());
  }
  protected done(): void {
    window.alert("Created ✓");
  }
}

@Component({
  selector: "demo-stepper-steps-only",
  imports: [BpdmStepper, BpdmStepList, BpdmStep],
  template: `
    <div class="w-full max-w-2xl">
      <bpdm-stepper defaultValue="design">
        <bpdm-step-list>
          <bpdm-step value="design">Design</bpdm-step>
          <bpdm-step value="development">Development</bpdm-step>
          <bpdm-step value="qa">QA</bpdm-step>
        </bpdm-step-list>
      </bpdm-stepper>
    </div>
  `,
})
class StepsOnlyDemo {}

@Component({
  selector: "demo-stepper-template",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav, BpdmInput],
  template: `
    <div class="w-full max-w-xl">
      <bpdm-stepper defaultValue="account">
        <bpdm-step-list>
          <bpdm-step value="account" [icon]="user">Account</bpdm-step>
          <bpdm-step value="preferences" [icon]="sliders">Preferences</bpdm-step>
          <bpdm-step value="review" [icon]="list">Review</bpdm-step>
        </bpdm-step-list>
        <bpdm-step-panels>
          <bpdm-step-panel value="account"><div class="space-y-3 py-2"><input bpdmInput placeholder="Full name" /><input bpdmInput placeholder="Email" type="email" /></div></bpdm-step-panel>
          <bpdm-step-panel value="preferences"><div class="space-y-3 py-2"><input bpdmInput placeholder="Workspace name" /><input bpdmInput placeholder="URL slug" /></div></bpdm-step-panel>
          <bpdm-step-panel value="review"><div class="${BOX}">Confirm your details and finish creating the workspace.</div></bpdm-step-panel>
        </bpdm-step-panels>
        <demo-step-nav (finished)="done()" />
      </bpdm-stepper>
    </div>
    <ng-template #user><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg></ng-template>
    <ng-template #sliders><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4" /><line x1="10" x2="3" y1="4" y2="4" /><line x1="21" x2="12" y1="12" y2="12" /><line x1="8" x2="3" y1="12" y2="12" /><line x1="21" x2="16" y1="20" y2="20" /><line x1="12" x2="3" y1="20" y2="20" /><line x1="14" x2="14" y1="2" y2="6" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="16" x2="16" y1="18" y2="22" /></svg></ng-template>
    <ng-template #list><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4" /><path d="m3 7 2 2 4-4" /><path d="M13 6h8" /><path d="M13 12h8" /><path d="M13 18h8" /></svg></ng-template>
  `,
})
class TemplateDemo {
  protected done(): void {
    window.alert("Created ✓");
  }
}

@Component({
  selector: "demo-stepper-five",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav],
  template: `
    <div class="w-full max-w-3xl">
      <bpdm-stepper defaultValue="account">
        <bpdm-step-list>
          @for (s of steps; track s.value) {
            <bpdm-step [value]="s.value">{{ s.label }}</bpdm-step>
          }
        </bpdm-step-list>
        <bpdm-step-panels>
          @for (s of steps; track s.value) {
            <bpdm-step-panel [value]="s.value"><div class="${BOX}">{{ s.body }}</div></bpdm-step-panel>
          }
        </bpdm-step-panels>
        <demo-step-nav (finished)="done()" />
      </bpdm-stepper>
    </div>
  `,
})
class FiveStepsDemo {
  protected readonly steps = [
    { value: "account", label: "Account", body: "Tell us who you are — name and email." },
    { value: "team", label: "Team", body: "Invite teammates and assign roles." },
    { value: "project", label: "Project", body: "Create your first project." },
    { value: "integrations", label: "Integrations", body: "Connect the tools you already use." },
    { value: "review", label: "Review", body: "Everything looks good — review and finish." },
  ];
  protected done(): void {
    window.alert("Done ✓");
  }
}

@Component({
  selector: "demo-stepper-two",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav],
  template: `
    <div class="w-full max-w-xl">
      <bpdm-stepper defaultValue="details">
        <bpdm-step-list>
          <bpdm-step value="details">Details</bpdm-step>
          <bpdm-step value="confirm">Confirm</bpdm-step>
        </bpdm-step-list>
        <bpdm-step-panels>
          <bpdm-step-panel value="details"><div class="${BOX}">Enter the details for your new project.</div></bpdm-step-panel>
          <bpdm-step-panel value="confirm"><div class="${BOX}">Review and confirm to create it.</div></bpdm-step-panel>
        </bpdm-step-panels>
        <demo-step-nav (finished)="done()" />
      </bpdm-stepper>
    </div>
  `,
})
class TwoStepsDemo {
  protected done(): void {
    window.alert("Created ✓");
  }
}

@Component({
  selector: "demo-stepper-controlled",
  imports: [BpdmStepper, BpdmStepList, BpdmStep, BpdmStepPanels, BpdmStepPanel, StepNav],
  template: `
    <div class="w-full max-w-2xl space-y-3">
      <p class="text-sm text-muted-foreground">
        Active step: <span class="font-medium text-foreground">{{ value() }}</span>
      </p>
      <bpdm-stepper [value]="value()" (valueChange)="value.set($event)">
        <bpdm-step-list>
          <bpdm-step value="1">Account</bpdm-step>
          <bpdm-step value="2">Workspace</bpdm-step>
          <bpdm-step value="3">Review</bpdm-step>
        </bpdm-step-list>
        <bpdm-step-panels>
          <bpdm-step-panel value="1"><div class="${BOX}">Step one content.</div></bpdm-step-panel>
          <bpdm-step-panel value="2"><div class="${BOX}">Step two content.</div></bpdm-step-panel>
          <bpdm-step-panel value="3"><div class="${BOX}">Step three content.</div></bpdm-step-panel>
        </bpdm-step-panels>
        <demo-step-nav />
      </bpdm-stepper>
    </div>
  `,
})
class ControlledDemo {
  protected readonly value = signal("1");
}

const usage = `
A step-by-step flow. State lives in \`<bpdm-stepper>\` (controlled via \`[(value)]\` or
uncontrolled via \`defaultValue\`); steps are ordered by declaration. Horizontal
(\`<bpdm-step-list>\` + \`<bpdm-step-panels>\`) or vertical (\`<bpdm-step-item>\`), with
optional \`linear\` gating. Inject \`BpdmStepper\` in a Back/Next bar to drive it.

\`\`\`html
<bpdm-stepper defaultValue="1">
  <bpdm-step-list>
    <bpdm-step value="1">Account</bpdm-step>
    <bpdm-step value="2">Review</bpdm-step>
  </bpdm-step-list>
  <bpdm-step-panels>
    <bpdm-step-panel value="1">…</bpdm-step-panel>
    <bpdm-step-panel value="2">…</bpdm-step-panel>
  </bpdm-step-panels>
</bpdm-stepper>
\`\`\`
`;

const ALL = [
  HorizontalDemo,
  VerticalDemo,
  ValidatedDemo,
  StepsOnlyDemo,
  TemplateDemo,
  FiveStepsDemo,
  TwoStepsDemo,
  ControlledDemo,
];

const meta: Meta = {
  title: "Navigation/Stepper",
  decorators: [moduleMetadata({ imports: ALL })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
};
export default meta;

type Story = StoryObj;

export const Horizontal: Story = { render: () => ({ template: `<demo-stepper-horizontal />` }) };
/** Content sits inline under each step header. */
export const Vertical: Story = { render: () => ({ template: `<demo-stepper-vertical />` }) };
/** Linear — future steps aren't clickable until reached; advance with Next. */
export const Linear: Story = {
  render: () => ({ template: `<demo-stepper-horizontal [linear]="true" />` }),
};
/** Gated progression — Next stays disabled until the step's content is valid. */
export const Validated: Story = { render: () => ({ template: `<demo-stepper-validated />` }) };
/** Just the progress indicator (no panels) — clickable steps. */
export const StepsOnly: Story = { render: () => ({ template: `<demo-stepper-steps-only />` }) };
/** Custom marker icons + form content. */
export const Template: Story = { render: () => ({ template: `<demo-stepper-template />` }) };
/** As few as two steps. */
export const TwoSteps: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-stepper-two />` }),
};
/** Step count is fully configurable — here are five. */
export const FiveSteps: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-stepper-five />` }),
};
/** Controlled from outside — single source of truth in your own state. */
export const Controlled: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-stepper-controlled />` }),
};
