'use client';

import { Accordion, type AccordionItemData } from '@bpdm/ui/accordion';
import { Tabs } from '@bpdm/ui/tabs';

// neutral, dev-relevant FAQ content
const FAQ: AccordionItemData[] = [
  {
    value: 'deploys',
    title: 'How are deploys triggered?',
    content: 'Every push to main runs CI; a green build promotes to staging automatically.',
  },
  {
    value: 'rollback',
    title: 'Can I roll back a release?',
    content: 'Yes — pick any previous build in the deploys panel and click Promote.',
  },
  {
    value: 'logs',
    title: 'Where are build logs stored?',
    content: 'Logs are kept for 30 days and are downloadable from each run.',
  },
];

const cls = 'size-4';
const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Rocket = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
  </svg>
);
const Rotate = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const FileText = () => (
  <svg viewBox="0 0 24 24" className={cls} {...s}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v5h5M9 13h6M9 17h6" />
  </svg>
);
const FAQ_ICONS = [<Rocket key="r" />, <Rotate key="o" />, <FileText key="f" />];

// ── demos ─────────────────────────────────────────────────────────────────────
function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-full max-w-lg">{children}</div>;
}

export function AccordionUsageDemo() {
  return (
    <Box>
      <Accordion type="single" collapsible defaultValue="deploys" items={FAQ} />
    </Box>
  );
}

export function AccordionVariantsDemo() {
  const each = (variant: 'default' | 'separated' | 'borderless') => (
    <Accordion type="single" collapsible defaultValue="deploys" variant={variant} items={FAQ} />
  );
  return (
    <Tabs
      className="w-full max-w-lg self-start"
      listClassName="mb-2"
      defaultValue="default"
      items={[
        { value: 'default', label: 'Default', content: each('default') },
        { value: 'separated', label: 'Separated', content: each('separated') },
        { value: 'borderless', label: 'Borderless', content: each('borderless') },
      ]}
    />
  );
}

export function AccordionIconsDemo() {
  const items = FAQ.map((it, i) => ({ ...it, icon: FAQ_ICONS[i] }));
  return (
    <Box>
      <Accordion type="single" collapsible defaultValue="deploys" items={items} />
    </Box>
  );
}

export function AccordionMultipleDemo() {
  return (
    <Box>
      <Accordion type="multiple" defaultValue={['deploys', 'logs']} items={FAQ} />
    </Box>
  );
}

export function AccordionDisabledDemo() {
  const items = FAQ.map((it) => (it.value === 'logs' ? { ...it, disabled: true } : it));
  return (
    <Box>
      <Accordion type="single" collapsible items={items} />
    </Box>
  );
}
