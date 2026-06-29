'use client';

import { Bell } from 'lucide-react';
import { Tooltip } from '@bpdm/ui/tooltip';
import { Button } from '@bpdm/ui/button';

type Side = 'top' | 'right' | 'bottom' | 'left';

export function TooltipBasicDemo() {
  return (
    <Tooltip content="Copy address">
      <Button variant="secondary" appearance="outline">
        Copy
      </Button>
    </Tooltip>
  );
}

export function TooltipSidesDemo() {
  const sides: Side[] = ['top', 'right', 'bottom', 'left'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map((side) => (
        <Tooltip key={side} side={side} content={`On the ${side}`}>
          <Button variant="secondary" appearance="outline" className="capitalize">
            {side}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}

export function TooltipIconDemo() {
  return (
    <Tooltip content="Notifications">
      <Button size="icon" variant="secondary" appearance="ghost" aria-label="Notifications">
        <Bell />
      </Button>
    </Tooltip>
  );
}

export function TooltipRichDemo() {
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <p className="font-medium">Keyboard shortcut</p>
          <p className="text-background/70">Press ⌘K to open search.</p>
        </div>
      }
    >
      <Button variant="secondary" appearance="outline">
        Rich content
      </Button>
    </Tooltip>
  );
}

export function TooltipDisabledTriggerDemo() {
  return (
    <Tooltip content="You need the Admin role to publish">
      <Button disabled>Publish</Button>
    </Tooltip>
  );
}
