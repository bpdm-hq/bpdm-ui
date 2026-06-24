import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmMultiSelect } from "./multi-select";
import type { SelectItems } from "../select/select";

const FRAMEWORKS: SelectItems = [
  "React", "Vue", "Angular", "Svelte", "Solid", "Qwik", "Preact",
  "Ember", "Lit", "Alpine", "Next.js", "Remix", "Astro", "Nuxt",
].map((label) => ({ value: label.toLowerCase(), label }));

const BIG: SelectItems = Array.from({ length: 10000 }, (_, i) => ({
  value: String(i),
  label: `Record #${(i + 1).toLocaleString()}`,
}));

const CITIES: SelectItems = [
  {
    label: "🇩🇪 Germany",
    options: [
      { value: "berlin", label: "Berlin" },
      { value: "frankfurt", label: "Frankfurt" },
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

const usage = `
Searchable, virtualized multi-select (Select's bigger sibling). Same \`options\`
(flat or grouped), always virtualized. The trigger shows up to \`maxDisplay\` chips
then "+N" — or a count when \`maxDisplay=0\`. Optional "Select all" row.

\`\`\`html
<bpdm-multi-select [options]="frameworks" [maxDisplay]="2" searchable />
\`\`\`
`;

const meta: Meta<BpdmMultiSelect> = {
  title: "Selection/MultiSelect",
  component: BpdmMultiSelect,
  decorators: [moduleMetadata({ imports: [BpdmMultiSelect] })],
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
    options: FRAMEWORKS,
    placeholder: "Select frameworks",
    maxDisplay: 3,
    searchable: true,
    size: "md",
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-80">
  <bpdm-multi-select [options]="options" [placeholder]="placeholder" [maxDisplay]="maxDisplay" [searchable]="searchable" [selectAll]="selectAll ?? true" [size]="size" [disabled]="disabled ?? false" />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmMultiSelect>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select searchable [options]="frameworks" [maxDisplay]="3" placeholder="Select frameworks" />\`,
})
export class MultiComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
    'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
  ].map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};

/** Chips capped at `maxDisplay`, the rest collapse into "+N". */
export const ChipsWithOverflow: Story = {
  render: () => ({
    props: { options: FRAMEWORKS, dv: ["react", "vue", "svelte", "solid"] },
    template: `<div class="w-80"><bpdm-multi-select [options]="options" [maxDisplay]="2" [defaultValue]="dv" placeholder="Select frameworks" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi-overflow',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select [options]="frameworks" [maxDisplay]="2" [defaultValue]="['react','vue','svelte','solid']" placeholder="Select frameworks" />\`,
})
export class MultiOverflowComponent {
  frameworks: SelectItems = ['React', 'Vue', 'Svelte', 'Solid']
    .map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};

/** `maxDisplay=0` → show a count instead of chips. */
export const CountMode: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: FRAMEWORKS, dv: ["react", "vue", "angular", "svelte", "solid"] },
    template: `<div class="w-80"><bpdm-multi-select [options]="options" [maxDisplay]="0" [defaultValue]="dv" placeholder="Select frameworks" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi-count',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select [options]="frameworks" [maxDisplay]="0" [defaultValue]="['react','vue','angular','svelte','solid']" placeholder="Select frameworks" />\`,
})
export class MultiCountComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid',
  ].map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};

/** Grouped options. */
export const Grouped: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: CITIES, dv: ["berlin", "munich"] },
    template: `<div class="w-80"><bpdm-multi-select searchable [options]="options" [defaultValue]="dv" placeholder="Select cities" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi-grouped',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select searchable [options]="cities" [defaultValue]="['berlin','munich']" placeholder="Select cities" />\`,
})
export class MultiGroupedComponent {
  cities: SelectItems = [
    {
      label: '🇩🇪 Germany',
      options: [
        { value: 'berlin', label: 'Berlin' },
        { value: 'frankfurt', label: 'Frankfurt' },
        { value: 'munich', label: 'Munich' },
      ],
    },
    {
      label: '🇺🇸 USA',
      options: [
        { value: 'nyc', label: 'New York' },
        { value: 'la', label: 'Los Angeles' },
        { value: 'chicago', label: 'Chicago' },
      ],
    },
  ];
}`,
      },
    },
  },
};

/** 10,000 options — virtualized, multi-select stays smooth. */
export const LargeDataset_10k: Story = {
  render: () => ({
    props: { options: BIG, dv: ["3", "7"] },
    template: `<div class="w-80"><bpdm-multi-select [options]="options" [defaultValue]="dv" placeholder="Pick from 10,000" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi-big',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select [options]="options" placeholder="Pick from 10,000" />\`,
})
export class MultiBigComponent {
  options: SelectItems = Array.from({ length: 10000 }, (_, i) => ({
    value: String(i),
    label: \`Record #\${i + 1}\`,
  }));
}`,
      },
    },
  },
};

/** Invalid state (red border). */
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: FRAMEWORKS },
    template: `<div class="w-80"><bpdm-multi-select aria-invalid [options]="options" placeholder="Required" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmMultiSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-multi-invalid',
  imports: [BpdmMultiSelect],
  template: \`<bpdm-multi-select aria-invalid [options]="options" placeholder="Required" />\`,
})
export class MultiInvalidComponent {
  options: SelectItems = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
  ];
}`,
      },
    },
  },
};
