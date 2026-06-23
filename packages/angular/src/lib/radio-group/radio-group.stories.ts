import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmRadio, BpdmRadioGroup } from "./radio-group";

/**
 * Single-select radio group with three item sizes and vertical/horizontal layout.
 * Works with `[(ngModel)]` / reactive forms or `[(value)]`.
 */
const meta: Meta<BpdmRadioGroup> = {
  title: "Selection/RadioGroup",
  decorators: [moduleMetadata({ imports: [BpdmRadioGroup, BpdmRadio] })],
  tags: ["autodocs"],
  render: (args) => ({
    props: args,
    template: `<bpdm-radio-group [value]="'pro'">
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="free" /> Free</label>
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="pro" /> Pro</label>
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="team" /> Team</label>
</bpdm-radio-group>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmRadioGroup>;

/** A plan selector. */
export const Plan: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmRadioGroup, BpdmRadio } from '@bpdm/ng';

@Component({
  selector: 'app-radio-plan',
  imports: [BpdmRadioGroup, BpdmRadio, FormsModule],
  template: \`
    <bpdm-radio-group [(ngModel)]="plan">
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="free" /> Free</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="pro" /> Pro</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="team" /> Team</label>
    </bpdm-radio-group>
  \`,
})
export class RadioPlanComponent {
  plan = 'pro';
}`,
      },
    },
  },
};

/** Laid out in a row. */
export const Horizontal: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-radio-group orientation="horizontal" [value]="'sm'">
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="sm" /> Small</label>
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="md" /> Medium</label>
  <label class="flex cursor-pointer items-center gap-2 text-sm"><bpdm-radio value="lg" /> Large</label>
</bpdm-radio-group>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmRadioGroup, BpdmRadio } from '@bpdm/ng';

@Component({
  selector: 'app-radio-horizontal',
  imports: [BpdmRadioGroup, BpdmRadio],
  template: \`
    <bpdm-radio-group orientation="horizontal" [value]="'sm'">
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="sm" /> Small</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="md" /> Medium</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="lg" /> Large</label>
    </bpdm-radio-group>
  \`,
})
export class RadioHorizontalComponent {}`,
      },
    },
  },
};

/** Three item sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-radio-group orientation="horizontal" [value]="'a'">
  <bpdm-radio value="a" size="sm" />
  <bpdm-radio value="b" size="md" />
  <bpdm-radio value="c" size="lg" />
</bpdm-radio-group>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmRadioGroup, BpdmRadio } from '@bpdm/ng';

@Component({
  selector: 'app-radio-sizes',
  imports: [BpdmRadioGroup, BpdmRadio],
  template: \`
    <bpdm-radio-group orientation="horizontal" [value]="'a'">
      <bpdm-radio value="a" size="sm" />
      <bpdm-radio value="b" size="md" />
      <bpdm-radio value="c" size="lg" />
    </bpdm-radio-group>
  \`,
})
export class RadioSizesComponent {}`,
      },
    },
  },
};

/** A disabled group. */
export const Disabled: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { dis: true },
    template: `<bpdm-radio-group [value]="'pro'" [disabled]="dis">
  <label class="flex items-center gap-2 text-sm opacity-70"><bpdm-radio value="free" /> Free</label>
  <label class="flex items-center gap-2 text-sm opacity-70"><bpdm-radio value="pro" /> Pro</label>
</bpdm-radio-group>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BpdmRadioGroup, BpdmRadio } from '@bpdm/ng';

@Component({
  selector: 'app-radio-disabled',
  imports: [BpdmRadioGroup, BpdmRadio, ReactiveFormsModule],
  template: \`
    <bpdm-radio-group [formControl]="plan">
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="free" /> Free</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="pro" /> Pro</label>
    </bpdm-radio-group>
  \`,
})
export class RadioDisabledComponent {
  readonly plan = new FormControl({ value: 'pro', disabled: true });
}`,
      },
    },
  },
};

/** Invalid state on the items. */
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-radio-group>
  <label class="flex items-center gap-2 text-sm"><bpdm-radio value="yes" aria-invalid="true" /> Yes</label>
  <label class="flex items-center gap-2 text-sm"><bpdm-radio value="no" aria-invalid="true" /> No</label>
</bpdm-radio-group>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmRadioGroup, BpdmRadio } from '@bpdm/ng';

@Component({
  selector: 'app-radio-invalid',
  imports: [BpdmRadioGroup, BpdmRadio],
  template: \`
    <bpdm-radio-group>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="yes" aria-invalid="true" /> Yes</label>
      <label class="flex items-center gap-2 text-sm"><bpdm-radio value="no" aria-invalid="true" /> No</label>
    </bpdm-radio-group>
  \`,
})
export class RadioInvalidComponent {}`,
      },
    },
  },
};
