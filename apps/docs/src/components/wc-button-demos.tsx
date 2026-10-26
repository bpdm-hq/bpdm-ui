'use client';

import { useState, type HTMLAttributes, type DetailedHTMLProps } from 'react';
// Importing the subpath registers <bpdm-button> in the browser (SSR-safe: the
// element's own guard skips registration on the server).
import '@bpdm/wc/button';

// Teach JSX about the custom element (React 19 sets these as attributes/props).
type BpdmButtonAttrs = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    variant?: string;
    appearance?: string;
    size?: string;
    shape?: string;
    type?: string;
    disabled?: boolean;
    loading?: string;
    'loading-label'?: string;
  },
  HTMLElement
>;
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'bpdm-button': BpdmButtonAttrs;
    }
  }
}

const VARIANTS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'help',
  'destructive',
  'contrast',
] as const;

export function WcButtonBasicDemo() {
  return <bpdm-button variant="primary">Save changes</bpdm-button>;
}

export function WcButtonVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((v) => (
        <bpdm-button key={v} variant={v}>
          {v[0].toUpperCase() + v.slice(1)}
        </bpdm-button>
      ))}
    </div>
  );
}

export function WcButtonAppearancesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <bpdm-button appearance="solid">Solid</bpdm-button>
      <bpdm-button appearance="outline">Outline</bpdm-button>
      <bpdm-button appearance="ghost">Ghost</bpdm-button>
    </div>
  );
}

export function WcButtonSizesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <bpdm-button size="sm">Small</bpdm-button>
      <bpdm-button size="md">Medium</bpdm-button>
      <bpdm-button size="lg">Large</bpdm-button>
    </div>
  );
}

export function WcButtonShapeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <bpdm-button shape="round">Pill button</bpdm-button>
      <bpdm-button shape="round" variant="success">
        Success
      </bpdm-button>
    </div>
  );
}

export function WcButtonLoadingDemo() {
  const [saving, setSaving] = useState(false);
  return (
    <bpdm-button
      loading={saving ? '' : undefined}
      onClick={() => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1600);
      }}
    >
      {saving ? 'Saving…' : 'Save changes'}
    </bpdm-button>
  );
}

export function WcButtonFormDemo() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(String(data.get('plan') ?? ''));
      }}
    >
      <select name="plan" className="rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-sm">
        <option value="starter">Starter</option>
        <option value="pro">Pro</option>
      </select>
      <div className="flex gap-3">
        <bpdm-button type="submit">Subscribe</bpdm-button>
        <bpdm-button type="reset" variant="secondary" appearance="outline">
          Reset
        </bpdm-button>
      </div>
      <p className="text-sm text-fd-muted-foreground">
        {submitted ? `Submitted plan: ${submitted}` : 'A real <form> submit — no JS wiring.'}
      </p>
    </form>
  );
}
