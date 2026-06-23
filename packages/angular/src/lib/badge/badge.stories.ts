import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmBadge, BpdmNotificationBadge } from "./badge";
import { BpdmButton } from "../button/button";

const INITIAL_TAGS = ["Frontend", "Backend", "Design", "Infra", "Docs"];
const BELL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;
const MAIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`;

/** Removable tag chips that collapse + fade on remove. */
@Component({
  selector: "demo-badge-removable",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmBadge, BpdmButton],
  template: `
    <div class="flex min-h-8 flex-wrap items-center gap-2">
      @for (t of tags(); track t) {
        <bpdm-badge variant="neutral" removable (removed)="drop(t)">{{ t }}</bpdm-badge>
      }
      @if (tags().length === 0) {
        <button bpdmButton size="sm" variant="ghost" (click)="reset()">Reset</button>
      }
    </div>
  `,
})
class BadgeRemovableDemo {
  readonly tags = signal([...INITIAL_TAGS]);
  drop(tag: string) {
    this.tags.update((cur) => cur.filter((x) => x !== tag));
  }
  reset() {
    this.tags.set([...INITIAL_TAGS]);
  }
}

/** Count / dot overlaid on icon buttons. */
@Component({
  selector: "demo-badge-notifications",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmBadge, BpdmNotificationBadge, BpdmButton],
  template: `
    <div class="flex items-center gap-6">
      <button bpdmButton size="icon" variant="ghost" aria-label="Notifications">
        <bpdm-notification-badge [count]="count()"><span [innerHTML]="bell"></span></bpdm-notification-badge>
      </button>
      <button bpdmButton size="icon" variant="ghost" aria-label="Inbox">
        <bpdm-notification-badge [count]="128" [max]="99"><span [innerHTML]="mail"></span></bpdm-notification-badge>
      </button>
      <button bpdmButton size="icon" variant="ghost" aria-label="Status">
        <bpdm-notification-badge dot variant="success"><span [innerHTML]="bell"></span></bpdm-notification-badge>
      </button>
      <div class="flex items-center gap-2">
        <button bpdmButton size="sm" variant="outline" (click)="count.set(count() + 1)">Add</button>
        <button bpdmButton size="sm" variant="ghost" (click)="count.set(0)">Clear</button>
      </div>
    </div>
  `,
})
class BadgeNotificationsDemo {
  readonly count = signal(3);
  readonly bell = BELL;
  readonly mail = MAIL;
}

/**
 * Compact label for status, categories, counts and tags. Six semantic colors
 * across appearances (`soft`, `solid`, `outline`, `ghost`), an optional status dot
 * (with a `pulse` for live states), and a removable mode that collapses + fades.
 * `<bpdm-notification-badge>` overlays a count or dot on an icon or button.
 */
const meta: Meta<BpdmBadge> = {
  title: "Data Display/Badge",
  decorators: [
    moduleMetadata({
      imports: [
        BpdmBadge,
        BpdmNotificationBadge,
        BpdmButton,
        BadgeRemovableDemo,
        BadgeNotificationsDemo,
      ],
    }),
  ],
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["neutral", "primary", "success", "warning", "info", "destructive"],
    },
    appearance: { control: "inline-radio", options: ["soft", "solid", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    dot: { control: "boolean" },
    pulse: { control: "boolean" },
  },
  args: { variant: "success", appearance: "soft", size: "md", dot: false, pulse: false },
  render: (args) => ({
    props: args,
    template: `<bpdm-badge [variant]="variant" [appearance]="appearance" [size]="size" [dot]="dot" [pulse]="pulse">Active</bpdm-badge>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmBadge>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmBadge } from '@bpdm/ng';

@Component({
  selector: 'app-badge-demo',
  imports: [BpdmBadge],
  template: \`<bpdm-badge variant="success" appearance="soft">Active</bpdm-badge>\`,
})
export class BadgeDemoComponent {}`,
      },
    },
  },
};

/** Every color across the three appearances. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="flex flex-col gap-3">
  @for (appearance of ['soft','solid','outline']; track appearance) {
    <div class="flex flex-wrap items-center gap-2">
      <span class="w-16 text-xs text-muted-foreground">{{ appearance }}</span>
      @for (variant of ['neutral','primary','success','warning','info','destructive']; track variant) {
        <bpdm-badge [variant]="variant" [appearance]="appearance">{{ variant }}</bpdm-badge>
      }
    </div>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmBadge } from '@bpdm/ng';

@Component({
  selector: 'app-badge-variants',
  imports: [BpdmBadge],
  template: \`<bpdm-badge variant="success" appearance="soft">Active</bpdm-badge>\`,
})
export class BadgeVariantsComponent {}`,
      },
    },
  },
};

/** Leading dot — add `pulse` for live / in-progress states. */
export const StatusDots: Story = {
  render: () => ({
    template: `<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-center gap-2">
    <bpdm-badge variant="success" dot pulse>Live</bpdm-badge>
    <bpdm-badge variant="info" dot pulse>Deploying</bpdm-badge>
    <bpdm-badge variant="warning" dot>Degraded</bpdm-badge>
    <bpdm-badge variant="destructive" dot>Offline</bpdm-badge>
    <bpdm-badge variant="neutral" dot>Draft</bpdm-badge>
  </div>
  <div class="flex flex-wrap items-center gap-5">
    <bpdm-badge appearance="ghost" variant="success" dot>Healthy</bpdm-badge>
    <bpdm-badge appearance="ghost" variant="info" dot pulse>Syncing</bpdm-badge>
    <bpdm-badge appearance="ghost" variant="warning" dot>Pending</bpdm-badge>
    <bpdm-badge appearance="ghost" variant="neutral" dot>Paused</bpdm-badge>
    <bpdm-badge appearance="ghost" variant="destructive" dot>Blocked</bpdm-badge>
  </div>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmBadge } from '@bpdm/ng';

@Component({
  selector: 'app-badge-dots',
  imports: [BpdmBadge],
  template: \`
    <bpdm-badge variant="info" dot pulse>Deploying</bpdm-badge>
    <bpdm-badge appearance="ghost" variant="success" dot>Healthy</bpdm-badge>
  \`,
})
export class BadgeDotsComponent {}`,
      },
    },
  },
};

/** Removable chips — collapse + fade out on remove. */
export const Removable: Story = {
  render: () => ({ template: `<demo-badge-removable />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmBadge, BpdmButton } from '@bpdm/ng';

const INITIAL = ['Frontend', 'Backend', 'Design', 'Infra', 'Docs'];

@Component({
  selector: 'app-badge-removable',
  imports: [BpdmBadge, BpdmButton],
  template: \`
    <div class="flex min-h-8 flex-wrap items-center gap-2">
      @for (t of tags(); track t) {
        <bpdm-badge variant="neutral" removable (removed)="drop(t)">{{ t }}</bpdm-badge>
      }
      @if (tags().length === 0) {
        <button bpdmButton size="sm" variant="ghost" (click)="reset()">Reset</button>
      }
    </div>
  \`,
})
export class BadgeRemovableComponent {
  readonly tags = signal([...INITIAL]);
  drop(tag: string) { this.tags.update((cur) => cur.filter((x) => x !== tag)); }
  reset() { this.tags.set([...INITIAL]); }
}`,
      },
    },
  },
};

/** Count / dot overlaid on an icon or button. */
export const Notifications: Story = {
  render: () => ({ template: `<demo-badge-notifications />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmNotificationBadge, BpdmButton } from '@bpdm/ng';

@Component({
  selector: 'app-badge-notifications',
  imports: [BpdmNotificationBadge, BpdmButton],
  template: \`
    <button bpdmButton size="icon" variant="ghost" aria-label="Notifications">
      <bpdm-notification-badge [count]="count()"><svg><!-- bell --></svg></bpdm-notification-badge>
    </button>
    <button bpdmButton size="icon" variant="ghost" aria-label="Inbox">
      <bpdm-notification-badge [count]="128" [max]="99"><svg><!-- mail --></svg></bpdm-notification-badge>
    </button>
    <button bpdmButton size="icon" variant="ghost" aria-label="Status">
      <bpdm-notification-badge dot variant="success"><svg><!-- bell --></svg></bpdm-notification-badge>
    </button>
  \`,
})
export class BadgeNotificationsComponent {
  readonly count = signal(3);
}`,
      },
    },
  },
};

/** As a link — interactive press feedback. */
export const AsLink: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<a href="#changelog" class="no-underline"><bpdm-badge variant="primary" appearance="soft" interactive>What’s new →</bpdm-badge></a>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmBadge } from '@bpdm/ng';

@Component({
  selector: 'app-badge-link',
  imports: [BpdmBadge],
  template: \`
    <a href="/changelog" class="no-underline">
      <bpdm-badge variant="primary" appearance="soft" interactive>What’s new →</bpdm-badge>
    </a>
  \`,
})
export class BadgeLinkComponent {}`,
      },
    },
  },
};
