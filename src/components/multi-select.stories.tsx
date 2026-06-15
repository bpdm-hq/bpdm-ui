import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { MultiSelect } from "./multi-select";
import type { SelectItems } from "./select";

const usage = `
Searchable, virtualized **multi-select**. Same options (flat or grouped) as Select,
always virtualized. The trigger shows up to \`maxDisplay\` chips then "+N" — or a
count when \`maxDisplay={0}\`. Value is a string array.

\`\`\`tsx
import { MultiSelect } from "@bpdm/ui";

<MultiSelect
  options={frameworks}
  value={value}
  onValueChange={setValue}
  maxDisplay={3}        // 3 chips, then "+N"
  searchable
/>
\`\`\`
`;

const FRAMEWORKS: SelectItems = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

const meta: Meta<typeof MultiSelect> = {
  title: "Components/MultiSelect",
  component: MultiSelect,
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
    selectAll: { control: "boolean" },
    maxDisplay: { control: { type: "number", min: 0, max: 6 } },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    options: { table: { disable: true } },
    value: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    options: FRAMEWORKS,
    placeholder: "Select frameworks",
    maxDisplay: 3,
    searchable: true,
    size: "md",
  },
  render: (args) => (
    <div className="w-80">
      <MultiSelect {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MultiSelect>;

export const Playground: Story = {};

// chips capped at maxDisplay, the rest collapse into "+N"
export const ChipsWithOverflow: Story = {
  parameters: {
    docs: { source: { code: `<MultiSelect options={…} maxDisplay={2} defaultValue={["react","vue","svelte","solid"]} />` } },
  },
  render: () => (
    <div className="w-80">
      <MultiSelect
        options={FRAMEWORKS}
        maxDisplay={2}
        defaultValue={["react", "vue", "svelte", "solid"]}
        placeholder="Select frameworks"
      />
    </div>
  ),
};

// maxDisplay={0} → show a count instead of chips
export const CountMode: Story = {
  parameters: {
    docs: { source: { code: `<MultiSelect options={…} maxDisplay={0} defaultValue={["react","vue","svelte"]} />` } },
  },
  render: () => (
    <div className="w-72">
      <MultiSelect
        options={FRAMEWORKS}
        maxDisplay={0}
        defaultValue={["react", "vue", "svelte"]}
        placeholder="Select frameworks"
      />
    </div>
  ),
};

// grouped + searchable
const CITIES: SelectItems = [
  { label: "🇩🇪 Germany", options: [
    { value: "berlin", label: "Berlin" }, { value: "munich", label: "Munich" }, { value: "hamburg", label: "Hamburg" },
  ] },
  { label: "🇺🇸 USA", options: [
    { value: "nyc", label: "New York" }, { value: "la", label: "Los Angeles" }, { value: "chicago", label: "Chicago" },
  ] },
];

export const Grouped: Story = {
  parameters: {
    docs: { source: { code: `<MultiSelect options={groupedCities} searchable placeholder="Select cities" />` } },
  },
  render: () => (
    <div className="w-72">
      <MultiSelect options={CITIES} searchable placeholder="Select cities" defaultValue={["berlin"]} />
    </div>
  ),
};

// 10,000 options — virtualized (always-on), multi-select stays smooth
const BIG: SelectItems = Array.from({ length: 10000 }, (_, i) => ({
  value: String(i),
  label: `Record #${(i + 1).toLocaleString()}`,
}));

export const LargeDataset_10k: Story = {
  parameters: {
    docs: {
      source: {
        code: `// 10,000 options — select many, scroll/search stays smooth
<MultiSelect searchable maxDisplay={3} options={tenThousand} placeholder="Pick records" />`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <MultiSelect
        searchable
        maxDisplay={3}
        options={BIG}
        placeholder="Pick records"
        searchPlaceholder="Type a number…"
      />
    </div>
  ),
};

export const Invalid: Story = {
  parameters: {
    docs: { source: { code: `<MultiSelect aria-invalid options={…} placeholder="Required" />` } },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-1.5">
      <MultiSelect aria-invalid options={FRAMEWORKS} placeholder="Required" />
      <p className="text-sm text-destructive">Select at least one.</p>
    </div>
  ),
};
