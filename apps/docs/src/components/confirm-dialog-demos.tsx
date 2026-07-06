'use client';

import { type ReactNode, useState } from 'react';
import { ConfirmProvider, useConfirm, type ConfirmOptions } from '@bpdm/ui/confirm-dialog';
import { Button } from '@bpdm/ui/button';

function ConfirmButton({
  label,
  okText,
  options,
  destructive,
}: {
  label: string;
  okText: string;
  options: ConfirmOptions;
  destructive?: boolean;
}) {
  const confirm = useConfirm();
  const [result, setResult] = useState('');
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant={destructive ? 'destructive' : 'primary'}
        onClick={async () => setResult((await confirm(options)) ? okText : 'Cancelled')}
      >
        {label}
      </Button>
      {result && (
        <p className="text-sm text-fd-muted-foreground">
          Result: <span className="font-medium text-fd-foreground">{result}</span>
        </p>
      )}
    </div>
  );
}

/** ConfirmProvider is mounted once near the app root; demos wrap their own. */
function Provide({ children }: { children: ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}

export function ConfirmUsageDemo() {
  return (
    <Provide>
      <ConfirmButton
        label="Publish changes"
        okText="Confirmed"
        options={{
          title: 'Publish changes?',
          description: 'This will make your edits live for everyone in the workspace.',
        }}
      />
    </Provide>
  );
}

export function ConfirmDestructiveDemo() {
  return (
    <Provide>
      <ConfirmButton
        label="Delete project"
        okText="Deleted"
        destructive
        options={{
          title: 'Delete project?',
          description: 'This permanently deletes the project and all its data. This cannot be undone.',
          confirmText: 'Delete',
          destructive: true,
        }}
      />
    </Provide>
  );
}
