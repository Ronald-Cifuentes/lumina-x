import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '@/features/properties/server/repository';
import { getSiteUrl } from '@/shared/config/env.server';

export const dynamic = 'force-dynamic';

const STATIC_PATHS = ['/', '/propiedades', '/contacto', '/propietarios', '/privacidad', '/creditos'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const properties = await getSitemapEntries();
  return [
    ...STATIC_PATHS.map((path) => ({
      url: new URL(path, base).toString(),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : path === '/propiedades' ? 0.9 : 0.4,
    })),
    ...properties.map((property) => ({
      url: new URL(`/propiedades/${property.slug}`, base).toString(),
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
