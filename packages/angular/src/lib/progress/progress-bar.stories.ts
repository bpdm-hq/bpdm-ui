import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmProgressBar } from "./progress-bar";
import { BpdmButton } from "../button/button";

/** Drives `value` 0→100 on a loop so the fill animation is visible. */
@Component({
  selector: "demo-progress-dynamic",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmProgressBar],
  template: `
    <div class="w-full max-w-md">
      <bpdm-progress-bar
        [value]="value()"
        showValue
        label="Syncing"
        [variant]="value() >= 100 ? 'success' : 'primary'"
      />
    </div>
  `,
})
class ProgressDynamicDemo implements OnInit, OnDestroy {
  readonly value = signal(0);
  private id?: ReturnType<typeof setInterval>;
  ngOnInit() {
    this.id = setInterval(() => this.value.update((v) => (v >= 100 ? 0 : v + 10)), 900);
  }
  ngOnDestroy() {
    clearInterval(this.id);
  }
}

/** A file-upload card with a Start button. */
@Component({
  selector: "demo-progress-in-card",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmProgressBar, BpdmButton],
  template: `
    <div class="w-72 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p class="text-sm font-medium">report-2025.pdf</p>
        <p class="text-xs text-muted-foreground">4.2 MB</p>
      </div>
      <bpdm-progress-bar [value]="value()" showValue [variant]="value() >= 100 ? 'success' : 'primary'" />
      <button bpdmButton size="sm" variant="outline" (click)="start()" [disabled]="uploading()">
        {{ value() >= 100 ? "Upload again" : "Upload" }}
      </button>
    </div>
  `,
})
class ProgressInCardDemo {
  readonly value = signal(0);
  readonly uploading = signal(false);
  start() {
    this.uploading.set(true);
    this.value.set(0);
    const id = setInterval(() => {
      this.value.update((v) => {
        if (v >= 100) {
          clearInterval(id);
          this.uploading.set(false);
          return 100;
        }
        return v + 8;
      });
    }, 220);
  }
}

/**
 * Process indicator. Determinate — drive `value` (the fill animates smoothly to
 * its new width) — or `indeterminate` for an animated sweep when there's no known
 * total. Five colors, three sizes, the value above the bar or
 * `valuePosition="inside"`, and a custom `format`.
 */
const meta: Meta<BpdmProgressBar> = {
  title: "Feedback/ProgressBar",
  decorators: [
    moduleMetadata({
      imports: [BpdmProgressBar, ProgressDynamicDemo, ProgressInCardDemo],
    }),
  ],
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
    indeterminate: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "inline-radio",
      options: ["primary", "success", "warning", "destructive", "info"],
    },
    showValue: { control: "boolean" },
    valuePosition: { control: "inline-radio", options: ["outside", "inside"] },
    format: { table: { disable: true } },
  },
  args: { value: 60, max: 100, size: "md", variant: "primary", showValue: false },
  render: (args) => ({
    props: args,
    template: `<div class="w-full max-w-md">
  <bpdm-progress-bar [value]="value" [max]="max" [indeterminate]="indeterminate" [size]="size" [variant]="variant" [showValue]="showValue" [valuePosition]="valuePosition"></bpdm-progress-bar>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmProgressBar>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-demo',
  imports: [BpdmProgressBar],
  template: \`<bpdm-progress-bar [value]="60" />\`,
})
export class ProgressDemoComponent {}`,
      },
    },
  },
};

/** The percentage sits inside the bar (readable on both fill and track). */
export const ValueInside: Story = {
  render: () => ({
    template: `<div class="w-full max-w-md"><bpdm-progress-bar [value]="72" valuePosition="inside" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-inside',
  imports: [BpdmProgressBar],
  template: \`<bpdm-progress-bar [value]="72" valuePosition="inside" />\`,
})
export class ProgressInsideComponent {}`,
      },
    },
  },
};

/** No known total — an animated sweep. */
export const Indeterminate: Story = {
  render: () => ({
    template: `<div class="w-full max-w-md"><bpdm-progress-bar indeterminate /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-indeterminate',
  imports: [BpdmProgressBar],
  template: \`<bpdm-progress-bar indeterminate />\`,
})
export class ProgressIndeterminateComponent {}`,
      },
    },
  },
};

/** The five semantic colors. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex w-full max-w-md flex-col gap-4">
  <bpdm-progress-bar variant="primary" [value]="18" showValue label="primary" />
  <bpdm-progress-bar variant="success" [value]="36" showValue label="success" />
  <bpdm-progress-bar variant="warning" [value]="54" showValue label="warning" />
  <bpdm-progress-bar variant="destructive" [value]="72" showValue label="destructive" />
  <bpdm-progress-bar variant="info" [value]="90" showValue label="info" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar, ProgressVariant } from '@bpdm/ng';

@Component({
  selector: 'app-progress-variants',
  imports: [BpdmProgressBar],
  template: \`
    <div class="flex max-w-md flex-col gap-4">
      @for (v of variants; track v; let i = $index) {
        <bpdm-progress-bar [variant]="v" [value]="(i + 1) * 18" showValue [label]="v" />
      }
    </div>
  \`,
})
export class ProgressVariantsComponent {
  readonly variants: ProgressVariant[] = ['primary', 'success', 'warning', 'destructive', 'info'];
}`,
      },
    },
  },
};

/** Value updates animate the fill smoothly. */
export const Dynamic: Story = {
  render: () => ({ template: `<demo-progress-dynamic />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-dynamic',
  imports: [BpdmProgressBar],
  template: \`
    <bpdm-progress-bar
      [value]="value()"
      showValue
      label="Syncing"
      [variant]="value() >= 100 ? 'success' : 'primary'"
    />
  \`,
})
export class ProgressDynamicComponent implements OnInit, OnDestroy {
  readonly value = signal(0);
  private id?: ReturnType<typeof setInterval>;
  ngOnInit() {
    this.id = setInterval(() => this.value.update((v) => (v >= 100 ? 0 : v + 10)), 900);
  }
  ngOnDestroy() {
    clearInterval(this.id);
  }
}`,
      },
    },
  },
};

/** Custom label in the row (e.g. "50/100 GB"). */
export const CustomLabel: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { fmt: (v: number, max: number) => `${v}/${max} GB` },
    template: `<div class="w-full max-w-md"><bpdm-progress-bar [value]="50" [max]="100" label="Storage" [format]="fmt" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-format',
  imports: [BpdmProgressBar],
  template: \`<bpdm-progress-bar [value]="50" [max]="100" label="Storage" [format]="fmt" />\`,
})
export class ProgressFormatComponent {
  readonly fmt = (v: number, max: number) => \`\${v}/\${max} GB\`;
}`,
      },
    },
  },
};

/** Three sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex w-full max-w-md flex-col gap-5">
  <bpdm-progress-bar size="sm" [value]="62" />
  <bpdm-progress-bar size="md" [value]="62" />
  <bpdm-progress-bar size="lg" [value]="62" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmProgressBar } from '@bpdm/ng';

@Component({
  selector: 'app-progress-sizes',
  imports: [BpdmProgressBar],
  template: \`
    <div class="flex max-w-md flex-col gap-5">
      <bpdm-progress-bar size="sm" [value]="62" />
      <bpdm-progress-bar size="md" [value]="62" />
      <bpdm-progress-bar size="lg" [value]="62" />
    </div>
  \`,
})
export class ProgressSizesComponent {}`,
      },
    },
  },
};

/** Scoped to a card while a file uploads. */
export const InCard: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-progress-in-card />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmProgressBar, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-progress-in-card',
  imports: [BpdmProgressBar, BpdmButton],
  template: \`
    <div class="w-72 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p class="text-sm font-medium">report-2025.pdf</p>
        <p class="text-xs text-muted-foreground">4.2 MB</p>
      </div>
      <bpdm-progress-bar [value]="value()" showValue [variant]="value() >= 100 ? 'success' : 'primary'" />
      <button bpdmButton size="sm" variant="outline" (click)="start()" [disabled]="uploading()">
        {{ value() >= 100 ? 'Upload again' : 'Upload' }}
      </button>
    </div>
  \`,
})
export class ProgressInCardComponent {
  readonly value = signal(0);
  readonly uploading = signal(false);
  start() {
    this.uploading.set(true);
    this.value.set(0);
    const id = setInterval(() => {
      this.value.update((v) => {
        if (v >= 100) { clearInterval(id); this.uploading.set(false); return 100; }
        return v + 8;
      });
    }, 220);
  }
}`,
      },
    },
  },
};
