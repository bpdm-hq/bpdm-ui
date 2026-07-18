'use client';

import { useState, type ReactNode } from 'react';
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

// demos
// PickList is fluid — it fills its container. In the docs stage we give it a
// comfortable, centered width so the two panes read as a balanced pair.
function Stage({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl">{children}</div>;
}

export function PickListUsageDemo() {
  const [value, setValue] = useState({ source: FEATURES, target: [] as string[] });
  return (
    <Stage>
      <PickList
        value={value}
        onChange={setValue}
        itemKey={(s) => s}
        renderItem={(s) => s}
        sourceHeader="Available"
        targetHeader="Enabled"
      />
    </Stage>
  );
}

export function PickListCustomDemo() {
  const [value, setValue] = useState({ source: FEATURE_OBJS, target: [] as Feature[] });
  return (
    <Stage>
      <PickList
        value={value}
        onChange={setValue}
        itemKey={(f) => f.id}
        renderItem={(f) => <FeatureRow f={f} />}
        sourceHeader="Available"
        targetHeader="Enabled"
      />
    </Stage>
  );
}

export function PickListFilterDemo() {
  const [value, setValue] = useState({ source: FEATURE_OBJS, target: [] as Feature[] });
  return (
    <Stage>
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
    </Stage>
  );
}

export function PickListTransferDemo() {
  const [value, setValue] = useState({ source: FEATURES, target: [] as string[] });
  return (
    <Stage>
      <PickList
        value={value}
        onChange={setValue}
        itemKey={(s) => s}
        renderItem={(s) => s}
        sourceHeader="Available"
        targetHeader="Enabled"
        reorder={false}
      />
    </Stage>
  );
}

export function PickListLockedDemo() {
  const [value, setValue] = useState({ source: ['Billing', 'Webhooks', 'SSO'], target: ['Analytics'] });
  return (
    <Stage>
      <PickList
        value={value}
        onChange={setValue}
        itemKey={(s) => s}
        renderItem={(s) => s}
        sourceHeader="Available"
        targetHeader="Enabled"
        isItemDisabled={(s) => s === 'Analytics'}
      />
    </Stage>
  );
}

// German labels + RTL container: every string comes from `messages`, and the
// transfer arrows flip so "toward target" still points at the target pane.
export function PickListI18nDemo() {
  const [value, setValue] = useState({ source: FEATURES, target: [] as string[] });
  return (
    <Stage>
      <PickList
        value={value}
        onChange={setValue}
        itemKey={(s) => s}
        renderItem={(s) => s}
        sourceHeader="Verfügbar"
        targetHeader="Aktiviert"
        messages={{
          transferGroup: 'Zwischen Listen verschieben',
          moveToTarget: 'Zum Ziel verschieben',
          moveAllToTarget: 'Alle zum Ziel verschieben',
          moveToSource: 'Zur Quelle verschieben',
          moveAllToSource: 'Alle zur Quelle verschieben',
          targetEmpty: 'Noch nichts hier',
          filterPlaceholder: 'Filtern',
          transferAnnouncement: (count, list) => `${count} nach ${list} verschoben`,
        }}
      />
    </Stage>
  );
}
