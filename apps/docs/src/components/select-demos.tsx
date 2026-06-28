'use client';

import type { ReactNode } from 'react';
import { Circle, CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import { Select } from '@bpdm/ui/select';

/** A longer list — long enough to scroll. */
const FRAMEWORKS = [
  'React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Preact',
  'Ember', 'Lit', 'Alpine', 'Next.js', 'Remix', 'Astro', 'Nuxt',
].map((label) => ({ value: label.toLowerCase(), label }));

const STATUSES = [
  { value: 'todo', label: 'Todo', icon: <Circle className="size-4 text-muted-foreground" /> },
  { value: 'in-progress', label: 'In progress', icon: <CircleDashed className="size-4 text-primary" /> },
  { value: 'done', label: 'Done', icon: <CircleCheck className="size-4 text-primary" /> },
  { value: 'canceled', label: 'Canceled', icon: <CircleX className="size-4 text-destructive" /> },
];

const CITIES = [
  {
    label: '🇩🇪 Germany',
    options: [
      { value: 'berlin', label: 'Berlin' },
      { value: 'frankfurt', label: 'Frankfurt' },
      { value: 'hamburg', label: 'Hamburg' },
      { value: 'munich', label: 'Munich' },
    ],
  },
  {
    label: '🇺🇸 USA',
    options: [
      { value: 'nyc', label: 'New York' },
      { value: 'la', label: 'Los Angeles' },
      { value: 'chicago', label: 'Chicago' },
    ],
  },
];

/** 10,000 rows — virtualized (only visible rows render), no lag. */
const BIG = Array.from({ length: 10000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i + 1}`,
}));

function Box({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}

export function SelectBasicDemo() {
  return (
    <Box>
      <Select options={FRAMEWORKS} placeholder="Select a framework" />
    </Box>
  );
}

export function SelectSearchableDemo() {
  return (
    <Box>
      <Select searchable options={FRAMEWORKS} placeholder="Search frameworks" />
    </Box>
  );
}

export function SelectWithIconsDemo() {
  return (
    <Box>
      <Select options={STATUSES} placeholder="Set status" />
    </Box>
  );
}

export function SelectGroupsDemo() {
  return (
    <Box>
      <Select options={CITIES} placeholder="Select a city" />
    </Box>
  );
}

export function SelectBigDemo() {
  return (
    <Box>
      <Select options={BIG} placeholder="Scroll 10,000 records" />
    </Box>
  );
}

export function SelectSizesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <Select size="sm" options={FRAMEWORKS} placeholder="Small" />
      <Select size="md" options={FRAMEWORKS} placeholder="Medium" />
      <Select size="lg" options={FRAMEWORKS} placeholder="Large" />
    </div>
  );
}

export function SelectStatesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <Select options={FRAMEWORKS} placeholder="Default" />
      <Select options={FRAMEWORKS} defaultValue="react" />
      <Select options={FRAMEWORKS} aria-invalid placeholder="Required" />
      <Select options={FRAMEWORKS} disabled placeholder="Disabled" />
    </div>
  );
}
