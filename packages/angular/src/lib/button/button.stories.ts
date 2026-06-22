import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "./button";

/**
 * `bpdmButton` turns a native `<button>` or `<a>` into a bpdm button — variants,
 * sizes and shapes come from the shared design system, so it matches the React
 * button exactly, motion touch included.
 */
const meta: Meta<BpdmButton> = {
  title: "Actions/Button",
  decorators: [moduleMetadata({ imports: [BpdmButton] })],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
      description: "Visual style",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "iconSm", "icon", "iconLg", "none"],
      description: "Text size, square icon size, or `none`",
    },
    shape: {
      control: "select",
      options: ["default", "round"],
      description: "`default` token radius, or `round` pill / circle",
    },
  },
  args: { variant: "primary", size: "md", shape: "default" },
  render: (args) => ({
    props: args,
    template: `<button bpdmButton [variant]="variant" [size]="size" [shape]="shape">Save changes</button>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmButton>;

/** Play with every option from the controls panel. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-demo',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton variant="primary" size="md" shape="default">
      Save changes
    </button>
  \`,
})
export class ButtonDemoComponent {}`,
      },
    },
  },
};

/** The five visual styles. */
export const Variants: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  <button bpdmButton variant="primary">Primary</button>
  <button bpdmButton variant="secondary">Secondary</button>
  <button bpdmButton variant="outline">Outline</button>
  <button bpdmButton variant="ghost">Ghost</button>
  <button bpdmButton variant="destructive">Destructive</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-variants',
  imports: [BpdmButton],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <button bpdmButton variant="primary">Primary</button>
      <button bpdmButton variant="secondary">Secondary</button>
      <button bpdmButton variant="outline">Outline</button>
      <button bpdmButton variant="ghost">Ghost</button>
      <button bpdmButton variant="destructive">Destructive</button>
    </div>
  \`,
})
export class ButtonVariantsComponent {}`,
      },
    },
  },
};

/** Text sizes, side by side. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  <button bpdmButton size="sm">Small</button>
  <button bpdmButton size="md">Medium</button>
  <button bpdmButton size="lg">Large</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-sizes',
  imports: [BpdmButton],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <button bpdmButton size="sm">Small</button>
      <button bpdmButton size="md">Medium</button>
      <button bpdmButton size="lg">Large</button>
    </div>
  \`,
})
export class ButtonSizesComponent {}`,
      },
    },
  },
};

/** `round` makes a text button a pill, or a square icon button a circle. */
export const Shapes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  <button bpdmButton shape="default">Default radius</button>
  <button bpdmButton shape="round">Round pill</button>
  <button bpdmButton size="icon" shape="round" aria-label="Add">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-shapes',
  imports: [BpdmButton],
  template: \`
    <div class="flex flex-wrap items-center gap-3">
      <button bpdmButton shape="default">Default radius</button>
      <button bpdmButton shape="round">Round pill</button>
      <button bpdmButton size="icon" shape="round" aria-label="Add">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  \`,
})
export class ButtonShapesComponent {}`,
      },
    },
  },
};

/** The same styling on an anchor — a real link, keyboard and all. */
export const AsLink: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<a bpdmButton variant="primary" href="https://ui.bpdm.dev" target="_blank" rel="noopener">Open the docs</a>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-link',
  imports: [BpdmButton],
  template: \`
    <a bpdmButton variant="primary" href="https://ui.bpdm.dev"
       target="_blank" rel="noopener">Open the docs</a>
  \`,
})
export class ButtonLinkComponent {}`,
      },
    },
  },
};
