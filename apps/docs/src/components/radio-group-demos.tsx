'use client';

import { type ReactNode, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@bpdm/ui/radio-group';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

/** A radio + its linked label. `prefix` keeps ids unique across demos on a page. */
function Option({
  prefix,
  value,
  label,
  size,
  invalid,
}: {
  prefix: string;
  value: string;
  label: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
}) {
  const id = `${prefix}-${value}`;
  return (
    <div className="flex items-center gap-2.5">
      <RadioGroupItem value={value} id={id} size={size} aria-invalid={invalid || undefined} />
      <label htmlFor={id} className="cursor-pointer text-sm text-fd-foreground">
        {label}
      </label>
    </div>
  );
}

export function RadioGroupBasicDemo() {
  return (
    <RadioGroup defaultValue="pro">
      {PLANS.map((p) => (
        <Option key={p.value} prefix="u" value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  );
}

export function RadioGroupHorizontalDemo() {
  return (
    <RadioGroup defaultValue="pro" orientation="horizontal">
      {PLANS.map((p) => (
        <Option key={p.value} prefix="h" value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  );
}

export function RadioGroupSizesDemo() {
  return (
    <RadioGroup defaultValue="md" orientation="horizontal">
      <Option prefix="sz" value="sm" label="Small" size="sm" />
      <Option prefix="sz" value="md" label="Medium" size="md" />
      <Option prefix="sz" value="lg" label="Large" size="lg" />
    </RadioGroup>
  );
}

export function RadioGroupDisabledDemo() {
  return (
    <RadioGroup defaultValue="pro" disabled>
      {PLANS.map((p) => (
        <Option key={p.value} prefix="d" value={p.value} label={p.label} />
      ))}
    </RadioGroup>
  );
}

export function RadioGroupInvalidDemo() {
  return (
    <RadioGroup defaultValue="free">
      {PLANS.map((p) => (
        <Option key={p.value} prefix="inv" value={p.value} label={p.label} invalid />
      ))}
    </RadioGroup>
  );
}

export function RadioGroupControlledDemo() {
  const [value, setValue] = useState('pro');
  return (
    <div className="flex flex-col items-center gap-4">
      <RadioGroup value={value} onValueChange={setValue} orientation="horizontal">
        {PLANS.map((p) => (
          <Option key={p.value} prefix="c" value={p.value} label={p.label} />
        ))}
      </RadioGroup>
      <p className="text-sm text-fd-muted-foreground">
        Selected: <span className="font-medium text-fd-foreground">{value}</span>
      </p>
    </div>
  );
}
