'use client';

import { type ReactNode, useState } from 'react';
import { Spinner, LoadingOverlay, type SpinnerVariant } from '@bpdm/ui/spinner';
import { Button } from '@bpdm/ui/button';

/** Centered row for grouping spinners. */
function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-8">{children}</div>;
}

/** A spinner with a small caption beneath — clarifies the variant/size demos. */
function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="flex h-8 items-center justify-center">{children}</span>
      <span className="text-xs text-fd-muted-foreground">{label}</span>
    </div>
  );
}

const VARIANTS: SpinnerVariant[] = ['ring', 'gradient', 'square', 'dots', 'bars', 'flip'];

export function SpinnerBasicDemo() {
  return <Spinner size="lg" />;
}

export function SpinnerVariantsDemo() {
  return (
    <Row>
      {VARIANTS.map((v) => (
        <Labeled key={v} label={v}>
          <Spinner variant={v} size="lg" />
        </Labeled>
      ))}
    </Row>
  );
}

export function SpinnerSizesDemo() {
  return (
    <Row>
      <Labeled label="xs">
        <Spinner size="xs" />
      </Labeled>
      <Labeled label="sm">
        <Spinner size="sm" />
      </Labeled>
      <Labeled label="md">
        <Spinner size="md" />
      </Labeled>
      <Labeled label="lg">
        <Spinner size="lg" />
      </Labeled>
      <Labeled label="xl">
        <Spinner size="xl" />
      </Labeled>
    </Row>
  );
}

export function SpinnerColorsDemo() {
  return (
    <Row>
      <Labeled label="primary">
        <Spinner size="lg" className="text-primary" />
      </Labeled>
      <Labeled label="success">
        <Spinner size="lg" className="text-success" />
      </Labeled>
      <Labeled label="warning">
        <Spinner size="lg" className="text-warning" />
      </Labeled>
      <Labeled label="destructive">
        <Spinner size="lg" className="text-destructive" />
      </Labeled>
      <Labeled label="muted">
        <Spinner size="lg" className="text-fd-muted-foreground" />
      </Labeled>
    </Row>
  );
}

export function SpinnerInlineDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Button disabled>
        <Spinner size="sm" className="text-current" />
        Saving…
      </Button>
      <span className="inline-flex items-center gap-2 text-sm text-fd-muted-foreground">
        <Spinner size="sm" variant="dots" className="text-current" />
        Loading results
      </span>
    </div>
  );
}

export function SpinnerOverlayDemo() {
  const [loading, setLoading] = useState(false);
  const refetch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };
  return (
    <div className="w-72 space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card p-5 shadow-sm">
        <p className="text-sm text-fd-muted-foreground">Active users</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-fd-foreground">12,480</p>
        <p className="mt-1 text-xs text-success">+8.2% this week</p>
        <LoadingOverlay show={loading} label="Fetching…" size="md" />
      </div>
      <Button size="sm" variant="secondary" appearance="outline" onClick={refetch}>
        Refresh
      </Button>
    </div>
  );
}
