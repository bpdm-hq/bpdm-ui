import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "./button";

/**
 * Accessible button as an attribute directive on a native `<button>`/`<a>`.
 * Two independent axes — `variant` (colour / severity) and `appearance`
 * (`solid` / `outline` / `ghost`) — plus `size` and `shape`.
 *
 * ```html
 * <button bpdmButton>Save</button>
 * <button bpdmButton variant="success">Publish</button>
 * <button bpdmButton variant="destructive" appearance="outline">Delete</button>
 * <button bpdmButton variant="secondary" appearance="ghost">Cancel</button>
 *
 * <!-- icon-only — always give an aria-label -->
 * <button bpdmButton size="icon" aria-label="Search"><svg>…</svg></button>
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
      options: ["primary", "secondary", "success", "info", "warning", "help", "destructive", "contrast"],
    },
    appearance: { control: "inline-radio", options: ["solid", "outline", "ghost"] },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "iconSm", "icon", "iconLg", "none"],
    },
    shape: { control: "select", options: ["default", "round"] },
  },
  args: { variant: "primary", appearance: "solid", size: "md", shape: "default" },
  render: (args) => ({
    props: args,
    template: `<button bpdmButton [variant]="variant" [appearance]="appearance" [size]="size" [shape]="shape">Button</button>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmButton>;

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

/** Every colour / severity, filled. */
export const AllVariants: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap gap-3">
  <button bpdmButton variant="primary">Primary</button>
  <button bpdmButton variant="secondary">Secondary</button>
  <button bpdmButton variant="success">Success</button>
  <button bpdmButton variant="info">Info</button>
  <button bpdmButton variant="warning">Warning</button>
  <button bpdmButton variant="help">Help</button>
  <button bpdmButton variant="destructive">Destructive</button>
  <button bpdmButton variant="contrast">Contrast</button>
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
    <button bpdmButton variant="success">Success</button>
    <button bpdmButton variant="info">Info</button>
    <button bpdmButton variant="warning">Warning</button>
    <button bpdmButton variant="help">Help</button>
    <button bpdmButton variant="destructive">Destructive</button>
    <button bpdmButton variant="contrast">Contrast</button>
  \`,
})
export class ButtonVariantsComponent {}`,
      },
    },
  },
};

/** Same severities, bordered (transparent fill). */
export const Outlined: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap gap-3">
  <button bpdmButton variant="primary" appearance="outline">Primary</button>
  <button bpdmButton variant="secondary" appearance="outline">Secondary</button>
  <button bpdmButton variant="success" appearance="outline">Success</button>
  <button bpdmButton variant="info" appearance="outline">Info</button>
  <button bpdmButton variant="warning" appearance="outline">Warning</button>
  <button bpdmButton variant="help" appearance="outline">Help</button>
  <button bpdmButton variant="destructive" appearance="outline">Destructive</button>
  <button bpdmButton variant="contrast" appearance="outline">Contrast</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-outlined',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton variant="primary" appearance="outline">Primary</button>
    <button bpdmButton variant="success" appearance="outline">Success</button>
    <button bpdmButton variant="destructive" appearance="outline">Destructive</button>
    <button bpdmButton variant="contrast" appearance="outline">Contrast</button>
  \`,
})
export class ButtonOutlinedComponent {}`,
      },
    },
  },
};

/** Same severities, no border or fill. */
export const Ghost: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex flex-wrap gap-3">
  <button bpdmButton variant="primary" appearance="ghost">Primary</button>
  <button bpdmButton variant="secondary" appearance="ghost">Secondary</button>
  <button bpdmButton variant="success" appearance="ghost">Success</button>
  <button bpdmButton variant="info" appearance="ghost">Info</button>
  <button bpdmButton variant="warning" appearance="ghost">Warning</button>
  <button bpdmButton variant="help" appearance="ghost">Help</button>
  <button bpdmButton variant="destructive" appearance="ghost">Destructive</button>
  <button bpdmButton variant="contrast" appearance="ghost">Contrast</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-button-ghost',
  imports: [BpdmButton],
  template: \`
    <button bpdmButton variant="primary" appearance="ghost">Primary</button>
    <button bpdmButton variant="success" appearance="ghost">Success</button>
    <button bpdmButton variant="destructive" appearance="ghost">Destructive</button>
    <button bpdmButton variant="secondary" appearance="ghost">Secondary</button>
  \`,
})
export class ButtonGhostComponent {}`,
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
  <button bpdmButton variant="secondary" appearance="outline">
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
    <button bpdmButton variant="secondary" appearance="outline">
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

/** Icon-only matrix: every severity × every appearance. Round, `size="icon"`, with an `aria-label`. */
export const IconOnly: Story = {
  tags: ["!dev"],
  render: () => ({
    props: {
      severities: ["primary", "secondary", "success", "info", "warning", "help", "destructive", "contrast"],
      appearances: ["solid", "outline", "ghost"],
    },
    template: `<div class="space-y-3">
  @for (a of appearances; track a) {
    <div class="flex flex-wrap gap-3">
      @for (s of severities; track s) {
        <button bpdmButton size="icon" shape="round" [variant]="s" [appearance]="a" [attr.aria-label]="s">
          @switch (s) {
            @case ('primary') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg> }
            @case ('secondary') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3" /></svg> }
            @case ('success') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M20 6 9 17l-5-5" /></svg> }
            @case ('info') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg> }
            @case ('warning') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> }
            @case ('help') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" /></svg> }
            @case ('destructive') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> }
            @case ('contrast') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg> }
          }
        </button>
      }
    </div>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton } from '@bpdm/ng';

type Severity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'destructive' | 'contrast';

@Component({
  selector: 'app-button-icon-only',
  imports: [BpdmButton],
  template: \`
    @for (a of appearances; track a) {
      <div class="flex flex-wrap gap-3">
        @for (s of severities; track s) {
          <button bpdmButton size="icon" shape="round" [variant]="s" [appearance]="a" [attr.aria-label]="s">
            @switch (s) {
              @case ('primary') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M5 12h14M12 5v14" /></svg> }
              @case ('secondary') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3" /></svg> }
              @case ('success') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M20 6 9 17l-5-5" /></svg> }
              @case ('info') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg> }
              @case ('warning') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg> }
              @case ('help') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 5L2 7" /></svg> }
              @case ('destructive') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg> }
              @case ('contrast') { <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" /></svg> }
            }
          </button>
        }
      </div>
    }
  \`,
})
export class ButtonIconOnlyComponent {
  severities: Severity[] = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'destructive', 'contrast'];
  appearances = ['solid', 'outline', 'ghost'] as const;
}`,
      },
    },
  },
};

/** Circle icon buttons: `shape="round"` turns the square into a circle. */
export const RoundIcon: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton size="iconSm" shape="round" variant="secondary" appearance="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
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
    <button bpdmButton size="iconSm" shape="round" variant="secondary" appearance="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
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
  <button bpdmButton size="icon" variant="secondary" appearance="outline" aria-label="Search (preset)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="none" variant="secondary" appearance="ghost" class="size-6 rounded-md" aria-label="Search (size-6)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
  <button bpdmButton size="none" variant="secondary" appearance="outline" class="h-7 rounded-md px-2 text-xs">Tiny</button>
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
    <button bpdmButton size="icon" variant="secondary" appearance="outline" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
    <button bpdmButton size="none" variant="secondary" appearance="ghost" class="size-6 rounded-md" aria-label="Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg></button>
    <button bpdmButton size="none" variant="secondary" appearance="outline" class="h-7 px-2 text-xs rounded-md">Tiny</button>
    <button bpdmButton size="none" variant="primary" class="h-14 px-8 text-lg rounded-2xl">Chunky</button>
  \`,
})
export class ButtonCustomSizeComponent {}`,
      },
    },
  },
};

/** Pill: `shape="round"` gives fully-rounded ends — works with every severity. */
export const Pill: Story = {
  tags: ["!dev"],
  render: () => ({
    props: {
      colors: ["primary", "secondary", "success", "info", "warning", "help", "destructive", "contrast"],
    },
    template: `<div class="flex flex-wrap items-center gap-3">
  @for (v of colors; track v) {
    <button bpdmButton shape="round" [variant]="v" class="capitalize">{{ v }}</button>
  }
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
    <button bpdmButton shape="round" variant="primary">Primary</button>
    <button bpdmButton shape="round" variant="secondary">Secondary</button>
    <button bpdmButton shape="round" variant="success">Success</button>
    <button bpdmButton shape="round" variant="info">Info</button>
    <button bpdmButton shape="round" variant="warning">Warning</button>
    <button bpdmButton shape="round" variant="help">Help</button>
    <button bpdmButton shape="round" variant="destructive">Destructive</button>
    <button bpdmButton shape="round" variant="contrast">Contrast</button>
  \`,
})
export class ButtonPillComponent {}`,
      },
    },
  },
};
