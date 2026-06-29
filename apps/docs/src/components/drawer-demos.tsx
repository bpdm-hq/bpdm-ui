'use client';

import { useState } from 'react';
import { Drawer, DrawerClose } from '@bpdm/ui/drawer';
import { Button } from '@bpdm/ui/button';
import { Input } from '@bpdm/ui/input';

type Side = 'left' | 'right' | 'top' | 'bottom';
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export function DrawerBasicDemo() {
  return (
    <Drawer
      trigger={<Button>Open drawer</Button>}
      title="Notifications"
      description="Your latest activity."
      footer={
        <DrawerClose asChild>
          <Button>Mark all read</Button>
        </DrawerClose>
      }
    >
      <p className="text-sm text-fd-muted-foreground">A slide-in panel from the right edge.</p>
    </Drawer>
  );
}

export function DrawerSidesDemo() {
  const sides: Side[] = ['left', 'right', 'top', 'bottom'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sides.map((side) => (
        <Drawer
          key={side}
          side={side}
          trigger={
            <Button variant="secondary" appearance="outline" className="capitalize">
              {side}
            </Button>
          }
          title={`${side[0].toUpperCase()}${side.slice(1)} drawer`}
          description="Slides in from this edge."
          footer={
            <DrawerClose asChild>
              <Button>Done</Button>
            </DrawerClose>
          }
        />
      ))}
    </div>
  );
}

export function DrawerSizesDemo() {
  const sizes: Size[] = ['sm', 'md', 'lg', 'xl', 'full'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sizes.map((size) => (
        <Drawer
          key={size}
          size={size}
          trigger={
            <Button variant="secondary" appearance="outline" className="uppercase">
              {size}
            </Button>
          }
          title={`${size.toUpperCase()} drawer`}
          description="Width scales with the size prop."
        />
      ))}
    </div>
  );
}

export function DrawerFormDemo() {
  return (
    <Drawer
      trigger={<Button>Edit profile</Button>}
      title="Edit profile"
      description="Update your details, then save."
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="secondary" appearance="ghost">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Save</Button>
          </DrawerClose>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input placeholder="Display name" aria-label="Display name" defaultValue="Aria Lindqvist" />
        <Input type="email" placeholder="Email" aria-label="Email" defaultValue="aria@company.com" />
      </div>
    </Drawer>
  );
}

export function DrawerControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setOpen(true)}>Open from outside</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Controlled drawer"
        description="Driven by your own state."
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        <p className="text-sm text-fd-muted-foreground">
          Use <code>open</code> + <code>onOpenChange</code> to open it from anywhere.
        </p>
      </Drawer>
    </div>
  );
}
