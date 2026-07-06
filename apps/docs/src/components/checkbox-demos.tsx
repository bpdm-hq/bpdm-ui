'use client';

import { type ReactNode, useState } from 'react';
import { Checkbox } from '@bpdm/ui/checkbox';

/** Centered row for grouping checkboxes. */
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-7">{children}</div>;
}

/** A checkbox with a small caption beneath — clarifies the size/state demos. */
function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      {children}
      <span className="text-xs text-fd-muted-foreground">{label}</span>
    </div>
  );
}

export function CheckboxBasicDemo() {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id="terms" defaultChecked />
      <label htmlFor="terms" className="cursor-pointer text-sm text-fd-foreground">
        Accept terms &amp; conditions
      </label>
    </div>
  );
}

/** Starts indeterminate; clicking transitions it (indeterminate → checked → …)
 *  so the demo cell is interactive like the others, not frozen. */
function IndeterminateCell() {
  const [value, setValue] = useState<boolean | 'indeterminate'>('indeterminate');
  return <Checkbox checked={value} onCheckedChange={setValue} aria-label="Indeterminate" />;
}

export function CheckboxStatesDemo() {
  return (
    <Row>
      <Labeled label="unchecked">
        <Checkbox aria-label="Unchecked" />
      </Labeled>
      <Labeled label="checked">
        <Checkbox defaultChecked aria-label="Checked" />
      </Labeled>
      <Labeled label="indeterminate">
        <IndeterminateCell />
      </Labeled>
      <Labeled label="disabled">
        <Checkbox disabled aria-label="Disabled" />
      </Labeled>
      <Labeled label="disabled on">
        <Checkbox disabled defaultChecked aria-label="Disabled checked" />
      </Labeled>
    </Row>
  );
}

export function CheckboxSizesDemo() {
  return (
    <Row>
      <Labeled label="sm">
        <Checkbox size="sm" defaultChecked aria-label="Small" />
      </Labeled>
      <Labeled label="md">
        <Checkbox size="md" defaultChecked aria-label="Medium" />
      </Labeled>
      <Labeled label="lg">
        <Checkbox size="lg" defaultChecked aria-label="Large" />
      </Labeled>
    </Row>
  );
}

export function CheckboxInvalidDemo() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2.5">
        <Checkbox id="agree" aria-invalid aria-describedby="agree-err" />
        <label htmlFor="agree" className="cursor-pointer text-sm text-fd-foreground">
          I agree to the terms
        </label>
      </div>
      <p id="agree-err" className="text-xs text-fd-destructive">
        You must accept before continuing.
      </p>
    </div>
  );
}

const PREFS = [
  { id: 'g-email', label: 'Email notifications', checked: true },
  { id: 'g-sms', label: 'SMS notifications', checked: false },
  { id: 'g-push', label: 'Push notifications', checked: true },
];

export function CheckboxGroupDemo() {
  return (
    <div className="flex flex-col gap-3">
      {PREFS.map((o) => (
        <div key={o.id} className="flex items-center gap-2.5">
          <Checkbox id={o.id} defaultChecked={o.checked} />
          <label htmlFor={o.id} className="cursor-pointer text-sm text-fd-foreground">
            {o.label}
          </label>
        </div>
      ))}
    </div>
  );
}

const TOPPINGS = ['Cheese', 'Mushrooms', 'Olives'];

export function CheckboxSelectAllDemo() {
  const [checked, setChecked] = useState([true, false, false]);
  const all = checked.every(Boolean);
  const some = checked.some(Boolean);
  const parent: boolean | 'indeterminate' = all ? true : some ? 'indeterminate' : false;

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <div className="flex items-center gap-2.5 border-b border-fd-border pb-3">
        <Checkbox
          id="all"
          checked={parent}
          onCheckedChange={(v) => setChecked(TOPPINGS.map(() => v === true))}
        />
        <label htmlFor="all" className="cursor-pointer text-sm font-medium text-fd-foreground">
          Select all
        </label>
      </div>
      {TOPPINGS.map((t, i) => (
        <div key={t} className="flex items-center gap-2.5 ps-1">
          <Checkbox
            id={`t-${i}`}
            checked={checked[i]}
            onCheckedChange={(v) =>
              setChecked((prev) => prev.map((c, j) => (j === i ? v === true : c)))
            }
          />
          <label htmlFor={`t-${i}`} className="cursor-pointer text-sm text-fd-foreground">
            {t}
          </label>
        </div>
      ))}
    </div>
  );
}
