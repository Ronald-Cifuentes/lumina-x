import { getCatalogImage } from '@/content/images';
import { ConversionBand } from '@/features/landing/ConversionBand';
import { FeaturedResidences } from '@/features/landing/FeaturedResidences';
import { Hero } from '@/features/landing/Hero';
import { NEIGHBORHOOD_COPY, type NeighborhoodPanel, Neighborhoods } from '@/features/landing/Neighborhoods';
import { RentalProcess } from '@/features/landing/RentalProcess';
import { Storytelling } from '@/features/landing/Storytelling';
import { ZONE_LABELS } from '@/features/properties/domain';
import { getFeaturedProperties, getPublishedCount, getZoneCounts } from '@/features/properties/server/repository';
import { getSiteUrl } from '@/shared/config/env.server';
import { site } from '@/shared/config/site';
import { pageMetadata, serializeJsonLd } from '@/shared/seo/metadata';

export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  title: `${site.name} · Arriendos residenciales en Medellín y el Valle de Aburrá`,
  description: site.description,
  path: '/',
  absoluteTitle: true,
});

const PANEL_ZONES = ['el-poblado', 'laureles', 'envigado', 'sabaneta'] as const;

export default async function HomePage() {
  const [featured, zoneCounts, total] = await Promise.all([getFeaturedProperties(6), getZoneCounts(), getPublishedCount()]);

  const panels: NeighborhoodPanel[] = PANEL_ZONES.map((zone) => ({
    zone,
    name: ZONE_LABELS[zone],
    description: NEIGHBORHOOD_COPY[zone],
    count: zoneCounts[zone],
    image: getCatalogImage(`zona-${zone}`),
  }));

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: getSiteUrl().toString(),
    inLanguage: 'es-CO',
    description: site.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }} />
      <Hero background={getCatalogImage('hero')} fragment={getCatalogImage('fragment')} totalProperties={total} />
      <Storytelling
        images={[getCatalogImage('story-luz'), getCatalogImage('story-materia'), getCatalogImage('story-entorno')]}
      />
      <FeaturedResidences properties={featured} total={total} />
      <Neighborhoods panels={panels} />
      <RentalProcess />
      <ConversionBand />
    </>
  );
}
