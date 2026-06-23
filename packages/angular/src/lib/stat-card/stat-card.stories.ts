import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmStatCard } from "./stat-card";

// inline lucide-style icons (Angular has no lucide-react); attribute marks the slot
const SVG = `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
const ICONS = {
  users: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  userPlus: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
  trendingDown: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>`,
  clock: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  eye: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  activity: `<svg bpdmStatCardIcon viewBox="0 0 24 24" ${SVG}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
};

/**
 * Dashboard KPI / stat card — a label, a big value, and an optional percentage
 * delta coloured green/red by whether the change is good. For metrics where an
 * increase is bad (e.g. churn), set `[positiveIsGood]="false"`.
 */
const meta: Meta<BpdmStatCard> = {
  title: "Data Display/StatCard",
  decorators: [moduleMetadata({ imports: [BpdmStatCard] })],
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    delta: { control: "number" },
    deltaLabel: { control: "text" },
    positiveIsGood: { control: "boolean" },
    accent: { control: "color" },
  },
  args: {
    label: "Active users",
    value: "8,420",
    delta: 3.1,
    deltaLabel: "vs last week",
    positiveIsGood: true,
  },
  render: (args) => ({
    props: args,
    template: `<div class="w-72">
  <bpdm-stat-card [label]="label" [value]="value" [delta]="delta" [deltaLabel]="deltaLabel" [positiveIsGood]="positiveIsGood" [accent]="accent"></bpdm-stat-card>
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmStatCard>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatCard } from '@bpdm/ng';

@Component({
  selector: 'app-stat-demo',
  imports: [BpdmStatCard],
  template: \`
    <bpdm-stat-card label="Active users" value="8,420" [delta]="3.1" deltaLabel="vs last week" />
  \`,
})
export class StatDemoComponent {}`,
      },
    },
  },
};

/** A typical dashboard row — note bounce rate uses `[positiveIsGood]="false"`. */
export const Dashboard: Story = {
  render: () => ({
    template: `<div class="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
  <bpdm-stat-card label="Active users" value="8,420" [delta]="3.1" deltaLabel="vs last week">${ICONS.users}</bpdm-stat-card>
  <bpdm-stat-card label="New signups" value="1,294" [delta]="12.5" deltaLabel="vs last month">${ICONS.userPlus}</bpdm-stat-card>
  <bpdm-stat-card label="Bounce rate" value="2.4%" [delta]="0.6" [positiveIsGood]="false" deltaLabel="vs last month">${ICONS.trendingDown}</bpdm-stat-card>
  <bpdm-stat-card label="Avg. session" value="4m 12s" [delta]="-1.8" deltaLabel="vs last month">${ICONS.clock}</bpdm-stat-card>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatCard } from '@bpdm/ng';

@Component({
  selector: 'app-stat-dashboard',
  imports: [BpdmStatCard],
  template: \`
    <div class="grid max-w-3xl gap-4 sm:grid-cols-2">
      <bpdm-stat-card label="Active users" value="8,420" [delta]="3.1" deltaLabel="vs last week">
        <svg bpdmStatCardIcon><!-- your icon --></svg>
      </bpdm-stat-card>
      <bpdm-stat-card label="New signups" value="1,294" [delta]="12.5" deltaLabel="vs last month">…</bpdm-stat-card>
      <bpdm-stat-card label="Bounce rate" value="2.4%" [delta]="0.6" [positiveIsGood]="false" deltaLabel="vs last month">…</bpdm-stat-card>
      <bpdm-stat-card label="Avg. session" value="4m 12s" [delta]="-1.8" deltaLabel="vs last month">…</bpdm-stat-card>
    </div>
  \`,
})
export class StatDashboardComponent {}`,
      },
    },
  },
};

/** Custom accent colors — tinted card + matching icon badge. */
export const Colored: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <bpdm-stat-card label="Page views" value="1.24M" accent="#2563eb">${ICONS.eye}</bpdm-stat-card>
  <bpdm-stat-card label="Sessions" value="84.3K" accent="#0d9488">${ICONS.activity}</bpdm-stat-card>
  <bpdm-stat-card label="Bounce rate" value="1.8%" accent="#e11d48">${ICONS.trendingDown}</bpdm-stat-card>
  <bpdm-stat-card label="New signups" value="1,294" accent="#7c3aed">${ICONS.userPlus}</bpdm-stat-card>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatCard } from '@bpdm/ng';

@Component({
  selector: 'app-stat-colored',
  imports: [BpdmStatCard],
  template: \`
    <div class="grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <bpdm-stat-card label="Page views" value="1.24M" accent="#2563eb"><svg bpdmStatCardIcon>…</svg></bpdm-stat-card>
      <bpdm-stat-card label="Sessions" value="84.3K" accent="#0d9488"><svg bpdmStatCardIcon>…</svg></bpdm-stat-card>
      <bpdm-stat-card label="Bounce rate" value="1.8%" accent="#e11d48"><svg bpdmStatCardIcon>…</svg></bpdm-stat-card>
      <bpdm-stat-card label="New signups" value="1,294" accent="#7c3aed"><svg bpdmStatCardIcon>…</svg></bpdm-stat-card>
    </div>
  \`,
})
export class StatColoredComponent {}`,
      },
    },
  },
};

/** No delta — just label + value. */
export const NoDelta: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-72"><bpdm-stat-card label="Open tickets" value="37" /></div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmStatCard } from '@bpdm/ng';

@Component({
  selector: 'app-stat-no-delta',
  imports: [BpdmStatCard],
  template: \`<bpdm-stat-card label="Open tickets" value="37" />\`,
})
export class StatNoDeltaComponent {}`,
      },
    },
  },
};
