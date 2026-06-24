import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmCheckbox } from "./checkbox";

/**
 * Accessible checkbox — three sizes, an indeterminate state, and an invalid state
 * (`aria-invalid`). Works with `[(ngModel)]` / reactive forms or `[(checked)]`.
 */
const meta: Meta<BpdmCheckbox> = {
  title: "Selection/Checkbox",
  component: BpdmCheckbox,
  decorators: [moduleMetadata({ imports: [BpdmCheckbox] })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    indeterminate: { control: "boolean" },
  },
  args: { size: "md", indeterminate: false },
  render: (args) => ({
    props: args,
    // no [checked] binding — the checkbox self-manages clicks (a one-way arg
    // binding would fight the toggle and flicker)
    template: `<bpdm-checkbox [size]="size" [indeterminate]="indeterminate"></bpdm-checkbox>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmCheckbox>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-demo',
  imports: [BpdmCheckbox, FormsModule],
  template: \`<bpdm-checkbox [(ngModel)]="agreed" />\`,
})
export class CheckboxDemoComponent {
  agreed = false;
}`,
      },
    },
  },
};

/** Unchecked, checked, indeterminate, disabled. */
export const States: Story = {
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-checkbox />
  <bpdm-checkbox [checked]="true" />
  <bpdm-checkbox indeterminate />
  <bpdm-checkbox disabled [checked]="true" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-states',
  imports: [BpdmCheckbox],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-checkbox />
      <bpdm-checkbox [checked]="true" />
      <bpdm-checkbox indeterminate />
      <bpdm-checkbox disabled [checked]="true" />
    </div>
  \`,
})
export class CheckboxStatesComponent {}`,
      },
    },
  },
};

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-4">
  <bpdm-checkbox size="sm" [checked]="true" />
  <bpdm-checkbox size="md" [checked]="true" />
  <bpdm-checkbox size="lg" [checked]="true" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-sizes',
  imports: [BpdmCheckbox],
  template: \`
    <div class="flex items-center gap-4">
      <bpdm-checkbox size="sm" [checked]="true" />
      <bpdm-checkbox size="md" [checked]="true" />
      <bpdm-checkbox size="lg" [checked]="true" />
    </div>
  \`,
})
export class CheckboxSizesComponent {}`,
      },
    },
  },
};

/** Paired with a clickable label. */
export const WithLabel: Story = {
  render: () => ({
    template: `<label class="flex cursor-pointer items-center gap-2 text-sm">
  <bpdm-checkbox [checked]="true" /> Email me about product updates
</label>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-label',
  imports: [BpdmCheckbox, FormsModule],
  template: \`
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <bpdm-checkbox [(ngModel)]="subscribed" /> Email me about product updates
    </label>
  \`,
})
export class CheckboxLabelComponent {
  subscribed = true;
}`,
      },
    },
  },
};

/** A group of options. */
export const Group: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-col gap-3 text-sm">
  <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox [checked]="true" /> Analytics</label>
  <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox [checked]="true" /> Deployments</label>
  <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox /> Billing</label>
  <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox /> Team activity</label>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-group',
  imports: [BpdmCheckbox],
  template: \`
    <div class="flex flex-col gap-3 text-sm">
      <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox [checked]="true" /> Analytics</label>
      <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox [checked]="true" /> Deployments</label>
      <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox /> Billing</label>
      <label class="flex cursor-pointer items-center gap-2"><bpdm-checkbox /> Team activity</label>
    </div>
  \`,
})
export class CheckboxGroupComponent {}`,
      },
    },
  },
};

/** Invalid state. */
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<label class="flex cursor-pointer items-center gap-2 text-sm">
  <bpdm-checkbox aria-invalid="true" /> I accept the terms (required)
</label>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCheckbox } from '@bpdm/ng';

@Component({
  selector: 'app-checkbox-invalid',
  imports: [BpdmCheckbox],
  template: \`
    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <bpdm-checkbox aria-invalid="true" /> I accept the terms (required)
    </label>
  \`,
})
export class CheckboxInvalidComponent {}`,
      },
    },
  },
};
