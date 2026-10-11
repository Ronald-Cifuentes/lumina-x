import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/shared/config/env.server';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/favoritos'] }],
    sitemap: new URL('/sitemap.xml', base).toString(),
    host: base.origin,
  };
}
