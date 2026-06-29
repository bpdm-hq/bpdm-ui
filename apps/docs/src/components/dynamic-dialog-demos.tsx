'use client';

import { type ReactNode } from 'react';
import { DialogProvider, useDialog } from '@bpdm/ui/dynamic-dialog';
import { Button } from '@bpdm/ui/button';
import { Input } from '@bpdm/ui/input';

/** DialogProvider is mounted once near the app root; demos wrap their own. */
function Provide({ children }: { children: ReactNode }) {
  return <DialogProvider>{children}</DialogProvider>;
}

function EditButton() {
  const dialog = useDialog();
  return (
    <Button
      onClick={() =>
        dialog.open(
          ({ close }) => (
            <div className="flex flex-col gap-3">
              <Input defaultValue="Acme website" aria-label="Project name" />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" appearance="ghost" onClick={close}>
                  Cancel
                </Button>
                <Button onClick={close}>Save</Button>
              </div>
            </div>
          ),
          { title: 'Edit project', description: 'Rename your project.' },
        )
      }
    >
      Edit project
    </Button>
  );
}

export function DynamicUsageDemo() {
  return (
    <Provide>
      <EditButton />
    </Provide>
  );
}

function StackedButton() {
  const dialog = useDialog();
  return (
    <Button
      onClick={() =>
        dialog.open(
          ({ close }) => (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-fd-muted-foreground">
                Open another dialog from inside this one — they stack.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" appearance="ghost" onClick={close}>
                  Close
                </Button>
                <Button
                  onClick={() =>
                    dialog.open(
                      'This dialog opened on top of the first one.',
                      { title: 'Second dialog', size: 'sm' },
                    )
                  }
                >
                  Open second
                </Button>
              </div>
            </div>
          ),
          { title: 'First dialog' },
        )
      }
    >
      Stacked dialogs
    </Button>
  );
}

export function DynamicStackedDemo() {
  return (
    <Provide>
      <StackedButton />
    </Provide>
  );
}
