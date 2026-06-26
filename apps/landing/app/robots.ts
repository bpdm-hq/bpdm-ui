import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://ui.bpdm.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
