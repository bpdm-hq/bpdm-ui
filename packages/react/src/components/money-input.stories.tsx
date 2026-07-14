import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { MoneyInput } from "./money-input";

const usage = `
Currency + locale-aware money input. Displays grouped per locale (e.g. en-IN →
1,00,000) with the currency symbol and the currency's decimal count; the stored
value stays a precise numeric string (bignumber.js — no float rounding). Editable
as a plain number on focus, formatted on blur.

\`\`\`tsx
import { MoneyInput } from "@bpdm/ui";

<MoneyInput currency="USD" locale="en-US" value={amount} onValueChange={setAmount} />
<MoneyInput currency="INR" locale="en-IN" defaultValue="100000" />   // ₹1,00,000.00
<MoneyInput currency="JPY" locale="ja-JP" defaultValue="5000" />     // ¥5,000 (0 decimals)
\`\`\`
`;

const meta: Meta<typeof MoneyInput> = {
  title: "Inputs/MoneyInput",
  component: MoneyInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Playground</h2>
          <Primary />
          <Controls />
          <h2>Examples</h2>
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
  argTypes: {
    currency: { control: "text" },
    locale: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    allowNegative: { control: "boolean" },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    currency: "USD",
    locale: "en-US",
    defaultValue: "1234.5",
    size: "md",
  },
  render: (args) => (
    <div className="w-64">
      <MoneyInput {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MoneyInput>;

export const Playground: Story = {};

// same amount, different currency + locale → different symbol, grouping, decimals
export const Currencies: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { MoneyInput } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-72 flex-col gap-3">
      <MoneyInput currency="USD" locale="en-US" defaultValue="100000" />   {/* $100,000.00 */}
      <MoneyInput currency="EUR" locale="de-DE" defaultValue="100000" />   {/* 100.000,00 € */}
      <MoneyInput currency="INR" locale="en-IN" defaultValue="100000" />   {/* ₹1,00,000.00 */}
      <MoneyInput currency="JPY" locale="ja-JP" defaultValue="100000" />   {/* ¥100,000 */}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {[
        { currency: "USD", locale: "en-US" },
        { currency: "EUR", locale: "de-DE" },
        { currency: "INR", locale: "en-IN" },
        { currency: "JPY", locale: "ja-JP" },
      ].map((c) => (
        <div key={c.currency} className="flex items-center gap-3">
          <span className="w-10 text-sm text-muted-foreground">{c.currency}</span>
          <MoneyInput currency={c.currency} locale={c.locale} defaultValue="100000" />
        </div>
      ))}
    </div>
  ),
};

// precise to the last digit — large amount keeps every digit (no float rounding)
export const PrecisionLargeAmount: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { MoneyInput } from "@bpdm/ui";

export function Example() {
  return <MoneyInput currency="USD" defaultValue="123456789012.34" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-72">
      <MoneyInput currency="USD" locale="en-US" defaultValue="123456789012.34" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { MoneyInput } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-64 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <MoneyInput key={s} size={s} currency="USD" defaultValue="2500" />
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <MoneyInput key={s} size={s} currency="USD" defaultValue="2500" />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { MoneyInput } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-64 flex-col gap-1.5">
      <MoneyInput aria-invalid currency="USD" defaultValue="0" />
      <p className="text-sm text-destructive-strong">Amount must be greater than 0.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-64 flex-col gap-1.5">
      <MoneyInput aria-invalid currency="USD" defaultValue="0" />
      <p className="text-sm text-destructive-strong">Amount must be greater than 0.</p>
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { MoneyInput } from "@bpdm/ui";

export function Example() {
  return <MoneyInput disabled currency="USD" defaultValue="2500" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-64">
      <MoneyInput disabled currency="USD" defaultValue="2500" />
    </div>
  ),
};
