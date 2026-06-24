import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmLoadingOverlay, BpdmSpinner } from "./spinner";
import { BpdmButton } from "../button/button";

/** Card with a scoped LoadingOverlay toggled by a Refetch button. */
@Component({
  selector: "demo-spinner-overlay",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmLoadingOverlay, BpdmButton],
  template: `
    <div class="w-72 space-y-3">
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
        <p class="text-sm text-muted-foreground">Active users</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">12,480</p>
        <p class="mt-1 text-xs text-success">+8.2% this week</p>
        <bpdm-loading-overlay [show]="loading()" label="Fetching…" size="md" />
      </div>
      <button bpdmButton size="sm" variant="outline" (click)="refetch()">Refetch</button>
    </div>
  `,
})
class SpinnerOverlayDemo {
  readonly loading = signal(false);
  refetch() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1600);
  }
}

/** Inline spinner swaps in for the value while it loads. */
@Component({
  selector: "demo-spinner-inline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmSpinner, BpdmButton],
  template: `
    <div class="w-72 space-y-3">
      <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p class="text-sm text-muted-foreground">Active users</p>
        <div class="mt-1 flex h-8 items-center">
          @if (loading()) {
            <bpdm-spinner size="sm" variant="dots" class="text-muted-foreground" />
          } @else {
            <span class="text-2xl font-semibold tabular-nums">12,480</span>
          }
        </div>
        <p class="mt-1 text-xs text-success">+8.2% this week</p>
      </div>
      <button bpdmButton size="sm" variant="outline" (click)="refetch()">Refetch amount</button>
    </div>
  `,
})
class SpinnerInlineDemo {
  readonly loading = signal(false);
  refetch() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1600);
  }
}

/** Whole-screen overlay toggled by a button. */
@Component({
  selector: "demo-spinner-fullpage",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmLoadingOverlay, BpdmButton],
  template: `
    <button bpdmButton (click)="load()">Load page</button>
    <bpdm-loading-overlay [show]="loading()" fullPage label="Loading your workspace…" />
  `,
})
class SpinnerFullPageDemo {
  readonly loading = signal(false);
  load() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1600);
  }
}

/**
 * Loading indicators in six looks — `ring`, `gradient`, `square`, `dots`, `bars`,
 * `flip`. `<bpdm-spinner>` inherits the current text color (recolor with `text-*`)
 * and sizes xs–xl. `<bpdm-loading-overlay>` drops a soft, blurred scrim + spinner
 * over the nearest `relative` ancestor, or the whole screen with `fullPage`.
 */
const meta: Meta<BpdmSpinner> = {
  title: "Feedback/Spinner",
  component: BpdmSpinner,
  decorators: [
    moduleMetadata({
      imports: [
        BpdmSpinner,
        BpdmButton,
        SpinnerOverlayDemo,
        SpinnerInlineDemo,
        SpinnerFullPageDemo,
      ],
    }),
  ],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["ring", "gradient", "square", "dots", "bars", "flip"],
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    label: { control: "text" },
  },
  args: { variant: "ring", size: "lg" },
  render: (args) => ({
    props: args,
    template: `<bpdm-spinner [variant]="variant" [size]="size" [label]="label"></bpdm-spinner>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmSpinner>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSpinner } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-demo',
  imports: [BpdmSpinner],
  template: \`<bpdm-spinner variant="ring" size="lg" />\`,
})
export class SpinnerDemoComponent {}`,
      },
    },
  },
};

/** All six looks. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex flex-wrap items-start gap-16 text-primary">
  @for (v of ['ring','gradient','square','dots','bars','flip']; track v) {
    <div class="flex w-16 flex-col items-center gap-3">
      <span class="flex h-10 items-center justify-center"><bpdm-spinner [variant]="v" size="lg" /></span>
      <span class="text-xs text-muted-foreground">{{ v }}</span>
    </div>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSpinner } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-variants',
  imports: [BpdmSpinner],
  template: \`
    <div class="flex flex-wrap items-start gap-16 text-primary">
      <bpdm-spinner variant="ring" size="lg" />
      <bpdm-spinner variant="gradient" size="lg" />
      <bpdm-spinner variant="square" size="lg" />
      <bpdm-spinner variant="dots" size="lg" />
      <bpdm-spinner variant="bars" size="lg" />
      <bpdm-spinner variant="flip" size="lg" />
    </div>
  \`,
})
export class SpinnerVariantsComponent {}`,
      },
    },
  },
};

/** Scoped to a card/section while it fetches (give the box `relative`). */
export const OverlayInCard: Story = {
  render: () => ({ template: `<demo-spinner-overlay />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmLoadingOverlay, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-overlay',
  imports: [BpdmLoadingOverlay, BpdmButton],
  template: \`
    <div class="w-72 space-y-3">
      <div class="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
        <p class="text-sm text-muted-foreground">Active users</p>
        <p class="mt-1 text-2xl font-semibold tabular-nums">12,480</p>
        <p class="mt-1 text-xs text-success">+8.2% this week</p>
        <bpdm-loading-overlay [show]="loading()" label="Fetching…" size="md" />
      </div>
      <button bpdmButton size="sm" variant="outline" (click)="refetch()">Refetch</button>
    </div>
  \`,
})
export class SpinnerOverlayComponent {
  readonly loading = signal(false);
  refetch() { this.loading.set(true); setTimeout(() => this.loading.set(false), 1600); }
}`,
      },
    },
  },
};

/** Only the value loads — the rest of the card stays put (reserved height). */
export const InlineValue: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-spinner-inline />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmSpinner, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-inline',
  imports: [BpdmSpinner, BpdmButton],
  template: \`
    <div class="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p class="text-sm text-muted-foreground">Active users</p>
      <div class="mt-1 flex h-8 items-center">
        @if (loading()) {
          <bpdm-spinner size="sm" variant="dots" class="text-muted-foreground" />
        } @else {
          <span class="text-2xl font-semibold tabular-nums">12,480</span>
        }
      </div>
    </div>
  \`,
})
export class SpinnerInlineComponent {
  readonly loading = signal(false);
}`,
      },
    },
  },
};

/** Whole-screen loader. */
export const FullPage: Story = {
  render: () => ({ template: `<demo-spinner-fullpage />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmLoadingOverlay, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-fullpage',
  imports: [BpdmLoadingOverlay, BpdmButton],
  template: \`
    <button bpdmButton (click)="load()">Load page</button>
    <bpdm-loading-overlay [show]="loading()" fullPage label="Loading your workspace…" />
  \`,
})
export class SpinnerFullPageComponent {
  readonly loading = signal(false);
  load() { this.loading.set(true); setTimeout(() => this.loading.set(false), 1600); }
}`,
      },
    },
  },
};

/** Five sizes. */
export const Sizes: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-end gap-6 text-primary">
  @for (s of ['xs','sm','md','lg','xl']; track s) {
    <div class="flex flex-col items-center gap-2"><bpdm-spinner [size]="s" /><span class="text-xs text-muted-foreground">{{ s }}</span></div>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSpinner } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-sizes',
  imports: [BpdmSpinner],
  template: \`
    <div class="flex items-end gap-6 text-primary">
      <bpdm-spinner size="xs" /><bpdm-spinner size="sm" /><bpdm-spinner size="md" />
      <bpdm-spinner size="lg" /><bpdm-spinner size="xl" />
    </div>
  \`,
})
export class SpinnerSizesComponent {}`,
      },
    },
  },
};

/** Inherits text color — recolor with `text-*`. */
export const Colors: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-6">
  <bpdm-spinner class="text-primary" />
  <bpdm-spinner variant="dots" class="text-success" />
  <bpdm-spinner variant="bars" class="text-destructive" />
  <bpdm-spinner class="text-muted-foreground" />
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSpinner } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-colors',
  imports: [BpdmSpinner],
  template: \`
    <div class="flex items-center gap-6">
      <bpdm-spinner class="text-primary" />
      <bpdm-spinner variant="dots" class="text-success" />
      <bpdm-spinner variant="bars" class="text-destructive" />
      <bpdm-spinner class="text-muted-foreground" />
    </div>
  \`,
})
export class SpinnerColorsComponent {}`,
      },
    },
  },
};

/** Inside a loading button — inherits the button's text color. */
export const InButton: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="flex items-center gap-3">
  <button bpdmButton disabled><bpdm-spinner size="sm" class="text-current" /> Saving…</button>
  <button bpdmButton variant="outline" disabled><bpdm-spinner size="sm" variant="dots" class="text-current" /> Loading</button>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmSpinner, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-spinner-in-button',
  imports: [BpdmSpinner, BpdmButton],
  template: \`
    <div class="flex items-center gap-3">
      <button bpdmButton disabled><bpdm-spinner size="sm" class="text-current" /> Saving…</button>
      <button bpdmButton variant="outline" disabled>
        <bpdm-spinner size="sm" variant="dots" class="text-current" /> Loading
      </button>
    </div>
  \`,
})
export class SpinnerInButtonComponent {}`,
      },
    },
  },
};
