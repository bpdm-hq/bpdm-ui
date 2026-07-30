'use client';

import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';

/**
 * Search trigger — opens Fumadocs' search dialog (same as ⌘K).
 * `block` renders the full-width variant used inside the mobile drawer; the
 * default is the header pill (icon-only below `md`, fixed width from `md` up).
 */
export function SearchBox({ block = false }: { block?: boolean }) {
  const { setOpenSearch } = useSearchContext();
  const width = block
    ? 'w-full justify-start px-3.5'
    : 'w-9 max-w-[40vw] justify-center px-0 md:w-52 md:justify-start md:px-3.5';
  const collapse = block ? '' : 'hidden md:block';
  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      aria-label="Search"
      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-fd-border bg-fd-muted/40 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground ${width}`}
    >
      <Search className="size-4 shrink-0" />
      <span className={`flex-1 text-start ${collapse}`}>Search</span>
      <kbd
        className={`rounded border border-fd-border bg-fd-background px-1.5 py-0.5 font-mono text-[11px] leading-none ${collapse}`}
      >
        ⌘K
      </kbd>
    </button>
  );
}
