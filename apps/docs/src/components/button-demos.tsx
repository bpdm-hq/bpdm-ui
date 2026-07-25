'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ArrowRight,
  Bell,
  Check,
  Download,
  Heart,
  Mail,
  Plus,
  Search,
  Star,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@bpdm/ui/button';

/** Prop unions are derived from the component itself, so these demos stay in
 *  sync with `@bpdm/ui` and never drift. */
type Variant = NonNullable<ComponentProps<typeof Button>['variant']>;

const VARIANTS: readonly Variant[] = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'help',
  'destructive',
  'contrast',
];

/** One distinct icon per severity. */
const SEVERITY_ICONS: readonly { variant: Variant; label: string; Icon: LucideIcon }[] = [
  { variant: 'primary', label: 'Add', Icon: Plus },
  { variant: 'secondary', label: 'Favorite', Icon: Star },
  { variant: 'success', label: 'Confirm', Icon: Check },
  { variant: 'info', label: 'Notifications', Icon: Bell },
  { variant: 'warning', label: 'Download', Icon: Download },
  { variant: 'help', label: 'Messages', Icon: Mail },
  { variant: 'destructive', label: 'Delete', Icon: Trash2 },
  { variant: 'contrast', label: 'Like', Icon: Heart },
];

/** A centered, wrapping row — the shared layout for every demo. The max-width
 *  keeps long sets (the 8 variants) wrapping into balanced, centered rows
 *  instead of leaving a single button orphaned on its own line. */
function Row({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-center gap-3">
      {children}
    </div>
  );
}

export function ButtonBasicDemo() {
  return <Button>Save changes</Button>;
}

export function ButtonVariantsDemo() {
  return (
    <Row>
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} className="capitalize">
          {variant}
        </Button>
      ))}
    </Row>
  );
}

export function ButtonAppearancesDemo() {
  return (
    <Row>
      <Button appearance="solid">Solid</Button>
      <Button appearance="outline">Outline</Button>
      <Button appearance="ghost">Ghost</Button>
    </Row>
  );
}

export function ButtonSizesDemo() {
  return (
    <Row>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Row>
  );
}

export function ButtonIconTextDemo() {
  return (
    <Row>
      <Button>
        <Plus className="size-4" /> New item
      </Button>
      <Button variant="secondary" appearance="outline">
        Continue <ArrowRight className="size-4" />
      </Button>
    </Row>
  );
}

export function ButtonIconSizesDemo() {
  return (
    <Row>
      <Button size="iconSm" aria-label="Add">
        <Plus className="size-4" />
      </Button>
      <Button size="icon" aria-label="Add">
        <Plus className="size-[18px]" />
      </Button>
      <Button size="iconLg" variant="secondary" appearance="outline" aria-label="Search">
        <Search className="size-5" />
      </Button>
    </Row>
  );
}

export function ButtonIconRowDemo() {
  return (
    <Row>
      {SEVERITY_ICONS.map(({ variant, label, Icon }) => (
        <Button key={variant} size="icon" shape="round" variant={variant} aria-label={label}>
          <Icon className="size-[18px]" />
        </Button>
      ))}
    </Row>
  );
}

export function ButtonShapeDemo() {
  return (
    <Row>
      <Button shape="round">Pill button</Button>
      <Button shape="round" variant="success">
        Success
      </Button>
      <Button shape="round" size="icon" variant="secondary" appearance="outline" aria-label="Like">
        <Heart className="size-[18px]" />
      </Button>
    </Row>
  );
}

export function ButtonLinkDemo() {
  return (
    <Row>
      <Button asChild>
        <a href="https://ui.bpdm.dev">Open docs</a>
      </Button>
      <Button asChild variant="secondary" appearance="outline">
        <a href="https://github.com/bpdm-hq/bpdm-ui">GitHub</a>
      </Button>
    </Row>
  );
}

export function ButtonDisabledDemo() {
  return (
    <Row>
      <Button disabled>Disabled</Button>
      <Button disabled appearance="outline">
        Disabled
      </Button>
    </Row>
  );
}

export function ButtonLoadingDemo() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  };
  return (
    <Row>
      <Button loading={saving} onClick={save}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
      <Button loading variant="secondary" appearance="outline">
        Please wait
      </Button>
      <Button loading size="icon" aria-label="Loading" />
    </Row>
  );
}

export function ButtonCustomSizeDemo() {
  return (
    <Row>
      <Button size="none" variant="secondary" appearance="outline" className="h-7 rounded-md px-2 text-xs">
        Tiny
      </Button>
      <Button size="none" variant="primary" className="h-14 rounded-2xl px-8 text-lg">
        Chunky
      </Button>
    </Row>
  );
}
