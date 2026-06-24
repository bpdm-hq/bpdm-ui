import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmTreeSelect, type TreeNode } from "./tree-select";

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

const usage = `
Hierarchical multi-select. Expand/collapse branches; checking a parent selects all
its (enabled) leaves, and a parent shows indeterminate when only some leaves are
selected. Selection is leaf-based — \`value\` is the array of selected leaf values.

\`\`\`html
<bpdm-tree-select [options]="categories" searchable />
\`\`\`
`;

const meta: Meta<BpdmTreeSelect> = {
  title: "Selection/TreeSelect",
  component: BpdmTreeSelect,
  decorators: [moduleMetadata({ imports: [BpdmTreeSelect] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    searchable: { control: "boolean" },
    selectAll: { control: "boolean" },
    maxDisplay: { control: { type: "number", min: 0, max: 6 } },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    options: { table: { disable: true } },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    valueChange: { table: { disable: true } },
  },
  args: {
    options: TREE,
    placeholder: "Select categories",
    maxDisplay: 3,
    searchable: false,
    size: "md",
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-80">
  <bpdm-tree-select [options]="options" [placeholder]="placeholder" [maxDisplay]="maxDisplay" [searchable]="searchable" [selectAll]="selectAll ?? true" [size]="size" [disabled]="disabled ?? false" />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmTreeSelect>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree',
  imports: [BpdmTreeSelect],
  template: \`<bpdm-tree-select [options]="categories" placeholder="Select categories" />\`,
})
export class TreeComponent {
  categories: TreeNode[] = [
    {
      value: 'electronics',
      label: 'Electronics',
      children: [
        { value: 'phones', label: 'Phones', children: [
          { value: 'iphone', label: 'iPhone 15' },
          { value: 'pixel', label: 'Pixel 9' },
          { value: 'galaxy', label: 'Galaxy S24' },
        ] },
        { value: 'laptops', label: 'Laptops', children: [
          { value: 'macbook', label: 'MacBook Pro' },
        ] },
        { value: 'audio', label: 'Audio', children: [
          { value: 'airpods', label: 'AirPods Pro' },
          { value: 'sony', label: 'Sony WH-1000XM5' },
        ] },
      ],
    },
  ];
}`,
      },
    },
  },
};

/** Checking a parent selects all its leaves; partial selection shows indeterminate. */
export const ParentChild: Story = {
  render: () => ({
    props: { options: TREE, dv: ["iphone", "pixel"] },
    template: `<div class="w-80"><bpdm-tree-select [options]="options" [defaultValue]="dv" placeholder="Select categories" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree',
  imports: [BpdmTreeSelect],
  template: \`<bpdm-tree-select [options]="categories" [defaultValue]="['iphone','pixel']" placeholder="Select categories" />\`,
})
export class TreeComponent {
  categories: TreeNode[] = [
    { value: 'electronics', label: 'Electronics', children: [
      { value: 'phones', label: 'Phones', children: [
        { value: 'iphone', label: 'iPhone 15' },
        { value: 'pixel', label: 'Pixel 9' },
        { value: 'galaxy', label: 'Galaxy S24' },
      ] },
      { value: 'laptops', label: 'Laptops', children: [
        { value: 'macbook', label: 'MacBook Pro' },
        { value: 'xps', label: 'Dell XPS' },
      ] },
    ] },
  ];
}`,
      },
    },
  },
};

/** Type to filter — matching branches auto-expand. */
export const Searchable: Story = {
  tags: ["!dev"],
  args: { searchable: true, placeholder: "Search categories" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree-search',
  imports: [BpdmTreeSelect],
  template: \`<bpdm-tree-select searchable [options]="categories" placeholder="Search categories" />\`,
})
export class TreeSearchComponent {
  categories: TreeNode[] = [
    { value: 'electronics', label: 'Electronics', children: [
      { value: 'phones', label: 'Phones', children: [
        { value: 'iphone', label: 'iPhone 15' },
        { value: 'pixel', label: 'Pixel 9' },
      ] },
      { value: 'laptops', label: 'Laptops', children: [
        { value: 'macbook', label: 'MacBook Pro' },
        { value: 'xps', label: 'Dell XPS' },
      ] },
    ] },
  ];
}`,
      },
    },
  },
};

/** Many leaves selected — chips overflow into "+N". */
export const ManySelected: Story = {
  tags: ["!dev"],
  render: () => ({
    props: {
      options: TREE,
      dv: ["iphone", "pixel", "macbook", "airpods", "m-shoes", "decor"],
    },
    template: `<div class="w-80"><bpdm-tree-select searchable [maxDisplay]="3" [options]="options" [defaultValue]="dv" placeholder="Select categories" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree-many',
  imports: [BpdmTreeSelect],
  template: \`<bpdm-tree-select searchable [maxDisplay]="3" [options]="categories" [defaultValue]="['iphone','pixel','macbook','airpods']" placeholder="Select categories" />\`,
})
export class TreeManyComponent {
  categories: TreeNode[] = [
    { value: 'electronics', label: 'Electronics', children: [
      { value: 'phones', label: 'Phones', children: [
        { value: 'iphone', label: 'iPhone 15' },
        { value: 'pixel', label: 'Pixel 9' },
      ] },
      { value: 'laptops', label: 'Laptops', children: [
        { value: 'macbook', label: 'MacBook Pro' },
      ] },
      { value: 'audio', label: 'Audio', children: [
        { value: 'airpods', label: 'AirPods Pro' },
      ] },
    ] },
  ];
}`,
      },
    },
  },
};

/** \`maxDisplay=0\` → show a count instead of chips. */
export const CountMode: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: TREE, dv: ["iphone", "macbook", "shoes"] },
    template: `<div class="w-72"><bpdm-tree-select [options]="options" [maxDisplay]="0" [defaultValue]="dv" placeholder="Select categories" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree-count',
  imports: [BpdmTreeSelect],
  template: \`<bpdm-tree-select [options]="categories" [maxDisplay]="0" [defaultValue]="['iphone','macbook']" placeholder="Select categories" />\`,
})
export class TreeCountComponent {
  categories: TreeNode[] = [
    { value: 'electronics', label: 'Electronics', children: [
      { value: 'phones', label: 'Phones', children: [
        { value: 'iphone', label: 'iPhone 15' },
      ] },
      { value: 'laptops', label: 'Laptops', children: [
        { value: 'macbook', label: 'MacBook Pro' },
      ] },
    ] },
  ];
}`,
      },
    },
  },
};

/** Invalid state (red border). */
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: TREE },
    template: `<div class="flex w-80 flex-col gap-1.5">
  <bpdm-tree-select aria-invalid [options]="options" placeholder="Required" />
  <p class="text-sm text-destructive">Select at least one category.</p>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTreeSelect, TreeNode } from '@bpdm/ng';

@Component({
  selector: 'app-tree-invalid',
  imports: [BpdmTreeSelect],
  template: \`
    <div class="flex w-80 flex-col gap-1.5">
      <bpdm-tree-select aria-invalid [options]="categories" placeholder="Required" />
      <p class="text-sm text-destructive">Select at least one category.</p>
    </div>
  \`,
})
export class TreeInvalidComponent {
  categories: TreeNode[] = [
    { value: 'electronics', label: 'Electronics', children: [
      { value: 'iphone', label: 'iPhone 15' },
      { value: 'macbook', label: 'MacBook Pro' },
    ] },
  ];
}`,
      },
    },
  },
};
