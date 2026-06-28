'use client';

import type { ReactNode } from 'react';
import { Select } from '@bpdm/ui/select';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
];

const CITIES = [
  {
    label: 'Europe',
    options: [
      { value: 'lon', label: 'London' },
      { value: 'par', label: 'Paris' },
      { value: 'ber', label: 'Berlin' },
    ],
  },
  {
    label: 'Americas',
    options: [
      { value: 'nyc', label: 'New York' },
      { value: 'sf', label: 'San Francisco' },
      { value: 'tor', label: 'Toronto' },
    ],
  },
];

/** Selects are full-width; show them in a centered, constrained column. */
function Stack({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-sm flex-col gap-3">{children}</div>;
}

export function SelectBasicDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Select options={FRAMEWORKS} placeholder="Select a framework" />
    </div>
  );
}

export function SelectSearchableDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Select searchable options={FRAMEWORKS} placeholder="Search frameworks" />
    </div>
  );
}

export function SelectGroupsDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Select options={CITIES} placeholder="Select a city" />
    </div>
  );
}

export function SelectSizesDemo() {
  return (
    <Stack>
      <Select size="sm" options={FRAMEWORKS} placeholder="Small" />
      <Select size="md" options={FRAMEWORKS} placeholder="Medium" />
      <Select size="lg" options={FRAMEWORKS} placeholder="Large" />
    </Stack>
  );
}

export function SelectStatesDemo() {
  return (
    <Stack>
      <Select options={FRAMEWORKS} placeholder="Default" />
      <Select options={FRAMEWORKS} defaultValue="react" />
      <Select options={FRAMEWORKS} aria-invalid placeholder="Invalid" />
      <Select options={FRAMEWORKS} disabled placeholder="Disabled" />
    </Stack>
  );
}
