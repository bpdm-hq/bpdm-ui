'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';

/** Header search trigger — opens Fumadocs' search dialog (same as ⌘K). */
export function SearchBox() {
  const { setOpenSearch } = useSearchContext();
  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-label="Search"
      className="inline-flex h-9 w-52 max-w-[40vw] cursor-pointer items-center gap-2 rounded-full border border-fd-border bg-fd-muted/40 px-3.5 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      <Search className="size-4 shrink-0" />
      <span className="flex-1 text-start">Search</span>
      <kbd className="rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[11px] leading-none">
        ⌘K
      </kbd>
    </button>
  );
}
