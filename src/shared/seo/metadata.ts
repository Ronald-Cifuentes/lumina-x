import type { Metadata } from 'next';
import { site } from '@/shared/config/site';

export const DEFAULT_OG_IMAGE = {
  url: '/images/site/og.jpg',
  width: 1200,
  height: 630,
  alt: 'Casa contemporánea iluminada al anochecer bajo un gran árbol',
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

/** Complete metadata per page: Next.js merges `openGraph` shallowly, so every page sets it fully. */
export const pageMetadata = ({ title, description, path, image, noIndex, absoluteTitle }: PageMetadataInput): Metadata => ({
  title: absoluteTitle ? { absolute: title } : title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.name,
    title: absoluteTitle ? title : `${title} · ${site.name}`,
    description,
    url: path,
    images: [image ?? DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
});

/** Serialises JSON-LD for a script tag, escaping `<` so data cannot close the element. */
export const serializeJsonLd = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c');
