import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { Calendar, DatePicker, defaultRangePresets, type DateRange } from "./calendar";

const usage = `
Date and range picker built on native dates (no date library). \`DatePicker\` shows a
trigger that opens a \`Calendar\` in a popover; \`Calendar\` can also be used inline.
Single date or a range, month/year navigation, \`min\`/\`max\` + per-day \`disabled\`,
today + selection highlights, and full keyboard support (arrows move, Enter selects,
PageUp/PageDown change month).

\`\`\`tsx
import { useState } from "react";
import { DatePicker } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker value={date} onChange={(v) => setDate(v as Date | null)} />;
}
\`\`\`

**Range presets are just data** — \`defaultRangePresets\` is an array of
\`{ label, range: () => DateRange }\`, so customize it with plain JS:

\`\`\`tsx
import { defaultRangePresets } from "@bpdm/ui";

// delete one
const a = defaultRangePresets.filter((p) => p.label !== "Previous year");
// rename / change a range
const b = defaultRangePresets.map((p) => (p.label === "This year" ? { ...p, label: "YTD" } : p));
// add your own (range is computed on click, so it stays "today"-relative)
const c = [{ label: "Today", range: () => { const t = new Date(); return { from: t, to: t }; } }, ...defaultRangePresets];

<DatePicker mode="range" presets={c} value={range} onChange={setRange} />
\`\`\`
`;

const meta: Meta<typeof DatePicker> = {
  title: "Inputs/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Playground</h2>
          <Primary />
          <Controls />
          <h2>Examples</h2>
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
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
  render: (args) => (
    <div className="w-72">
      <DatePicker {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Playground: Story = {};

// pick a single date
export const SingleDate: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div className="w-72">
        <DatePicker value={date} onChange={(v) => setDate(v as Date | null)} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker value={date} onChange={(v) => setDate(v as Date | null)} />;
}`,
      },
    },
  },
};

// pick a start + end date
export const RangeDate: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange>({ from: null, to: null });
    return (
      <div className="w-80">
        <DatePicker
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateRange)}
          placeholder="Pick a date range"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker, type DateRange } from "@bpdm/ui";

export function Example() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  return (
    <DatePicker
      mode="range"
      value={range}
      onChange={(v) => setRange(v as DateRange)}
      placeholder="Pick a date range"
    />
  );
}`,
      },
    },
  },
};

// range picker with quick presets + month/year dropdowns. Presets are fully
// developer-configurable — here we add a couple of custom ones to the defaults.
const customPresets = [
  {
    label: "Year to date",
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), 0, 1), to: new Date(n.getFullYear(), n.getMonth(), n.getDate()) };
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
  render: () => {
    const [range, setRange] = useState<DateRange>({ from: null, to: null });
    return (
      <div className="w-96">
        <DatePicker
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateRange)}
          presets={customPresets}
          captionLayout="dropdown"
          placeholder="Pick a date range"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker, defaultRangePresets, type DateRange } from "@bpdm/ui";

// presets are just { label, range }, so the developer configures any they want
const presets = [
  {
    label: "Year to date",
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), 0, 1), to: n };
    },
  },
  ...defaultRangePresets, // Last 7 days, Last 30 days, This month, This year, Previous year
];

export function Example() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  return (
    <DatePicker
      mode="range"
      value={range}
      onChange={(v) => setRange(v as DateRange)}
      presets={presets}
      captionLayout="dropdown"  // month + year menus in the header
      placeholder="Pick a date range"
    />
  );
}`,
      },
    },
  },
};

// buffer the selection; commit only on Apply (Cancel/Escape/outside discard the draft)
export const Confirm: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | null>(null);
    return (
      <div className="w-96">
        <DatePicker
          mode="range"
          value={range}
          onChange={(v) => setRange(v as DateRange | null)}
          presets={defaultRangePresets}
          confirm
          placeholder="Pick a date range"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker, defaultRangePresets, type DateRange } from "@bpdm/ui";

export function Example() {
  const [range, setRange] = useState<DateRange | null>(null);
  return (
    <DatePicker
      mode="range"
      value={range}
      onChange={(v) => setRange(v as DateRange | null)}
      presets={defaultRangePresets}
      confirm // buffer the selection; commit only on Apply
      placeholder="Pick a date range"
    />
  );
}`,
      },
    },
  },
};

// only future dates selectable; weekends disabled
export const Constraints: Story = {
  tags: ["!dev"],
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    const today = new Date();
    const inThreeMonths = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    return (
      <div className="w-72">
        <DatePicker
          value={date}
          onChange={(v) => setDate(v as Date | null)}
          min={today}
          max={inThreeMonths}
          disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
          placeholder="Weekday in next 3 months"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();
  const inThreeMonths = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

  return (
    <DatePicker
      value={date}
      onChange={(v) => setDate(v as Date | null)}
      min={today}
      max={inThreeMonths}
      disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
      placeholder="Weekday in next 3 months"
    />
  );
}`,
      },
    },
  },
};

// the calendar on its own, without the popover trigger
export const InlineCalendar: Story = {
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div className="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <Calendar value={date} onChange={(v) => setDate(v as Date | null)} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Calendar } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="w-fit rounded-lg border bg-card shadow-sm">
      <Calendar value={date} onChange={(v) => setDate(v as Date | null)} />
    </div>
  );
}`,
      },
    },
  },
};

// month + year dropdowns in the header — jump to any month/year fast
export const MonthYearDropdown: Story = {
  tags: ["!dev"],
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div className="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <Calendar
          value={date}
          onChange={(v) => setDate(v as Date | null)}
          captionLayout="dropdown"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Calendar } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="w-fit rounded-lg border bg-card shadow-sm">
      <Calendar
        value={date}
        onChange={(v) => setDate(v as Date | null)}
        captionLayout="dropdown"
        // optional: bound the year list
        // fromYear={2015} toYear={2035}
      />
    </div>
  );
}`,
      },
    },
  },
};

// squircle day highlight instead of a circle
export const SquareDays: Story = {
  tags: ["!dev"],
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div className="w-fit rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <Calendar value={date} onChange={(v) => setDate(v as Date | null)} dayShape="square" />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Calendar } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="w-fit rounded-lg border bg-card shadow-sm">
      <Calendar value={date} onChange={(v) => setDate(v as Date | null)} dayShape="square" />
    </div>
  );
}`,
      },
    },
  },
};

// invalid state on the trigger
export const Invalid: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="w-72 space-y-1.5">
      <DatePicker invalid placeholder="Required" />
      <p className="text-xs text-destructive-strong">Please choose a date.</p>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { DatePicker } from "@bpdm/ui";

export function Example() {
  return (
    <div className="space-y-1.5">
      <DatePicker invalid placeholder="Required" />
      <p className="text-xs text-destructive-strong">Please choose a date.</p>
    </div>
  );
}`,
      },
    },
  },
};

// Sunday-first week
export const SundayFirst: Story = {
  tags: ["!dev"],
  render: () => {
    const [date, setDate] = useState<Date | null>(null);
    return (
      <div className="w-72">
        <DatePicker value={date} onChange={(v) => setDate(v as Date | null)} weekStartsOn={0} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { DatePicker } from "@bpdm/ui";

export function Example() {
  const [date, setDate] = useState<Date | null>(null);
  return <DatePicker value={date} onChange={(v) => setDate(v as Date | null)} weekStartsOn={0} />;
}`,
      },
    },
  },
};
