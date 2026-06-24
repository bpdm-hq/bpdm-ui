import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import { BpdmSelect } from "../select/select";
import { BpdmMultiSelect } from "../multi-select/multi-select";
import { BpdmTreeSelect } from "../tree-select/tree-select";
import {
  BpdmDialog,
  BpdmDialogBody,
  BpdmDialogClose,
  BpdmDialogFooter,
  BpdmDialogTrigger,
} from "./dialog";

const DIALOG_IMPORTS = [
  BpdmDialog,
  BpdmDialogTrigger,
  BpdmDialogClose,
  BpdmDialogBody,
  BpdmDialogFooter,
  BpdmButton,
  BpdmInput,
  BpdmSelect,
  BpdmMultiSelect,
  BpdmTreeSelect,
];

/**
 * Modal dialog on the CDK overlay — focus trap, scroll lock, Escape +
 * backdrop-click to close, and full ARIA, all handled. Project a
 * `[bpdmDialogTrigger]` button and `ng-template[bpdmDialogBody]` /
 * `ng-template[bpdmDialogFooter]`, set `title`/`description`/`size`, or drive it
 * with `[(open)]`. `bpdmDialogClose` dismisses from inside. Theme-aware, animated.
 */
const meta: Meta<BpdmDialog> = {
  title: "Overlay/Dialog",
  decorators: [moduleMetadata({ imports: DIALOG_IMPORTS })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    showClose: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "Edit project",
    description: "Update the project details.",
    size: "md",
    showClose: true,
  },
  render: (args) => ({
    props: args,
    template: `<bpdm-dialog [title]="title" [description]="description" [size]="size" [showClose]="showClose">
  <button bpdmButton bpdmDialogTrigger>Edit project</button>
  <ng-template bpdmDialogBody>
    <div class="space-y-3">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Name</label>
        <input bpdmInput value="Q3 Planning" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Owner</label>
        <input bpdmInput value="Lucas Meyer" />
      </div>
    </div>
  </ng-template>
  <ng-template bpdmDialogFooter>
    <button bpdmButton variant="ghost" bpdmDialogClose>Cancel</button>
    <button bpdmButton bpdmDialogClose>Save changes</button>
  </ng-template>
</bpdm-dialog>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmDialog>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-dialog-demo',
  imports: [BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger, BpdmInput],
  template: \`
    <bpdm-dialog title="Edit project" description="Update the project details.">
      <button bpdmButton bpdmDialogTrigger>Edit project</button>
      <ng-template bpdmDialogBody>
        <div class="space-y-3">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Name</label>
            <input bpdmInput value="Q3 Planning" />
          </div>
        </div>
      </ng-template>
      <ng-template bpdmDialogFooter>
        <button bpdmButton variant="ghost" bpdmDialogClose>Cancel</button>
        <button bpdmButton bpdmDialogClose>Save changes</button>
      </ng-template>
    </bpdm-dialog>
  \`,
})
export class DialogDemoComponent {}`,
      },
    },
  },
};

/** The panel width adapts to the `size` prop. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { sizes: ["sm", "md", "lg", "xl"] as const },
    template: `<div class="flex flex-wrap gap-3">
  @for (size of sizes; track size) {
    <bpdm-dialog [size]="size" [title]="'Size: ' + size" description="The panel width adapts to the size prop.">
      <button bpdmButton variant="outline" class="uppercase" bpdmDialogTrigger>{{ size }}</button>
      <ng-template bpdmDialogBody><p class="text-sm text-muted-foreground">Dialog body content.</p></ng-template>
      <ng-template bpdmDialogFooter><button bpdmButton bpdmDialogClose>Got it</button></ng-template>
    </bpdm-dialog>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger } from '@bpdm/ng';

@Component({
  selector: 'app-dialog-sizes',
  imports: [BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger],
  template: \`
    <div class="flex flex-wrap gap-3">
      @for (size of sizes; track size) {
        <bpdm-dialog [size]="size" [title]="'Size: ' + size" description="The panel width adapts to the size prop.">
          <button bpdmButton variant="outline" class="uppercase" bpdmDialogTrigger>{{ size }}</button>
          <ng-template bpdmDialogBody><p class="text-sm text-muted-foreground">Dialog body content.</p></ng-template>
          <ng-template bpdmDialogFooter><button bpdmButton bpdmDialogClose>Got it</button></ng-template>
        </bpdm-dialog>
      }
    </div>
  \`,
})
export class DialogSizesComponent {
  sizes = ['sm', 'md', 'lg', 'xl'] as const;
}`,
      },
    },
  },
};

/** A tall body scrolls inside the dialog; the header + footer stay fixed. */
export const ScrollableContent: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { lines: Array.from({ length: 14 }, (_, i) => i + 1) },
    template: `<bpdm-dialog title="Terms of service" description="Please review before continuing.">
  <button bpdmButton variant="outline" bpdmDialogTrigger>Open long content</button>
  <ng-template bpdmDialogBody>
    <div class="space-y-3 text-sm text-muted-foreground">
      @for (i of lines; track i) {
        <p>{{ i }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      }
    </div>
  </ng-template>
  <ng-template bpdmDialogFooter><button bpdmButton bpdmDialogClose>Accept</button></ng-template>
</bpdm-dialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger } from '@bpdm/ng';

@Component({
  selector: 'app-dialog-scroll',
  imports: [BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogClose, BpdmDialogFooter, BpdmDialogTrigger],
  template: \`
    <bpdm-dialog title="Terms of service" description="Please review before continuing.">
      <button bpdmButton variant="outline" bpdmDialogTrigger>Open long content</button>
      <ng-template bpdmDialogBody>
        <div class="space-y-3 text-sm text-muted-foreground">
          @for (i of lines; track i) {
            <p>{{ i }}. Lorem ipsum dolor sit amet…</p>
          }
        </div>
      </ng-template>
      <ng-template bpdmDialogFooter><button bpdmButton bpdmDialogClose>Accept</button></ng-template>
    </bpdm-dialog>
  \`,
})
export class DialogScrollComponent {
  lines = Array.from({ length: 14 }, (_, i) => i + 1);
}`,
      },
    },
  },
};

/** Drive `open` yourself — no trigger needed. */
export const Controlled: Story = {
  render: () => ({
    props: { open: false },
    template: `<button bpdmButton (click)="open = true">Open controlled</button>
<bpdm-dialog [(open)]="open" title="Controlled dialog" description="Its open state lives in the parent.">
  <ng-template bpdmDialogBody>
    <p class="text-sm text-muted-foreground">Useful when opening from a menu, after an async action, etc.</p>
  </ng-template>
  <ng-template bpdmDialogFooter><button bpdmButton (click)="open = false">Close</button></ng-template>
</bpdm-dialog>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogFooter } from '@bpdm/ng';

@Component({
  selector: 'app-dialog-controlled',
  imports: [BpdmButton, BpdmDialog, BpdmDialogBody, BpdmDialogFooter],
  template: \`
    <button bpdmButton (click)="open = true">Open controlled</button>
    <bpdm-dialog [(open)]="open" title="Controlled dialog" description="Its open state lives in the parent.">
      <ng-template bpdmDialogBody>
        <p class="text-sm text-muted-foreground">Useful when opening from a menu, after an async action, etc.</p>
      </ng-template>
      <ng-template bpdmDialogFooter><button bpdmButton (click)="open = false">Close</button></ng-template>
    </bpdm-dialog>
  \`,
})
export class DialogControlledComponent {
  open = false;
}`,
      },
    },
  },
};

/** Select / MultiSelect / TreeSelect all work inside the dialog — each dropdown
 * portals out and stays clickable + scrollable without changing the dialog's height. */
export const WithDropdowns: Story = {
  render: () => ({
    props: {
      visibility: [
        { value: "private", label: "Private" },
        { value: "team", label: "Team" },
        { value: "org", label: "Organization" },
        { value: "public", label: "Public" },
        { value: "archived", label: "Archived" },
        { value: "draft", label: "Draft" },
      ],
      labels: [
        { value: "frontend", label: "Frontend" },
        { value: "backend", label: "Backend" },
        { value: "design", label: "Design" },
        { value: "docs", label: "Docs" },
        { value: "bug", label: "Bug" },
      ],
      categories: [
        {
          value: "engineering",
          label: "Engineering",
          children: [
            { value: "web", label: "Web" },
            { value: "mobile", label: "Mobile" },
            { value: "infra", label: "Infrastructure" },
          ],
        },
        {
          value: "product",
          label: "Product",
          children: [
            { value: "design", label: "Design" },
            { value: "research", label: "Research" },
          ],
        },
      ],
    },
    template: `<bpdm-dialog size="sm" title="New project" description="Every dropdown portals out — clickable, scrollable, no height change.">
  <button bpdmButton bpdmDialogTrigger>New project</button>
  <ng-template bpdmDialogBody>
    <div class="space-y-3">
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Visibility</label>
        <bpdm-select searchable [maxHeight]="150" [options]="visibility" defaultValue="team" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Labels</label>
        <bpdm-multi-select searchable [maxHeight]="150" [options]="labels" [defaultValue]="['frontend']" placeholder="Add labels" />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium">Category</label>
        <bpdm-tree-select searchable [maxHeight]="170" [options]="categories" placeholder="Pick categories" />
      </div>
    </div>
  </ng-template>
  <ng-template bpdmDialogFooter>
    <button bpdmButton variant="ghost" bpdmDialogClose>Cancel</button>
    <button bpdmButton bpdmDialogClose>Create</button>
  </ng-template>
</bpdm-dialog>`,
  }),
};
