'use client';

import { useState, type ReactNode } from 'react';
import { Calendar, DatePicker, defaultRangePresets } from '@bpdm/ui/calendar';
import { Button } from '@bpdm/ui/button';

// Fixed sample month so the rendered grid is deterministic (no hydration drift).
const SAMPLE = new Date(2026, 5, 15); // 15 Jun 2026
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

// presets are just { label, range() } — the range is computed at click time
const customPresets = [
  {
    label: 'Year to date',
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), 0, 1), to: n };
    },
  },
  {
    label: 'Last quarter',
    range: () => {
      const n = new Date();
      return { from: new Date(n.getFullYear(), n.getMonth() - 3, 1), to: n };
    },
  },
  ...defaultRangePresets,
];

function Center({ children }: { children: ReactNode }) {
  return <div className="flex justify-center">{children}</div>;
}

function Field({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-64">{children}</div>;
}

export function CalendarUsageDemo() {
  return (
    <Field>
      <DatePicker />
    </Field>
  );
}

export function CalendarRangeDemo() {
  return (
    <Field>
      <DatePicker mode="range" placeholder="Pick a date range" />
    </Field>
  );
}

export function CalendarPresetsDemo() {
  return (
    <div className="mx-auto w-96">
      <DatePicker
        mode="range"
        presets={customPresets}
        captionLayout="dropdown"
        placeholder="Pick a date range"
      />
    </div>
  );
}

export function CalendarInlineDemo() {
  return (
    <Center>
      <Calendar defaultValue={SAMPLE} />
    </Center>
  );
}

export function CalendarConstraintsDemo() {
  return (
    <Field>
      <DatePicker
        min={new Date(2026, 5, 1)}
        max={new Date(2026, 7, 31)}
        disabled={isWeekend}
        placeholder="Weekday in next 3 months"
      />
    </Field>
  );
}

export function CalendarCaptionDemo() {
  return (
    <Center>
      <Calendar captionLayout="dropdown" defaultValue={SAMPLE} />
    </Center>
  );
}

export function CalendarSquareDemo() {
  return (
    <Center>
      <Calendar dayShape="square" defaultValue={SAMPLE} />
    </Center>
  );
}

export function CalendarSundayFirstDemo() {
  return (
    <Field>
      <DatePicker weekStartsOn={0} placeholder="Pick a date" />
    </Field>
  );
}

export function CalendarInvalidDemo() {
  return (
    <Field>
      <DatePicker invalid placeholder="Required" />
      <p className="mt-1.5 text-sm text-destructive">Please choose a date.</p>
    </Field>
  );
}

export function CalendarConfirmDemo() {
  return (
    <div className="mx-auto w-96">
      <DatePicker
        mode="range"
        presets={customPresets}
        confirm
        placeholder="Pick a date range"
      />
    </div>
  );
}

export function CalendarInlineConfirmDemo() {
  const [committed, setCommitted] = useState<Date | null>(SAMPLE);
  const [draft, setDraft] = useState<Date | null>(SAMPLE);
  return (
    <div className="mx-auto w-fit">
      <Calendar value={draft} onChange={(v) => setDraft(v as Date | null)} />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setDraft(committed)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => setCommitted(draft)}>
          Apply
        </Button>
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Applied: {committed ? committed.toLocaleDateString() : '—'}
      </p>
    </div>
  );
}

export function CalendarShowcaseDemo() {
  return (
    <div className="mx-auto w-96">
      <DatePicker
        mode="range"
        presets={customPresets}
        captionLayout="dropdown"
        weekStartsOn={1}
        dayShape="square"
        disabled={isWeekend}
        placeholder="Book a stay"
      />
    </div>
  );
}
