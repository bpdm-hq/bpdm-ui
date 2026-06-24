import { Component, inject, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmButton } from "../button/button";
import { BpdmConfirm } from "./confirm-dialog";

@Component({
  selector: "demo-confirm-delete",
  imports: [BpdmButton],
  template: `<div class="flex items-center gap-3">
    <button bpdmButton variant="destructive" (click)="run()">Delete project</button>
    @if (result()) {
      <span class="text-sm text-muted-foreground">{{ result() }}</span>
    }
  </div>`,
})
class DeleteDemo {
  private readonly confirm = inject(BpdmConfirm);
  readonly result = signal<string | null>(null);
  async run(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: "Delete project?",
      description: "This permanently removes the project and its data.",
      destructive: true,
      confirmText: "Delete",
    });
    this.result.set(ok ? "Deleted ✓" : "Cancelled");
  }
}

@Component({
  selector: "demo-confirm-publish",
  imports: [BpdmButton],
  template: `<div class="flex items-center gap-3">
    <button bpdmButton (click)="run()">Publish</button>
    @if (result()) {
      <span class="text-sm text-muted-foreground">{{ result() }}</span>
    }
  </div>`,
})
class PublishDemo {
  private readonly confirm = inject(BpdmConfirm);
  readonly result = signal<string | null>(null);
  async run(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: "Publish changes?",
      description: "Your edits will go live immediately.",
      confirmText: "Publish",
    });
    this.result.set(ok ? "Published ✓" : "Kept as draft");
  }
}

const usage = `
Imperative confirmation. Inject \`BpdmConfirm\` and \`await confirm(...)\` anywhere —
no per-action dialog or open-state boilerplate. Resolves \`true\` on confirm,
\`false\` on cancel / Escape / outside-click. Built on the same modal surface as
\`<bpdm-dialog>\`.

\`\`\`ts
const confirm = inject(BpdmConfirm);
const ok = await confirm.confirm({
  title: "Delete project?",
  description: "This can't be undone.",
  destructive: true,
  confirmText: "Delete",
});
if (ok) remove();
\`\`\`
`;

const meta: Meta = {
  title: "Overlay/ConfirmDialog",
  decorators: [moduleMetadata({ imports: [DeleteDemo, PublishDemo] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
};
export default meta;

type Story = StoryObj;

/** A destructive (red) confirm — for irreversible actions. */
export const Destructive: Story = {
  render: () => ({ template: `<demo-confirm-delete />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, inject } from '@angular/core';
import { BpdmButton, BpdmConfirm } from '@bpdm/ng';

@Component({
  selector: 'app-delete-button',
  imports: [BpdmButton],
  template: \`<button bpdmButton variant="destructive" (click)="run()">Delete project</button>\`,
})
export class DeleteButtonComponent {
  private confirm = inject(BpdmConfirm);
  async run() {
    const ok = await this.confirm.confirm({
      title: 'Delete project?',
      description: 'This permanently removes the project and its data.',
      destructive: true,
      confirmText: 'Delete',
    });
    if (ok) this.deleteProject();
  }
  deleteProject() {}
}`,
      },
    },
  },
};

/** A standard confirm — for routine, reversible actions. */
export const Default: Story = {
  render: () => ({ template: `<demo-confirm-publish />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, inject } from '@angular/core';
import { BpdmButton, BpdmConfirm } from '@bpdm/ng';

@Component({
  selector: 'app-publish-button',
  imports: [BpdmButton],
  template: \`<button bpdmButton (click)="run()">Publish</button>\`,
})
export class PublishButtonComponent {
  private confirm = inject(BpdmConfirm);
  async run() {
    const ok = await this.confirm.confirm({
      title: 'Publish changes?',
      description: 'Your edits will go live immediately.',
      confirmText: 'Publish',
    });
    if (ok) this.publish();
  }
  publish() {}
}`,
      },
    },
  },
};
