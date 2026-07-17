import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    // Fumadocs' own navbar is disabled — we render a full-width <SiteHeader />
    // above DocsLayout instead (mirrors the marketing landing's header). The
    // docs sidebar (component tree) still comes from DocsLayout underneath.
    nav: { enabled: false },
    // our SiteHeader has the theme selector + GitHub — hide Fumadocs' own
    // theme switch (it showed a redundant light/dark toggle in the sidebar footer).
    themeSwitch: { enabled: false },
    // the search now lives in <SiteHeader /> (<SearchBox />, opens the same
    // dialog) — hide Fumadocs' own sidebar/nav search toggle.
    searchToggle: { enabled: false },
  };
}
