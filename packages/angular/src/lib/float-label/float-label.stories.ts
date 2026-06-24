import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmFloatLabel } from "./float-label";
import { BpdmInput } from "../input/input";

/**
 * Floating-label wrapper — wrap a single input; the label sits as a placeholder
 * and floats up on focus or when filled. Three looks: `over` (above the field),
 * `in` (top inside), `on` (a notch on the border).
 */
const meta: Meta<BpdmFloatLabel> = {
  title: "Inputs/FloatLabel",
  component: BpdmFloatLabel,
  decorators: [moduleMetadata({ imports: [BpdmFloatLabel, BpdmInput] })],
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    variant: { control: "inline-radio", options: ["over", "in", "on"] },
  },
  args: { label: "Email", variant: "over" },
  render: (args) => ({
    props: args,
    template: `<div class="w-80 pt-2">
  <bpdm-float-label [label]="label" [variant]="variant" htmlFor="fl-demo">
    <input bpdmInput id="fl-demo" />
  </bpdm-float-label>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmFloatLabel>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BpdmFloatLabel, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-floatlabel-demo',
  imports: [BpdmFloatLabel, BpdmInput, FormsModule],
  template: \`
    <bpdm-float-label label="Email" htmlFor="email">
      <input bpdmInput id="email" [(ngModel)]="email" />
    </bpdm-float-label>
  \`,
})
export class FloatLabelDemoComponent {
  email = '';
}`,
      },
    },
  },
};

/** The three looks. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-6 pt-2">
  <bpdm-float-label label="Over (default)" variant="over" htmlFor="fl-over"><input bpdmInput id="fl-over" /></bpdm-float-label>
  <bpdm-float-label label="In" variant="in" htmlFor="fl-in"><input bpdmInput id="fl-in" /></bpdm-float-label>
  <bpdm-float-label label="On the border" variant="on" htmlFor="fl-on"><input bpdmInput id="fl-on" /></bpdm-float-label>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmFloatLabel, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-floatlabel-variants',
  imports: [BpdmFloatLabel, BpdmInput],
  template: \`
    <div class="flex w-80 flex-col gap-6">
      <bpdm-float-label label="Over (default)" variant="over" htmlFor="a"><input bpdmInput id="a" /></bpdm-float-label>
      <bpdm-float-label label="In" variant="in" htmlFor="b"><input bpdmInput id="b" /></bpdm-float-label>
      <bpdm-float-label label="On the border" variant="on" htmlFor="c"><input bpdmInput id="c" /></bpdm-float-label>
    </div>
  \`,
})
export class FloatLabelVariantsComponent {}`,
      },
    },
  },
};

/** Pre-filled — the label stays floated when the field has a value. */
export const Filled: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-80 pt-2">
  <bpdm-float-label label="Full name" htmlFor="fl-filled">
    <input bpdmInput id="fl-filled" value="Ada Lovelace" />
  </bpdm-float-label>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmFloatLabel, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-floatlabel-filled',
  imports: [BpdmFloatLabel, BpdmInput],
  template: \`
    <bpdm-float-label label="Full name" htmlFor="name">
      <input bpdmInput id="name" value="Ada Lovelace" />
    </bpdm-float-label>
  \`,
})
export class FloatLabelFilledComponent {}`,
      },
    },
  },
};
