import { SearchBox } from './search-box';
import { ThemeSelect } from './theme-select';

const LANDING = 'https://ui.bpdm.dev';
// Hidden until the repo moves to a public org — re-enable with the GitHub link below.
// const REPO = 'https://github.com/bpdm-hq/bpdm-ui';
const VERSION = '0.1.0';

/**
 * The docs site header — mirrors the marketing landing's look (full-bleed bar,
 * <bpdm/ui /> wordmark) but with a docs-appropriate right side: version, GitHub,
 * and a theme selector (the 4 @bpdm/ui themes) that re-themes the whole docs.
 * Replaces Fumadocs' default navbar (via DocsLayout `nav.component`).
 */
/**
 * The controls that live on the right of <SiteHeader /> on desktop (search,
 * version, theme) — relocated into the mobile sidebar drawer via the Fumadocs
 * `sidebar.banner` slot, so the mobile header stays down to just the hamburger
 * and wordmark. `md:hidden` keeps this out of the desktop docked sidebar (where
 * the header already carries these), leaving it only in the mobile drawer.
 */
export function MobileMenuBanner() {
  return (
    <div className="mb-1 flex flex-col gap-3 border-b border-fd-border pb-3 md:hidden">
      <SearchBox block />
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-9 items-center rounded-full border border-fd-border px-3 font-mono text-xs leading-none text-fd-muted-foreground">
          v{VERSION}
        </span>
        <ThemeSelect />
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/70 backdrop-blur-md">
      <div className="site-header-inner flex h-[3.75rem] items-center justify-between">
        {/* left: wordmark, plus — on mobile — the sidebar toggle that <MobileNavTrigger />
            portals into the slot below. Our header replaces Fumadocs' nav, which is where
            that trigger normally lives, so without it phones have no way to open the
            component nav. */}
        <div className="flex min-w-0 items-center gap-2 ps-4">
          <span id="fd-sidebar-trigger-slot" className="md:hidden" />
          {/* wordmark → landing (same tab) */}
          <a
            href={LANDING}
            className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[1.05rem] font-semibold tracking-tight text-fd-foreground no-underline"
          >
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#f5a623" />
            <path d="M20 8 L12 24" stroke="#1a1205" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          <span>
            <span className="text-fd-primary">&lt;</span>bpdm
            <span className="text-fd-primary">/ui</span>
            <span className="text-fd-primary"> /&gt;</span>
          </span>
          </a>
        </div>

        {/* right — one consistent control family: every item is h-9, rounded-full
            and shares the same border. Search (primary) · divider · version chip
            (quiet metadata) · GitHub · theme. */}
        <nav className="hidden items-center gap-2 pe-4 md:flex">
          <SearchBox />
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-fd-border md:block" />
          <span className="hidden h-9 items-center rounded-full border border-fd-border px-3 font-mono text-xs leading-none text-fd-muted-foreground md:inline-flex">
            v{VERSION}
          </span>
          {/* GitHub link hidden until the repo moves to a public org (see REPO const above).
              Re-enable this block + the REPO const, and point REPO at the new org URL. */}
          {/* <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex size-9 items-center justify-center rounded-full border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a> */}
          <ThemeSelect />
        </nav>
      </div>
    </header>
  );
}
