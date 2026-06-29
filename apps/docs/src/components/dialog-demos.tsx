'use client';

import { type ReactNode, useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@bpdm/ui/dialog';
import { Button } from '@bpdm/ui/button';
import { Select } from '@bpdm/ui/select';

type Size = 'sm' | 'md' | 'lg' | 'xl';

export function DialogBasicDemo() {
  return (
    <Dialog
      trigger={<Button>Edit profile</Button>}
      title="Edit profile"
      description="Update your details. Changes are saved when you click Save."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="secondary" appearance="ghost">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </>
      }
    >
      <p className="text-sm text-fd-muted-foreground">
        Your profile is visible to everyone in the workspace.
      </p>
    </Dialog>
  );
}

export function DialogSizesDemo() {
  const sizes: Size[] = ['sm', 'md', 'lg', 'xl'];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {sizes.map((size) => (
        <Dialog
          key={size}
          size={size}
          trigger={
            <Button variant="secondary" appearance="outline" className="uppercase">
              {size}
            </Button>
          }
          title={`${size.toUpperCase()} dialog`}
          description="The panel width scales with the size prop."
          footer={
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          }
        />
      ))}
    </div>
  );
}

export function DialogControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setOpen(true)}>Open from outside</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Controlled dialog"
        description="Its open state is driven by your own React state."
        footer={
          <Button onClick={() => setOpen(false)}>Close</Button>
        }
      >
        <p className="text-sm text-fd-muted-foreground">
          Use <code>open</code> + <code>onOpenChange</code> to open it from anywhere.
        </p>
      </Dialog>
    </div>
  );
}

export function DialogScrollableDemo() {
  return (
    <Dialog
      trigger={<Button variant="secondary" appearance="outline">Terms of service</Button>}
      title="Terms of service"
      description="Please review before continuing."
      footer={
        <DialogClose asChild>
          <Button>I agree</Button>
        </DialogClose>
      }
    >
      <div className="space-y-3 text-sm text-fd-muted-foreground">
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            {i + 1}. Long-form content scrolls inside the panel while the header and footer stay
            pinned. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </Dialog>
  );
}

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

export function DialogDropdownDemo() {
  return (
    <Dialog
      trigger={<Button>Choose a plan</Button>}
      title="Choose a plan"
      description="A Select (its own overlay) works correctly inside the dialog."
      footer={
        <DialogClose asChild>
          <Button>Confirm</Button>
        </DialogClose>
      }
    >
      <div className="py-1">
        <Select options={PLANS} defaultValue="pro" aria-label="Plan" />
      </div>
    </Dialog>
  );
}

/** Shows the composable primitives (full control) rather than the convenience API. */
function Panel({ children }: { children: ReactNode }) {
  return <div className="flex justify-center">{children}</div>;
}

export function DialogCompositionDemo() {
  return (
    <Panel>
      <DialogRoot>
        <DialogTrigger asChild>
          <Button variant="secondary" appearance="outline">
            Compose it
          </Button>
        </DialogTrigger>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Invite teammates</DialogTitle>
            <DialogDescription>Build the layout from the primitives.</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-2 text-sm text-fd-muted-foreground">
            Full control over header, body, and footer.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" appearance="ghost">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button>Send invites</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Panel>
  );
}
