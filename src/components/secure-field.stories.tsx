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
Masked input for sensitive values — API keys, secrets, license keys, tokens.
Masked at rest (with an optional visible tail), a reveal toggle, and an optional
copy button. Uses text + masking (not \`type=password\`) so password managers don't
hijack it. \`onValueChange\` / copy always give the real value.

\`\`\`tsx
import { SecureField } from "@bpdm/ui";

<SecureField format="grouped" unmaskedTail={4} placeholder="License key" />
<SecureField copyable defaultValue="ak_live_7Hq2..." placeholder="API key" />
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
    format: { control: "inline-radio", options: ["none", "grouped"] },
    unmaskedTail: { control: { type: "number", min: 0, max: 8 } },
    revealable: { control: "boolean" },
    copyable: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    format: "grouped",
    unmaskedTail: 4,
    revealable: true,
    copyable: false,
    size: "md",
    defaultValue: "4821095512470066",
    placeholder: "License key",
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

// grouped 4-4-4-4, last 4 visible, reveal to see the full key
export const LicenseKey: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField format="grouped" unmaskedTail={4} defaultValue="4821095512470066" />` },
    },
  },
  render: () => (
    <div className="w-72">
      <SecureField format="grouped" unmaskedTail={4} defaultValue="4821095512470066" placeholder="License key" />
    </div>
  ),
};

// API key / secret — fully masked, copy + reveal
export const ApiKey: Story = {
  parameters: {
    docs: {
      source: { code: `<SecureField copyable defaultValue="ak_live_7Hq2...e9Qa" placeholder="API key" />` },
    },
  },
  render: () => (
    <div className="w-80">
      <SecureField copyable defaultValue="ak_live_7Hq2eZvKf3mQpe9Qa1Lx" placeholder="API key" />
    </div>
  ),
};

// show the last 4 of a serial number while masked
export const SerialTail: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: { code: `<SecureField unmaskedTail={4} copyable defaultValue="SN8842019930245011" />` },
    },
  },
  render: () => (
    <div className="w-80">
      <SecureField unmaskedTail={4} copyable defaultValue="SN8842019930245011" placeholder="Serial number" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: { code: `<SecureField size="sm" /> <SecureField size="md" /> <SecureField size="lg" />` },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <SecureField key={s} size={s} format="grouped" unmaskedTail={4} defaultValue="4821095512470066" />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: { source: { code: `<SecureField aria-invalid format="grouped" />` } },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <SecureField aria-invalid format="grouped" unmaskedTail={4} defaultValue="4821" />
      <p className="text-sm text-destructive">Enter a valid license key.</p>
    </div>
  ),
};
