import type { ReactNode } from 'react';

/** A bordered, on-brand stage for rendering live @bpdm/ui components in the docs. */
export function Preview({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-4 flex min-h-36 flex-wrap items-center justify-center gap-3 rounded-xl border border-fd-border bg-fd-card p-8">
      {children}
    </div>
  );
}
