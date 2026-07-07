'use client';

import type { ReactNode } from 'react';
import { Calendar, DatePicker, defaultRangePresets } from '@bpdm/ui/calendar';

// Fixed sample month so the rendered grid is deterministic (no hydration drift).
const SAMPLE = new Date(2026, 5, 15); // 15 Jun 2026
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

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
      <DatePicker mode="range" presets={defaultRangePresets} placeholder="Pick a range" />
    </Field>
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
        defaultValue={SAMPLE}
        min={new Date(2026, 5, 1)}
        max={new Date(2026, 5, 30)}
        disabled={isWeekend}
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
