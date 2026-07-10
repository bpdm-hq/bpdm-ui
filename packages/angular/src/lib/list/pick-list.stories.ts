import { Component, signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmPickList, type PickListMessages, type PickListValue } from "./pick-list";

type Story = StoryObj;

interface Widget {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

const ICON: Record<string, string> = {
  gauge: "M12 14l4-4M21 12a9 9 0 1 0-18 0",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  chart: "M3 3v18h18M7 16v-5M12 16V8M17 16v-3",
  clock: "M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87",
};

const AVAILABLE: Widget[] = [
  { id: "traffic", name: "Traffic", category: "Analytics", icon: ICON["activity"] },
  { id: "revenue", name: "Revenue", category: "Finance", icon: ICON["chart"] },
  { id: "sessions", name: "Active sessions", category: "Analytics", icon: ICON["clock"] },
  { id: "team", name: "Team activity", category: "People", icon: ICON["users"] },
  { id: "uptime", name: "Uptime", category: "Reliability", icon: ICON["activity"] },
];
const CHOSEN: Widget[] = [{ id: "overview", name: "Overview", category: "Summary", icon: ICON["gauge"] }];

// string-item host (Basic / TransferOnly)
@Component({
  selector: "pl-string",
  imports: [BpdmPickList],
  template: `
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [reorder]="reorder"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  `,
})
class PlStringHost {
  readonly lists = signal<PickListValue<string>>({
    source: ["Traffic", "Revenue", "Active sessions", "Team activity", "Uptime"],
    target: ["Overview"],
  });
  readonly key = (w: string) => w;
  reorder = true;
}

// filterable host (WithFilter)
@Component({
  selector: "pl-filter",
  imports: [BpdmPickList],
  template: `
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [filterBy]="filterBy"
      filterPlaceholder="Filter widgets"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-w>
      <div class="flex items-center justify-between gap-3">
        <span>{{ w.name }}</span>
        <span class="text-xs text-muted-foreground">{{ w.category }}</span>
      </div>
    </ng-template>
  `,
})
class PlFilterHost {
  readonly lists = signal<PickListValue<Widget>>({ source: [...AVAILABLE], target: [...CHOSEN] });
  readonly key = (w: Widget) => w.id;
  readonly filterBy = (w: Widget) => w.name;
}

// rich template host (Template)
@Component({
  selector: "pl-template",
  imports: [BpdmPickList],
  template: `
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-w>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-muted-foreground" aria-hidden="true">
          <path [attr.d]="w.icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ w.name }}</p>
          <p class="text-xs text-muted-foreground">{{ w.category }}</p>
        </div>
      </div>
    </ng-template>
  `,
})
class PlTemplateHost {
  readonly lists = signal<PickListValue<Widget>>({ source: [...AVAILABLE], target: [...CHOSEN] });
  readonly key = (w: Widget) => w.id;
}

// i18n + RTL host (Internationalized): every string via `messages`, dir="rtl"
// flips the transfer arrows.
@Component({
  selector: "pl-i18n",
  imports: [BpdmPickList],
  template: `
    <div dir="rtl">
      <bpdm-pick-list
        [(value)]="lists"
        [itemKey]="key"
        [itemTemplate]="tpl"
        sourceHeader="المتاح"
        targetHeader="مُفعّل"
        [messages]="messages"
      />
      <ng-template #tpl let-item>{{ item }}</ng-template>
    </div>
  `,
})
class PlI18nHost {
  readonly lists = signal<PickListValue<string>>({
    source: ["Traffic", "Revenue", "Active sessions", "Team activity", "Uptime"],
    target: ["Overview"],
  });
  readonly key = (w: string) => w;
  readonly messages: Partial<PickListMessages> = {
    transferGroup: "النقل بين القوائم",
    moveToTarget: "نقل إلى الهدف",
    moveAllToTarget: "نقل الكل إلى الهدف",
    moveToSource: "نقل إلى المصدر",
    moveAllToSource: "نقل الكل إلى المصدر",
    filterPlaceholder: "تصفية",
    transferAnnouncement: (count, list) => `تم نقل ${count} إلى ${list}`,
  };
}

/**
 * Move items between two lists. Select items on either side and transfer them with
 * the middle controls (move / move all, each way); optionally reorder within each
 * list (drag or the side controls). Controlled (`[(value)]`) or uncontrolled,
 * filterable, and responsive — the lists stack on small screens. Reuses
 * `SelectableList` (same body as `OrderList`).
 *
 * ```html
 * <bpdm-pick-list [(value)]="lists" [itemKey]="key" [itemTemplate]="tpl"
 *   sourceHeader="Available" targetHeader="Your dashboard" />
 * <ng-template #tpl let-item>{{ item }}</ng-template>
 * ```
 */
const meta: Meta = {
  title: "Data Display/PickList",
  component: BpdmPickList,
  decorators: [
    moduleMetadata({ imports: [PlStringHost, PlFilterHost, PlTemplateHost, PlI18nHost] }),
    // PickList is fluid; constrain + centre it in the story canvas so the two
    // panes read as a compact, balanced pair.
    (storyFn) => {
      const story = storyFn() as { template?: string; [k: string]: unknown };
      return {
        ...story,
        template: `<div class="mx-auto w-full max-w-4xl">${story.template ?? ""}</div>`,
      };
    },
  ],
  tags: ["autodocs"],
};
export default meta;

export const Basic: Story = {
  render: () => ({ template: `<pl-string />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmPickList, type PickListValue } from '@bpdm/ng';

@Component({
  selector: 'app-pick-basic',
  imports: [BpdmPickList],
  template: \`
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  \`,
})
export class PickBasicComponent {
  readonly lists = signal<PickListValue<string>>({
    source: ['Traffic', 'Revenue', 'Active sessions', 'Team activity', 'Uptime'],
    target: ['Overview'],
  });
  readonly key = (w: string) => w;
}`,
      },
    },
  },
};

export const WithFilter: Story = {
  render: () => ({ template: `<pl-filter />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmPickList, type PickListValue } from '@bpdm/ng';

type Widget = { id: string; name: string; category: string };

@Component({
  selector: 'app-pick-filter',
  imports: [BpdmPickList],
  template: \`
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [filterBy]="filterBy"
      filterPlaceholder="Filter widgets"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-w>
      <div class="flex items-center justify-between gap-3">
        <span>{{ w.name }}</span>
        <span class="text-xs text-muted-foreground">{{ w.category }}</span>
      </div>
    </ng-template>
  \`,
})
export class PickFilterComponent {
  readonly lists = signal<PickListValue<Widget>>({
    source: [
      { id: 'traffic', name: 'Traffic', category: 'Analytics' },
      { id: 'revenue', name: 'Revenue', category: 'Finance' },
      { id: 'sessions', name: 'Active sessions', category: 'Analytics' },
    ],
    target: [{ id: 'overview', name: 'Overview', category: 'Summary' }],
  });
  readonly key = (w: Widget) => w.id;
  readonly filterBy = (w: Widget) => w.name;
}`,
      },
    },
  },
};

export const Template: Story = {
  render: () => ({ template: `<pl-template />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmPickList, type PickListValue } from '@bpdm/ng';

type Widget = { id: string; name: string; category: string; icon: string };

@Component({
  selector: 'app-pick-template',
  imports: [BpdmPickList],
  template: \`
    <bpdm-pick-list [(value)]="lists" [itemKey]="key" [itemTemplate]="tpl" sourceHeader="Available" targetHeader="Your dashboard" />
    <ng-template #tpl let-w>
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 24 24" fill="none" class="size-4 shrink-0 text-muted-foreground">
          <path [attr.d]="w.icon" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="min-w-0 flex-1">
          <p class="truncate font-medium">{{ w.name }}</p>
          <p class="text-xs text-muted-foreground">{{ w.category }}</p>
        </div>
      </div>
    </ng-template>
  \`,
})
export class PickTemplateComponent {
  readonly lists = signal<PickListValue<Widget>>({
    source: [
      { id: 'traffic', name: 'Traffic', category: 'Analytics', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
      { id: 'revenue', name: 'Revenue', category: 'Finance', icon: 'M3 3v18h18M7 16v-5M12 16V8M17 16v-3' },
    ],
    target: [{ id: 'overview', name: 'Overview', category: 'Summary', icon: 'M12 14l4-4M21 12a9 9 0 1 0-18 0' }],
  });
  readonly key = (w: Widget) => w.id;
}`,
      },
    },
  },
};

// transfer-only: hide the reorder controls (and within-list drag)
export const TransferOnly: Story = {
  tags: ["!dev"],
  render: () => ({ template: `<pl-string [reorder]="false" />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmPickList, type PickListValue } from '@bpdm/ng';

@Component({
  selector: 'app-pick-transfer',
  imports: [BpdmPickList],
  template: \`
    <bpdm-pick-list
      [(value)]="lists"
      [itemKey]="key"
      [itemTemplate]="tpl"
      [reorder]="false"
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
    <ng-template #tpl let-item>{{ item }}</ng-template>
  \`,
})
export class PickTransferComponent {
  readonly lists = signal<PickListValue<string>>({
    source: ['Traffic', 'Revenue', 'Active sessions', 'Uptime'],
    target: ['Overview'],
  });
  readonly key = (w: string) => w;
}`,
      },
    },
  },
};

// i18n + RTL: every string overridden via [messages]; dir="rtl" flips the arrows.
export const Internationalized: Story = {
  render: () => ({ template: `<pl-i18n />` }),
  parameters: {
    docs: {
      source: {
        code: `import { Component, signal } from '@angular/core';
import { BpdmPickList, type PickListMessages, type PickListValue } from '@bpdm/ng';

@Component({
  selector: 'app-pick-i18n',
  imports: [BpdmPickList],
  template: \`
    <div dir="rtl">
      <bpdm-pick-list
        [(value)]="lists"
        [itemKey]="key"
        [itemTemplate]="tpl"
        sourceHeader="المتاح"
        targetHeader="مُفعّل"
        [messages]="messages"
      />
      <ng-template #tpl let-item>{{ item }}</ng-template>
    </div>
  \`,
})
export class PickI18nComponent {
  readonly lists = signal<PickListValue<string>>({
    source: ['Traffic', 'Revenue', 'Active sessions', 'Team activity', 'Uptime'],
    target: ['Overview'],
  });
  readonly key = (w: string) => w;
  readonly messages: Partial<PickListMessages> = {
    transferGroup: 'النقل بين القوائم',
    moveToTarget: 'نقل إلى الهدف',
    moveAllToTarget: 'نقل الكل إلى الهدف',
    moveToSource: 'نقل إلى المصدر',
    moveAllToSource: 'نقل الكل إلى المصدر',
    filterPlaceholder: 'تصفية',
    transferAnnouncement: (count, list) => \`تم نقل \${count} إلى \${list}\`,
  };
}`,
      },
    },
  },
};
