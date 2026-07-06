'use client';

import type { ReactNode } from 'react';
import { Textarea } from '@bpdm/ui/textarea';

/** Textareas are full-width, so demos sit in a centered, constrained column. */
function Stack({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-sm flex-col gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fd-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextareaUsageDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Textarea placeholder="Write a comment…" />
    </div>
  );
}

export function TextareaSizesDemo() {
  return (
    <Stack>
      <Textarea size="sm" placeholder="Small" />
      <Textarea size="md" placeholder="Medium (default)" />
      <Textarea size="lg" placeholder="Large" />
    </Stack>
  );
}

export function TextareaResizeDemo() {
  return (
    <Stack>
      <Field label="Fixed — resize none">
        <Textarea resize="none" placeholder="This one can't be resized." />
      </Field>
      <Field label="Resize freely — both">
        <Textarea resize="both" placeholder="Drag the corner to resize." />
      </Field>
    </Stack>
  );
}

export function TextareaAutoResizeDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Textarea
        autoResize
        defaultValue={
          'This textarea grows as you type.\nAdd another line and it expands to fit — no scrollbar, no manual resize.'
        }
      />
    </div>
  );
}

export function TextareaCountDemo() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <Textarea showCount maxLength={120} defaultValue="A short note with a live character counter." />
    </div>
  );
}

export function TextareaStatesDemo() {
  return (
    <Stack>
      <Field label="Disabled">
        <Textarea disabled defaultValue="You can't edit this field." />
      </Field>
      <Field label="Invalid">
        <Textarea aria-invalid defaultValue="This value needs attention." />
      </Field>
    </Stack>
  );
}
