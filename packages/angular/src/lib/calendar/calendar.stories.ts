import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { BpdmDatePicker } from "./date-picker";
import { BpdmCalendar } from "./calendar";
import { defaultRangePresets, type DateRangePreset } from "./date-utils";

/**
 * Date and range picker built on native dates (no date library). `<bpdm-date-picker>`
 * shows a trigger that opens a `<bpdm-calendar>` in a popover; `<bpdm-calendar>` can
 * also be used inline. Single date or a range, month/year navigation, `min`/`max` +
 * per-day `disabled`, today + selection highlights, and full keyboard support
 * (arrows move, Enter selects, PageUp/PageDown change month).
 *
 * ```html
 * <bpdm-date-picker [(value)]="date" />
 * ```
 *
 * **Range presets are just data** — `defaultRangePresets` is an array of
 * `{ label, range: () => DateRange }`, so customize it with plain JS:
 *
 * ```ts
 * import { defaultRangePresets } from "@bpdm/ng";
 *
 * // delete one
 * const a = defaultRangePresets.filter((p) => p.label !== "Previous year");
 * // add your own (range is computed on click, so it stays "today"-relative)
 * const c = [{ label: "Today", range: () => { const t = new Date(); return { from: t, to: t }; } }, ...defaultRangePresets];
 * ```
 */
const meta: Meta<BpdmDatePicker> = {
  title: "Inputs/DatePicker",
  component: BpdmDatePicker,
  decorators: [moduleMetadata({ imports: [BpdmDatePicker, BpdmCalendar] })],
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"] },
    dayShape: { control: "inline-radio", options: ["circle", "square"] },
    captionLayout: { control: "inline-radio", options: ["buttons", "dropdown"] },
    weekStartsOn: { control: "inline-radio", options: [0, 1] },
    clearable: { control: "boolean" },
    invalid: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: { mode: "single", weekStartsOn: 1, clearable: true },
  render: (args) => ({
    props: args,
    template: `<div class="w-72">
  <bpdm-date-picker
    [mode]="mode"
    [weekStartsOn]="weekStartsOn"
    [dayShape]="dayShape"
    [captionLayout]="captionLayout"
    [clearable]="clearable"
    [invalid]="invalid"
    [placeholder]="placeholder"
  />
</div>`,
  }),
};
export default meta;

type Story = StoryObj<BpdmDatePicker>;

export const Playground: Story = {};

// pick a single date
export const SingleDate: Story = {
  render: () => ({
    template: `<div class="w-72">
  <bpdm-date-picker [(value)]="date" />
</div>`,
    props: { date: null },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker } from '@bpdm/ng';

@Component({
  selector: 'app-date-single',
  imports: [BpdmDatePicker],
  template: \`<bpdm-date-picker [(value)]="date" />\`,
})
export class DateSingleComponent {
  date: Date | null = null;
}`,
      },
    },
  },
};

// pick a start + end date
export const RangeDate: Story = {
  render: () => ({
    template: `<div class="w-80">
  <bpdm-date-picker mode="range" [(value)]="range" placeholder="Pick a date range" />
</div>`,
    props: { range: { from: null, to: null } },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker, type DateRange } from '@bpdm/ng';

@Component({
  selector: 'app-date-range',
  imports: [BpdmDatePicker],
  template: \`
    <bpdm-date-picker
      mode="range"
      [(value)]="range"
      placeholder="Pick a date range"
    />
  \`,
})
export class DateRangeComponent {
  range: DateRange = { from: null, to: null };
}`,
      },
    },
  },
};

// range picker with quick presets + month/year dropdowns. Presets are fully
// developer-configurable — here we add a couple of custom ones to the defaults.
const customPresets: DateRangePreset[] = [
  {
    label: "Year to date",
    range: () => {
      const n = new Date();
      return {
        from: new Date(n.getFullYear(), 0, 1),
        to: new Date(n.getFullYear(), n.getMonth(), n.getDate()),
      };
    },
  },
  {
    label: "Last quarter",
    range: () => {
      const n = new Date();
      const q = Math.floor(n.getMonth() / 3);
      const startMonth = (q - 1) * 3;
      const y = startMonth < 0 ? n.getFullYear() - 1 : n.getFullYear();
      const m = ((startMonth % 12) + 12) % 12;
      return { from: new Date(y, m, 1), to: new Date(y, m + 3, 0) };
    },
  },
  ...defaultRangePresets,
];

export const RangeWithPresets: Story = {
  render: () => ({
    template: `<div class="w-96">
  <bpdm-date-picker
    mode="range"
    [(value)]="range"
    [presets]="presets"
    captionLayout="dropdown"
    placeholder="Pick a date range"
  />
</div>`,
    props: { range: { from: null, to: null }, presets: customPresets },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker, defaultRangePresets, type DateRange, type DateRangePreset } from '@bpdm/ng';

// presets are just { label, range }, so the developer configures any they want
const presets: DateRangePreset[] = [
  {
    label: 'Year to date',
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), 0, 1), to: n };
    },
  },
  ...defaultRangePresets, // Last 7 days, Last 30 days, This month, This year, Previous year
];

@Component({
  selector: 'app-date-presets',
  imports: [BpdmDatePicker],
  template: \`
    <bpdm-date-picker
      mode="range"
      [(value)]="range"
      [presets]="presets"
      captionLayout="dropdown"
      placeholder="Pick a date range"
    />
  \`,
})
export class DatePresetsComponent {
  presets = presets;
  range: DateRange = { from: null, to: null };
}`,
      },
    },
  },
};

// buffer the selection; commit only on Apply (Cancel/Escape/outside discard the draft)
export const Confirm: Story = {
  render: () => ({
    template: `<div class="w-96">
  <bpdm-date-picker
    mode="range"
    [(value)]="range"
    [presets]="presets"
    confirm
    placeholder="Pick a date range"
  />
</div>`,
    props: { range: { from: null, to: null }, presets: defaultRangePresets },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker, defaultRangePresets, type DateRange, type DateRangePreset } from '@bpdm/ng';

@Component({
  selector: 'app-date-confirm',
  imports: [BpdmDatePicker],
  template: \`
    <bpdm-date-picker
      mode="range"
      [(value)]="range"
      [presets]="presets"
      confirm
      placeholder="Pick a date range"
    />
  \`,
})
export class DateConfirmComponent {
  presets: DateRangePreset[] = defaultRangePresets;
  range: DateRange = { from: null, to: null };
}`,
      },
    },
  },
};

// only future dates selectable; weekends disabled
export const Constraints: Story = {
  tags: ["!dev"],
  render: () => {
    const today = new Date();
    const inThreeMonths = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    return {
      template: `<div class="w-72">
  <bpdm-date-picker
    [(value)]="date"
    [min]="min"
    [max]="max"
    [disabled]="isWeekend"
    placeholder="Weekday in next 3 months"
  />
</div>`,
      props: {
        date: null,
        min: today,
        max: inThreeMonths,
        isWeekend: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
      },
    };
  },
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker } from '@bpdm/ng';

@Component({
  selector: 'app-date-constraints',
  imports: [BpdmDatePicker],
  template: \`
    <bpdm-date-picker
      [(value)]="date"
      [min]="today"
      [max]="inThreeMonths"
      [disabled]="isWeekend"
      placeholder="Weekday in next 3 months"
    />
  \`,
})
export class DateConstraintsComponent {
  date: Date | null = null;
  today = new Date();
  inThreeMonths = new Date(this.today.getFullYear(), this.today.getMonth() + 3, this.today.getDate());
  isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
}`,
      },
    },
  },
};

// the calendar on its own, without the popover trigger
export const InlineCalendar: Story = {
  render: () => ({
    template: `<div class="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
  <bpdm-calendar [(value)]="date" />
</div>`,
    props: { date: null },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCalendar } from '@bpdm/ng';

@Component({
  selector: 'app-calendar-inline',
  imports: [BpdmCalendar],
  template: \`
    <div class="w-fit rounded-lg border bg-card shadow-sm">
      <bpdm-calendar [(value)]="date" />
    </div>
  \`,
})
export class CalendarInlineComponent {
  date: Date | null = null;
}`,
      },
    },
  },
};

// month + year dropdowns in the header — jump to any month/year fast
export const MonthYearDropdown: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
  <bpdm-calendar [(value)]="date" captionLayout="dropdown" />
</div>`,
    props: { date: null },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCalendar } from '@bpdm/ng';

@Component({
  selector: 'app-calendar-dropdown',
  imports: [BpdmCalendar],
  template: \`
    <div class="w-fit rounded-lg border bg-card shadow-sm">
      <bpdm-calendar
        [(value)]="date"
        captionLayout="dropdown"
      />
      <!-- optional: bound the year list with [fromYear]="2015" [toYear]="2035" -->
    </div>
  \`,
})
export class CalendarDropdownComponent {
  date: Date | null = null;
}`,
      },
    },
  },
};

// rounded-corner square day highlight instead of a circle
export const SquareDays: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
  <bpdm-calendar [(value)]="date" dayShape="square" />
</div>`,
    props: { date: null },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmCalendar } from '@bpdm/ng';

@Component({
  selector: 'app-calendar-square',
  imports: [BpdmCalendar],
  template: \`
    <div class="w-fit rounded-lg border bg-card shadow-sm">
      <bpdm-calendar [(value)]="date" dayShape="square" />
    </div>
  \`,
})
export class CalendarSquareComponent {
  date: Date | null = null;
}`,
      },
    },
  },
};

// invalid state on the trigger
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-72 space-y-1.5">
  <bpdm-date-picker invalid placeholder="Required" />
  <p class="text-xs text-destructive-strong">Please choose a date.</p>
</div>`,
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker } from '@bpdm/ng';

@Component({
  selector: 'app-date-invalid',
  imports: [BpdmDatePicker],
  template: \`
    <div class="space-y-1.5">
      <bpdm-date-picker invalid placeholder="Required" />
      <p class="text-xs text-destructive-strong">Please choose a date.</p>
    </div>
  \`,
})
export class DateInvalidComponent {}`,
      },
    },
  },
};

// Sunday-first week
export const SundayFirst: Story = {
  tags: ["!dev"],
  render: () => ({
    template: `<div class="w-72">
  <bpdm-date-picker [(value)]="date" [weekStartsOn]="0" />
</div>`,
    props: { date: null },
  }),
  parameters: {
    docs: {
      source: {
        code: `import { Component } from '@angular/core';
import { BpdmDatePicker } from '@bpdm/ng';

@Component({
  selector: 'app-date-sunday',
  imports: [BpdmDatePicker],
  template: \`<bpdm-date-picker [(value)]="date" [weekStartsOn]="0" />\`,
})
export class DateSundayComponent {
  date: Date | null = null;
}`,
      },
    },
  },
};
