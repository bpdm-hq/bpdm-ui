import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const SITE = 'https://docs.ui.bpdm.dev';
const TITLE = 'bpdm/ui — component library for React & Angular';
const DESCRIPTION =
  'Documentation for bpdm/ui — an accessible, themeable component library with native React (@bpdm/ui) and Angular (@bpdm/ng) implementations, built from one shared set of design tokens.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: '%s · bpdm/ui',
  },
  description: DESCRIPTION,
  applicationName: 'bpdm/ui',
  keywords: [
    'bpdm',
    'bpdm ui',
    'bpdm/ui',
    'bpdm react',
    'bpdm angular',
    'bpdm component library',
    'bpdm react component library',
    'bpdm angular component library',
    'component library',
    'react component library',
    'angular component library',
    'react and angular component library',
    'one design system for react and angular',
    'react ui library',
    'angular ui library',
    'react ui components',
    'angular ui components',
    'tailwind component library',
    'typescript component library',
    'open source component library',
    'accessible react components',
    'accessible angular components',
    'design tokens',
    'accessible components',
    'tailwind components',
    'radix ui',
    'angular cdk',
  ],
  authors: [{ name: 'bpdm', url: SITE }],
  creator: 'bpdm',
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'bpdm/ui',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla → cz-shortcut-listen)
          inject attributes on <body> that aren't in the SSR'd HTML. */}
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        {/* Four @bpdm/ui themes chosen via data-theme (tokens.css supplies each
            palette). Runs before paint AND before next-themes' own script, so it:
            (1) honours a cross-property light/dark choice carried over from the
            marketing site via the shared `.bpdm.dev` cookie `bpdm-mode` — if that
            mode disagrees with the stored docs theme, we fall back to that mode's
            default (charcoal / paper); (2) writes the resolved theme into the
            `theme` storage key so next-themes applies the same value (no flash,
            no revert); (3) sets `data-theme` + the `.dark` signal that Fumadocs
            chrome + Shiki code rely on. The ThemeSelect keeps both in sync after. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var D={charcoal:1,slate:1};var s=localStorage.getItem('theme');var m=document.cookie.match(/(?:^|;\\s*)bpdm-mode=(light|dark)/);var mode=m?m[1]:null;var t=s;if(t){if(mode&&((mode==='dark')!==!!D[t]))t=mode==='dark'?'charcoal':'paper';}else t=mode==='dark'?'charcoal':(mode==='light'?'paper':'paper');if(t!==s){try{localStorage.setItem('theme',t);}catch(e){}}var el=document.documentElement;el.setAttribute('data-theme',t);if(D[t])el.classList.add('dark');else el.classList.remove('dark');}catch(e){}})();`,
          }}
        />
        <RootProvider
          theme={{
            attribute: 'data-theme',
            themes: ['paper', 'mist', 'charcoal', 'slate'],
            defaultTheme: 'paper',
            storageKey: 'theme',
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
