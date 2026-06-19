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

<RadioGroup defaultValue="pro">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="free" id="free" />
    <label htmlFor="free">Free</label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="pro" id="pro" />
    <label htmlFor="pro">Pro</label>
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
  args: { defaultValue: "pro", orientation: "vertical" },
};
export default meta;

type Story = StoryObj<typeof RadioGroup>;

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
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
export const Plan: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export function Example() {
  return (
    <RadioGroup defaultValue="pro">
      {plans.map((p) => (
        <div key={p.value} className="flex items-center gap-2">
          <RadioGroupItem value={p.value} id={p.value} />
          <label htmlFor={p.value}>{p.label}</label>
        </div>
      ))}
    </RadioGroup>
  );
}`,
      },
    },
  },
  render: (args) => (
    <RadioGroup {...args}>
      {plans.map((p) => (
        <Option key={p.value} value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export function Example() {
  return (
    <RadioGroup defaultValue="pro" orientation="horizontal">
      {plans.map((p) => (
        <div key={p.value} className="flex items-center gap-2">
          <RadioGroupItem value={p.value} id={p.value} />
          <label htmlFor={p.value}>{p.label}</label>
        </div>
      ))}
    </RadioGroup>
  );
}`,
      },
    },
  },
  render: () => (
    <RadioGroup defaultValue="pro" orientation="horizontal">
      {plans.map((p) => (
        <Option key={p.value} value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

export function Example() {
  return (
    <RadioGroup defaultValue="md" className="flex flex-wrap gap-5">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="sm" id="sm" size="sm" />
        <label htmlFor="sm">Small</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="md" id="md" size="md" />
        <label htmlFor="md">Medium</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="lg" id="lg" size="lg" />
        <label htmlFor="lg">Large</label>
      </div>
    </RadioGroup>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-5">
      <RadioGroup defaultValue="md-pro" className="flex flex-wrap gap-5">
        <Option value="free" label="Small" size="sm" />
        <Option value="pro" label="Medium" size="md" />
        <Option value="enterprise" label="Large" size="lg" />
      </RadioGroup>
    </div>
  ),
};

export const Disabled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

const plans = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

export function Example() {
  return (
    <RadioGroup defaultValue="pro" disabled>
      {plans.map((p) => (
        <div key={p.value} className="flex items-center gap-2">
          <RadioGroupItem value={p.value} id={p.value} />
          <label htmlFor={p.value}>{p.label}</label>
        </div>
      ))}
    </RadioGroup>
  );
}`,
      },
    },
  },
  render: () => (
    <RadioGroup defaultValue="pro" disabled>
      {plans.map((p) => (
        <Option key={p.value} value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { RadioGroup, RadioGroupItem } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <RadioGroup>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="free" id="inv-free" aria-invalid />  {/* mark options invalid */}
          <label htmlFor="inv-free">Free</label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="pro" id="inv-pro" aria-invalid />
          <label htmlFor="inv-pro">Pro</label>
        </div>
      </RadioGroup>
      <p className="text-sm text-destructive">Please choose a plan.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-1.5">
      <RadioGroup>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="free" id="inv-free" aria-invalid />
          <label htmlFor="inv-free" className="cursor-pointer text-sm text-foreground">
            Free
          </label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="pro" id="inv-pro" aria-invalid />
          <label htmlFor="inv-pro" className="cursor-pointer text-sm text-foreground">
            Pro
          </label>
        </div>
      </RadioGroup>
      <p className="text-sm text-destructive">Please choose a plan.</p>
    </div>
  ),
};
