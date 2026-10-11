import { galleryImages } from '../../content/images/catalog';
import { getCatalogImage } from '../../content/images';
import {
  DEMO_NOTICE,
  MUNICIPALITY_LABELS,
  PROPERTY_TYPE_LABELS,
  ZONE_LABELS,
  ZONE_MUNICIPALITY,
  type Zone,
} from '../../features/properties/domain';
import { normalizeSearch, slugify } from '../../shared/lib/text';
import type { NewPropertyRow } from '../schema';
import { type Listing, listings } from './listings';

export const ZONE_CONTEXT: Record<Zone, string> = {
  'el-poblado':
    'El Poblado concentra buena parte de la oferta gastronómica, comercial y de oficinas de Medellín. Sus lomas combinan calles arborizadas, quebradas y edificios residenciales con vista al valle; los desplazamientos en hora pico requieren planeación.',
  laureles:
    'Laureles-Estadio es un sector plano y caminable, de calles circulares y antejardines, con buena conexión al metro y a la unidad deportiva del estadio. Predominan edificios de baja altura y casas de mediados del siglo XX.',
  belen:
    'Belén es una de las comunas más extensas de Medellín: combina vida de barrio, comercio tradicional y nuevas unidades residenciales en sus lomas, con acceso rápido a la avenida 80 y al aeropuerto Olaya Herrera.',
  envigado:
    'Envigado, al sur de Medellín, conserva una escala de pueblo en su centro y una oferta residencial creciente en sus lomas. Tiene parques, senderos de montaña y estaciones de metro sobre la avenida Regional.',
  sabaneta:
    'Sabaneta es el municipio más pequeño del Valle de Aburrá y uno de los de mayor crecimiento residencial. Su parque principal y la zona de Calle Larga mantienen un ambiente tradicional, mientras en las lomas aparecen conjuntos con zonas comunes amplias.',
  itagui:
    'Itagüí combina tradición industrial y comercial con barrios residenciales consolidados, parques y conexión directa al metro. Ofrece opciones de arriendo con presupuestos más moderados que otros sectores del sur del valle.',
};

const LATEST_PUBLICATION = Date.UTC(2026, 9, 6);
const DAY_MS = 86_400_000;

const pick = <T,>(list: readonly T[], index: number): T => {
  const item = list[index % list.length];
  if (item === undefined) throw new Error('Lista de imágenes vacía');
  return item;
};

const galleryKeys = (listing: Listing, index: number): string[] => {
  const kitchen = pick(galleryImages.kitchen, index * 3).key;
  const bedroom = pick(galleryImages.bedroom, index * 5 + 1).key;
  const bathroom = pick(galleryImages.bathroom, index * 7 + 2).key;
  const living = pick(galleryImages.living, index * 3 + 1).key;
  if (listing.type === 'apartaestudio') return [listing.cover, kitchen, bathroom, living];
  return [listing.cover, living, kitchen, bedroom, bathroom];
};

export const propertyId = (index: number): string => `lum-${String(index + 1).padStart(3, '0')}`;

const publicationDate = (index: number): string =>
  new Date(LATEST_PUBLICATION - ((index * 37) % 173) * DAY_MS).toISOString().slice(0, 10);

export const buildSearchText = (fields: {
  name: string;
  neighborhood: string;
  zone: Zone;
  type: Listing['type'];
}): string => {
  const municipality = MUNICIPALITY_LABELS[ZONE_MUNICIPALITY[fields.zone]];
  return normalizeSearch(
    [fields.name, fields.neighborhood, ZONE_LABELS[fields.zone], municipality, PROPERTY_TYPE_LABELS[fields.type]].join(' '),
  );
};

export const buildPropertyRows = (now = new Date()): NewPropertyRow[] =>
  listings.map((listing, index) => ({
    id: propertyId(index),
    slug: slugify(listing.name),
    name: listing.name,
    type: listing.type,
    municipality: ZONE_MUNICIPALITY[listing.zone],
    zone: listing.zone,
    neighborhood: listing.neighborhood,
    layout: listing.layout,
    areaM2: listing.areaM2,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    parking: listing.parking,
    stratum: listing.stratum,
    floor: listing.floor,
    monthlyRent: listing.monthlyRent,
    administrationFee: listing.administrationFee,
    furnished: listing.furnished,
    petsAllowed: listing.petsAllowed,
    availability: listing.availability,
    amenities: listing.amenities,
    images: galleryKeys(listing, index).map(getCatalogImage),
    summary: listing.summary,
    description: [listing.lead, ZONE_CONTEXT[listing.zone], DEMO_NOTICE].join('\n\n'),
    featured: listing.featured,
    published: true,
    searchText: buildSearchText(listing),
    publishedAt: publicationDate(index),
    createdAt: now,
    updatedAt: now,
  }));
