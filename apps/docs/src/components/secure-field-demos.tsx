'use client';

import type { ReactNode } from 'react';
import { SecureField } from '@bpdm/ui/secure-field';

// Neutral, clearly-not-payment sample secrets (alphanumeric keys / serials).
const LICENSE = 'XJ4K9F2C7A4E1D8B';
const API_KEY = 'prj_live_9f2c7a4e1d8b3a6f';
const SERIAL = 'SN8842019930AB45';

function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-80">{children}</div>;
}

export function SecureFieldUsageDemo() {
  return (
    <Frame>
      <SecureField format="grouped" unmaskedTail={4} defaultValue={LICENSE} placeholder="License key" />
    </Frame>
  );
}

export function SecureFieldRevealCopyDemo() {
  return (
    <Frame>
      <SecureField copyable defaultValue={API_KEY} placeholder="API key" />
    </Frame>
  );
}

export function SecureFieldFormatDemo() {
  return (
    <div className="mx-auto flex w-80 flex-col gap-4">
      <SecureField format="grouped" unmaskedTail={4} defaultValue={LICENSE} placeholder="Grouped, last 4 shown" />
      <SecureField unmaskedTail={4} copyable defaultValue={SERIAL} placeholder="Serial, last 4 shown" />
      <SecureField format="none" defaultValue={API_KEY} placeholder="Fully masked" />
    </div>
  );
}

export function SecureFieldSizesDemo() {
  return (
    <div className="mx-auto flex w-80 flex-col gap-3">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <SecureField key={s} size={s} format="grouped" unmaskedTail={4} defaultValue={LICENSE} />
      ))}
    </div>
  );
}

export function SecureFieldStatesDemo() {
  return (
    <div className="mx-auto flex w-80 flex-col gap-4">
      <SecureField disabled defaultValue={LICENSE} placeholder="Disabled" />
      <div className="flex flex-col gap-1.5">
        <SecureField aria-invalid aria-describedby="sf-err" format="grouped" unmaskedTail={4} defaultValue="XJ4K" />
        <p id="sf-err" className="text-sm text-fd-destructive">
          That key looks too short.
        </p>
      </div>
    </div>
  );
}
