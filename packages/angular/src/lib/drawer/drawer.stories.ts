import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import {
  BpdmDrawer,
  BpdmDrawerBody,
  BpdmDrawerClose,
  BpdmDrawerFooter,
  BpdmDrawerTrigger,
} from "./drawer";

const DRAWER_IMPORTS = [
  BpdmDrawer,
  BpdmDrawerTrigger,
  BpdmDrawerClose,
  BpdmDrawerBody,
  BpdmDrawerFooter,
  BpdmButton,
  BpdmInput,
];

/**
 * Slide-in panel ("sheet") on the CDK overlay — focus trap, scroll lock, Escape +
 * backdrop-click to close, full ARIA. Slides in from any edge. Project a
 * `[bpdmDrawerTrigger]` button and `ng-template[bpdmDrawerBody]` /
 * `ng-template[bpdmDrawerFooter]`, set `side`/`size`/`title`, or drive it with
 * `[(open)]`. `bpdmDrawerClose` dismisses from inside. Theme-aware, slide-animated.
 */
const meta: Meta<BpdmDrawer> = {
  title: "Overlay/Drawer",
  decorators: [moduleMetadata({ imports: DRAWER_IMPORTS })],
  tags: ["autodocs"],
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    showClose: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    side: "right",
    size: "md",
    title: "Edit project",
    description: "Update the project details.",
    showClose: true,
  },
  render: (args) => ({
    props: args,
    template: `<bpdm-drawer [side]="side" [size]="size" [title]="title" [description]="description" [showClose]="showClose">
  <button bpdmButton bpdmDrawerTrigger>Open drawer</button>
  <ng-template bpdmDrawerBody>
    <div class="space-y-3">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Name</label>
        <input bpdmInput value="Q3 Planning" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Owner</label>
        <input bpdmInput value="Elena Costa" />
      </div>
    </div>
  </ng-template>
  <ng-template bpdmDrawerFooter>
    <button bpdmButton variant="ghost" bpdmDrawerClose>Cancel</button>
    <button bpdmButton bpdmDrawerClose>Save changes</button>
  </ng-template>
</bpdm-drawer>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmDrawer>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerClose, BpdmDrawerFooter, BpdmDrawerTrigger, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-drawer-demo',
  imports: [BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerClose, BpdmDrawerFooter, BpdmDrawerTrigger, BpdmInput],
  template: \`
    <bpdm-drawer side="right" title="Edit project" description="Update the project details.">
      <button bpdmButton bpdmDrawerTrigger>Open drawer</button>
      <ng-template bpdmDrawerBody>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Name</label>
          <input bpdmInput value="Q3 Planning" />
        </div>
      </ng-template>
      <ng-template bpdmDrawerFooter>
        <button bpdmButton variant="ghost" bpdmDrawerClose>Cancel</button>
        <button bpdmButton bpdmDrawerClose>Save changes</button>
      </ng-template>
    </bpdm-drawer>
  \`,
})
export class DrawerDemoComponent {}`,
      },
    },
  },
};

/** Slides in from any of the four edges. */
export const Sides: Story = {
  render: () => ({
    props: { sides: ["left", "right", "top", "bottom"] as const },
    template: `<div class="flex flex-wrap gap-3">
  @for (side of sides; track side) {
    <bpdm-drawer [side]="side" [title]="side + ' drawer'" [description]="'Slides in from the ' + side + '.'">
      <button bpdmButton variant="outline" class="capitalize" bpdmDrawerTrigger>{{ side }}</button>
      <ng-template bpdmDrawerBody><p class="text-sm text-muted-foreground">Drawer body content.</p></ng-template>
      <ng-template bpdmDrawerFooter><button bpdmButton bpdmDrawerClose>Done</button></ng-template>
    </bpdm-drawer>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerClose, BpdmDrawerFooter, BpdmDrawerTrigger } from '@bpdm/ng';

@Component({
  selector: 'app-drawer-sides',
  imports: [BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerClose, BpdmDrawerFooter, BpdmDrawerTrigger],
  template: \`
    <div class="flex flex-wrap gap-3">
      @for (side of sides; track side) {
        <bpdm-drawer [side]="side" [title]="side + ' drawer'" [description]="'Slides in from the ' + side + '.'">
          <button bpdmButton variant="outline" class="capitalize" bpdmDrawerTrigger>{{ side }}</button>
          <ng-template bpdmDrawerBody><p class="text-sm text-muted-foreground">Drawer body content.</p></ng-template>
          <ng-template bpdmDrawerFooter><button bpdmButton bpdmDrawerClose>Done</button></ng-template>
        </bpdm-drawer>
      }
    </div>
  \`,
})
export class DrawerSidesComponent {
  sides = ['left', 'right', 'top', 'bottom'] as const;
}`,
      },
    },
  },
};

/** Drive `open` yourself — no trigger needed. */
export const Controlled: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { open: false },
    template: `<button bpdmButton (click)="open = true">Open controlled</button>
<bpdm-drawer [(open)]="open" title="Controlled drawer" description="Its open state lives in the parent.">
  <ng-template bpdmDrawerBody>
    <p class="text-sm text-muted-foreground">Open it from a menu, after an async action, etc.</p>
  </ng-template>
  <ng-template bpdmDrawerFooter><button bpdmButton (click)="open = false">Close</button></ng-template>
</bpdm-drawer>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerFooter } from '@bpdm/ng';

@Component({
  selector: 'app-drawer-controlled',
  imports: [BpdmButton, BpdmDrawer, BpdmDrawerBody, BpdmDrawerFooter],
  template: \`
    <button bpdmButton (click)="open = true">Open controlled</button>
    <bpdm-drawer [(open)]="open" title="Controlled drawer" description="Its open state lives in the parent.">
      <ng-template bpdmDrawerBody>
        <p class="text-sm text-muted-foreground">Open it from a menu, after an async action, etc.</p>
      </ng-template>
      <ng-template bpdmDrawerFooter><button bpdmButton (click)="open = false">Close</button></ng-template>
    </bpdm-drawer>
  \`,
})
export class DrawerControlledComponent {
  open = false;
}`,
      },
    },
  },
};
