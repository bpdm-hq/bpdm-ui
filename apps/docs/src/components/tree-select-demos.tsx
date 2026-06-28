'use client';

import type { ReactNode } from 'react';
import { TreeSelect } from '@bpdm/ui/tree-select';

const TREE = [
  {
    value: 'frontend',
    label: 'Frontend',
    children: [
      { value: 'react', label: 'React' },
      { value: 'angular', label: 'Angular' },
      { value: 'vue', label: 'Vue' },
    ],
  },
  {
    value: 'backend',
    label: 'Backend',
    children: [
      { value: 'node', label: 'Node.js' },
      { value: 'go', label: 'Go' },
      { value: 'rust', label: 'Rust' },
    ],
  },
];

function Box({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-sm">{children}</div>;
}

export function TreeSelectBasicDemo() {
  return (
    <Box>
      <TreeSelect options={TREE} defaultValue={['react', 'vue']} placeholder="Select technologies" />
    </Box>
  );
}

export function TreeSelectSearchableDemo() {
  return (
    <Box>
      <TreeSelect options={TREE} searchable placeholder="Search technologies" />
    </Box>
  );
}

export function TreeSelectCountDemo() {
  return (
    <Box>
      <TreeSelect
        options={TREE}
        defaultValue={['react', 'angular', 'vue', 'node']}
        maxDisplay={0}
        placeholder="Select technologies"
      />
    </Box>
  );
}

export function TreeSelectStatesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
      <TreeSelect options={TREE} placeholder="Default" />
      <TreeSelect options={TREE} aria-invalid placeholder="Invalid" />
      <TreeSelect options={TREE} disabled placeholder="Disabled" />
    </div>
  );
}
