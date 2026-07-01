'use client';

import { useState } from 'react';
import { PickList } from '@bpdm/ui/pick-list';
import { Badge } from '@bpdm/ui/badge';

// neutral, dev-relevant data
const FEATURES = ['Analytics', 'Billing', 'Webhooks', 'SSO', 'Audit log', 'API keys'];

type Feature = { id: string; name: string; tag: 'Core' | 'Add-on' | 'Beta' };
const FEATURE_OBJS: Feature[] = [
  { id: 'f1', name: 'Analytics', tag: 'Core' },
  { id: 'f2', name: 'Billing', tag: 'Core' },
  { id: 'f3', name: 'Webhooks', tag: 'Add-on' },
  { id: 'f4', name: 'SSO', tag: 'Add-on' },
  { id: 'f5', name: 'Audit log', tag: 'Beta' },
];

function FeatureRow({ f }: { f: Feature }) {
  return (
    <div className="flex flex-1 items-center justify-between gap-3">
      <span className="font-medium text-fd-foreground">{f.name}</span>
      <Badge variant="secondary" appearance="soft">
        {f.tag}
      </Badge>
    </div>
  );
}

// ── demos ─────────────────────────────────────────────────────────────────────
export function PickListUsageDemo() {
  const [value, setValue] = useState({ source: FEATURES, target: [] as string[] });
  return (
    <PickList
      value={value}
      onChange={setValue}
      itemKey={(s) => s}
      renderItem={(s) => s}
      sourceHeader="Available"
      targetHeader="Enabled"
    />
  );
}

export function PickListCustomDemo() {
  const [value, setValue] = useState({ source: FEATURE_OBJS, target: [] as Feature[] });
  return (
    <PickList
      value={value}
      onChange={setValue}
      itemKey={(f) => f.id}
      renderItem={(f) => <FeatureRow f={f} />}
      sourceHeader="Available"
      targetHeader="Enabled"
    />
  );
}

export function PickListFilterDemo() {
  const [value, setValue] = useState({ source: FEATURE_OBJS, target: [] as Feature[] });
  return (
    <PickList
      value={value}
      onChange={setValue}
      itemKey={(f) => f.id}
      renderItem={(f) => <FeatureRow f={f} />}
      sourceHeader="Available"
      targetHeader="Enabled"
      filterBy={(f) => f.name}
      filterPlaceholder="Filter features…"
    />
  );
}

export function PickListTransferDemo() {
  const [value, setValue] = useState({ source: FEATURES, target: [] as string[] });
  return (
    <PickList
      value={value}
      onChange={setValue}
      itemKey={(s) => s}
      renderItem={(s) => s}
      sourceHeader="Available"
      targetHeader="Enabled"
      reorder={false}
    />
  );
}
