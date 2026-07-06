'use client';

import type { ReactNode } from 'react';
import { MoneyInput } from '@bpdm/ui/money-input';

/** Money inputs are full-width, so demos sit in a centered, constrained column. */
function Stack({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-xs flex-col gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fd-foreground">{label}</span>
      {children}
    </label>
  );
}

export function MoneyInputUsageDemo() {
  return (
    <Stack>
      <MoneyInput currency="USD" locale="en-US" defaultValue="1234.5" />
    </Stack>
  );
}

export function MoneyInputCurrenciesDemo() {
  const rows = [
    { currency: 'USD', locale: 'en-US' },
    { currency: 'EUR', locale: 'de-DE' },
    { currency: 'INR', locale: 'en-IN' },
    { currency: 'JPY', locale: 'ja-JP' },
  ];
  return (
    <Stack>
      {rows.map((r) => (
        <div key={r.currency} className="flex items-center gap-3">
          <span className="w-10 text-sm text-fd-muted-foreground">{r.currency}</span>
          <MoneyInput currency={r.currency} locale={r.locale} defaultValue="100000" />
        </div>
      ))}
    </Stack>
  );
}

export function MoneyInputPrecisionDemo() {
  return (
    <Stack>
      <MoneyInput currency="USD" locale="en-US" defaultValue="123456789012.34" />
    </Stack>
  );
}

export function MoneyInputSizesDemo() {
  return (
    <Stack>
      <MoneyInput size="sm" currency="USD" defaultValue="2500" />
      <MoneyInput size="md" currency="USD" defaultValue="2500" />
      <MoneyInput size="lg" currency="USD" defaultValue="2500" />
    </Stack>
  );
}

export function MoneyInputStatesDemo() {
  return (
    <Stack>
      <Field label="Invalid">
        <MoneyInput aria-invalid currency="USD" defaultValue="0" />
      </Field>
      <Field label="Disabled">
        <MoneyInput disabled currency="USD" defaultValue="2500" />
      </Field>
    </Stack>
  );
}
