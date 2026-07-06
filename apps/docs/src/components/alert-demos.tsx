'use client';

import { type ReactNode, useState } from 'react';
import { Alert } from '@bpdm/ui/alert';
import { Button } from '@bpdm/ui/button';

/** Alerts are full-width — constrain demos to a centered column. */
function Box({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-md">{children}</div>;
}

export function AlertUsageDemo() {
  return (
    <Box>
      <Alert variant="warning" title="Approaching seat limit">
        You&apos;ve used 9 of 10 seats. Add more to keep inviting teammates.
      </Alert>
    </Box>
  );
}

export function AlertVariantsDemo() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <Alert variant="info" title="Scheduled maintenance">
        We&apos;ll be down for ~10 minutes at 02:00 UTC.
      </Alert>
      <Alert variant="success" title="Deployment complete">
        v2.4.0 is live in production.
      </Alert>
      <Alert variant="warning" title="Approaching seat limit">
        You&apos;ve used 9 of 10 seats.
      </Alert>
      <Alert variant="error" title="Build failed">
        3 tests failed in <code>checkout.spec.ts</code>.
      </Alert>
      <Alert variant="default" title="Heads up">
        This workspace switches to the new editor next week.
      </Alert>
    </div>
  );
}

export function AlertAppearancesDemo() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-3">
      <Alert variant="info" appearance="soft" title="Soft (default)">
        A tinted surface with a coloured accent bar.
      </Alert>
      <Alert variant="success" appearance="solid" title="Solid">
        A filled, high-emphasis banner.
      </Alert>
      <Alert variant="error" appearance="outline" title="Outline">
        A bordered, low-emphasis variant.
      </Alert>
    </div>
  );
}

export function AlertActionsDemo() {
  return (
    <Box>
      <Alert
        variant="warning"
        title="Approaching seat limit"
        action={
          <>
            <Button size="sm" variant="primary">Upgrade plan</Button>
            <Button size="sm" variant="secondary" appearance="ghost">Manage members</Button>
          </>
        }
      >
        You&apos;ve used 9 of 10 seats.
      </Alert>
    </Box>
  );
}

export function AlertDismissibleDemo() {
  const [open, setOpen] = useState(true);
  return (
    <Box>
      {open ? (
        <Alert variant="success" title="Invite sent" onClose={() => setOpen(false)}>
          Mara will get an email with a link to join.
        </Alert>
      ) : (
        <Button variant="secondary" appearance="ghost" onClick={() => setOpen(true)}>
          Show alert again
        </Button>
      )}
    </Box>
  );
}

export function AlertTitleOnlyDemo() {
  return (
    <Box>
      <Alert variant="info" title="Your changes have been saved." />
    </Box>
  );
}

export function AlertNoIconDemo() {
  return (
    <Box>
      <Alert variant="default" icon={null} title="Release notes">
        We&apos;ve shipped a faster editor and a few bug fixes.
      </Alert>
    </Box>
  );
}
