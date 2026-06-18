import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { FloatLabel } from "./float-label";
import { Input } from "./input";

const usage = `
Floating label wrapper. Wrap a single input — the label starts as
a placeholder and floats up on focus or when filled. Pure CSS (no JS). Three
\`variant\`s: \`over\` (above the field), \`in\` (top, inside), \`on\` (notch on the border).

\`\`\`tsx
import { FloatLabel, Input } from "@bpdm/ui";

<FloatLabel label="Email" variant="over">
  <Input id="email" type="email" />
</FloatLabel>
\`\`\`

The label's \`htmlFor\` binds to the child's \`id\` automatically; \`peer\` and a blank
placeholder are injected for you.
`;

const meta: Meta<typeof FloatLabel> = {
  title: "Inputs/FloatLabel",
  component: FloatLabel,
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
    label: { control: "text" },
    variant: { control: "inline-radio", options: ["over", "in", "on"] },
  },
  args: { label: "Email", variant: "over" },
  render: (args) => (
    <div className="w-72 pt-4">
      <FloatLabel {...args}>
        <Input id="fl-demo" />
      </FloatLabel>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof FloatLabel>;

export const Playground: Story = {};

// All three variants side by side. Click/type to see the label float.
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `<FloatLabel label="Over" variant="over"><Input id="a" /></FloatLabel>
<FloatLabel label="In" variant="in"><Input id="b" /></FloatLabel>
<FloatLabel label="On the border" variant="on"><Input id="c" /></FloatLabel>`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-7 pt-4">
      <FloatLabel label="Over" variant="over">
        <Input id="fl-over" />
      </FloatLabel>
      <FloatLabel label="In" variant="in">
        <Input id="fl-in" />
      </FloatLabel>
      <FloatLabel label="On the border" variant="on">
        <Input id="fl-on" />
      </FloatLabel>
    </div>
  ),
};

// Pre-filled — label stays floated because the field has a value.
export const Filled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `<FloatLabel label="Email" variant="on">
  <Input id="email" type="email" defaultValue="ada@bpdm.dev" />
</FloatLabel>`,
      },
    },
  },
  render: () => (
    <div className="w-72 pt-4">
      <FloatLabel label="Email" variant="on">
        <Input id="fl-filled" type="email" defaultValue="ada@bpdm.dev" />
      </FloatLabel>
    </div>
  ),
};
