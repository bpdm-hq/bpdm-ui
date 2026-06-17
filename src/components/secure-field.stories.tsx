import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { SecureField } from "./secure-field";

const usage = `
Masked input for sensitive values — card numbers, IBANs, API keys, secrets. Masked
at rest (with an optional visible tail), a reveal toggle, and an optional copy
button. Uses text + masking (not \`type=password\`) so password managers don't hijack
it. \`onValueChange\` / copy always give the real value.

\`\`\`tsx
import { SecureField } from "@bpdm/ui";

<SecureField format="card" unmaskedTail={4} placeholder="Card number" />
<SecureField copyable defaultValue="sk_live_51H..." placeholder="API key" />
\`\`\`
`;

const meta: Meta<typeof SecureField> = {
  title: "Inputs/SecureField",
  component: SecureField,
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
    format: { control: "inline-radio", options: ["none", "card"] },
    unmaskedTail: { control: { type: "number", min: 0, max: 8 } },
    revealable: { control: "boolean" },
    copyable: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    format: "card",
    unmaskedTail: 4,
    revealable: true,
    copyable: false,
    size: "md",
    defaultValue: "4242424242424242",
    placeholder: "Card number",
  },
  render: (args) => (
    <div className="w-72">
      <SecureField {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof SecureField>;

export const Playground: Story = {};

// card number — grouped 4-4-4-4, last 4 visible, reveal to see full
export const CardNumber: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField format="card" unmaskedTail={4} defaultValue="4242424242424242" />` },
    },
  },
  render: () => (
    <div className="w-72">
      <SecureField format="card" unmaskedTail={4} defaultValue="4242424242424242" />
    </div>
  ),
};

// API key / secret — fully masked, copy + reveal
export const ApiKey: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField copyable defaultValue="sk_live_51H8x...e9Qa" placeholder="API key" />` },
    },
  },
  render: () => (
    <div className="w-80">
      <SecureField copyable defaultValue="sk_live_51H8xKJ2eZvKf3mQpe9Qa" placeholder="API key" />
    </div>
  ),
};

// show the last 4 of an account number while masked
export const AccountTail: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField unmaskedTail={4} defaultValue="DE89370400440532013000" />` },
    },
  },
  render: () => (
    <div className="w-80">
      <SecureField unmaskedTail={4} copyable defaultValue="DE89370400440532013000" placeholder="IBAN" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField size="sm" /> <SecureField size="md" /> <SecureField size="lg" />` },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <SecureField key={s} size={s} format="card" unmaskedTail={4} defaultValue="4242424242424242" />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: { source: { code: `<SecureField aria-invalid format="card" />` } },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <SecureField aria-invalid format="card" unmaskedTail={4} defaultValue="4242" />
      <p className="text-sm text-destructive">Enter a valid card number.</p>
    </div>
  ),
};
