import { Component, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmInput } from "../input/input";
import { BpdmDialogService } from "./dynamic-dialog";

@Component({
  selector: "demo-dynamic-dialog",
  imports: [BpdmButton, BpdmInput],
  template: `
    <div class="flex flex-wrap gap-3">
      <button
        bpdmButton
        (click)="dialog.open(editTpl, { title: 'Edit project', description: 'Opened imperatively from code.' })"
      >
        Edit project
      </button>
      <button
        bpdmButton
        variant="secondary" appearance="outline"
        (click)="dialog.open(stackedTpl, { title: 'Stacked dialog', size: 'sm' })"
      >
        Open stacked
      </button>
    </div>

    <ng-template #editTpl let-d>
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Name</label>
          <input bpdmInput value="Q3 Planning" />
        </div>
        <div class="flex justify-end gap-2">
          <button bpdmButton size="sm" variant="secondary" appearance="ghost" (click)="d.close()">Cancel</button>
          <button bpdmButton size="sm" (click)="d.close()">Save</button>
        </div>
      </div>
    </ng-template>

    <ng-template #stackedTpl let-d>
      <div class="space-y-3">
        <p class="text-sm text-muted-foreground">
          Stack another dialog on top, then open more from here.
        </p>
        <button bpdmButton size="sm" (click)="d.close()">Got it</button>
      </div>
    </ng-template>
  `,
})
class DynamicDemo {
  protected readonly dialog = inject(BpdmDialogService);
}

const usage = `
Open dialogs with arbitrary content from anywhere — no per-dialog open state or
prop drilling. Inject \`BpdmDialogService\` and call \`open(tpl, options)\`; it returns
a \`BpdmDialogRef\` you can \`close()\`. The content template receives a \`{ close }\`
context. Stacks. Built on the same modal surface as \`<bpdm-dialog>\`.

\`\`\`ts
const dialog = inject(BpdmDialogService);
dialog.open(formTpl, { title: "Edit project" });
// <ng-template #formTpl let-d>… <button (click)="d.close()">Save</button></ng-template>
\`\`\`
`;

const meta: Meta = {
  title: "Overlay/DynamicDialog",
  decorators: [moduleMetadata({ imports: [DynamicDemo] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
};
export default meta;

type Story = StoryObj;

/** Open arbitrary content imperatively; the content gets a `close` handle. */
export const Basic: Story = {
  render: () => ({ template: `<demo-dynamic-dialog />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, inject } from '@angular/core';
import { BpdmButton, BpdmDialogService, BpdmInput } from '@bpdm/ng';

@Component({
  selector: 'app-edit-button',
  imports: [BpdmButton, BpdmInput],
  template: \`
    <button bpdmButton (click)="dialog.open(form, { title: 'Edit project', description: 'Opened imperatively from code.' })">
      Edit project
    </button>
    <ng-template #form let-d>
      <input bpdmInput value="Q3 Planning" />
      <div class="flex justify-end gap-2">
        <button bpdmButton size="sm" variant="secondary" appearance="ghost" (click)="d.close()">Cancel</button>
        <button bpdmButton size="sm" (click)="d.close()">Save</button>
      </div>
    </ng-template>
  \`,
})
export class EditButtonComponent {
  protected dialog = inject(BpdmDialogService);
}`,
      },
    },
  },
};
