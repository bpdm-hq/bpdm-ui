import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import {
  BpdmCard,
  BpdmCardContent,
  BpdmCardDescription,
  BpdmCardFooter,
  BpdmCardHeader,
  BpdmCardMedia,
  BpdmCardTitle,
} from "./card";
import { BpdmButton } from "../button/button";

const CARD_PARTS = [
  BpdmCard,
  BpdmCardMedia,
  BpdmCardHeader,
  BpdmCardTitle,
  BpdmCardDescription,
  BpdmCardContent,
  BpdmCardFooter,
  BpdmButton,
];

// license-free gradient media (inline SVG data URI) — no external images
function media(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = h % 360;
  const b = (a + 48) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${a} 68% 24%)'/><stop offset='1' stop-color='hsl(${b} 62% 13%)'/></linearGradient></defs><rect width='600' height='340' fill='url(#g)'/><circle cx='175' cy='150' r='120' fill='hsl(${a} 85% 58%)' opacity='0.28'/><circle cx='470' cy='255' r='72' fill='hsl(${b} 85% 62%)' opacity='0.22'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const BODY =
  "A clear, focused summary lives here — enough context to scan quickly without overwhelming the reader. Cards keep related content together with consistent spacing.";

/**
 * Composable surface for grouping content. Three looks (`elevated`, `outlined`,
 * `soft`), an optional edge-to-edge `<bpdm-card-media>` band (image zooms on
 * hover), and `hoverable` / `interactive` inputs for lift + press feedback.
 */
const meta: Meta<BpdmCard> = {
  title: "Data Display/Card",
  decorators: [moduleMetadata({ imports: CARD_PARTS })],
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["elevated", "outlined", "soft"] },
    hoverable: { control: "boolean" },
    interactive: { control: "boolean" },
  },
  args: { variant: "elevated", hoverable: false, interactive: false },
  render: (args) => ({
    props: args,
    template: `<bpdm-card [variant]="variant" [hoverable]="hoverable" [interactive]="interactive" class="w-full max-w-md">
  <bpdm-card-header>
    <h3 bpdmCardTitle>Project Atlas</h3>
    <p bpdmCardDescription>Workspace · 12 members</p>
  </bpdm-card-header>
  <div bpdmCardContent>${BODY}</div>
</bpdm-card>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmCard>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-demo',
  imports: [BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent],
  template: \`
    <bpdm-card class="max-w-md">
      <bpdm-card-header>
        <h3 bpdmCardTitle>Project Atlas</h3>
        <p bpdmCardDescription>Workspace · 12 members</p>
      </bpdm-card-header>
      <div bpdmCardContent>${BODY}</div>
    </bpdm-card>
  \`,
})
export class CardDemoComponent {}`,
      },
    },
  },
};

/** Title + body only. */
export const Simple: Story = {
  render: () => ({
    template: `<bpdm-card class="w-full max-w-md">
  <bpdm-card-header><h3 bpdmCardTitle>Release notes</h3></bpdm-card-header>
  <div bpdmCardContent>Version 2.4 adds keyboard navigation across the console, a faster table, and four built-in themes. Existing settings carry over automatically.</div>
</bpdm-card>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardContent } from '@bpdm/ng';

@Component({
  selector: 'app-card-simple',
  imports: [BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardContent],
  template: \`
    <bpdm-card>
      <bpdm-card-header><h3 bpdmCardTitle>Release notes</h3></bpdm-card-header>
      <div bpdmCardContent>
        Version 2.4 adds keyboard navigation across the console, a faster table,
        and four built-in themes. Existing settings carry over automatically.
      </div>
    </bpdm-card>
  \`,
})
export class CardSimpleComponent {}`,
      },
    },
  },
};

/** Media + subtitle + footer actions. */
export const Advanced: Story = {
  render: () => ({
    props: { cover: media("atlas") },
    template: `<bpdm-card hoverable class="w-full max-w-sm">
  <bpdm-card-media [src]="cover" alt="" />
  <bpdm-card-header>
    <h3 bpdmCardTitle>Project Atlas</h3>
    <p bpdmCardDescription>Updated 2 days ago</p>
    <span bpdmCardAction class="inline-flex h-6 items-center rounded-full bg-[color-mix(in_srgb,var(--success)_18%,transparent)] px-2.5 text-xs font-medium text-success">Live</span>
  </bpdm-card-header>
  <div bpdmCardContent>${BODY}</div>
  <div bpdmCardFooter>
    <button bpdmButton variant="outline" class="flex-1">Cancel</button>
    <button bpdmButton class="flex-1">Save</button>
  </div>
</bpdm-card>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription,
  BpdmCardContent, BpdmCardFooter, BpdmButton,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-advanced',
  imports: [
    BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription,
    BpdmCardContent, BpdmCardFooter, BpdmButton,
  ],
  template: \`
    <bpdm-card hoverable class="max-w-sm">
      <bpdm-card-media src="/cover.jpg" alt="" />
      <bpdm-card-header>
        <h3 bpdmCardTitle>Project Atlas</h3>
        <p bpdmCardDescription>Updated 2 days ago</p>
        <span bpdmCardAction>Live</span>
      </bpdm-card-header>
      <div bpdmCardContent>
        A clear, focused summary lives here — enough context to scan quickly
        without overwhelming the reader.
      </div>
      <div bpdmCardFooter>
        <button bpdmButton variant="outline" class="flex-1">Cancel</button>
        <button bpdmButton class="flex-1">Save</button>
      </div>
    </bpdm-card>
  \`,
})
export class CardAdvancedComponent {}`,
      },
    },
  },
};

/** The three looks — shadow vs border vs fill. */
export const Variants: Story = {
  render: () => ({
    template: `<div class="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
  <bpdm-card variant="elevated">
    <bpdm-card-header><h3 bpdmCardTitle>Elevated</h3><p bpdmCardDescription>variant="elevated"</p></bpdm-card-header>
    <div bpdmCardContent>Lifts off the page with a soft shadow and no border.</div>
  </bpdm-card>
  <bpdm-card variant="outlined">
    <bpdm-card-header><h3 bpdmCardTitle>Outlined</h3><p bpdmCardDescription>variant="outlined"</p></bpdm-card-header>
    <div bpdmCardContent>A flat surface defined by a border — no shadow.</div>
  </bpdm-card>
  <bpdm-card variant="soft">
    <bpdm-card-header><h3 bpdmCardTitle>Soft</h3><p bpdmCardDescription>variant="soft"</p></bpdm-card-header>
    <div bpdmCardContent>A filled, muted surface — no border or shadow.</div>
  </bpdm-card>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-variants',
  imports: [BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent],
  template: \`
    <div class="grid gap-4 sm:grid-cols-3">
      <bpdm-card variant="elevated">
        <bpdm-card-header><h3 bpdmCardTitle>Elevated</h3><p bpdmCardDescription>variant="elevated"</p></bpdm-card-header>
        <div bpdmCardContent>Lifts off the page with a soft shadow and no border.</div>
      </bpdm-card>
      <bpdm-card variant="outlined">
        <bpdm-card-header><h3 bpdmCardTitle>Outlined</h3><p bpdmCardDescription>variant="outlined"</p></bpdm-card-header>
        <div bpdmCardContent>A flat surface defined by a border — no shadow.</div>
      </bpdm-card>
      <bpdm-card variant="soft">
        <bpdm-card-header><h3 bpdmCardTitle>Soft</h3><p bpdmCardDescription>variant="soft"</p></bpdm-card-header>
        <div bpdmCardContent>A filled, muted surface — no border or shadow.</div>
      </bpdm-card>
    </div>
  \`,
})
export class CardVariantsComponent {}`,
      },
    },
  },
};

/** Responsive grid of media cards; each lifts + zooms on hover. */
export const ResponsiveGrid: Story = {
  render: () => ({
    props: {
      services: ["Atlas", "Beacon", "Cobalt", "Drift", "Ember", "Forge"].map((name) => ({
        name,
        cover: media(name),
      })),
    },
    template: `<div class="grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
  @for (s of services; track s.name) {
    <bpdm-card hoverable>
      <bpdm-card-media [src]="s.cover" alt="" aspect="video" />
      <bpdm-card-header><h3 bpdmCardTitle>{{ s.name }}</h3><p bpdmCardDescription>Service · healthy</p></bpdm-card-header>
      <div bpdmCardContent>Deploys automatically on every merge to the main branch.</div>
    </bpdm-card>
  }
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-grid',
  imports: [BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent],
  template: \`
    <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      @for (name of services; track name) {
        <bpdm-card hoverable>
          <bpdm-card-media [src]="'/covers/' + name + '.jpg'" alt="" aspect="video" />
          <bpdm-card-header><h3 bpdmCardTitle>{{ name }}</h3><p bpdmCardDescription>Service · healthy</p></bpdm-card-header>
          <div bpdmCardContent>Deploys automatically on every merge to the main branch.</div>
        </bpdm-card>
      }
    </div>
  \`,
})
export class CardGridComponent {
  readonly services = ['Atlas', 'Beacon', 'Cobalt', 'Drift', 'Ember', 'Forge'];
}`,
      },
    },
  },
};

/** Whole card is a link — press feedback + focus ring. */
export const Interactive: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<a href="#atlas" class="block w-full max-w-md no-underline">
  <bpdm-card hoverable interactive>
    <bpdm-card-header>
      <h3 bpdmCardTitle>Open Project Atlas →</h3>
      <p bpdmCardDescription>The entire card is clickable</p>
      <svg bpdmCardAction viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-muted-foreground">
        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
      </svg>
    </bpdm-card-header>
    <div bpdmCardContent>${BODY}</div>
  </bpdm-card>
</a>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-interactive',
  imports: [BpdmCard, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent],
  template: \`
    <a href="/atlas" class="block max-w-md no-underline">
      <bpdm-card hoverable interactive>
        <bpdm-card-header>
          <h3 bpdmCardTitle>Open Project Atlas →</h3>
          <p bpdmCardDescription>The entire card is clickable</p>
        </bpdm-card-header>
        <div bpdmCardContent>A clear, focused summary lives here.</div>
      </bpdm-card>
    </a>
  \`,
})
export class CardInteractiveComponent {}`,
      },
    },
  },
};

/** Media beside the content (stacks on small screens). */
export const Horizontal: Story = {
  tags: ["!dev"],
  render: () => ({
    props: { cover: media("beacon") },
    template: `<bpdm-card hoverable class="w-full max-w-2xl sm:flex-row">
  <bpdm-card-media [src]="cover" alt="" class="sm:w-2/5 sm:aspect-auto" aspect="video" />
  <div class="flex flex-col">
    <bpdm-card-header><h3 bpdmCardTitle>Beacon</h3><p bpdmCardDescription>Monitoring service</p></bpdm-card-header>
    <div bpdmCardContent>Real-time health checks across every region, with alerting and a 30-day history.</div>
  </div>
</bpdm-card>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import {
  BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent,
} from '@bpdm/ng';

@Component({
  selector: 'app-card-horizontal',
  imports: [BpdmCard, BpdmCardMedia, BpdmCardHeader, BpdmCardTitle, BpdmCardDescription, BpdmCardContent],
  template: \`
    <bpdm-card hoverable class="sm:flex-row">
      <bpdm-card-media src="/cover.jpg" alt="" class="sm:w-2/5 sm:aspect-auto" aspect="video" />
      <div class="flex flex-col">
        <bpdm-card-header><h3 bpdmCardTitle>Beacon</h3><p bpdmCardDescription>Monitoring service</p></bpdm-card-header>
        <div bpdmCardContent>
          Real-time health checks across every region, with alerting and a 30-day history.
        </div>
      </div>
    </bpdm-card>
  \`,
})
export class CardHorizontalComponent {}`,
      },
    },
  },
};
