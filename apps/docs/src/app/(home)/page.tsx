import Link from 'next/link';
import { Button } from '@bpdm/ui/button';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <span className="mb-5 inline-flex items-center rounded-full border border-fd-border px-3 py-1 text-xs font-medium text-fd-muted-foreground">
        Design system · React + Angular
      </span>

      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
        bpdm<span className="text-fd-primary">/ui</span>
      </h1>

      <p className="mt-5 max-w-2xl text-lg text-fd-muted-foreground">
        One design system. The same accessible, themeable components in{' '}
        <strong className="font-semibold text-fd-foreground">React</strong> and{' '}
        <strong className="font-semibold text-fd-foreground">Angular</strong> —
        built from a single set of design tokens.
      </p>

      {/* dogfooding: user-facing CTAs use the real @bpdm/ui Button */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/docs">Get started</Link>
        </Button>
        <Button asChild size="lg" variant="secondary" appearance="outline">
          <a href="https://github.com/BDev-9/bpdm-ui" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </Button>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-fd-muted-foreground">
        <span>♿&nbsp; Accessible</span>
        <span>🎨&nbsp; Themeable</span>
        <span>⚛️&nbsp; React + 🅰️ Angular</span>
        <span>🟡&nbsp; One token set</span>
      </div>
    </main>
  );
}
