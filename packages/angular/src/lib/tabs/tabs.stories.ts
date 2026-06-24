import { Component, computed, input, TemplateRef, viewChild } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmTabs, type TabItem, type TabsBaseline, type TabsVariant } from "./tabs";

@Component({
  selector: "demo-tabs",
  imports: [BpdmTabs],
  template: `
    <div class="w-full max-w-3xl">
      <bpdm-tabs
        [items]="items()"
        [variant]="variant()"
        [baseline]="baseline()"
        [fullWidth]="fullWidth()"
      />
    </div>
    <ng-template #overview><p class="text-sm text-muted-foreground">Project overview and highlights.</p></ng-template>
    <ng-template #activity><p class="text-sm text-muted-foreground">Recent activity and events.</p></ng-template>
    <ng-template #members><p class="text-sm text-muted-foreground">People with access and their roles.</p></ng-template>
    <ng-template #integrations><p class="text-sm text-muted-foreground">Connected apps and services.</p></ng-template>
    <ng-template #settings><p class="text-sm text-muted-foreground">Project preferences.</p></ng-template>
  `,
})
class TabsDemo {
  readonly variant = input<TabsVariant>("underline");
  readonly baseline = input<TabsBaseline>("full");
  readonly fullWidth = input(false);
  private readonly overview = viewChild<TemplateRef<unknown>>("overview");
  private readonly activity = viewChild<TemplateRef<unknown>>("activity");
  private readonly members = viewChild<TemplateRef<unknown>>("members");
  private readonly integrations = viewChild<TemplateRef<unknown>>("integrations");
  private readonly settings = viewChild<TemplateRef<unknown>>("settings");

  readonly items = computed<TabItem[]>(() => {
    const t = [
      this.overview(),
      this.activity(),
      this.members(),
      this.integrations(),
      this.settings(),
    ];
    if (t.some((x) => !x)) return [];
    return [
      { value: "overview", label: "Overview", content: t[0] },
      { value: "activity", label: "Activity", content: t[1] },
      { value: "members", label: "Members", content: t[2] },
      { value: "integrations", label: "Integrations", content: t[3] },
      { value: "settings", label: "Settings", content: t[4] },
    ];
  });
}

@Component({
  selector: "demo-tabs-pill",
  imports: [BpdmTabs],
  template: `
    <div class="w-full max-w-3xl">
      <bpdm-tabs variant="pill" [items]="items()" />
    </div>
    <ng-template #briefcase>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    </ng-template>
    <ng-template #user>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    </ng-template>
    <ng-template #wsPanel><p class="text-sm text-muted-foreground">Workspace-wide preferences.</p></ng-template>
    <ng-template #profilePanel><p class="text-sm text-muted-foreground">Your personal profile.</p></ng-template>
  `,
})
class TabsPillDemo {
  private readonly briefcase = viewChild<TemplateRef<unknown>>("briefcase");
  private readonly user = viewChild<TemplateRef<unknown>>("user");
  private readonly wsPanel = viewChild<TemplateRef<unknown>>("wsPanel");
  private readonly profilePanel = viewChild<TemplateRef<unknown>>("profilePanel");
  readonly items = computed<TabItem[]>(() => {
    const b = this.briefcase();
    const u = this.user();
    const w = this.wsPanel();
    const p = this.profilePanel();
    if (!b || !u || !w || !p) return [];
    return [
      { value: "workspace", label: "Workspace", icon: b, content: w },
      { value: "profile", label: "Profile", icon: u, content: p },
    ];
  });
}

@Component({
  selector: "demo-tabs-disabled",
  imports: [BpdmTabs],
  template: `
    <div class="w-full max-w-3xl">
      <bpdm-tabs [items]="items()" />
    </div>
    <ng-template #general><p class="text-sm text-muted-foreground">General.</p></ng-template>
    <ng-template #billing><p class="text-sm text-muted-foreground">Billing.</p></ng-template>
    <ng-template #danger><p class="text-sm text-muted-foreground">Danger.</p></ng-template>
  `,
})
class TabsDisabledDemo {
  private readonly general = viewChild<TemplateRef<unknown>>("general");
  private readonly billing = viewChild<TemplateRef<unknown>>("billing");
  private readonly danger = viewChild<TemplateRef<unknown>>("danger");
  readonly items = computed<TabItem[]>(() => {
    const g = this.general();
    const b = this.billing();
    const d = this.danger();
    if (!g || !b || !d) return [];
    return [
      { value: "general", label: "General", content: g },
      { value: "billing", label: "Billing", content: b },
      { value: "danger", label: "Danger zone", disabled: true, content: d },
    ];
  });
}

const usage = `
Tabs (roving focus, arrow-key nav) with two looks — \`underline\` (a line indicator
under the active tab) and \`pill\` (a filled active tab). Data-driven via \`items\`
(each with a \`content\` template). Controlled or uncontrolled; supports icons,
disabled tabs, and \`fullWidth\`.

\`\`\`html
<bpdm-tabs variant="underline" [items]="tabs" />
\`\`\`
`;

const meta: Meta = {
  title: "Navigation/Tabs",
  component: BpdmTabs,
  decorators: [moduleMetadata({ imports: [TabsDemo, TabsPillDemo, TabsDisabledDemo] })],
  tags: ["autodocs"],
  parameters: { docs: { description: { component: usage } } },
  argTypes: {
    variant: { control: "inline-radio", options: ["underline", "pill"] },
    baseline: { control: "inline-radio", options: ["full", "content"] },
    fullWidth: { control: "boolean" },
  },
  args: { variant: "underline", baseline: "full", fullWidth: false },
  render: (args) => ({
    props: args,
    template: `<demo-tabs [variant]="variant" [baseline]="baseline" [fullWidth]="fullWidth" />`,
  }),
};
export default meta;

type Story = StoryObj;

export const Underline: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmTabs, TabItem } from '@bpdm/ng';

@Component({
  selector: 'app-tabs',
  imports: [BpdmTabs],
  template: \`
    <bpdm-tabs variant="underline" [items]="items()" />
    <ng-template #overview><p>Project overview and highlights.</p></ng-template>
    <ng-template #activity><p>Recent activity and events.</p></ng-template>
  \`,
})
export class TabsComponent {
  private overview = viewChild<TemplateRef<unknown>>('overview');
  private activity = viewChild<TemplateRef<unknown>>('activity');
  items = computed<TabItem[]>(() => {
    const o = this.overview(), a = this.activity();
    return o && a ? [
      { value: 'overview', label: 'Overview', content: o },
      { value: 'activity', label: 'Activity', content: a },
    ] : [];
  });
}`,
      },
    },
  },
};

/** The underline track ends with the last tab instead of spanning the row. */
export const ContentBaseline: Story = {
  tags: ["!dev"],
  args: { baseline: "content" },
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmTabs, TabItem } from '@bpdm/ng';

@Component({
  selector: 'app-tabs',
  imports: [BpdmTabs],
  template: \`
    <bpdm-tabs variant="underline" baseline="content" [items]="items()" />
    <ng-template #overview><p>Project overview and highlights.</p></ng-template>
    <ng-template #activity><p>Recent activity and events.</p></ng-template>
    <ng-template #members><p>People with access and their roles.</p></ng-template>
    <ng-template #integrations><p>Connected apps and services.</p></ng-template>
    <ng-template #settings><p>Project preferences.</p></ng-template>
  \`,
})
export class TabsComponent {
  private overview = viewChild<TemplateRef<unknown>>('overview');
  private activity = viewChild<TemplateRef<unknown>>('activity');
  private members = viewChild<TemplateRef<unknown>>('members');
  private integrations = viewChild<TemplateRef<unknown>>('integrations');
  private settings = viewChild<TemplateRef<unknown>>('settings');
  items = computed<TabItem[]>(() => {
    const o = this.overview(), a = this.activity(), m = this.members(),
      i = this.integrations(), s = this.settings();
    return o && a && m && i && s ? [
      { value: 'overview', label: 'Overview', content: o },
      { value: 'activity', label: 'Activity', content: a },
      { value: 'members', label: 'Members', content: m },
      { value: 'integrations', label: 'Integrations', content: i },
      { value: 'settings', label: 'Settings', content: s },
    ] : [];
  });
}`,
      },
    },
  },
};

/** Filled active tab with icons (no underline). */
export const Pill: Story = {
  render: () => ({ template: `<demo-tabs-pill />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmTabs, TabItem } from '@bpdm/ng';

@Component({
  selector: 'app-tabs',
  imports: [BpdmTabs],
  template: \`
    <bpdm-tabs variant="pill" [items]="items()" />
    <ng-template #briefcase>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    </ng-template>
    <ng-template #user>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    </ng-template>
    <ng-template #workspace><p>Workspace-wide preferences.</p></ng-template>
    <ng-template #profile><p>Your personal profile.</p></ng-template>
  \`,
})
export class TabsComponent {
  private briefcase = viewChild<TemplateRef<unknown>>('briefcase');
  private user = viewChild<TemplateRef<unknown>>('user');
  private workspace = viewChild<TemplateRef<unknown>>('workspace');
  private profile = viewChild<TemplateRef<unknown>>('profile');
  items = computed<TabItem[]>(() => {
    const b = this.briefcase(), u = this.user(), w = this.workspace(), p = this.profile();
    return b && u && w && p ? [
      { value: 'workspace', label: 'Workspace', icon: b, content: w },
      { value: 'profile', label: 'Profile', icon: u, content: p },
    ] : [];
  });
}`,
      },
    },
  },
};

/** Tabs stretch to fill the row width equally. */
export const FullWidth: Story = {
  tags: ["!dev"],
  args: { fullWidth: true },
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmTabs, TabItem } from '@bpdm/ng';

@Component({
  selector: 'app-tabs',
  imports: [BpdmTabs],
  template: \`
    <bpdm-tabs variant="underline" [fullWidth]="true" [items]="items()" />
    <ng-template #overview><p>Project overview and highlights.</p></ng-template>
    <ng-template #activity><p>Recent activity and events.</p></ng-template>
    <ng-template #settings><p>Project preferences.</p></ng-template>
  \`,
})
export class TabsComponent {
  private overview = viewChild<TemplateRef<unknown>>('overview');
  private activity = viewChild<TemplateRef<unknown>>('activity');
  private settings = viewChild<TemplateRef<unknown>>('settings');
  items = computed<TabItem[]>(() => {
    const o = this.overview(), a = this.activity(), s = this.settings();
    return o && a && s ? [
      { value: 'overview', label: 'Overview', content: o },
      { value: 'activity', label: 'Activity', content: a },
      { value: 'settings', label: 'Settings', content: s },
    ] : [];
  });
}`,
      },
    },
  },
};

/** A disabled tab can't be selected or focused. */
export const DisabledTab: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<demo-tabs-disabled />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, computed, TemplateRef, viewChild } from '@angular/core';
import { BpdmTabs, TabItem } from '@bpdm/ng';

@Component({
  selector: 'app-tabs',
  imports: [BpdmTabs],
  template: \`
    <bpdm-tabs [items]="items()" />
    <ng-template #general><p>General.</p></ng-template>
    <ng-template #billing><p>Billing.</p></ng-template>
    <ng-template #danger><p>Danger.</p></ng-template>
  \`,
})
export class TabsComponent {
  private general = viewChild<TemplateRef<unknown>>('general');
  private billing = viewChild<TemplateRef<unknown>>('billing');
  private danger = viewChild<TemplateRef<unknown>>('danger');
  items = computed<TabItem[]>(() => {
    const g = this.general(), b = this.billing(), d = this.danger();
    return g && b && d ? [
      { value: 'general', label: 'General', content: g },
      { value: 'billing', label: 'Billing', content: b },
      { value: 'danger', label: 'Danger zone', disabled: true, content: d },
    ] : [];
  });
}`,
      },
    },
  },
};
