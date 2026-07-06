import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

const SITE = 'https://docs.bpdm.dev';
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
    'bpdm/ui',
    'component library',
    'react component library',
    'angular component library',
    'shadcn-style',
    'shadcn for angular',
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
        {/* One theme signal: next-themes toggles the `.dark` class (what Fumadocs
            + its code highlighting use). global.css mirrors bpdm's dark palette
            under `.dark`, so background, components and code switch together. */}
        <RootProvider
          theme={{
            attribute: 'class',
            defaultTheme: 'light',
            enableSystem: false,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
