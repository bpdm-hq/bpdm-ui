import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import { BpdmPopover, BpdmPopoverClose } from "./popover";

/**
 * Click-triggered floating panel on any trigger — rendered through the CDK overlay
 * (so it escapes `overflow: hidden`), collision-aware (flips/shifts to stay on
 * screen), and theme-aware. Apply `bpdmPopover` to a trigger and pass the panel as
 * a `<ng-template>`; add `bpdmPopoverClose` to a button inside to dismiss it.
 *
 * ```html
 * <button bpdmButton [bpdmPopover]="panel">Open</button>
 * <ng-template #panel>…<button bpdmButton bpdmPopoverClose>Done</button></ng-template>
 * ```
 */
const meta: Meta<BpdmPopover> = {
  title: "Overlay/Popover",
  component: BpdmPopover,
  decorators: [moduleMetadata({ imports: [BpdmPopover, BpdmPopoverClose, BpdmButton, BpdmInput] })],
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    offset: { control: { type: "number", min: 0, max: 24 } },
    modal: { control: "boolean" },
    showArrow: { control: "boolean" },
  },
  args: { side: "bottom", align: "center", offset: 8, modal: false, showArrow: false },
  render: (args) => ({
    props: args,
    template: `<div class="flex min-h-48 items-start justify-center pt-6">
  <button
    bpdmButton
    variant="secondary" appearance="outline"
    [bpdmPopover]="panel"
    [bpdmPopoverSide]="side"
    [bpdmPopoverAlign]="align"
    [bpdmPopoverOffset]="offset"
    [bpdmPopoverModal]="modal"
    [bpdmPopoverShowArrow]="showArrow"
  >Open popover</button>
  <ng-template #panel>
    <div class="w-64 space-y-1">
      <p class="font-medium">Quick info</p>
      <p class="text-sm text-muted-foreground">Popovers can hold any content — text, forms, menus.</p>
    </div>
  </ng-template>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmPopover>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmPopover } from '@bpdm/ng';

@Component({
  selector: 'app-popover-demo',
  imports: [BpdmButton, BpdmPopover],
  template: \`
    <button bpdmButton variant="secondary" appearance="outline" [bpdmPopover]="panel">Open popover</button>
    <ng-template #panel>
      <div class="w-64 space-y-1">
        <p class="font-medium">Quick info</p>
        <p class="text-sm text-muted-foreground">Popovers can hold any content — text, forms, menus.</p>
      </div>
    </ng-template>
  \`,
})
export class PopoverDemoComponent {}`,
      },
    },
  },
};

/** Opens on any of the four sides; flips when there isn't room. */
export const Placements: Story = {
  render: () => ({
    props: { sides: ["top", "right", "bottom", "left"] as const },
    template: `<div class="flex min-h-48 items-center justify-center gap-4">
  @for (side of sides; track side) {
    <button bpdmButton variant="secondary" appearance="outline" class="capitalize" [bpdmPopover]="tpl" [bpdmPopoverSide]="side" [bpdmPopoverShowArrow]="true">
      {{ side }}
    </button>
    <ng-template #tpl><p class="text-sm">Opens on the {{ side }}.</p></ng-template>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmPopover } from '@bpdm/ng';

@Component({
  selector: 'app-popover-placements',
  imports: [BpdmButton, BpdmPopover],
  template: \`
    <div class="flex items-center justify-center gap-4">
      @for (side of sides; track side) {
        <button bpdmButton variant="secondary" appearance="outline" class="capitalize" [bpdmPopover]="tpl" [bpdmPopoverSide]="side" bpdmPopoverShowArrow>
          {{ side }}
        </button>
        <ng-template #tpl><p class="text-sm">Opens on the {{ side }}.</p></ng-template>
      }
    </div>
  \`,
})
export class PopoverPlacementsComponent {
  sides = ['top', 'right', 'bottom', 'left'] as const;
}`,
      },
    },
  },
};

/** A small form inside a popover; `bpdmPopoverClose` dismisses it. */
export const WithForm: Story = {
  render: () => ({
    template: `<div class="flex min-h-56 items-start justify-center pt-6">
  <button bpdmButton [bpdmPopover]="form">Rename project</button>
  <ng-template #form>
    <form class="w-64 space-y-3" (submit)="$event.preventDefault()">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Name</label>
        <input bpdmInput value="Q3 Planning" />
      </div>
      <div class="flex justify-end gap-2">
        <button bpdmButton size="sm" variant="secondary" appearance="ghost" bpdmPopoverClose>Cancel</button>
        <button bpdmButton size="sm" bpdmPopoverClose>Save</button>
      </div>
    </form>
  </ng-template>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmInput, BpdmPopover, BpdmPopoverClose } from '@bpdm/ng';

@Component({
  selector: 'app-popover-form',
  imports: [BpdmButton, BpdmInput, BpdmPopover, BpdmPopoverClose],
  template: \`
    <button bpdmButton [bpdmPopover]="form">Rename project</button>
    <ng-template #form>
      <form class="w-64 space-y-3" (submit)="$event.preventDefault()">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Name</label>
          <input bpdmInput value="Q3 Planning" />
        </div>
        <div class="flex justify-end gap-2">
          <button bpdmButton size="sm" variant="secondary" appearance="ghost" bpdmPopoverClose>Cancel</button>
          <button bpdmButton size="sm" bpdmPopoverClose>Save</button>
        </div>
      </form>
    </ng-template>
  \`,
})
export class PopoverFormComponent {}`,
      },
    },
  },
};

/** A little arrow pointing back at the trigger. */
export const WithArrow: Story = {
  tags: ["!dev"],
  args: { showArrow: true },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmPopover } from '@bpdm/ng';

@Component({
  selector: 'app-popover-arrow',
  imports: [BpdmButton, BpdmPopover],
  template: \`
    <button bpdmButton variant="secondary" appearance="outline" bpdmPopoverShowArrow [bpdmPopover]="panel">Open popover</button>
    <ng-template #panel>
      <div class="w-64 space-y-1">
        <p class="font-medium">Quick info</p>
        <p class="text-sm text-muted-foreground">Popovers can hold any content — text, forms, menus.</p>
      </div>
    </ng-template>
  \`,
})
export class PopoverArrowComponent {}`,
      },
    },
  },
};
