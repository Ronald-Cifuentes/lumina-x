import { and, asc, count, desc, eq, gte, inArray, lte, ne, type SQL, sql } from 'drizzle-orm';
import type { Database } from '@/db/client';
import { properties, type PropertyRow } from '@/db/schema';
import { normalizeSearch } from '@/shared/lib/text';
import { type CatalogFilters, PAGE_SIZE, type SortOption } from '../catalog/params';
import type { Property, PropertyCardData, Zone } from '../domain';
import { rankSimilar } from '../similar';

const cardColumns = {
  id: properties.id,
  slug: properties.slug,
  name: properties.name,
  type: properties.type,
  municipality: properties.municipality,
  zone: properties.zone,
  neighborhood: properties.neighborhood,
  areaM2: properties.areaM2,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  parking: properties.parking,
  monthlyRent: properties.monthlyRent,
  administrationFee: properties.administrationFee,
  availability: properties.availability,
  summary: properties.summary,
  images: properties.images,
};

type CardRow = { [K in keyof typeof cardColumns]: PropertyRow[K] };

const toCard = ({ images, ...row }: CardRow): PropertyCardData => {
  const [cover, secondary] = images;
  if (!cover) throw new Error(`La propiedad ${row.slug} no tiene imágenes`);
  return { ...row, cover, secondary: secondary ?? null };
};

export const toProperty = (row: PropertyRow): Property => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  type: row.type,
  municipality: row.municipality,
  zone: row.zone,
  neighborhood: row.neighborhood,
  layout: row.layout,
  areaM2: row.areaM2,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  parking: row.parking,
  stratum: row.stratum,
  floor: row.floor,
  monthlyRent: row.monthlyRent,
  administrationFee: row.administrationFee,
  furnished: row.furnished,
  petsAllowed: row.petsAllowed,
  availability: row.availability,
  amenities: row.amenities,
  images: row.images,
  summary: row.summary,
  description: row.description,
  featured: row.featured,
  published: row.published,
  publishedAt: row.publishedAt,
});

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (match) => `\\${match}`);

export const buildCatalogConditions = (filters: CatalogFilters): SQL[] => {
  const conditions: SQL[] = [eq(properties.published, true)];
  if (filters.q) {
    for (const token of normalizeSearch(filters.q).split(' ').filter(Boolean)) {
      conditions.push(sql`${properties.searchText} LIKE ${`%${escapeLike(token)}%`} ESCAPE '\\'`);
    }
  }
  if (filters.zona) conditions.push(eq(properties.zone, filters.zona));
  if (filters.tipo) conditions.push(eq(properties.type, filters.tipo));
  if (filters.precioMin) conditions.push(gte(properties.monthlyRent, filters.precioMin));
  if (filters.precioMax) conditions.push(lte(properties.monthlyRent, filters.precioMax));
  if (filters.habitaciones) conditions.push(gte(properties.bedrooms, filters.habitaciones));
  if (filters.banos) conditions.push(gte(properties.bathrooms, filters.banos));
  if (filters.parqueaderos) conditions.push(gte(properties.parking, filters.parqueaderos));
  if (filters.amoblado) conditions.push(eq(properties.furnished, filters.amoblado === 'si'));
  if (filters.mascotas) conditions.push(eq(properties.petsAllowed, true));
  if (filters.disponibilidad) conditions.push(eq(properties.availability, filters.disponibilidad));
  return conditions;
};

const ORDER: Record<SortOption, SQL[]> = {
  recientes: [desc(properties.publishedAt), asc(properties.id)],
  'precio-asc': [asc(properties.monthlyRent), asc(properties.id)],
  'precio-desc': [desc(properties.monthlyRent), asc(properties.id)],
  'area-desc': [desc(properties.areaM2), asc(properties.id)],
  'area-asc': [asc(properties.areaM2), asc(properties.id)],
};

export type CatalogPage = {
  items: PropertyCardData[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
};

export const searchCatalog = async (db: Database, filters: CatalogFilters): Promise<CatalogPage> => {
  const where = and(...buildCatalogConditions(filters));
  const [counted] = await db.select({ total: count() }).from(properties).where(where);
  const total = counted?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.pagina, pageCount);
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(where)
    .orderBy(...ORDER[filters.orden])
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  return {
    items: rows.map(toCard),
    total,
    page,
    pageCount,
    pageSize: PAGE_SIZE,
    rangeStart,
    rangeEnd: total === 0 ? 0 : rangeStart + rows.length - 1,
  };
};

export const findPublishedBySlug = async (db: Database, slug: string): Promise<Property | null> => {
  const [row] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), eq(properties.published, true)))
    .limit(1);
  return row ? toProperty(row) : null;
};

export const findFeatured = async (db: Database, limit = 6): Promise<PropertyCardData[]> => {
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(and(eq(properties.featured, true), eq(properties.published, true)))
    .orderBy(desc(properties.publishedAt), asc(properties.id))
    .limit(limit);
  return rows.map(toCard);
};

export const findSimilar = async (db: Database, base: Property, limit = 3): Promise<PropertyCardData[]> => {
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(and(eq(properties.published, true), ne(properties.id, base.id)));
  return rankSimilar(base, rows.map(toCard), limit);
};

export const findCardsBySlugs = async (db: Database, slugs: readonly string[]): Promise<PropertyCardData[]> => {
  if (slugs.length === 0) return [];
  const rows = await db
    .select(cardColumns)
    .from(properties)
    .where(and(eq(properties.published, true), inArray(properties.slug, [...slugs])));
  const order = new Map(slugs.map((slug, index) => [slug, index]));
  return rows.map(toCard).sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));
};

export const countByZone = async (db: Database): Promise<Record<Zone, number>> => {
  const rows = await db
    .select({ zone: properties.zone, total: count() })
    .from(properties)
    .where(eq(properties.published, true))
    .groupBy(properties.zone);
  const counts = { 'el-poblado': 0, laureles: 0, belen: 0, envigado: 0, sabaneta: 0, itagui: 0 } satisfies Record<Zone, number>;
  for (const row of rows) counts[row.zone] = row.total;
  return counts;
};

export const countPublished = async (db: Database): Promise<number> => {
  const [row] = await db.select({ total: count() }).from(properties).where(eq(properties.published, true));
  return row?.total ?? 0;
};

export const listSitemapEntries = async (db: Database) =>
  db
    .select({ slug: properties.slug, updatedAt: properties.updatedAt })
    .from(properties)
    .where(eq(properties.published, true))
    .orderBy(asc(properties.id));
