import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmAlert, BpdmAlertActions } from "./alert";
import { BpdmButton } from "../button/button";

/**
 * Inline, persistent alert — a colored left accent, a tinted icon, a title and
 * body, with optional actions and a dismiss button. Five variants
 * (`default`, `info`, `success`, `warning`, `error`), theme-aware across all
 * themes. For transient pop-up notifications use a toast instead.
 */
const meta: Meta<BpdmAlert> = {
  title: "Feedback/Alert",
  component: BpdmAlert,
  decorators: [moduleMetadata({ imports: [BpdmAlert, BpdmAlertActions, BpdmButton] })],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "error"],
    },
    title: { control: "text" },
    dismissible: { control: "boolean" },
    showIcon: { control: "boolean" },
  },
  args: {
    variant: "info",
    title: "Scheduled maintenance",
    dismissible: false,
    showIcon: true,
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-full max-w-xl">
  <bpdm-alert [variant]="variant" [title]="title" [dismissible]="dismissible" [showIcon]="showIcon">
    The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.
  </bpdm-alert>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmAlert>;

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
    <bpdm-alert variant="info" title="Scheduled maintenance">
      The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.
    </bpdm-alert>
  \`,
})
export class AlertDemoComponent {}`,
      },
    },
  },
};

/** All five variants stacked. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex w-full max-w-xl flex-col gap-3">
  <bpdm-alert variant="info" title="Scheduled maintenance">The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.</bpdm-alert>
  <bpdm-alert variant="success" title="Deployment complete">Build #482 is live in production.</bpdm-alert>
  <bpdm-alert variant="warning" title="Approaching seat limit">Your workspace is using 18 of 20 member seats.</bpdm-alert>
  <bpdm-alert variant="error" title="Build failed">3 checks failed on the latest commit. Review the logs to continue.</bpdm-alert>
  <bpdm-alert variant="default" title="Heads up">Two-factor authentication is recommended for every team member.</bpdm-alert>
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
    <div class="flex w-full max-w-xl flex-col gap-3">
      <bpdm-alert variant="info" title="Scheduled maintenance">The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.</bpdm-alert>
      <bpdm-alert variant="success" title="Deployment complete">Build #482 is live in production.</bpdm-alert>
      <bpdm-alert variant="warning" title="Approaching seat limit">Your workspace is using 18 of 20 member seats.</bpdm-alert>
      <bpdm-alert variant="error" title="Build failed">3 checks failed on the latest commit. Review the logs to continue.</bpdm-alert>
      <bpdm-alert variant="default" title="Heads up">Two-factor authentication is recommended for every team member.</bpdm-alert>
    </div>
  \`,
})
export class AlertVariantsComponent {}`,
      },
    },
  },
};

/** Title + body + action buttons. */
export const WithActions: Story = {
  render: () => ({
    template: `<div class="w-full max-w-xl">
  <bpdm-alert variant="warning" title="Approaching seat limit">
    Your workspace is using 18 of 20 member seats. Upgrade to add more.
    <div bpdmAlertActions>
      <button bpdmButton size="sm">Upgrade plan</button>
      <button bpdmButton size="sm" variant="ghost">Manage members</button>
    </div>
  </bpdm-alert>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert, BpdmAlertActions, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-alert-actions',
  imports: [BpdmAlert, BpdmAlertActions, BpdmButton],
  template: \`
    <bpdm-alert variant="warning" title="Approaching seat limit">
      Your workspace is using 18 of 20 member seats. Upgrade to add more.
      <div bpdmAlertActions>
        <button bpdmButton size="sm">Upgrade plan</button>
        <button bpdmButton size="sm" variant="ghost">Manage members</button>
      </div>
    </bpdm-alert>
  \`,
})
export class AlertActionsComponent {}`,
      },
    },
  },
};

/** Dismissable — the alert collapses and emits `closed`. */
export const Dismissible: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-full max-w-xl">
  <bpdm-alert variant="success" title="Invite sent" dismissible>
    We emailed an invitation to the new project member.
  </bpdm-alert>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';

@Component({
  selector: 'app-alert-dismissible',
  imports: [BpdmAlert],
  template: \`
    <bpdm-alert variant="success" title="Invite sent" dismissible (closed)="onClose()">
      We emailed an invitation to the new project member.
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

/** Title only, no body. */
export const TitleOnly: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-full max-w-xl">
  <bpdm-alert variant="info" title="Your changes have been saved." />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';

@Component({
  selector: 'app-alert-title-only',
  imports: [BpdmAlert],
  template: \`<bpdm-alert variant="info" title="Your changes have been saved." />\`,
})
export class AlertTitleOnlyComponent {}`,
      },
    },
  },
};

/** Hide the leading icon. */
export const NoIcon: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-full max-w-xl">
  <bpdm-alert variant="default" [showIcon]="false" title="Release notes">
    Version 2.4 adds keyboard navigation across the whole console.
  </bpdm-alert>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmAlert } from '@bpdm/ng';

@Component({
  selector: 'app-alert-no-icon',
  imports: [BpdmAlert],
  template: \`
    <bpdm-alert variant="default" [showIcon]="false" title="Release notes">
      Version 2.4 adds keyboard navigation across the whole console.
    </bpdm-alert>
  \`,
})
export class AlertNoIconComponent {}`,
      },
    },
  },
};
