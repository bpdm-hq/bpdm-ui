import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmMoneyInput } from "./money-input";

/**
 * Currency + locale-aware money input. Displays grouped per locale (e.g. en-IN →
 * 1,00,000) with the currency symbol and the currency's decimal count; the stored
 * value stays a precise numeric string (bignumber.js — no float rounding). Editable
 * as a plain number on focus, formatted on blur.
 *
 * ```html
 * <bpdm-money-input currency="USD" locale="en-US" [(value)]="amount" />
 * <bpdm-money-input currency="INR" locale="en-IN" defaultValue="100000" />   <!-- ₹1,00,000.00 -->
 * <bpdm-money-input currency="JPY" locale="ja-JP" defaultValue="5000" />     <!-- ¥5,000 (0 decimals) -->
 * ```
 */
const meta: Meta<BpdmMoneyInput> = {
  title: "Inputs/MoneyInput",
  component: BpdmMoneyInput,
  decorators: [moduleMetadata({ imports: [BpdmMoneyInput] })],
  tags: ["autodocs"],
  argTypes: {
    currency: { control: "text" },
    locale: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    allowNegative: { control: "boolean" },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
  },
  args: {
    currency: "USD",
    locale: "en-US",
    defaultValue: "1234.5",
    size: "md",
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-64">
  <bpdm-money-input
    [currency]="currency"
    [locale]="locale"
    [defaultValue]="defaultValue"
    [size]="size"
    [allowNegative]="allowNegative"
    [disabled]="disabled"
  />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmMoneyInput>;

export const Playground: Story = {};

// same amount, different currency + locale → different symbol, grouping, decimals
export const Currencies: Story = {
  render: () => ({
    template: `<div class="flex w-72 flex-col gap-3">
  <div class="flex items-center gap-3"><span class="w-10 text-sm text-muted-foreground">USD</span><bpdm-money-input currency="USD" locale="en-US" defaultValue="100000" /></div>
  <div class="flex items-center gap-3"><span class="w-10 text-sm text-muted-foreground">EUR</span><bpdm-money-input currency="EUR" locale="de-DE" defaultValue="100000" /></div>
  <div class="flex items-center gap-3"><span class="w-10 text-sm text-muted-foreground">INR</span><bpdm-money-input currency="INR" locale="en-IN" defaultValue="100000" /></div>
  <div class="flex items-center gap-3"><span class="w-10 text-sm text-muted-foreground">JPY</span><bpdm-money-input currency="JPY" locale="ja-JP" defaultValue="100000" /></div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMoneyInput } from '@bpdm/ng';

@Component({
  selector: 'app-money-currencies',
  imports: [BpdmMoneyInput],
  template: \`
    <div class="flex w-72 flex-col gap-3">
      <bpdm-money-input currency="USD" locale="en-US" defaultValue="100000" /> <!-- $100,000.00 -->
      <bpdm-money-input currency="EUR" locale="de-DE" defaultValue="100000" /> <!-- 100.000,00 € -->
      <bpdm-money-input currency="INR" locale="en-IN" defaultValue="100000" /> <!-- ₹1,00,000.00 -->
      <bpdm-money-input currency="JPY" locale="ja-JP" defaultValue="100000" /> <!-- ¥100,000 -->
    </div>
  \`,
})
export class MoneyCurrenciesComponent {}`,
      },
    },
  },
};

// precise to the last digit — large amount keeps every digit (no float rounding)
export const PrecisionLargeAmount: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-72">
  <bpdm-money-input currency="USD" locale="en-US" defaultValue="123456789012.34" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMoneyInput } from '@bpdm/ng';

@Component({
  selector: 'app-money-precision',
  imports: [BpdmMoneyInput],
  template: \`<bpdm-money-input currency="USD" defaultValue="123456789012.34" />\`,
})
export class MoneyPrecisionComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-64 flex-col gap-3">
  <bpdm-money-input size="sm" currency="USD" defaultValue="2500" />
  <bpdm-money-input size="md" currency="USD" defaultValue="2500" />
  <bpdm-money-input size="lg" currency="USD" defaultValue="2500" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMoneyInput } from '@bpdm/ng';

@Component({
  selector: 'app-money-sizes',
  imports: [BpdmMoneyInput],
  template: \`
    <div class="flex w-64 flex-col gap-3">
      <bpdm-money-input size="sm" currency="USD" defaultValue="2500" />
      <bpdm-money-input size="md" currency="USD" defaultValue="2500" />
      <bpdm-money-input size="lg" currency="USD" defaultValue="2500" />
    </div>
  \`,
})
export class MoneySizesComponent {}`,
      },
    },
  },
};

export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-64 flex-col gap-1.5">
  <bpdm-money-input aria-invalid="true" currency="USD" defaultValue="0" />
  <p class="text-sm text-destructive">Amount must be greater than 0.</p>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMoneyInput } from '@bpdm/ng';

@Component({
  selector: 'app-money-invalid',
  imports: [BpdmMoneyInput],
  template: \`
    <div class="flex w-64 flex-col gap-1.5">
      <bpdm-money-input aria-invalid="true" currency="USD" defaultValue="0" />
      <p class="text-sm text-destructive">Amount must be greater than 0.</p>
    </div>
  \`,
})
export class MoneyInvalidComponent {}`,
      },
    },
  },
};

export const Disabled: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-64">
  <bpdm-money-input disabled currency="USD" defaultValue="2500" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMoneyInput } from '@bpdm/ng';

@Component({
  selector: 'app-money-disabled',
  imports: [BpdmMoneyInput],
  template: \`<bpdm-money-input disabled currency="USD" defaultValue="2500" />\`,
})
export class MoneyDisabledComponent {}`,
      },
    },
  },
};
