import { Component, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmOrderList } from "./order-list";

type Story = StoryObj;

interface Widget {
  id: string;
  name: string;
  category: string;
  updated?: string;
  icon?: string;
}

const ICON: Record<string, string> = {
  gauge: "M12 14l4-4M21 12a9 9 0 1 0-18 0",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  chart: "M3 3v18h18M7 16v-5M12 16V8M17 16v-3",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87",
};

const WIDGETS: Widget[] = [
  { id: "overview", name: "Overview", category: "Summary", updated: "2m ago", icon: ICON["gauge"] },
  { id: "traffic", name: "Traffic", category: "Analytics", updated: "5m ago", icon: ICON["activity"] },
  { id: "revenue", name: "Revenue", category: "Finance", updated: "1h ago", icon: ICON["chart"] },
  { id: "sessions", name: "Active sessions", category: "Analytics", updated: "just now", icon: ICON["clock"] },
  { id: "team", name: "Team activity", category: "People", updated: "12m ago", icon: ICON["users"] },
  { id: "uptime", name: "Uptime", category: "Reliability", updated: "3m ago", icon: ICON["activity"] },
];

const STRINGS = ["Overview", "Traffic", "Revenue", "Sessions", "Team activity", "Uptime"];

// string-item host (Basic / MultipleSelection / NoDragDrop)
@Component({
  selector: "ol-string",
  imports: [BpdmOrderList],
  template: `
    <div class="w-80">
      <bpdm-order-list
        [(value)]="items"
        [itemKey]="key"
        [itemTemplate]="tpl"
        [selectionMode]="selectionMode"
        [dragdrop]="dragdrop"
      />
    </div>
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class OlStringHost {
  readonly items = signal<string[]>([...STRINGS]);
  readonly key = (w: string) => w;
  selectionMode: "single" | "multiple" = "single";
  dragdrop = true;
}

// filterable host (WithFilter)
@Component({
  selector: "ol-filter",
  imports: [BpdmOrderList],
  template: `
    <div class="w-96">
      <bpdm-order-list
        [(value)]="items"
        [itemKey]="key"
        [itemTemplate]="tpl"
        [filterBy]="filterBy"
        filterPlaceholder="Filter widgets"
      />
    </div>
    <ng-template #tpl let-w>
      <div class="flex items-center justify-between gap-3">
        <span>{{ w.name }}</span>
        <span class="text-xs text-muted-foreground">{{ w.category }}</span>
      </div>
    </ng-template>
  `,
})
class OlFilterHost {
  readonly items = signal<Widget[]>([...WIDGETS]);
  readonly key = (w: Widget) => w.id;
  readonly filterBy = (w: Widget) => w.name;
}

// rich template host (Template) — icon, title, meta + a header
@Component({
  selector: "ol-template",
  imports: [BpdmOrderList],
  template: `
    <div class="w-96">
      <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" header="Dashboard widgets" />
    </div>
    <ng-template #tpl let-w>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
          <path [attr.d]="w.icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ w.name }}</p>
          <p class="text-xs text-muted-foreground">{{ w.category }}</p>
        </div>
        <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ w.updated }}</span>
      </div>
    </ng-template>
  `,
})
class OlTemplateHost {
  readonly items = signal<Widget[]>([...WIDGETS]);
  readonly key = (w: Widget) => w.id;
}

/**
 * Reorder a collection: select one or more items, then move them with the control
 * column (up / to top / down / to bottom), or drag to reorder. Controlled
 * (`[(value)]`) or uncontrolled (`defaultValue`), optional filtering, a custom item
 * template, and responsive — the controls sit beside the list and stack above it on
 * small screens. `SelectableList` (the list body) is shared with `PickList`.
 *
 * ```html
 * <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" />
 * <ng-template #tpl let-item>{{ item }}</ng-template>
 * ```
 */
const meta: Meta = {
  title: "Data Display/OrderList",
  component: BpdmOrderList,
  decorators: [
    moduleMetadata({ imports: [OlStringHost, OlFilterHost, OlTemplateHost] }),
  ],
  tags: ["autodocs"],
};
export default meta;

export const Basic: Story = {
  render: () => ({ template: `<ol-string />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmOrderList } from '@bpdm/ng';

@Component({
  selector: 'app-order-basic',
  imports: [BpdmOrderList],
  template: \`
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  \`,
})
export class OrderBasicComponent {
  readonly items = signal(['Overview', 'Traffic', 'Revenue', 'Sessions', 'Team activity', 'Uptime']);
  readonly key = (w: string) => w;
}`,
      },
    },
  },
};

export const WithFilter: Story = {
  render: () => ({ template: `<ol-filter />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmOrderList } from '@bpdm/ng';

type Widget = { id: string; name: string; category: string };

@Component({
  selector: 'app-order-filter',
  imports: [BpdmOrderList],
  template: \`
    <bpdm-order-list
      [(value)]="items"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [filterBy]="filterBy"
      filterPlaceholder="Filter widgets"
    />
    <ng-template #tpl let-w>
      <div class="flex items-center justify-between gap-3">
        <span>{{ w.name }}</span>
        <span class="text-xs text-muted-foreground">{{ w.category }}</span>
      </div>
    </ng-template>
  \`,
})
export class OrderFilterComponent {
  readonly items = signal<Widget[]>([
    { id: 'overview', name: 'Overview', category: 'Summary' },
    { id: 'traffic', name: 'Traffic', category: 'Analytics' },
    { id: 'revenue', name: 'Revenue', category: 'Finance' },
    { id: 'sessions', name: 'Active sessions', category: 'Analytics' },
  ]);
  readonly key = (w: Widget) => w.id;
  readonly filterBy = (w: Widget) => w.name;
}`,
      },
    },
  },
};

export const Template: Story = {
  render: () => ({ template: `<ol-template />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmOrderList } from '@bpdm/ng';

type Widget = { id: string; name: string; category: string; updated: string; icon: string };

@Component({
  selector: 'app-order-template',
  imports: [BpdmOrderList],
  template: \`
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" header="Dashboard widgets" />
    <ng-template #tpl let-w>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-muted-foreground">
          <path [attr.d]="w.icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ w.name }}</p>
          <p class="text-xs text-muted-foreground">{{ w.category }}</p>
        </div>
        <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{{ w.updated }}</span>
      </div>
    </ng-template>
  \`,
})
export class OrderTemplateComponent {
  readonly items = signal<Widget[]>([
    { id: 'overview', name: 'Overview', category: 'Summary', updated: '2m ago', icon: 'M12 14l4-4M21 12a9 9 0 1 0-18 0' },
    { id: 'traffic', name: 'Traffic', category: 'Analytics', updated: '5m ago', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  ]);
  readonly key = (w: Widget) => w.id;
}`,
      },
    },
  },
};

// select several items and move them together with the control column
export const MultipleSelection: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<ol-string [selectionMode]="'multiple'" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmOrderList } from '@bpdm/ng';

@Component({
  selector: 'app-order-multiple',
  imports: [BpdmOrderList],
  template: \`
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" selectionMode="multiple" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  \`,
})
export class OrderMultipleComponent {
  readonly items = signal(['Overview', 'Traffic', 'Revenue', 'Sessions', 'Team activity', 'Uptime']);
  readonly key = (w: string) => w;
}`,
      },
    },
  },
};

// drag-and-drop is on by default; set [dragdrop]="false" to disable
export const NoDragDrop: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<ol-string [dragdrop]="false" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmOrderList } from '@bpdm/ng';

@Component({
  selector: 'app-order-nodrag',
  imports: [BpdmOrderList],
  template: \`
    <bpdm-order-list [(value)]="items" [itemKey]="key" [itemTemplate]="tpl" [dragdrop]="false" />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  \`,
})
export class OrderNoDragComponent {
  readonly items = signal(['Overview', 'Traffic', 'Revenue', 'Sessions']);
  readonly key = (w: string) => w;
}`,
      },
    },
  },
};
