import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScrollTop } from "./scroll-top";

const SITE = "https://ui.bpdm.dev";
const TITLE = "bpdm/ui — an accessible component library for React & Angular";
const DESCRIPTION =
  "An accessible, themeable component library on one shared set of design tokens — built natively for React (Radix + Tailwind) and Angular (CDK + Tailwind). The same components, the same look, in both frameworks.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s · bpdm/ui",
  },
  description: DESCRIPTION,
  applicationName: "bpdm/ui",
  keywords: [
    "component library",
    "design system",
    "react component library",
    "angular component library",
    "react and angular component library",
    "one design system for react and angular",
    "angular component library tailwind",
    "tailwind components",
    "radix ui",
    "angular cdk",
    "design tokens",
    "accessible components",
    "themeable ui",
  ],
  authors: [{ name: "bpdm", url: SITE }],
  creator: "bpdm",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "bpdm/ui",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0e11" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
  ],
  colorScheme: "dark light",
};

// Runs before paint: pick the theme and set it on <html> so there's no flash of
// the wrong one. Precedence: the shared `.bpdm.dev` cookie (an explicit choice
// carried over from the docs) → this site's own saved theme → system preference.
// SSR defaults to dark.
const THEME_INIT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)bpdm-mode=(light|dark)/);var t=m?m[1]:localStorage.getItem('bpdm-theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){}})();`;

// Structured data: the site + the software (component library) it documents.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "bpdm/ui",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: "bpdm",
      url: SITE,
    },
    {
      "@type": "SoftwareApplication",
      name: "bpdm/ui",
      alternateName: ["bpdm", "bpdm/ng", "bpdm component library"],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      url: SITE,
      author: { "@id": `${SITE}/#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is bpdm/ui built on?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "On React, bpdm/ui is built on Radix UI primitives + Tailwind CSS; on Angular, the Angular CDK + Tailwind CSS. Both are accessible and themeable, and both are driven by one shared set of design tokens.",
          },
        },
        {
          "@type": "Question",
          name: "Does bpdm/ui provide a native Angular component library?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Angular library is built natively with standalone components and the Angular CDK — the same components, design tokens, and look as the React library, not a wrapper.",
          },
        },
        {
          "@type": "Question",
          name: "Which frameworks does it support — React or Angular?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both. One design system and one shared set of design tokens, with native React and Angular implementations, so the components look and behave identically across frameworks.",
          },
        },
        {
          "@type": "Question",
          name: "Is bpdm/ui free and open source?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. bpdm/ui is MIT-licensed and open source on GitHub for both the React and Angular libraries.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. ColorZilla, Grammarly)
    // inject attributes on <html>/<body> that aren't in the SSR'd HTML — this
    // silences only those top-level attribute mismatches, not the rest of the tree.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
        <ScrollTop />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
