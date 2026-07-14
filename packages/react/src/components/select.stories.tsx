import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Circle, CircleCheck, CircleDashed, CircleX } from "lucide-react";
import { Select, type SelectItems } from "./select";

const usage = `
Single-select dropdown — data-driven (\`options\`, flat or grouped), always
**virtualized** (10k+ rows stay smooth), with an optional **searchable** filter.
Controlled (\`value\` + \`onValueChange\`) or uncontrolled (\`defaultValue\`). Width
follows the wrapper.

\`\`\`tsx
import { Select } from "@bpdm/ui";

<Select
  options={[
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
  ]}
  searchable
  placeholder="Select a framework"
/>
\`\`\`
`;

const FRAMEWORKS: SelectItems = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

const meta: Meta<typeof Select> = {
  title: "Selection/Select",
  component: Select,
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
    searchable: { control: "boolean" },
    placeholder: { control: "text" },
    maxHeight: { control: { type: "number", min: 120, max: 480, step: 20 } },
    disabled: { control: "boolean" },
    options: { table: { disable: true } },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    options: FRAMEWORKS,
    placeholder: "Select a framework",
    size: "md",
    searchable: false,
    disabled: false,
  },
  render: (args) => (
    <div className="w-72">
      <Select {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Select>;

export const Playground: Story = {};

// type to filter the list
export const Searchable: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Select } from "@bpdm/ui";

const frameworks = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

export function Example() {
  return <Select searchable options={frameworks} placeholder="Search frameworks" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-72">
      <Select searchable options={FRAMEWORKS} placeholder="Search frameworks" />
    </div>
  ),
};

// 10,000 rows — virtualized, no lag (only visible rows render)
const BIG: SelectItems = Array.from({ length: 10000 }, (_, i) => ({
  value: String(i),
  label: `Record #${(i + 1).toLocaleString()}`,
}));

export const LargeDataset_10k: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Select } from "@bpdm/ui";

// 10,000 rows — virtualized (only visible rows render), no lag
const options = Array.from({ length: 10000 }, (_, i) => ({
  value: String(i),
  label: \`Record #\${i + 1}\`,
}));

export function Example() {
  return <Select options={options} placeholder="Scroll 10,000 records" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-72">
      <Select options={BIG} placeholder="Scroll 10,000 records" />
    </div>
  ),
};

// grouped options with bold, icon-friendly headers
const CITIES: SelectItems = [
  {
    label: "🇩🇪 Germany",
    options: [
      { value: "berlin", label: "Berlin" },
      { value: "frankfurt", label: "Frankfurt" },
      { value: "hamburg", label: "Hamburg" },
      { value: "munich", label: "Munich" },
    ],
  },
  {
    label: "🇺🇸 USA",
    options: [
      { value: "nyc", label: "New York" },
      { value: "la", label: "Los Angeles" },
      { value: "chicago", label: "Chicago" },
    ],
  },
];

export const Groups: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Select } from "@bpdm/ui";

export function Example() {
  return (
    <Select
      placeholder="Select a City"
      options={[
        {
          label: "🇩🇪 Germany",
          options: [
            { value: "berlin", label: "Berlin" },
            { value: "frankfurt", label: "Frankfurt" },
            { value: "hamburg", label: "Hamburg" },
            { value: "munich", label: "Munich" },
          ],
        },
        {
          label: "🇺🇸 USA",
          options: [
            { value: "nyc", label: "New York" },
            { value: "la", label: "Los Angeles" },
            { value: "chicago", label: "Chicago" },
          ],
        },
      ]}
    />
  );
}`,
      },
    },
  },
  render: () => (
    <div className="w-64">
      <Select placeholder="Select a City" options={CITIES} />
    </div>
  ),
};

export const WithIcons: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Circle, CircleCheck, CircleDashed, CircleX } from "lucide-react";
import { Select } from "@bpdm/ui";

const options = [
  { value: "todo", label: "Todo", icon: <Circle className="size-4 text-muted-foreground" /> },
  { value: "in-progress", label: "In progress", icon: <CircleDashed className="size-4 text-primary" /> },
  { value: "done", label: "Done", icon: <CircleCheck className="size-4 text-primary" /> },
  { value: "canceled", label: "Canceled", icon: <CircleX className="size-4 text-destructive" /> },
];

export function Example() {
  return <Select options={options} defaultValue="in-progress" placeholder="Set status" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-64">
      <Select
        defaultValue="in-progress"
        placeholder="Set status"
        options={[
          { value: "todo", label: "Todo", icon: <Circle className="size-4 text-muted-foreground" /> },
          { value: "in-progress", label: "In progress", icon: <CircleDashed className="size-4 text-primary" /> },
          { value: "done", label: "Done", icon: <CircleCheck className="size-4 text-primary" /> },
          { value: "canceled", label: "Canceled", icon: <CircleX className="size-4 text-destructive" /> },
        ]}
      />
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Select } from "@bpdm/ui";

const frameworks = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

export function Example() {
  return (
    <div className="flex w-72 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <Select key={s} size={s} options={frameworks} placeholder={\`Size \${s}\`} />
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {(["sm", "md", "lg"] as const).map((s) => (
        <Select key={s} size={s} options={FRAMEWORKS} placeholder={`Size ${s}`} />
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Select } from "@bpdm/ui";

const frameworks = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

export function Example() {
  return (
    <div className="flex w-72 flex-col gap-1.5">
      <Select aria-invalid options={frameworks} placeholder="Required" />
      <p className="text-sm text-destructive-strong">Please choose a framework.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <Select aria-invalid options={FRAMEWORKS} placeholder="Required" />
      <p className="text-sm text-destructive-strong">Please choose a framework.</p>
    </div>
  ),
};
