import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmInputOtp } from "./input-otp";

/**
 * One-time-code input — one box per character with auto-advance,
 * backspace-to-previous, arrow-key navigation, and paste-to-fill. Controlled
 * (`[(value)]`) or uncontrolled (`defaultValue`); value is a string.
 *
 * ```html
 * <bpdm-input-otp [length]="6" integerOnly />
 * <bpdm-input-otp [length]="4" mask integerOnly />        <!-- hidden PIN -->
 * <bpdm-input-otp [(value)]="code" />
 * ```
 */
const meta: Meta<BpdmInputOtp> = {
  title: "Inputs/InputOtp",
  component: BpdmInputOtp,
  decorators: [moduleMetadata({ imports: [BpdmInputOtp] })],
  tags: ["autodocs"],
  argTypes: {
    length: { control: { type: "number", min: 2, max: 8 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    grouped: { control: "boolean" },
    groupSize: { control: { type: "number", min: 0, max: 6 } },
    separator: { control: "text" },
    mask: { control: "boolean" },
    integerOnly: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { length: 6, size: "md", integerOnly: true },
  render: (args) => ({
    props: args,
    template: `<bpdm-input-otp
  [length]="length"
  [size]="size"
  [grouped]="grouped"
  [groupSize]="groupSize"
  [separator]="separator"
  [mask]="mask"
  [integerOnly]="integerOnly"
  [disabled]="disabled"
/>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmInputOtp>;

export const Playground: Story = {};

// connected segments, auto-balanced into 2 groups (even → equal, odd → ceil+floor)
export const Grouped: Story = {
  args: { length: 6, grouped: true, separator: "−", integerOnly: true },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInputOtp } from '@bpdm/ng';

@Component({
  selector: 'app-otp-grouped',
  imports: [BpdmInputOtp],
  template: \`
    <!-- auto-balanced: 6 → 3-3, 8 → 4-4, 5 → 3-2 -->
    <bpdm-input-otp [length]="6" grouped separator="−" integerOnly />

    <!-- or fixed groups of a custom size -->
    <bpdm-input-otp [length]="9" [groupSize]="3" separator="−" integerOnly />
  \`,
})
export class OtpGroupedComponent {}`,
      },
    },
  },
};

// hidden characters for PINs
export const Masked: Story = {
  args: { length: 4, mask: true, integerOnly: true, defaultValue: "1" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInputOtp } from '@bpdm/ng';

@Component({
  selector: 'app-otp-masked',
  imports: [BpdmInputOtp],
  template: \`<bpdm-input-otp [length]="4" mask integerOnly />\`,
})
export class OtpMaskedComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-col gap-4">
  <bpdm-input-otp [length]="4" size="sm" integerOnly />
  <bpdm-input-otp [length]="4" size="md" integerOnly />
  <bpdm-input-otp [length]="4" size="lg" integerOnly />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInputOtp } from '@bpdm/ng';

@Component({
  selector: 'app-otp-sizes',
  imports: [BpdmInputOtp],
  template: \`
    <div class="flex flex-col gap-4">
      <bpdm-input-otp [length]="4" size="sm" integerOnly />
      <bpdm-input-otp [length]="4" size="md" integerOnly />
      <bpdm-input-otp [length]="4" size="lg" integerOnly />
    </div>
  \`,
})
export class OtpSizesComponent {}`,
      },
    },
  },
};

export const Disabled: Story = {
  tags: ["!dev"],
  args: { length: 6, disabled: true, defaultValue: "123456" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInputOtp } from '@bpdm/ng';

@Component({
  selector: 'app-otp-disabled',
  imports: [BpdmInputOtp],
  template: \`<bpdm-input-otp [length]="6" disabled defaultValue="123456" />\`,
})
export class OtpDisabledComponent {}`,
      },
    },
  },
};
