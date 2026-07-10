'use client';

import { useState } from 'react';
import { OrderList } from '@bpdm/ui/order-list';
import { Badge } from '@bpdm/ui/badge';

// neutral, dev-relevant data
const STAGES = ['Lint', 'Type-check', 'Unit tests', 'Build', 'Deploy'];

type Task = { id: string; name: string; tag: 'Backend' | 'Design' | 'Docs' | 'Frontend' };
const TASKS: Task[] = [
  { id: 't1', name: 'Auth refactor', tag: 'Backend' },
  { id: 't2', name: 'Dark mode', tag: 'Design' },
  { id: 't3', name: 'API reference', tag: 'Docs' },
  { id: 't4', name: 'Onboarding flow', tag: 'Frontend' },
  { id: 't5', name: 'Rate limiting', tag: 'Backend' },
];

function TaskRow({ t }: { t: Task }) {
  return (
    <div className="flex flex-1 items-center justify-between gap-3">
      <span className="font-medium text-fd-foreground">{t.name}</span>
      <Badge variant="secondary" appearance="soft">
        {t.tag}
      </Badge>
    </div>
  );
}

// ── demos ─────────────────────────────────────────────────────────────────────
export function OrderListUsageDemo() {
  const [items, setItems] = useState(STAGES);
  return (
    <div className="w-full max-w-md">
      <OrderList value={items} onChange={setItems} itemKey={(s) => s} renderItem={(s) => s} header="Pipeline stages" />
    </div>
  );
}

export function OrderListCustomDemo() {
  const [items, setItems] = useState(TASKS);
  return (
    <div className="w-full max-w-md">
      <OrderList value={items} onChange={setItems} itemKey={(t) => t.id} renderItem={(t) => <TaskRow t={t} />} header="Backlog" />
    </div>
  );
}

export function OrderListFilterDemo() {
  const [items, setItems] = useState(TASKS);
  return (
    <div className="w-full max-w-md">
      <OrderList
        value={items}
        onChange={setItems}
        itemKey={(t) => t.id}
        renderItem={(t) => <TaskRow t={t} />}
        filterBy={(t) => t.name}
        filterPlaceholder="Filter tasks…"
      />
    </div>
  );
}

export function OrderListMultipleDemo() {
  const [items, setItems] = useState(STAGES);
  return (
    <div className="w-full max-w-md">
      <OrderList value={items} onChange={setItems} itemKey={(s) => s} renderItem={(s) => s} selectionMode="multiple" header="Select several, move together" />
    </div>
  );
}

export function OrderListControlsDemo() {
  const [items, setItems] = useState(STAGES);
  return (
    <div className="w-full max-w-md">
      <OrderList value={items} onChange={setItems} itemKey={(s) => s} renderItem={(s) => s} dragdrop={false} header="Controls only (no drag)" />
    </div>
  );
}

// German labels + announcements via the `messages` prop
const STUFEN = ['Analyse', 'Erstellung', 'Tests', 'Bereitstellung'];

export function OrderListI18nDemo() {
  const [items, setItems] = useState(STUFEN);
  return (
    <div className="w-full max-w-md">
      <OrderList
        value={items}
        onChange={setItems}
        itemKey={(s) => s}
        renderItem={(s) => s}
        header="Pipeline-Phasen"
        messages={{
          reorderGroup: 'Neu ordnen',
          moveUp: 'Nach oben',
          moveToTop: 'Ganz nach oben',
          moveDown: 'Nach unten',
          moveToBottom: 'Ganz nach unten',
          movedUp: 'Nach oben verschoben',
          movedToTop: 'Ganz nach oben verschoben',
          movedDown: 'Nach unten verschoben',
          movedToBottom: 'Ganz nach unten verschoben',
          empty: 'Keine Einträge',
          listLabel: 'Sortierbare Liste',
        }}
      />
    </div>
  );
}
