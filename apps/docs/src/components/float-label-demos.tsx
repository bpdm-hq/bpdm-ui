'use client';

import type { ReactNode } from 'react';
import { FloatLabel } from '@bpdm/ui/float-label';
import { Input } from '@bpdm/ui/input';

/** Floating labels need vertical breathing room, so demos stack in a spaced column. */
function Col({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-72 flex-col gap-6">{children}</div>;
}

export function FloatLabelUsageDemo() {
  return (
    <div className="mx-auto w-72">
      <FloatLabel label="Email" variant="over" htmlFor="fl-usage">
        <Input id="fl-usage" />
      </FloatLabel>
    </div>
  );
}

export function FloatLabelVariantsDemo() {
  return (
    <Col>
      <FloatLabel label="Over (default)" variant="over" htmlFor="fl-over">
        <Input id="fl-over" />
      </FloatLabel>
      <FloatLabel label="In" variant="in" htmlFor="fl-in">
        <Input id="fl-in" />
      </FloatLabel>
      <FloatLabel label="On the border" variant="on" htmlFor="fl-on">
        <Input id="fl-on" />
      </FloatLabel>
    </Col>
  );
}

export function FloatLabelStatesDemo() {
  return (
    <Col>
      <FloatLabel label="Email" variant="on" htmlFor="fl-dis">
        <Input id="fl-dis" disabled defaultValue="jane@company.com" />
      </FloatLabel>
      <div className="flex flex-col gap-1.5">
        <FloatLabel label="Email" variant="on" htmlFor="fl-inv">
          <Input id="fl-inv" aria-invalid aria-describedby="fl-err" />
        </FloatLabel>
        <p id="fl-err" className="text-sm text-fd-destructive">
          Enter a valid email.
        </p>
      </div>
    </Col>
  );
}
