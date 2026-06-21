import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Textarea } from "./textarea";

const usage = `
Multi-line text input. Sizes, resize control (\`none\` / \`vertical\` / \`both\`),
optional \`autoResize\` (grows with content), optional character counter, and an
\`aria-invalid\` error state. Forwards a ref and takes all native \`<textarea>\` props.

\`\`\`tsx
import { Textarea } from "@bpdm/ui";

<Textarea placeholder="Notes…" />
<Textarea autoResize placeholder="Grows as you type" />
<Textarea showCount maxLength={200} placeholder="Bio" />
\`\`\`
`;

const meta: Meta<typeof Textarea> = {
  title: "Inputs/Textarea",
  component: Textarea,
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
    resize: { control: "inline-radio", options: ["none", "vertical", "both"] },
    autoResize: { control: "boolean" },
    showCount: { control: "boolean" },
    maxLength: { control: "number" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: { placeholder: "Write something…", size: "md", resize: "vertical" },
  render: (args) => (
    <div className="w-80">
      <Textarea {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Playground: Story = {};

// grows with content, no scrollbar
export const AutoResize: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@bpdm/ui";

export function Example() {
  return <Textarea autoResize placeholder="Grows as you type" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <Textarea autoResize placeholder="Type a few lines — it grows automatically" />
    </div>
  ),
};

// character counter with a max
export const WithCount: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@bpdm/ui";

export function Example() {
  return <Textarea showCount maxLength={200} placeholder="Bio" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <Textarea showCount maxLength={200} defaultValue="A short bio…" placeholder="Bio" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <Textarea key={s} size={s} placeholder={\`Size \${s}\`} />
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <Textarea key={s} size={s} placeholder={`Size ${s}`} />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-1.5">
      <Textarea aria-invalid placeholder="Message" />
      <p className="text-sm text-destructive">Message is required.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-1.5">
      <Textarea aria-invalid placeholder="Message" />
      <p className="text-sm text-destructive">Message is required.</p>
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Textarea } from "@bpdm/ui";

export function Example() {
  return <Textarea disabled defaultValue="Read only" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <Textarea disabled defaultValue="This field is disabled." />
    </div>
  ),
};
