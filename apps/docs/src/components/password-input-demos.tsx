'use client';

import type { ReactNode } from 'react';
import { PasswordInput } from '@bpdm/ui/password-input';

/** Password inputs are block-level, so demos sit in a centered fixed-width column. */
function Frame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-72">{children}</div>;
}

export function PasswordInputUsageDemo() {
  return (
    <Frame>
      <PasswordInput placeholder="Password" />
    </Frame>
  );
}

export function PasswordInputStrengthDemo() {
  return (
    <Frame>
      <PasswordInput placeholder="Create a password" defaultValue="abc" />
    </Frame>
  );
}

export function PasswordInputLevelsDemo() {
  return (
    <div className="mx-auto flex w-72 flex-col gap-6">
      <PasswordInput levels={3} defaultValue="abcdef" placeholder="3 levels" />
      <PasswordInput levels={5} defaultValue="Abc123!x" placeholder="5 levels" />
      <PasswordInput
        levels={3}
        labels={['Low', 'Mid', 'High']}
        defaultValue="Abcd1234!"
        placeholder="custom labels"
      />
    </div>
  );
}

export function PasswordInputNoFeedbackDemo() {
  return (
    <Frame>
      <PasswordInput feedback={false} placeholder="Password" />
    </Frame>
  );
}

export function PasswordInputSizesDemo() {
  return (
    <div className="mx-auto flex w-72 flex-col gap-3">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <PasswordInput key={s} size={s} feedback={false} placeholder={`Size ${s}`} />
      ))}
    </div>
  );
}

export function PasswordInputStatesDemo() {
  return (
    <div className="mx-auto flex w-72 flex-col gap-4">
      <PasswordInput disabled feedback={false} defaultValue="hunter2" placeholder="Disabled" />
      <div className="flex flex-col gap-1.5">
        <PasswordInput aria-invalid aria-describedby="pw-err" feedback={false} placeholder="Password" />
        <p id="pw-err" className="text-sm text-fd-destructive">
          Password is required.
        </p>
      </div>
    </div>
  );
}
