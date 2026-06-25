import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmNumberInput } from "./number-input";

/**
 * Number field with stepper buttons. **Precision-safe** — values are strings and
 * arithmetic uses bignumber.js, so very large quantities and high-decimal
 * measurements never lose precision (JS `number` caps at ~9×10¹⁵). Two button
 * layouts: `stacked` (chevrons) and `horizontal` (−/+). Controlled (`[(value)]`)
 * or uncontrolled (`defaultValue`); clamps to `min`/`max`.
 *
 * ```html
 * <bpdm-number-input defaultValue="20" prefix="$" />
 * <bpdm-number-input buttonLayout="horizontal" defaultValue="25" step="5" prefix="€" />
 * <bpdm-number-input min="0" max="10" defaultValue="5" />
 * <bpdm-number-input [(value)]="amount" step="0.0001" suffix="kg" />
 * ```
 */
const meta: Meta<BpdmNumberInput> = {
  title: "Inputs/NumberInput",
  component: BpdmNumberInput,
  decorators: [moduleMetadata({ imports: [BpdmNumberInput] })],
  tags: ["autodocs"],
  argTypes: {
    buttonLayout: { control: "inline-radio", options: ["stacked", "horizontal"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    defaultValue: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
    step: { control: "text" },
    prefix: { control: "text" },
    suffix: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: { defaultValue: "20", step: "1", buttonLayout: "stacked", size: "md" },
  render: (args) => ({
    props: args,
    template: `<bpdm-number-input
  [defaultValue]="defaultValue"
  [step]="step"
  [buttonLayout]="buttonLayout"
  [size]="size"
  [min]="min"
  [max]="max"
  [prefix]="prefix"
  [suffix]="suffix"
  [disabled]="disabled"
/>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmNumberInput>;

export const Playground: Story = {};

// up/down chevrons on the right (default)
export const Stacked: Story = {
  args: { buttonLayout: "stacked", defaultValue: "20", prefix: "$" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-stacked',
  imports: [BpdmNumberInput],
  template: \`<bpdm-number-input defaultValue="20" prefix="$" />\`,
})
export class NumberStackedComponent {}`,
      },
    },
  },
};

// − and + on either side, with a step
export const Horizontal: Story = {
  args: { buttonLayout: "horizontal", defaultValue: "25", step: "5", prefix: "€" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-horizontal',
  imports: [BpdmNumberInput],
  template: \`<bpdm-number-input buttonLayout="horizontal" defaultValue="25" step="5" prefix="€" />\`,
})
export class NumberHorizontalComponent {}`,
      },
    },
  },
};

// clamps to range; buttons disable at the bounds
export const MinMaxBoundaries: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-number-input min="0" max="10" defaultValue="10" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-bounds',
  imports: [BpdmNumberInput],
  template: \`<bpdm-number-input min="0" max="10" defaultValue="10" />\`,
})
export class NumberBoundsComponent {}`,
      },
    },
  },
};

// Precision-safe: a value far beyond Number.MAX_SAFE_INTEGER stays exact.
export const HighPrecision: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-col gap-3">
  <bpdm-number-input defaultValue="123456789012345678901234" step="1" suffix="ns" class="w-[26rem]" />
  <bpdm-number-input defaultValue="0.0001" step="0.0001" suffix="kg" class="w-[26rem]" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-precision',
  imports: [BpdmNumberInput],
  template: \`
    <div class="flex flex-col gap-3">
      <!-- 24-digit integer — a JS number would corrupt this -->
      <bpdm-number-input defaultValue="123456789012345678901234" step="1" suffix="ns" />
      <bpdm-number-input defaultValue="0.0001" step="0.0001" suffix="kg" />
    </div>
  \`,
})
export class NumberPrecisionComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <bpdm-number-input size="sm" defaultValue="1" />
  <bpdm-number-input size="md" defaultValue="1" />
  <bpdm-number-input size="lg" defaultValue="1" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-sizes',
  imports: [BpdmNumberInput],
  template: \`
    <div class="flex items-center gap-3">
      <bpdm-number-input size="sm" defaultValue="1" />
      <bpdm-number-input size="md" defaultValue="1" />
      <bpdm-number-input size="lg" defaultValue="1" />
    </div>
  \`,
})
export class NumberSizesComponent {}`,
      },
    },
  },
};

export const Disabled: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<bpdm-number-input disabled defaultValue="20" prefix="$" />`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmNumberInput } from '@bpdm/ng';

@Component({
  selector: 'app-number-disabled',
  imports: [BpdmNumberInput],
  template: \`<bpdm-number-input disabled defaultValue="20" prefix="$" />\`,
})
export class NumberDisabledComponent {}`,
      },
    },
  },
};
