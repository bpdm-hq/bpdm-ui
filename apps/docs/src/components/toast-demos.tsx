'use client';

import type { ReactNode } from 'react';
import { toast } from '@bpdm/ui/toast';
import { Button } from '@bpdm/ui/button';

/* The docs layout already mounts a single global <Toaster position="top-right" />
   (see copy-toast.tsx). `toast()` writes to a global store, so these demos just
   fire toasts — no second Toaster (a competing one would double-render every
   toast, including the copy-to-clipboard feedback). */

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>;
}

export function ToastBasicDemo() {
  return (
    <Button
      variant="secondary"
      appearance="outline"
      onClick={() => toast('Workspace settings updated')}
    >
      Show toast
    </Button>
  );
}

export function ToastVariantsDemo() {
  return (
    <Row>
      <Button variant="secondary" appearance="outline" onClick={() => toast('Workspace updated')}>
        Default
      </Button>
      <Button variant="secondary" appearance="outline" onClick={() => toast.success('Invite sent')}>
        Success
      </Button>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={() => toast.error('Couldn’t save changes')}
      >
        Error
      </Button>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={() => toast.warning('Storage almost full')}
      >
        Warning
      </Button>
      <Button variant="secondary" appearance="outline" onClick={() => toast.info('Sync finished')}>
        Info
      </Button>
    </Row>
  );
}

export function ToastDescriptionDemo() {
  return (
    <Button
      variant="secondary"
      appearance="outline"
      onClick={() =>
        toast.success('Deployment complete', {
          description: 'Build #482 is live in production.',
        })
      }
    >
      Show with description
    </Button>
  );
}

export function ToastActionDemo() {
  return (
    <Button
      variant="secondary"
      appearance="outline"
      onClick={() =>
        toast('Member removed', {
          description: 'Jonas Weber no longer has access.',
          action: { label: 'Undo', onClick: () => toast.success('Restored Jonas’s access') },
        })
      }
    >
      Remove member
    </Button>
  );
}

export function ToastPromiseDemo() {
  const deploy = () => new Promise<void>((resolve) => setTimeout(resolve, 1800));
  return (
    <Button
      variant="secondary"
      appearance="outline"
      onClick={() =>
        toast.promise(deploy(), {
          loading: 'Deploying…',
          success: 'Deployment complete',
          error: 'Deploy failed',
        })
      }
    >
      Deploy
    </Button>
  );
}

export function ToastDurationDemo() {
  return (
    <Row>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={() => toast('Saved', { duration: 1500 })}
      >
        Short (1.5s)
      </Button>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={() =>
          toast.info('Heads up', {
            description: 'This stays until you dismiss it.',
            duration: Infinity,
          })
        }
      >
        Persistent
      </Button>
    </Row>
  );
}

export function ToastDismissDemo() {
  return (
    <Row>
      <Button
        variant="secondary"
        appearance="outline"
        onClick={() => {
          toast.info('First notification');
          toast.success('Second notification');
        }}
      >
        Show two
      </Button>
      <Button variant="secondary" appearance="ghost" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
    </Row>
  );
}
