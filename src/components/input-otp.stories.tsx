import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { InputOtp } from "./input-otp";

const usage = `
One-time-code input — one box per character with auto-advance,
backspace-to-previous, arrow-key navigation, and paste-to-fill. Controlled
(\`value\` + \`onValueChange\`) or uncontrolled (\`defaultValue\`); value is a string.

\`\`\`tsx
import { InputOtp } from "@bpdm/ui";

<InputOtp length={6} integerOnly />
<InputOtp length={4} mask integerOnly />        // hidden PIN
<InputOtp value={code} onValueChange={setCode} />
\`\`\`
`;

const meta: Meta<typeof InputOtp> = {
  title: "Inputs/InputOtp",
  component: InputOtp,
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
};
export default meta;

type Story = StoryObj<typeof InputOtp>;

export const Playground: Story = {};

// connected segments, auto-balanced into 2 groups (even → equal, odd → ceil+floor)
export const Grouped: Story = {
  args: { length: 6, grouped: true, separator: "−", integerOnly: true },
  parameters: {
    docs: {
      source: {
        code: `// auto-balanced: 6 → 3-3, 8 → 4-4, 5 → 3-2
<InputOtp length={6} grouped separator="−" integerOnly />

// or fixed groups of a custom size
<InputOtp length={9} groupSize={3} separator="−" integerOnly />`,
      },
    },
  },
};

// hidden characters for PINs
export const Masked: Story = {
  args: { length: 4, mask: true, integerOnly: true, defaultValue: "1" },
  parameters: {
    docs: { source: { code: `<InputOtp length={4} mask integerOnly />` } },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `<InputOtp length={4} size="sm" />
<InputOtp length={4} size="md" />
<InputOtp length={4} size="lg" />`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOtp length={4} size="sm" integerOnly />
      <InputOtp length={4} size="md" integerOnly />
      <InputOtp length={4} size="lg" integerOnly />
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev"],
  args: { length: 6, disabled: true, defaultValue: "123456" },
  parameters: {
    docs: { source: { code: `<InputOtp length={6} disabled defaultValue="123456" />` } },
  },
};
