import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Calendar, Lock, Mail, Search } from "lucide-react";
import { Input } from "./input";

const usage = `
Accessible text input with sizes, icon adornments, and an invalid state driven by
\`aria-invalid\`. Forwards a ref and accepts all native \`<input>\` props
(\`type\`, \`placeholder\`, \`disabled\`, \`readOnly\`, …).

\`\`\`tsx
import { Input } from "@bpdm/ui";

<Input placeholder="Email" type="email" />
<Input size="lg" placeholder="Search" startIcon={<SearchIcon />} />
<Input aria-invalid placeholder="Required" />   // red border + ring
<Input disabled placeholder="Disabled" />
\`\`\`
`;

const meta: Meta<typeof Input> = {
  title: "Inputs/Input",
  component: Input,
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
    variant: { control: "select", options: ["outline", "underline"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: { placeholder: "Type here…", size: "md" },
  render: (args) => (
    <div className="w-80">
      <Input {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Playground: Story = {};

// outline (boxed, default) vs underline (Material-style bottom line).
export const Variants: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-6">
      <Input variant="outline" placeholder="Outline (default)" />
      <Input variant="underline" placeholder="Underline" />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-6">
      <Input variant="outline" placeholder="Outline (default)" />
      <Input variant="underline" placeholder="Underline" />
    </div>
  ),
};

// All key states at a glance.
export const States: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Default" />
      <Input defaultValue="With value" />
      <Input aria-invalid defaultValue="Invalid value" />
      <Input disabled placeholder="Disabled" />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Default" />
      <Input defaultValue="With value" />
      <Input aria-invalid defaultValue="Invalid value" />
      <Input disabled placeholder="Disabled" />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

// Leading / trailing icons via startIcon / endIcon.
export const WithIcons: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Calendar, Lock, Mail, Search } from "lucide-react";
import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Search" startIcon={<Search />} />            {/* leading */}
      <Input placeholder="Pick a date" endIcon={<Calendar />} />        {/* trailing */}
      <Input type="email" placeholder="Email" startIcon={<Mail />} />
      <Input type="password" placeholder="Password" startIcon={<Lock />} endIcon={<span>👁</span>} />  {/* both */}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input placeholder="Search" startIcon={<Search />} />
      <Input placeholder="Pick a date" endIcon={<Calendar />} />
      <Input type="email" placeholder="Email" startIcon={<Mail />} />
      <Input
        type="password"
        placeholder="Password"
        startIcon={<Lock />}
        endIcon={<span className="text-xs">👁</span>}
      />
    </div>
  ),
};

// Native types just work.
export const Types: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Input type="email" placeholder="email" />
      <Input type="password" placeholder="password" />
      <Input type="number" placeholder="0" />
      <Input type="file" />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <Input type="email" placeholder="email" />
      <Input type="password" placeholder="password" />
      <Input type="number" placeholder="0" />
      <Input type="file" />
    </div>
  ),
};

// Real-world composition: label + input + helper / error text.
export const FormField: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Input } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="email" className="text-sm font-medium">Email</label>
      <Input id="email" type="email" aria-invalid aria-describedby="email-err" placeholder="name@company.com" />
      <p id="email-err" className="text-sm text-destructive">Enter a valid email address.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Full name
        </label>
        <Input id="name" placeholder="Ada Lovelace" />
        <p className="text-sm text-muted-foreground">As it appears on your ID.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          type="email"
          aria-invalid
          aria-describedby="email-err"
          defaultValue="not-an-email"
          startIcon={<Mail />}
        />
        <p id="email-err" className="text-sm text-destructive">
          Enter a valid email address.
        </p>
      </div>
    </div>
  ),
};
