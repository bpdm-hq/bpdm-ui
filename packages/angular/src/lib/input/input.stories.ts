import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmInput } from "./input";

const ic = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">${paths}</svg>`;
const SEARCH = ic(`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`);
const CALENDAR = ic(`<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>`);
const MAIL = ic(`<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`);

/**
 * Accessible text input with sizes and a boxed (`outline`) or `underline` chrome.
 * Applied as `bpdmInput` on a native `<input>`, so `ngModel`, reactive forms,
 * validation and `type` all work natively. The invalid state is driven by
 * `aria-invalid="true"`.
 */
const meta: Meta<BpdmInput> = {
  title: "Inputs/Input",
  decorators: [moduleMetadata({ imports: [BpdmInput] })],
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["outline", "underline"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { variant: "outline", size: "md" },
  render: (args) => ({
    props: args,
    template: `<div class="w-80"><input bpdmInput [variant]="variant" [size]="size" placeholder="Type here…" /></div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-demo',
  imports: [BpdmInput],
  template: \`<input bpdmInput placeholder="Type here…" />\`,
})
export class InputDemoComponent {}`,
      },
    },
  },
};

/** Boxed (default) vs Material-style underline. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-6">
  <input bpdmInput variant="outline" placeholder="Outline (default)" />
  <input bpdmInput variant="underline" placeholder="Underline" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-variants',
  imports: [BpdmInput],
  template: \`
    <div class="flex w-80 flex-col gap-6">
      <input bpdmInput variant="outline" placeholder="Outline (default)" />
      <input bpdmInput variant="underline" placeholder="Underline" />
    </div>
  \`,
})
export class InputVariantsComponent {}`,
      },
    },
  },
};

/** All key states at a glance. */
export const States: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-3">
  <input bpdmInput placeholder="Default" />
  <input bpdmInput value="With value" />
  <input bpdmInput aria-invalid="true" value="Invalid value" />
  <input bpdmInput disabled placeholder="Disabled" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-states',
  imports: [BpdmInput],
  template: \`
    <div class="flex w-80 flex-col gap-3">
      <input bpdmInput placeholder="Default" />
      <input bpdmInput value="With value" />
      <input bpdmInput aria-invalid="true" value="Invalid value" />
      <input bpdmInput disabled placeholder="Disabled" />
    </div>
  \`,
})
export class InputStatesComponent {}`,
      },
    },
  },
};

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-3">
  <input bpdmInput size="sm" placeholder="Small" />
  <input bpdmInput size="md" placeholder="Medium" />
  <input bpdmInput size="lg" placeholder="Large" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-sizes',
  imports: [BpdmInput],
  template: \`
    <div class="flex w-80 flex-col gap-3">
      <input bpdmInput size="sm" placeholder="Small" />
      <input bpdmInput size="md" placeholder="Medium" />
      <input bpdmInput size="lg" placeholder="Large" />
    </div>
  \`,
})
export class InputSizesComponent {}`,
      },
    },
  },
};

/** Leading / trailing icons — wrap the input and pad it to clear the icon. */
export const WithIcons: Story = {
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-3">
  <div class="relative flex items-center">
    <span class="pointer-events-none absolute left-3 flex items-center text-muted-foreground">${SEARCH}</span>
    <input bpdmInput class="pl-9" placeholder="Search" />
  </div>
  <div class="relative flex items-center">
    <input bpdmInput class="pr-9" placeholder="Pick a date" />
    <span class="pointer-events-none absolute right-3 flex items-center text-muted-foreground">${CALENDAR}</span>
  </div>
  <div class="relative flex items-center">
    <span class="pointer-events-none absolute left-3 flex items-center text-muted-foreground">${MAIL}</span>
    <input bpdmInput class="pl-9" type="email" placeholder="Email" />
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-icons',
  imports: [BpdmInput],
  template: \`
    <div class="relative flex items-center">
      <span class="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
        <svg><!-- search icon --></svg>
      </span>
      <input bpdmInput class="pl-9" placeholder="Search" />
    </div>
  \`,
})
export class InputIconsComponent {}`,
      },
    },
  },
};

/** Native types just work. */
export const Types: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-3">
  <input bpdmInput type="email" placeholder="email" />
  <input bpdmInput type="password" placeholder="password" />
  <input bpdmInput type="number" placeholder="0" />
  <input bpdmInput type="file" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-types',
  imports: [BpdmInput],
  template: \`
    <div class="flex w-80 flex-col gap-3">
      <input bpdmInput type="email" placeholder="email" />
      <input bpdmInput type="password" placeholder="password" />
      <input bpdmInput type="number" placeholder="0" />
      <input bpdmInput type="file" />
    </div>
  \`,
})
export class InputTypesComponent {}`,
      },
    },
  },
};

/** Real-world composition: label + input + helper / error text. */
export const FormField: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-4">
  <div class="flex flex-col gap-1.5">
    <label for="name" class="text-sm font-medium text-foreground">Full name</label>
    <input bpdmInput id="name" placeholder="Ada Lovelace" />
    <p class="text-sm text-muted-foreground">As it appears on your ID.</p>
  </div>
  <div class="flex flex-col gap-1.5">
    <label for="email" class="text-sm font-medium text-foreground">Email</label>
    <input bpdmInput id="email" type="email" aria-invalid="true" aria-describedby="email-err" value="not-an-email" />
    <p id="email-err" class="text-sm text-destructive">Enter a valid email address.</p>
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-input-field',
  imports: [BpdmInput],
  template: \`
    <div class="flex flex-col gap-1.5">
      <label for="email" class="text-sm font-medium">Email</label>
      <input bpdmInput id="email" type="email" aria-invalid="true"
             aria-describedby="email-err" placeholder="name@company.com" />
      <p id="email-err" class="text-sm text-destructive">Enter a valid email address.</p>
    </div>
  \`,
})
export class InputFieldComponent {}`,
      },
    },
  },
};
