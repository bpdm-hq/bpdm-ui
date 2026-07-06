import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

const SITE = 'https://docs.bpdm.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: new URL(page.url, SITE).toString(),
    changeFrequency: 'weekly',
  }));
}
