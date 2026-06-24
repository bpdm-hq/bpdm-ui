import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "./button";

/**
 * Accessible button as an attribute directive on a native `<button>`/`<a>`.
 * Supports `variant`, `size`, and `shape`.
 *
 * ```html
 * <button bpdmButton>Save</button>
 * <button bpdmButton variant="outline" size="lg">Cancel</button>
 *
 * <!-- icon-only — always give an aria-label -->
 * <button bpdmButton size="icon" aria-label="Search"><svg>…</svg></button>
 *
 * <!-- circle / pill -->
 * <button bpdmButton size="icon" shape="round" aria-label="Add"><svg>…</svg></button>
 *
 * <!-- render as a link -->
 * <a bpdmButton href="/docs">Docs</a>
 * ```
 */
const meta: Meta<BpdmButton> = {
  title: "Actions/Button",
  component: BpdmButton,
  decorators: [moduleMetadata({ imports: [BpdmButton] })],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "iconSm", "icon", "iconLg", "none"],
    },
    shape: { control: "select", options: ["default", "round"] },
  },
  args: { variant: "primary", size: "md", shape: "default" },
  render: (args) => ({
    props: args,
    template: `<button bpdmButton [variant]="variant" [size]="size" [shape]="shape">Button</button>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmButton>;

/** Interactive — tweak variant / size / shape live from the Controls panel. */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button',
  imports: [BpdmButton],
  template: \`<button bpdmButton variant="primary">Button</button>\`,
})
export class ButtonComponent {}`,
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap gap-3">
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
    <button bpdmButton variant="primary">Primary</button>
    <button bpdmButton variant="secondary">Secondary</button>
    <button bpdmButton variant="outline">Outline</button>
    <button bpdmButton variant="ghost">Ghost</button>
    <button bpdmButton variant="destructive">Destructive</button>
  \`,
})
export class ButtonVariantsComponent {}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
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
    <button bpdmButton size="sm">Small</button>
    <button bpdmButton size="md">Medium</button>
    <button bpdmButton size="lg">Large</button>
  \`,
})
export class ButtonSizesComponent {}`,
      },
    },
  },
};

/** Icon + text: just drop an icon inside — the base `gap-2` spaces it. */
export const WithIcon: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap items-center gap-3">
  <button bpdmButton>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg>
    New item
  </button>
  <button bpdmButton variant="outline">
    Continue
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
  </button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-icon',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg>
      New item
    </button>
    <button bpdmButton variant="outline">
      Continue
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </button>
  \`,
})
export class ButtonIconComponent {}`,
      },
    },
  },
};

/** Icon-only: square `size="icon"`. Always pass an `aria-label` — there's no visible text. */
export const IconOnly: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton size="icon" aria-label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg></button>
  <button bpdmButton size="icon" variant="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="icon" variant="ghost" aria-label="Like"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg></button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-icon-only',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton size="icon" aria-label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg></button>
    <button bpdmButton size="icon" variant="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
    <button bpdmButton size="icon" variant="ghost" aria-label="Like"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg></button>
  \`,
})
export class ButtonIconOnlyComponent {}`,
      },
    },
  },
};

/** Circle icon buttons: `shape="round"` turns the square into a circle. */
export const RoundIcon: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton size="iconSm" shape="round" variant="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="icon" shape="round" aria-label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M5 12h14M12 5v14" /></svg></button>
  <button bpdmButton size="iconLg" shape="round" variant="secondary" aria-label="Like"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg></button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-round',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton size="iconSm" shape="round" variant="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
    <button bpdmButton size="icon" shape="round" aria-label="Add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M5 12h14M12 5v14" /></svg></button>
    <button bpdmButton size="iconLg" shape="round" variant="secondary" aria-label="Like"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg></button>
  \`,
})
export class ButtonRoundComponent {}`,
      },
    },
  },
};

/** `size="none"` drops the preset height/padding so you own the sizing via classes. */
export const CustomSize: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton size="icon" variant="outline" aria-label="Search (preset)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="none" variant="ghost" class="size-6 rounded-md" aria-label="Search (size-6)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="none" variant="outline" class="h-7 rounded-md px-2 text-xs">Tiny</button>
  <button bpdmButton size="none" variant="primary" class="h-14 rounded-2xl px-8 text-lg">Chunky</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-custom-size',
  imports: [BpdmButton],
  template: \`
    <!-- preset sizing -->
    <button bpdmButton size="icon" variant="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>

    <!-- bring your own dimensions -->
    <button bpdmButton size="none" variant="ghost" class="size-6 rounded-md" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
    <button bpdmButton size="none" variant="outline" class="h-7 px-2 text-xs rounded-md">Tiny</button>
    <button bpdmButton size="none" variant="primary" class="h-14 px-8 text-lg rounded-2xl">Chunky</button>
  \`,
})
export class ButtonCustomSizeComponent {}`,
      },
    },
  },
};

/** Pill: `shape="round"` on a text button gives fully-rounded ends. */
export const Pill: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton shape="round">Rounded pill</button>
  <button bpdmButton shape="round" variant="outline">
    Filter
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
  </button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-pill',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton shape="round">Rounded pill</button>
    <button bpdmButton shape="round" variant="outline">
      Filter
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
    </button>
  \`,
})
export class ButtonPillComponent {}`,
      },
    },
  },
};
