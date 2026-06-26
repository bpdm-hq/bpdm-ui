import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE = "https://ui.bpdm.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/react/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/angular/`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
