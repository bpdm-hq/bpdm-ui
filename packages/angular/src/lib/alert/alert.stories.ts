import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmAlert } from "./alert";
import { BpdmButton } from "../button/button";

/**
 * `<bpdm-alert>` — an inline, persistent alert with a colored accent, status
 * icon, title and body. Same tones as the React alert.
 */
const meta: Meta<BpdmAlert> = {
  title: "Feedback/Alert",
  decorators: [moduleMetadata({ imports: [BpdmAlert, BpdmButton] })],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "info", "success", "warning", "error"],
      description: "Color + default icon",
    },
    title: { control: "text", description: "Bold heading line" },
    dismissible: { control: "boolean", description: "Show a dismiss button" },
    showIcon: { control: "boolean", description: "Show the leading status icon" },
  },
  args: { variant: "info", title: "Heads up", dismissible: false, showIcon: true },
  render: (args) => ({
    props: args,
    template: `<bpdm-alert [variant]="variant" [title]="title" [dismissible]="dismissible" [showIcon]="showIcon">
  This is the alert body — a short, helpful message.
</bpdm-alert>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmAlert>;

/** Play with every option from the controls panel. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';

@Component({
  selector: 'app-alert-demo',
  imports: [BpdmAlert],
  template: \`
    <bpdm-alert variant="info" title="Heads up">
      This is the alert body — a short, helpful message.
    </bpdm-alert>
  \`,
})
export class AlertDemoComponent {}`,
      },
    },
  },
};

/** Every status color. */
export const Variants: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-col gap-3">
  <bpdm-alert variant="default" title="Note">A neutral, informational message.</bpdm-alert>
  <bpdm-alert variant="info" title="Did you know?">Tokens are shared across frameworks.</bpdm-alert>
  <bpdm-alert variant="success" title="Saved">Your changes have been published.</bpdm-alert>
  <bpdm-alert variant="warning" title="Heads up">Your trial ends in three days.</bpdm-alert>
  <bpdm-alert variant="error" title="Something went wrong">We couldn't reach the server.</bpdm-alert>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';

@Component({
  selector: 'app-alert-variants',
  imports: [BpdmAlert],
  template: \`
    <div class="flex flex-col gap-3">
      <bpdm-alert variant="default" title="Note">A neutral, informational message.</bpdm-alert>
      <bpdm-alert variant="info" title="Did you know?">Tokens are shared across frameworks.</bpdm-alert>
      <bpdm-alert variant="success" title="Saved">Your changes have been published.</bpdm-alert>
      <bpdm-alert variant="warning" title="Heads up">Your trial ends in three days.</bpdm-alert>
      <bpdm-alert variant="error" title="Something went wrong">We couldn't reach the server.</bpdm-alert>
    </div>
  \`,
})
export class AlertVariantsComponent {}`,
      },
    },
  },
};

/** Dismissible, with an actions slot. */
export const Dismissible: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-alert variant="warning" title="Unsaved changes" dismissible>
  You have edits that haven't been saved yet.
  <div bpdmAlertActions>
    <button bpdmButton size="sm" variant="outline">Discard</button>
    <button bpdmButton size="sm">Save now</button>
  </div>
</bpdm-alert>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-alert-dismissible',
  imports: [BpdmAlert, BpdmButton],
  template: \`
    <bpdm-alert variant="warning" title="Unsaved changes" dismissible (closed)="onClose()">
      You have edits that haven't been saved yet.
      <div bpdmAlertActions>
        <button bpdmButton size="sm" variant="outline">Discard</button>
        <button bpdmButton size="sm">Save now</button>
      </div>
    </bpdm-alert>
  \`,
})
export class AlertDismissibleComponent {
  onClose() {}
}`,
      },
    },
  },
};
