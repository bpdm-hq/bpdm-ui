'use client';

import type { ReactNode } from 'react';
import { MultiSelect } from '@bpdm/ui/multi-select';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
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

/** 10,000 options — virtualized, no lag. */
const BIG = Array.from({ length: 10000 }, (_, i) => ({
  value: `item-${i}`,
  label: `Item ${i + 1}`,
}));

function Box({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}

export function MultiSelectBasicDemo() {
  return (
    <Box>
      <MultiSelect options={FRAMEWORKS} defaultValue={['react', 'vue']} placeholder="Select frameworks" />
    </Box>
  );
}

export function MultiSelectOverflowDemo() {
  return (
    <Box>
      <MultiSelect
        options={FRAMEWORKS}
        maxDisplay={2}
        defaultValue={['react', 'vue', 'svelte', 'solid']}
        placeholder="Select frameworks"
      />
    </Box>
  );
}

export function MultiSelectBigDemo() {
  return (
    <Box>
      <MultiSelect searchable maxDisplay={3} options={BIG} placeholder="Pick records" />
    </Box>
  );
}

export function MultiSelectCountDemo() {
  return (
    <Box>
      <MultiSelect
        options={FRAMEWORKS}
        defaultValue={['react', 'angular', 'vue', 'svelte']}
        maxDisplay={0}
        placeholder="Select frameworks"
      />
    </Box>
  );
}

export function MultiSelectGroupedDemo() {
  return (
    <Box>
      <MultiSelect options={CITIES} searchable placeholder="Select cities" />
    </Box>
  );
}

export function MultiSelectStatesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <MultiSelect options={FRAMEWORKS} placeholder="Default" />
      <MultiSelect options={FRAMEWORKS} aria-invalid placeholder="Invalid" />
      <MultiSelect options={FRAMEWORKS} disabled placeholder="Disabled" />
    </div>
  );
}
