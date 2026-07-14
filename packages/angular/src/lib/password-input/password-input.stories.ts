import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmPasswordInput } from "./password-input";

/**
 * Password input with a show/hide toggle and an optional strength meter (segmented
 * bar + label: Weak / Fair / Good / Strong). Uses `type="password"`, so password
 * managers work. Controlled (`[(value)]`) or uncontrolled (`defaultValue`).
 *
 * ```html
 * <bpdm-password-input placeholder="Password" />
 * <bpdm-password-input [feedback]="false" placeholder="Password" />   <!-- no strength meter -->
 * ```
 */
const meta: Meta<BpdmPasswordInput> = {
  title: "Inputs/PasswordInput",
  component: BpdmPasswordInput,
  decorators: [moduleMetadata({ imports: [BpdmPasswordInput] })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    feedback: { control: "boolean" },
    levels: { control: { type: "number", min: 2, max: 6 } },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
  },
  args: { placeholder: "Password", feedback: true, size: "md" },
  render: (args) => ({
    props: args,
    template: `<div class="w-72">
  <bpdm-password-input
    [placeholder]="placeholder"
    [feedback]="feedback"
    [size]="size"
    [disabled]="disabled"
  />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmPasswordInput>;

export const Playground: Story = {};

// type to watch the strength meter fill (length + case + digits + symbols)
export const StrengthMeter: Story = {
  render: () => ({
    template: `<div class="w-72">
  <bpdm-password-input placeholder="Create a password" defaultValue="abc" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmPasswordInput } from '@bpdm/ng';

@Component({
  selector: 'app-password-strength',
  imports: [BpdmPasswordInput],
  template: \`<bpdm-password-input placeholder="Create a password" />\`,
})
export class PasswordStrengthComponent {}`,
      },
    },
  },
};

// configurable number of strength segments (+ custom labels / scorer)
export const CustomLevels: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-6">
  <bpdm-password-input [levels]="3" defaultValue="abcdef" placeholder="3 levels" />
  <bpdm-password-input [levels]="5" defaultValue="Abc123!x" placeholder="5 levels" />
  <bpdm-password-input [levels]="3" [labels]="['Low', 'Mid', 'High']" defaultValue="Abcd1234!" placeholder="custom labels" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmPasswordInput } from '@bpdm/ng';

@Component({
  selector: 'app-password-levels',
  imports: [BpdmPasswordInput],
  template: \`
    <div class="flex w-72 flex-col gap-6">
      <bpdm-password-input [levels]="3" />                                  <!-- 3 segments -->
      <bpdm-password-input [levels]="5" />                                  <!-- 5 segments -->
      <bpdm-password-input [levels]="3" [labels]="['Low', 'Mid', 'High']" /> <!-- custom labels -->
    </div>
  \`,
})
export class PasswordLevelsComponent {}`,
      },
    },
  },
};

export const NoFeedback: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-72">
  <bpdm-password-input [feedback]="false" placeholder="Password" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmPasswordInput } from '@bpdm/ng';

@Component({
  selector: 'app-password-nofeedback',
  imports: [BpdmPasswordInput],
  template: \`<bpdm-password-input [feedback]="false" placeholder="Password" />\`,
})
export class PasswordNoFeedbackComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-3">
  <bpdm-password-input size="sm" [feedback]="false" placeholder="Size sm" />
  <bpdm-password-input size="md" [feedback]="false" placeholder="Size md" />
  <bpdm-password-input size="lg" [feedback]="false" placeholder="Size lg" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmPasswordInput } from '@bpdm/ng';

@Component({
  selector: 'app-password-sizes',
  imports: [BpdmPasswordInput],
  template: \`
    <div class="flex w-72 flex-col gap-3">
      <bpdm-password-input size="sm" [feedback]="false" placeholder="Size sm" />
      <bpdm-password-input size="md" [feedback]="false" placeholder="Size md" />
      <bpdm-password-input size="lg" [feedback]="false" placeholder="Size lg" />
    </div>
  \`,
})
export class PasswordSizesComponent {}`,
      },
    },
  },
};

export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-1.5">
  <bpdm-password-input aria-invalid="true" [feedback]="false" placeholder="Password" />
  <p class="text-sm text-destructive-strong">Password is required.</p>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmPasswordInput } from '@bpdm/ng';

@Component({
  selector: 'app-password-invalid',
  imports: [BpdmPasswordInput],
  template: \`
    <div class="flex w-72 flex-col gap-1.5">
      <bpdm-password-input aria-invalid="true" [feedback]="false" placeholder="Password" />
      <p class="text-sm text-destructive-strong">Password is required.</p>
    </div>
  \`,
})
export class PasswordInvalidComponent {}`,
      },
    },
  },
};
