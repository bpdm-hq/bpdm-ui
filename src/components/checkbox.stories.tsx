import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Checkbox } from "./checkbox";

const usage = `
Accessible checkbox built on Radix. Supports checked / unchecked / **indeterminate**,
sizes, disabled, and an invalid state (\`aria-invalid\`). Controlled (\`checked\` +
\`onCheckedChange\`) or uncontrolled (\`defaultChecked\`).

\`\`\`tsx
import { Checkbox } from "@bpdm/ui";

<Checkbox defaultChecked />
<Checkbox checked="indeterminate" />
<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">Accept terms</label>
</div>
\`\`\`
`;

const meta: Meta<typeof Checkbox> = {
  title: "Selection/Checkbox",
  component: Checkbox,
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
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md" },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Playground: Story = {};

// every state at a glance
export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Checkbox />
<Checkbox defaultChecked />
<Checkbox checked="indeterminate" />
<Checkbox disabled />
<Checkbox disabled defaultChecked />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-5">
      <Checkbox />
      <Checkbox defaultChecked />
      <Checkbox checked="indeterminate" />
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Checkbox size="sm" defaultChecked />
<Checkbox size="md" defaultChecked />
<Checkbox size="lg" defaultChecked />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-5">
      <Checkbox size="sm" defaultChecked />
      <Checkbox size="md" defaultChecked />
      <Checkbox size="lg" defaultChecked />
    </div>
  ),
};

// label association via htmlFor (clicking the label toggles)
export const WithLabel: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div className="flex items-center gap-2">
  <Checkbox id="terms" defaultChecked />
  <label htmlFor="terms">Accept terms & conditions</label>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" defaultChecked />
      <label htmlFor="terms" className="cursor-pointer text-sm text-foreground">
        Accept terms &amp; conditions
      </label>
    </div>
  ),
};

export const Group: Story = {
  parameters: {
    docs: {
      source: {
        code: `{options.map((o) => (
  <div key={o.id} className="flex items-center gap-2">
    <Checkbox id={o.id} defaultChecked={o.checked} />
    <label htmlFor={o.id}>{o.label}</label>
  </div>
))}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { id: "g-email", label: "Email notifications", checked: true },
        { id: "g-sms", label: "SMS notifications", checked: false },
        { id: "g-push", label: "Push notifications", checked: true },
      ].map((o) => (
        <div key={o.id} className="flex items-center gap-2">
          <Checkbox id={o.id} defaultChecked={o.checked} />
          <label
            htmlFor={o.id}
            className="cursor-pointer text-sm text-foreground"
          >
            {o.label}
          </label>
        </div>
      ))}
    </div>
  ),
};

// error state via aria-invalid
export const Invalid: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div className="flex items-center gap-2">
  <Checkbox id="agree" aria-invalid aria-describedby="agree-err" />
  <label htmlFor="agree">I agree</label>
</div>
<p id="agree-err" className="text-sm text-destructive">You must agree to continue.</p>`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Checkbox id="agree" aria-invalid aria-describedby="agree-err" />
        <label htmlFor="agree" className="cursor-pointer text-sm text-foreground">
          I agree to the processing of my data
        </label>
      </div>
      <p id="agree-err" className="text-sm text-destructive">
        You must agree to continue.
      </p>
    </div>
  ),
};
