import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { PasswordInput } from "./password-input";

const usage = `
Password input with a show/hide toggle and an optional strength meter (segmented
bar + label: Weak / Fair / Good / Strong). Uses \`type="password"\`, so password
managers work. Controlled (\`value\` + \`onValueChange\`) or uncontrolled.

\`\`\`tsx
import { PasswordInput } from "@bpdm/ui";

<PasswordInput placeholder="Password" />
<PasswordInput feedback={false} placeholder="Password" />   // no strength meter
\`\`\`
`;

const meta: Meta<typeof PasswordInput> = {
  title: "Components/PasswordInput",
  component: PasswordInput,
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
    size: { control: "select", options: ["sm", "md", "lg"] },
    feedback: { control: "boolean" },
    levels: { control: { type: "number", min: 2, max: 6 } },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: { placeholder: "Password", feedback: true, size: "md" },
  render: (args) => (
    <div className="w-72">
      <PasswordInput {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Playground: Story = {};

// type to watch the strength meter fill (length + case + digits + symbols)
export const StrengthMeter: Story = {
  parameters: {
    docs: { source: { code: `<PasswordInput placeholder="Create a password" />` } },
  },
  render: () => (
    <div className="w-72">
      <PasswordInput placeholder="Create a password" defaultValue="abc" />
    </div>
  ),
};

// configurable number of strength segments (+ custom labels / scorer)
export const CustomLevels: Story = {
  parameters: {
    docs: {
      source: {
        code: `<PasswordInput levels={3} />                       // 3 segments
<PasswordInput levels={5} />                       // 5 segments
<PasswordInput levels={3} labels={["Low","Mid","High"]} />  // custom labels`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-6">
      <PasswordInput levels={3} defaultValue="abcdef" placeholder="3 levels" />
      <PasswordInput levels={5} defaultValue="Abc123!x" placeholder="5 levels" />
      <PasswordInput
        levels={3}
        labels={["Low", "Mid", "High"]}
        defaultValue="Abcd1234!"
        placeholder="custom labels"
      />
    </div>
  ),
};

export const NoFeedback: Story = {
  parameters: {
    docs: { source: { code: `<PasswordInput feedback={false} placeholder="Password" />` } },
  },
  render: () => (
    <div className="w-72">
      <PasswordInput feedback={false} placeholder="Password" />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: { source: { code: `<PasswordInput size="sm" /> <PasswordInput size="md" /> <PasswordInput size="lg" />` } },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <PasswordInput key={s} size={s} feedback={false} placeholder={`Size ${s}`} />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: { source: { code: `<PasswordInput aria-invalid placeholder="Password" />` } },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <PasswordInput aria-invalid feedback={false} placeholder="Password" />
      <p className="text-sm text-destructive">Password is required.</p>
    </div>
  ),
};
