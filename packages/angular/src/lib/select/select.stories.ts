import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmSelect, type SelectItems } from "./select";

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

const usage = `
Single-select dropdown. Data-driven (\`options\`, flat or grouped), always
**virtualized** (10k+ rows stay smooth), with an optional **searchable** filter.
Controlled (\`[(value)]\`) or uncontrolled (\`defaultValue\`).

\`\`\`html
<bpdm-select [options]="frameworks" placeholder="Select a framework" searchable />
\`\`\`
`;

const meta: Meta<BpdmSelect> = {
  title: "Selection/Select",
  component: BpdmSelect,
  decorators: [moduleMetadata({ imports: [BpdmSelect] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    searchable: { control: "boolean" },
    placeholder: { control: "text" },
    maxHeight: { control: { type: "number", min: 120, max: 480, step: 20 } },
    disabled: { control: "boolean" },
    options: { table: { disable: true } },
    value: { table: { disable: true } },
    valueChange: { table: { disable: true } },
  },
  args: {
    options: FRAMEWORKS,
    placeholder: "Select a framework",
    size: "md",
    searchable: false,
    disabled: false,
    maxHeight: 256,
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-72">
  <bpdm-select [options]="options" [placeholder]="placeholder" [size]="size" [searchable]="searchable" [disabled]="disabled" [maxHeight]="maxHeight" />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmSelect>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select',
  imports: [BpdmSelect],
  template: \`<bpdm-select [options]="frameworks" placeholder="Select a framework" />\`,
})
export class SelectComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
    'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
  ].map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};

/** Type to filter the list. */
export const Searchable: Story = {
  args: { searchable: true, placeholder: "Search frameworks" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select-search',
  imports: [BpdmSelect],
  template: \`<bpdm-select searchable [options]="frameworks" placeholder="Search frameworks" />\`,
})
export class SelectSearchComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
    'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
  ].map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};

/** 10,000 rows — virtualized (only visible rows render), no lag. */
export const LargeDataset_10k: Story = {
  args: { options: BIG, placeholder: "Scroll 10,000 records" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select-big',
  imports: [BpdmSelect],
  template: \`<bpdm-select [options]="options" placeholder="Scroll 10,000 records" />\`,
})
export class SelectBigComponent {
  options: SelectItems = Array.from({ length: 10000 }, (_, i) => ({
    value: String(i),
    label: \`Record #\${i + 1}\`,
  }));
}`,
      },
    },
  },
};

/** Grouped options with bold headers. */
export const Groups: Story = {
  tags: ["!dev"],
  args: { options: CITIES, placeholder: "Select a City" },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select-groups',
  imports: [BpdmSelect],
  template: \`<bpdm-select placeholder="Select a City" [options]="cities" />\`,
})
export class SelectGroupsComponent {
  cities: SelectItems = [
    {
      label: '🇩🇪 Germany',
      options: [
        { value: 'berlin', label: 'Berlin' },
        { value: 'frankfurt', label: 'Frankfurt' },
        { value: 'hamburg', label: 'Hamburg' },
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

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { options: FRAMEWORKS },
    template: `<div class="w-72 space-y-3">
  <bpdm-select size="sm" [options]="options" placeholder="Size sm" />
  <bpdm-select size="md" [options]="options" placeholder="Size md" />
  <bpdm-select size="lg" [options]="options" placeholder="Size lg" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select-sizes',
  imports: [BpdmSelect],
  template: \`
    <bpdm-select size="sm" [options]="frameworks" placeholder="Size sm" />
    <bpdm-select size="md" [options]="frameworks" placeholder="Size md" />
    <bpdm-select size="lg" [options]="frameworks" placeholder="Size lg" />
  \`,
})
export class SelectSizesComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
    'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
  ].map((label) => ({ value: label.toLowerCase(), label }));
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
    template: `<div class="w-72"><bpdm-select aria-invalid [options]="options" placeholder="Required" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSelect, SelectItems } from '@bpdm/ng';

@Component({
  selector: 'app-select-invalid',
  imports: [BpdmSelect],
  template: \`<bpdm-select aria-invalid [options]="frameworks" placeholder="Required" />\`,
})
export class SelectInvalidComponent {
  frameworks: SelectItems = [
    'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
    'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
  ].map((label) => ({ value: label.toLowerCase(), label }));
}`,
      },
    },
  },
};
