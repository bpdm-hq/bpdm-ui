import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-semibold">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#f5a623" />
            <path d="M20 8 L12 24" stroke="#1a1205" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          <span>
            bpdm<span className="text-fd-primary">/ui</span>
          </span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    // single toggle whose icon swaps with the theme (not two side-by-side icons)
    themeSwitch: { mode: 'light-dark' },
  };
}
