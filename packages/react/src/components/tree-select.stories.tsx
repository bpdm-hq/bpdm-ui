import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { TreeSelect, type TreeNode } from "./tree-select";

const usage = `
Hierarchical multi-select. Expand/collapse branches; checking a parent selects all
its leaves, and a parent shows **indeterminate** when only some are selected.
Selection is leaf-based — \`value\` is the array of selected leaf values.

\`\`\`tsx
import { TreeSelect } from "@bpdm/ui";

<TreeSelect
  options={[
    { value: "electronics", label: "Electronics", children: [
      { value: "iphone", label: "iPhone" },
      { value: "pixel", label: "Pixel" },
    ] },
  ]}
  value={value}
  onValueChange={setValue}
/>
\`\`\`
`;

const TREE: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      {
        value: "phones",
        label: "Phones",
        children: [
          { value: "iphone", label: "iPhone 15" },
          { value: "pixel", label: "Pixel 9" },
          { value: "galaxy", label: "Galaxy S24" },
          { value: "oneplus", label: "OnePlus 12" },
        ],
      },
      {
        value: "laptops",
        label: "Laptops",
        children: [
          { value: "macbook", label: "MacBook Pro" },
          { value: "xps", label: "Dell XPS" },
          { value: "thinkpad", label: "ThinkPad X1" },
        ],
      },
      {
        value: "audio",
        label: "Audio",
        children: [
          { value: "airpods", label: "AirPods Pro" },
          { value: "sony", label: "Sony WH-1000XM5" },
          { value: "bose", label: "Bose QC" },
        ],
      },
    ],
  },
  {
    value: "clothing",
    label: "Clothing",
    children: [
      {
        value: "men",
        label: "Men",
        children: [
          { value: "m-shirts", label: "Shirts" },
          { value: "m-shoes", label: "Shoes" },
          { value: "m-jackets", label: "Jackets" },
        ],
      },
      {
        value: "women",
        label: "Women",
        children: [
          { value: "w-dresses", label: "Dresses" },
          { value: "w-bags", label: "Bags" },
          { value: "w-shoes", label: "Shoes" },
        ],
      },
    ],
  },
  {
    value: "home",
    label: "Home & Kitchen",
    children: [
      {
        value: "furniture",
        label: "Furniture",
        children: [
          {
            value: "living",
            label: "Living Room",
            children: [
              { value: "sofas", label: "Sofas" },
              { value: "coffee-tables", label: "Coffee Tables" },
            ],
          },
          {
            value: "bedroom",
            label: "Bedroom",
            children: [
              { value: "beds", label: "Beds" },
              { value: "wardrobes", label: "Wardrobes" },
            ],
          },
        ],
      },
      { value: "cookware", label: "Cookware" },
      { value: "lighting", label: "Lighting" },
    ],
  },
];

const meta: Meta<typeof TreeSelect> = {
  title: "Selection/TreeSelect",
  component: TreeSelect,
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
  args: { options: TREE, placeholder: "Select categories", maxDisplay: 3, searchable: true, size: "md" },
  render: (args) => (
    <div className="w-80">
      <TreeSelect {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof TreeSelect>;

export const Playground: Story = {};

// check a parent → all leaves; parent goes indeterminate when only some are picked
export const ParentChild: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { TreeSelect, type TreeNode } from "@bpdm/ui";

const tree: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      {
        value: "phones",
        label: "Phones",
        children: [
          { value: "iphone", label: "iPhone 15" },
          { value: "pixel", label: "Pixel 9" },
          { value: "galaxy", label: "Galaxy S24" },
        ],
      },
      {
        value: "laptops",
        label: "Laptops",
        children: [
          { value: "macbook", label: "MacBook Pro" },
          { value: "xps", label: "Dell XPS" },
        ],
      },
    ],
  },
];

export function Example() {
  // "Phones" shows indeterminate; checking it selects all phones
  return <TreeSelect options={tree} defaultValue={["iphone", "pixel"]} placeholder="Select categories" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <TreeSelect options={TREE} defaultValue={["iphone", "pixel"]} placeholder="Select categories" />
    </div>
  ),
};

// type to filter — matches + their parents stay visible (auto-expanded)
export const Searchable: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { TreeSelect, type TreeNode } from "@bpdm/ui";

const tree: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      {
        value: "phones",
        label: "Phones",
        children: [
          { value: "iphone", label: "iPhone 15" },
          { value: "pixel", label: "Pixel 9" },
        ],
      },
      {
        value: "laptops",
        label: "Laptops",
        children: [
          { value: "macbook", label: "MacBook Pro" },
          { value: "xps", label: "Dell XPS" },
        ],
      },
    ],
  },
];

export function Example() {
  return <TreeSelect options={tree} searchable placeholder="Search categories" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <TreeSelect options={TREE} searchable placeholder="Search categories" />
    </div>
  ),
};

// many values selected → chips capped at maxDisplay, the rest become "+N"
export const ManySelected: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { TreeSelect, type TreeNode } from "@bpdm/ui";

const tree: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      {
        value: "phones",
        label: "Phones",
        children: [
          { value: "iphone", label: "iPhone 15" },
          { value: "pixel", label: "Pixel 9" },
        ],
      },
      {
        value: "laptops",
        label: "Laptops",
        children: [{ value: "macbook", label: "MacBook Pro" }],
      },
      {
        value: "audio",
        label: "Audio",
        children: [{ value: "airpods", label: "AirPods Pro" }],
      },
    ],
  },
];

export function Example() {
  return (
    <TreeSelect
      options={tree}
      searchable
      maxDisplay={3}
      placeholder="Select categories"
      defaultValue={["iphone", "pixel", "macbook", "airpods"]}
    />
  );
}`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <TreeSelect
        options={TREE}
        searchable
        maxDisplay={3}
        placeholder="Select categories"
        defaultValue={["iphone", "pixel", "macbook", "airpods", "m-shoes", "decor"]}
      />
    </div>
  ),
};

export const CountMode: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { TreeSelect, type TreeNode } from "@bpdm/ui";

const tree: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      {
        value: "phones",
        label: "Phones",
        children: [{ value: "iphone", label: "iPhone 15" }],
      },
      {
        value: "laptops",
        label: "Laptops",
        children: [{ value: "macbook", label: "MacBook Pro" }],
      },
    ],
  },
];

export function Example() {
  return (
    <TreeSelect
      options={tree}
      maxDisplay={0}
      defaultValue={["iphone", "macbook"]}
      placeholder="Select categories"
    />
  );
}`,
      },
    },
  },
  render: () => (
    <div className="w-72">
      <TreeSelect options={TREE} maxDisplay={0} defaultValue={["iphone", "macbook", "shoes"]} placeholder="Select categories" />
    </div>
  ),
};

export const Invalid: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { TreeSelect, type TreeNode } from "@bpdm/ui";

const tree: TreeNode[] = [
  {
    value: "electronics",
    label: "Electronics",
    children: [
      { value: "iphone", label: "iPhone 15" },
      { value: "macbook", label: "MacBook Pro" },
    ],
  },
];

export function Example() {
  return (
    <div className="flex w-80 flex-col gap-1.5">
      <TreeSelect aria-invalid options={tree} placeholder="Required" />
      <p className="text-sm text-destructive">Select at least one category.</p>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex w-80 flex-col gap-1.5">
      <TreeSelect aria-invalid options={TREE} placeholder="Required" />
      <p className="text-sm text-destructive">Select at least one category.</p>
    </div>
  ),
};
