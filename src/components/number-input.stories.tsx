import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { NumberInput } from "./number-input";

const usage = `
Number field with stepper buttons. **Precision-safe** — values are
strings and arithmetic uses bignumber.js, so very large quantities and
high-decimal measurements never lose precision (JS \`number\` caps at ~9×10¹⁵). Two button
layouts: \`stacked\` (chevrons) and \`horizontal\` (−/+). Controlled or uncontrolled;
clamps to \`min\`/\`max\`.

\`\`\`tsx
import { NumberInput } from "@bpdm/ui";

<NumberInput defaultValue="20" prefix="$" />
<NumberInput buttonLayout="horizontal" defaultValue="25" step="5" prefix="€" />
<NumberInput min="0" max="10" defaultValue="5" />

// precise to the last digit — no rounding
<NumberInput defaultValue="123456789012345678" step="1" suffix="ns" />

// controlled (value + onValueChange are strings)
<NumberInput value={amount} onValueChange={setAmount} step="0.0001" suffix="kg" />
\`\`\`
`;

const meta: Meta<typeof NumberInput> = {
  title: "Inputs/NumberInput",
  component: NumberInput,
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
};
export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Playground: Story = {};

// up/down chevrons on the right (default)
export const Stacked: Story = {
  args: { buttonLayout: "stacked", defaultValue: "20", prefix: "$" },
  parameters: {
    docs: { source: { code: `<NumberInput defaultValue="20" prefix="$" />` } },
  },
};

// − and + on either side, with a step
export const Horizontal: Story = {
  args: { buttonLayout: "horizontal", defaultValue: "25", step: "5", prefix: "€" },
  parameters: {
    docs: {
      source: {
        code: `<NumberInput buttonLayout="horizontal" defaultValue="25" step="5" prefix="€" />`,
      },
    },
  },
};

// clamps to range; buttons disable at the bounds
export const MinMaxBoundaries: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: { code: `<NumberInput min="0" max="10" defaultValue="10" />` },
    },
  },
  render: () => <NumberInput min="0" max="10" defaultValue="10" />,
};

// Precision-safe: a value far beyond Number.MAX_SAFE_INTEGER stays exact.
export const HighPrecision: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `// 24-digit integer — a JS number would corrupt this
<NumberInput defaultValue="123456789012345678901234" step="1" suffix="ns" />
<NumberInput defaultValue="0.0001" step="0.0001" suffix="kg" />`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3">
      <NumberInput
        defaultValue="123456789012345678901234"
        step="1"
        suffix="ns"
        className="w-[26rem]"
      />
      <NumberInput
        defaultValue="0.0001"
        step="0.0001"
        suffix="kg"
        className="w-[26rem]"
      />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `<NumberInput size="sm" defaultValue="1" />
<NumberInput size="md" defaultValue="1" />
<NumberInput size="lg" defaultValue="1" />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <NumberInput size="sm" defaultValue="1" />
      <NumberInput size="md" defaultValue="1" />
      <NumberInput size="lg" defaultValue="1" />
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: { source: { code: `<NumberInput disabled defaultValue="20" prefix="$" />` } },
  },
  render: () => <NumberInput disabled defaultValue="20" prefix="$" />,
};
