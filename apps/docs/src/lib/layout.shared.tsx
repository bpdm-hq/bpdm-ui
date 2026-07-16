import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';
import { ThemeToggle } from '@/components/theme-toggle';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // the docs logo returns to the marketing landing (the product front door)
      url: 'https://ui.bpdm.dev',
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#f5a623" />
            <path d="M20 8 L12 24" stroke="#1a1205" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          {/* wordmark mirrors the marketing landing: <bpdm/ui /> in mono, brackets + /ui amber */}
          <span className="font-mono">
            <span className="text-fd-primary">&lt;</span>bpdm<span className="text-fd-primary">/ui</span><span className="text-fd-primary"> /&gt;</span>
          </span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    // single toggle whose icon swaps with the theme (Fumadocs' light-dark mode
    // keeps both icons in one pill, so we supply our own one-icon toggle)
    themeSwitch: { component: <ThemeToggle /> },
  };
}
