'use client';

import type { ReactNode } from 'react';
import { NumberInput } from '@bpdm/ui/number-input';

/** Number inputs are inline, so demos sit in a centered, wrapping row. */
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-4">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col items-center gap-1.5">
      <span className="text-sm font-medium text-fd-foreground">{label}</span>
      {children}
    </label>
  );
}

export function NumberInputUsageDemo() {
  return (
    <div className="flex justify-center">
      <NumberInput defaultValue="9" min="0" />
    </div>
  );
}

export function NumberInputSizesDemo() {
  return (
    <Row>
      <NumberInput size="sm" defaultValue="9" />
      <NumberInput size="md" defaultValue="9" />
      <NumberInput size="lg" defaultValue="9" />
    </Row>
  );
}

export function NumberInputLayoutDemo() {
  return (
    <Row>
      <Field label="Stacked (default)">
        <NumberInput buttonLayout="stacked" defaultValue="9" />
      </Field>
      <Field label="Horizontal">
        <NumberInput buttonLayout="horizontal" defaultValue="9" />
      </Field>
    </Row>
  );
}

export function NumberInputRangeDemo() {
  return (
    <Row>
      <Field label="0–10, step 1">
        <NumberInput min="0" max="10" defaultValue="5" />
      </Field>
      <Field label="step 5">
        <NumberInput step="5" defaultValue="25" />
      </Field>
    </Row>
  );
}

export function NumberInputAffixDemo() {
  return (
    <Row>
      <Field label="Suffix">
        <NumberInput defaultValue="50" suffix="GB" min="0" />
      </Field>
      <Field label="Suffix">
        <NumberInput defaultValue="5" suffix="seats" min="1" />
      </Field>
      <Field label="Prefix">
        <NumberInput defaultValue="2" prefix="×" min="1" buttonLayout="horizontal" />
      </Field>
    </Row>
  );
}

export function NumberInputPrecisionDemo() {
  return (
    <Row>
      <Field label="High-decimal — step 0.0001">
        <NumberInput defaultValue="1.2500" step="0.0001" suffix="kg" />
      </Field>
      <Field label="Beyond MAX_SAFE_INTEGER">
        <NumberInput defaultValue="9007199254740993" />
      </Field>
    </Row>
  );
}

export function NumberInputStatesDemo() {
  return (
    <div className="flex justify-center">
      <NumberInput disabled defaultValue="9" />
    </div>
  );
}
