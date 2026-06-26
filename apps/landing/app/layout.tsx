import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = "https://bpdm.dev";
const DESCRIPTION =
  "bpdm — an accessible, themeable design system with one shared set of design tokens for every framework. Pick React or Angular and explore the live docs.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "bpdm/ui — One design system, every framework",
    template: "%s · bpdm/ui",
  },
  description: DESCRIPTION,
  applicationName: "bpdm/ui",
  keywords: [
    "design system",
    "component library",
    "React components",
    "Angular components",
    "Tailwind CSS",
    "Radix UI",
    "Angular CDK",
    "design tokens",
    "accessible components",
    "themeable UI",
  ],
  authors: [{ name: "Bhavin P. Devamorari", url: SITE }],
  creator: "Bhavin P. Devamorari",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "bpdm/ui",
    title: "bpdm/ui — One design system, every framework",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "bpdm/ui — One design system, every framework",
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
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      description: DESCRIPTION,
      url: SITE,
      author: { "@id": `${SITE}/#person` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/licenses/MIT",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
