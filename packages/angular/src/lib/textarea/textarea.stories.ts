import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmTextarea } from "./textarea";

/** Character counter paired with maxLength. */
@Component({
  selector: "demo-textarea-count",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmTextarea],
  template: `
    <div class="w-80">
      <textarea
        bpdmTextarea
        maxlength="200"
        placeholder="Bio"
        [value]="text()"
        (input)="text.set($any($event.target).value)"
      ></textarea>
      <div class="mt-1 text-right text-xs tabular-nums text-muted-foreground">{{ text().length }} / 200</div>
    </div>
  `,
})
class TextareaCountDemo {
  readonly text = signal("A short bio…");
}

/**
 * Auto-growing-capable textarea with three sizes, a `resize` control and an
 * `autoResize` mode. Applied as `bpdmTextarea` on a native `<textarea>`, so
 * `ngModel` / reactive forms work natively. Invalid styling via `aria-invalid`.
 */
const meta: Meta<BpdmTextarea> = {
  title: "Inputs/Textarea",
  decorators: [moduleMetadata({ imports: [BpdmTextarea, TextareaCountDemo] })],
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    resize: { control: "inline-radio", options: ["none", "vertical", "both"] },
    autoResize: { control: "boolean" },
  },
  args: { size: "md", resize: "vertical", autoResize: false },
  render: (args) => ({
    props: args,
    template: `<div class="w-80"><textarea bpdmTextarea [size]="size" [resize]="resize" [autoResize]="autoResize" placeholder="Type here…"></textarea></div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmTextarea>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-demo',
  imports: [BpdmTextarea],
  template: \`<textarea bpdmTextarea placeholder="Type here…"></textarea>\`,
})
export class TextareaDemoComponent {}`,
      },
    },
  },
};

/** Grows with content. */
export const AutoResize: Story = {
  render: () => ({
    template: `<div class="w-80"><textarea bpdmTextarea autoResize placeholder="Type a few lines — it grows automatically"></textarea></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-autoresize',
  imports: [BpdmTextarea],
  template: \`<textarea bpdmTextarea autoResize placeholder="Grows as you type"></textarea>\`,
})
export class TextareaAutoResizeComponent {}`,
      },
    },
  },
};

/** A character counter (pair with maxlength). */
export const WithCount: Story = {
  render: () => ({ template: `<demo-textarea-count />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-count',
  imports: [BpdmTextarea],
  template: \`
    <textarea bpdmTextarea maxlength="200" placeholder="Bio"
      [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
    <div class="mt-1 text-right text-xs text-muted-foreground">{{ text().length }} / 200</div>
  \`,
})
export class TextareaCountComponent {
  readonly text = signal('');
}`,
      },
    },
  },
};

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-80 flex-col gap-3">
  <textarea bpdmTextarea size="sm" placeholder="Size sm"></textarea>
  <textarea bpdmTextarea size="md" placeholder="Size md"></textarea>
  <textarea bpdmTextarea size="lg" placeholder="Size lg"></textarea>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-sizes',
  imports: [BpdmTextarea],
  template: \`
    <div class="flex w-80 flex-col gap-3">
      <textarea bpdmTextarea size="sm" placeholder="Size sm"></textarea>
      <textarea bpdmTextarea size="md" placeholder="Size md"></textarea>
      <textarea bpdmTextarea size="lg" placeholder="Size lg"></textarea>
    </div>
  \`,
})
export class TextareaSizesComponent {}`,
      },
    },
  },
};

/** Invalid state. */
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-80"><textarea bpdmTextarea aria-invalid="true" placeholder="Message"></textarea></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-invalid',
  imports: [BpdmTextarea],
  template: \`<textarea bpdmTextarea aria-invalid="true" placeholder="Message"></textarea>\`,
})
export class TextareaInvalidComponent {}`,
      },
    },
  },
};

/** Disabled. */
export const Disabled: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-80"><textarea bpdmTextarea disabled>This field is disabled.</textarea></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmTextarea } from '@bpdm/ng';

@Component({
  selector: 'app-textarea-disabled',
  imports: [BpdmTextarea],
  template: \`<textarea bpdmTextarea disabled>Read only</textarea>\`,
})
export class TextareaDisabledComponent {}`,
      },
    },
  },
};
