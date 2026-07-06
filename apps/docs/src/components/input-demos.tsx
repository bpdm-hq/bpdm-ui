'use client';

import type { ReactNode } from 'react';
import { Calendar, Lock, Mail, Search } from 'lucide-react';
import { Input } from '@bpdm/ui/input';

/** Inputs are full-width, so demos stack them in a centered, constrained column. */
function Stack({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-sm flex-col gap-3">{children}</div>;
}

export function InputBasicDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Input placeholder="you@company.com" />
    </div>
  );
}

export function InputVariantsDemo() {
  return (
    <Stack>
      <Input variant="outline" placeholder="Outline (default)" />
      <Input variant="underline" placeholder="Underline" />
    </Stack>
  );
}

export function InputSizesDemo() {
  return (
    <Stack>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </Stack>
  );
}

export function InputStatesDemo() {
  return (
    <Stack>
      <Input placeholder="Default" />
      <Input defaultValue="With a value" />
      <Input aria-invalid defaultValue="Invalid value" />
      <Input disabled placeholder="Disabled" />
    </Stack>
  );
}

export function InputIconsDemo() {
  return (
    <Stack>
      <Input placeholder="Search" startIcon={<Search />} />
      <Input placeholder="Pick a date" endIcon={<Calendar />} />
      <Input type="email" placeholder="Email" startIcon={<Mail />} />
      <Input type="password" placeholder="Password" startIcon={<Lock />} />
    </Stack>
  );
}

export function InputTypesDemo() {
  return (
    <Stack>
      <Input type="email" placeholder="email@company.com" />
      <Input type="password" placeholder="••••••••" />
      <Input type="number" placeholder="0" />
      <Input type="file" />
    </Stack>
  );
}

export function InputFormFieldDemo() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-1.5">
      <label htmlFor="demo-email" className="text-sm font-medium text-fd-foreground">
        Email
      </label>
      <Input id="demo-email" type="email" placeholder="you@company.com" startIcon={<Mail />} />
      <p className="text-xs text-fd-muted-foreground">We&apos;ll never share your email.</p>
    </div>
  );
}
