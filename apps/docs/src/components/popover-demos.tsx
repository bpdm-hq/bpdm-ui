'use client';

import { Popover, PopoverClose } from '@bpdm/ui/popover';
import { Button } from '@bpdm/ui/button';
import { Input } from '@bpdm/ui/input';

type Side = 'top' | 'right' | 'bottom' | 'left';

export function PopoverBasicDemo() {
  return (
    <Popover trigger={<Button variant="secondary" appearance="outline">Open popover</Button>}>
      <p className="max-w-xs text-sm text-fd-muted-foreground">
        A floating panel anchored to the trigger — click outside or press Esc to close.
      </p>
    </Popover>
  );
}

export function PopoverPlacementsDemo() {
  const sides: Side[] = ['top', 'right', 'bottom', 'left'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map((side) => (
        <Popover
          key={side}
          side={side}
          trigger={
            <Button variant="secondary" appearance="outline" className="capitalize">
              {side}
            </Button>
          }
        >
          <p className="text-sm text-fd-foreground">
            Opens on the <span className="font-medium">{side}</span>.
          </p>
        </Popover>
      ))}
    </div>
  );
}

export function PopoverBorderlessDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Popover trigger={<Button variant="secondary" appearance="outline">Bordered</Button>}>
        <p className="max-w-xs text-sm text-fd-muted-foreground">Default — a subtle border defines the edge.</p>
      </Popover>
      <Popover bordered={false} trigger={<Button variant="secondary" appearance="outline">Borderless</Button>}>
        <p className="max-w-xs text-sm text-fd-muted-foreground">Borderless — relies on the shadow alone.</p>
      </Popover>
    </div>
  );
}

export function PopoverArrowDemo() {
  return (
    <Popover showArrow trigger={<Button>With arrow</Button>}>
      <p className="max-w-xs text-sm text-fd-muted-foreground">
        A small arrow points back at the trigger.
      </p>
    </Popover>
  );
}

export function PopoverFormDemo() {
  return (
    <Popover width={260} trigger={<Button>Update name</Button>}>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-fd-foreground">Display name</p>
        <Input defaultValue="Aria Lindqvist" aria-label="Display name" />
        <div className="flex justify-end gap-2">
          <PopoverClose asChild>
            <Button variant="secondary" appearance="ghost">
              Cancel
            </Button>
          </PopoverClose>
          <PopoverClose asChild>
            <Button>Save</Button>
          </PopoverClose>
        </div>
      </div>
    </Popover>
  );
}
