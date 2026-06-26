import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = "https://ui.bpdm.dev";
const TITLE = "bpdm/ui — a shadcn-style component library for React & Angular";
const DESCRIPTION =
  "An accessible, themeable, shadcn-style component library on one shared set of design tokens — built natively for React (Radix + Tailwind) and Angular (CDK + Tailwind). The same components, the same look, in both frameworks.";

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
    "shadcn-style",
    "shadcn alternative",
    "shadcn for angular",
    "tailwind components",
    "radix ui",
    "angular cdk",
    "design tokens",
    "accessible components",
    "themeable ui",
  ],
  authors: [{ name: "Bhavin P. Devamorari", url: SITE }],
  creator: "Bhavin P. Devamorari",
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
  themeColor: "#0e0e11",
  colorScheme: "dark",
};

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
      publisher: { "@id": `${SITE}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: "Bhavin P. Devamorari",
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
      author: { "@id": `${SITE}/#person` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is bpdm/ui like shadcn/ui?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — on React, bpdm/ui is built on the same foundation as shadcn/ui (Radix UI primitives + Tailwind CSS), with the same accessible, themeable philosophy. It then brings that same approach to Angular.",
          },
        },
        {
          "@type": "Question",
          name: "Is there a shadcn for Angular?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "shadcn/ui itself is React-only. bpdm/ui's Angular library fills that gap — the same components and design tokens, built natively with Angular standalone components and the Angular CDK.",
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
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
