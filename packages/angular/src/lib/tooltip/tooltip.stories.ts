import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmTooltip } from "./tooltip";

/**
 * Hover/focus tooltip on any trigger — keyboard + screen-reader friendly, rendered
 * through the CDK overlay (so it escapes `overflow: hidden` and CSS transforms),
 * and theme-aware. Apply the `bpdmTooltip` directive to any element; pass a string
 * or a `TemplateRef` for rich content.
 *
 * ```html
 * <button bpdmButton bpdmTooltip="Copy address">Copy</button>
 * ```
 */
const meta: Meta<BpdmTooltip> = {
  title: "Overlay/Tooltip",
  decorators: [moduleMetadata({ imports: [BpdmTooltip, BpdmButton] })],
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    delay: { control: { type: "number", min: 0, max: 1000, step: 50 } },
    offset: { control: { type: "number", min: 0, max: 24, step: 1 } },
    hideArrow: { control: "boolean" },
    disabled: { control: "boolean" },
    content: { control: "text" },
  },
  args: {
    content: "Copy address",
    side: "top",
    align: "center",
    delay: 200,
    offset: 6,
    hideArrow: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<div class="flex min-h-24 items-center justify-center">
  <button
    bpdmButton
    variant="outline"
    [bpdmTooltip]="content"
    [bpdmTooltipSide]="side"
    [bpdmTooltipAlign]="align"
    [bpdmTooltipDelay]="delay"
    [bpdmTooltipOffset]="offset"
    [bpdmTooltipHideArrow]="hideArrow"
    [bpdmTooltipDisabled]="disabled"
  >Hover me</button>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmTooltip>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-demo',
  imports: [BpdmButton, BpdmTooltip],
  template: \`<button bpdmButton variant="outline" bpdmTooltip="Copy address">Hover me</button>\`,
})
export class TooltipDemoComponent {}`,
      },
    },
  },
};

/** A tooltip on each of the four sides. */
export const Sides: Story = {
  render: () => ({
    template: `<div class="grid place-items-center gap-6 py-8">
  <div class="flex gap-4">
    @for (side of ['top', 'right', 'bottom', 'left']; track side) {
      <button bpdmButton variant="outline" class="capitalize" [bpdmTooltip]="'Side: ' + side" [bpdmTooltipSide]="side">
        {{ side }}
      </button>
    }
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-sides',
  imports: [BpdmButton, BpdmTooltip],
  template: \`
    <div class="flex gap-4">
      @for (side of sides; track side) {
        <button bpdmButton variant="outline" class="capitalize" [bpdmTooltip]="'Side: ' + side" [bpdmTooltipSide]="side">
          {{ side }}
        </button>
      }
    </div>
  \`,
})
export class TooltipSidesComponent {
  sides = ['top', 'right', 'bottom', 'left'] as const;
}`,
      },
    },
  },
};

/** The common case: explain an icon-only button. */
export const OnIconButton: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex min-h-24 items-center justify-center">
  <button bpdmButton size="icon" variant="ghost" aria-label="Info" bpdmTooltip="Only your team can see this project">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  </button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-icon',
  imports: [BpdmButton, BpdmTooltip],
  template: \`
    <button bpdmButton size="icon" variant="ghost" aria-label="Info"
      bpdmTooltip="Only your team can see this project">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="size-5">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    </button>
  \`,
})
export class TooltipIconComponent {}`,
      },
    },
  },
};

/** Rich content via a `TemplateRef` — pass a template instead of a string. */
export const RichContent: Story = {
  render: () => ({
    template: `<div class="flex min-h-28 items-center justify-center">
  <button bpdmButton variant="outline" [bpdmTooltip]="rich" bpdmTooltipSide="right">Sync info</button>
  <ng-template #rich>
    <div class="space-y-1">
      <p class="font-medium text-foreground">Auto-sync</p>
      <p class="text-muted-foreground">Changes sync across devices in real time.</p>
    </div>
  </ng-template>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-rich',
  imports: [BpdmButton, BpdmTooltip],
  template: \`
    <button bpdmButton variant="outline" [bpdmTooltip]="rich" bpdmTooltipSide="right">Sync info</button>
    <ng-template #rich>
      <div class="space-y-1">
        <p class="font-medium text-foreground">Auto-sync</p>
        <p class="text-muted-foreground">Changes sync across devices in real time.</p>
      </div>
    </ng-template>
  \`,
})
export class TooltipRichComponent {}`,
      },
    },
  },
};

// `bpdmTooltipDisabled` turns the *tooltip* off — the trigger stays interactive.
// Shown as a contrast so the effect is visible: left shows on hover, right never does.
export const Disabled: Story = {
  name: "Disabled (tooltip off)",
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex min-h-24 items-center justify-center gap-12">
  <div class="flex flex-col items-center gap-2">
    <button bpdmButton variant="outline" bpdmTooltip="Saves your changes">Tooltip on</button>
    <span class="text-xs text-muted-foreground">hover → tooltip shows</span>
  </div>
  <div class="flex flex-col items-center gap-2">
    <button bpdmButton variant="outline" bpdmTooltip="Saves your changes" [bpdmTooltipDisabled]="true">Tooltip off</button>
    <span class="text-xs text-muted-foreground">disabled → nothing on hover</span>
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-disabled',
  imports: [BpdmButton, BpdmTooltip],
  template: \`
    <div class="flex gap-10">
      <!-- tooltip on → shows on hover -->
      <button bpdmButton variant="outline" bpdmTooltip="Saves your changes">Tooltip on</button>

      <!-- disabled → tooltip suppressed; the button still works -->
      <button bpdmButton variant="outline" bpdmTooltip="Saves your changes" bpdmTooltipDisabled>Tooltip off</button>
    </div>
  \`,
})
export class TooltipDisabledComponent {}`,
      },
    },
  },
};

// the useful case: a tooltip on a *disabled* control explaining why it's off.
// Disabled buttons emit no hover/focus events, so put the directive on a focusable
// wrapper (the button keeps `pointer-events` off) — reachable by pointer and keyboard.
export const OnDisabledTrigger: Story = {
  name: "On a disabled control",
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex min-h-24 items-center justify-center">
  <span bpdmTooltip="You need the Admin role to publish" tabindex="0" class="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <button bpdmButton disabled tabindex="-1" class="pointer-events-none">Publish</button>
  </span>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmTooltip } from '@bpdm/ng';

@Component({
  selector: 'app-tooltip-disabled-trigger',
  imports: [BpdmButton, BpdmTooltip],
  template: \`
    <span bpdmTooltip="You need the Admin role to publish" tabindex="0"
      class="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <button bpdmButton disabled tabindex="-1" class="pointer-events-none">Publish</button>
    </span>
  \`,
})
export class TooltipDisabledTriggerComponent {}`,
      },
    },
  },
};
