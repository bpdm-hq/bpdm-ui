import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const usage = `
Single-select group built on Radix — only one option active at a time (unlike a
checkbox group). Controlled (\`value\` + \`onValueChange\`) or uncontrolled
(\`defaultValue\`). Supports sizes, disabled, invalid, and horizontal/vertical.

\`\`\`tsx
import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

<RadioGroup defaultValue="card">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="card" id="card" />
    <label htmlFor="card">Card</label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="upi" id="upi" />
    <label htmlFor="upi">UPI</label>
  </div>
</RadioGroup>
\`\`\`
`;

const meta: Meta<typeof RadioGroup> = {
  title: "Selection/RadioGroup",
  component: RadioGroup,
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
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
  args: { defaultValue: "card", orientation: "vertical" },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

const methods = [
  { value: "card", label: "Card" },
  { value: "paypal", label: "PayPal" },
  { value: "wallet", label: "Wallet" },
];

function Option({
  value,
  label,
  size,
}: {
  value: string;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const id = `${size ?? "md"}-${value}`;
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={id} size={size} />
      <label htmlFor={id} className="cursor-pointer text-sm text-foreground">
        {label}
      </label>
    </div>
  );
}

// only one at a time — the single-select use case (interactive: see Controls)
export const PaymentMethod: Story = {
  parameters: {
    docs: {
      source: {
        code: `<RadioGroup defaultValue="card">
  {methods.map((m) => (
    <div key={m.value} className="flex items-center gap-2">
      <RadioGroupItem value={m.value} id={m.value} />
      <label htmlFor={m.value}>{m.label}</label>
    </div>
  ))}
</RadioGroup>`,
      },
    },
  },
  render: (args) => (
    <RadioGroup {...args}>
      {methods.map((m) => (
        <Option key={m.value} value={m.value} label={m.label} />
      ))}
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      source: { code: `<RadioGroup defaultValue="card" orientation="horizontal">…</RadioGroup>` },
    },
  },
  render: () => (
    <RadioGroup defaultValue="card" orientation="horizontal">
      {methods.map((m) => (
        <Option key={m.value} value={m.value} label={m.label} />
      ))}
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<RadioGroupItem value="a" size="sm" />
<RadioGroupItem value="b" size="md" />
<RadioGroupItem value="c" size="lg" />`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-5">
      <RadioGroup defaultValue="md-card" className="flex flex-wrap gap-5">
        <Option value="card" label="Small" size="sm" />
        <Option value="upi" label="Medium" size="md" />
        <Option value="wallet" label="Large" size="lg" />
      </RadioGroup>
    </div>
  ),
};

export const Disabled: Story = {
  parameters: {
    docs: { source: { code: `<RadioGroup defaultValue="card" disabled>…</RadioGroup>` } },
  },
  render: () => (
    <RadioGroup defaultValue="card" disabled>
      {methods.map((m) => (
        <Option key={m.value} value={m.value} label={m.label} />
      ))}
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<RadioGroupItem value="card" aria-invalid />  // mark options invalid`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-1.5">
      <RadioGroup>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="card" id="inv-card" aria-invalid />
          <label htmlFor="inv-card" className="cursor-pointer text-sm text-foreground">
            Card
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="paypal" id="inv-paypal" aria-invalid />
          <label htmlFor="inv-paypal" className="cursor-pointer text-sm text-foreground">
            PayPal
          </label>
        </div>
      </RadioGroup>
      <p className="text-sm text-destructive">Please choose a payment method.</p>
    </div>
  ),
};
