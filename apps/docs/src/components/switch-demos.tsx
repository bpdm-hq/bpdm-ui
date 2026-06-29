'use client';

import { type ReactNode, useState } from 'react';
import { Switch } from '@bpdm/ui/switch';

/** Centered row for grouping toggles. */
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-7">{children}</div>;
}

/** A toggle with a small caption beneath — clarifies the size/shape/state demos. */
function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <span className="text-xs text-fd-muted-foreground">{label}</span>
    </div>
  );
}

export function SwitchBasicDemo() {
  return <Switch defaultChecked aria-label="Toggle setting" />;
}

export function SwitchSizesDemo() {
  return (
    <Row>
      <Labeled label="sm">
        <Switch size="sm" defaultChecked aria-label="Small" />
      </Labeled>
      <Labeled label="md">
        <Switch size="md" defaultChecked aria-label="Medium" />
      </Labeled>
      <Labeled label="lg">
        <Switch size="lg" defaultChecked aria-label="Large" />
      </Labeled>
    </Row>
  );
}

export function SwitchShapesDemo() {
  return (
    <Row>
      <Labeled label="pill">
        <Switch shape="pill" defaultChecked aria-label="Pill" />
      </Labeled>
      <Labeled label="square">
        <Switch shape="square" defaultChecked aria-label="Square" />
      </Labeled>
      <Labeled label="sharp">
        <Switch shape="sharp" defaultChecked aria-label="Sharp" />
      </Labeled>
    </Row>
  );
}

export function SwitchIconDemo() {
  return (
    <Row>
      <Labeled label="on">
        <Switch icon defaultChecked aria-label="On" />
      </Labeled>
      <Labeled label="off">
        <Switch icon aria-label="Off" />
      </Labeled>
      <Labeled label="large">
        <Switch icon size="lg" defaultChecked aria-label="Large with icon" />
      </Labeled>
    </Row>
  );
}

export function SwitchStatesDemo() {
  return (
    <Row>
      <Labeled label="off">
        <Switch aria-label="Off" />
      </Labeled>
      <Labeled label="on">
        <Switch defaultChecked aria-label="On" />
      </Labeled>
      <Labeled label="disabled">
        <Switch disabled aria-label="Disabled off" />
      </Labeled>
      <Labeled label="disabled on">
        <Switch disabled defaultChecked aria-label="Disabled on" />
      </Labeled>
    </Row>
  );
}

export function SwitchLabelDemo() {
  return (
    <div className="flex items-center gap-3">
      <Switch id="airplane" defaultChecked />
      <label htmlFor="airplane" className="cursor-pointer text-sm font-medium text-fd-foreground">
        Airplane mode
      </label>
    </div>
  );
}

const SETTINGS = [
  { id: 's-2fa', label: 'Two-factor authentication', on: true },
  { id: 's-email', label: 'Email notifications', on: false },
  { id: 's-beta', label: 'Beta features', on: true },
];

export function SwitchSettingsDemo() {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col divide-y divide-fd-border rounded-lg border border-fd-border">
      {SETTINGS.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <label htmlFor={s.id} className="cursor-pointer text-sm text-fd-foreground">
            {s.label}
          </label>
          <Switch id={s.id} defaultChecked={s.on} />
        </div>
      ))}
    </div>
  );
}

export function SwitchControlledDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3">
      <Switch id="wifi" checked={on} onCheckedChange={setOn} />
      <label htmlFor="wifi" className="text-sm font-medium text-fd-foreground">
        Wi-Fi is {on ? 'on' : 'off'}
      </label>
    </div>
  );
}
