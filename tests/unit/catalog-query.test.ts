import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildPropertyRows } from '@/db/seed/build';
import { type CatalogFilters, PAGE_SIZE, parseCatalogParams } from '@/features/properties/catalog/params';
import {
  countByZone,
  findCardsBySlugs,
  findFeatured,
  findPublishedBySlug,
  findSimilar,
  searchCatalog,
} from '@/features/properties/server/queries';
import { normalizeSearch } from '@/shared/lib/text';
import { createTestDatabase, type TestDatabase } from './support/database';

let testDb: TestDatabase;
const canonical = buildPropertyRows();

beforeAll(async () => {
  testDb = await createTestDatabase();
});

afterAll(() => testDb.cleanup());

/** Reference implementation of the filter semantics over the canonical rows. */
const expected = (filters: CatalogFilters) =>
  canonical.filter((row) => {
    if (filters.q && !normalizeSearch(filters.q).split(' ').every((token) => row.searchText.includes(token))) return false;
    if (filters.zona && row.zone !== filters.zona) return false;
    if (filters.tipo && row.type !== filters.tipo) return false;
    if (filters.precioMin && row.monthlyRent < filters.precioMin) return false;
    if (filters.precioMax && row.monthlyRent > filters.precioMax) return false;
    if (filters.habitaciones && row.bedrooms < filters.habitaciones) return false;
    if (filters.banos && row.bathrooms < filters.banos) return false;
    if (filters.parqueaderos && row.parking < filters.parqueaderos) return false;
    if (filters.amoblado && row.furnished !== (filters.amoblado === 'si')) return false;
    if (filters.mascotas && !row.petsAllowed) return false;
    if (filters.disponibilidad && row.availability !== filters.disponibilidad) return false;
    return true;
  });

describe('searchCatalog', () => {
  it('pages through all 50 published properties', async () => {
    const first = await searchCatalog(testDb.db, parseCatalogParams({}));
    expect(first.total).toBe(50);
    expect(first.pageCount).toBe(Math.ceil(50 / PAGE_SIZE));
    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(first).toMatchObject({ rangeStart: 1, rangeEnd: PAGE_SIZE });

    const seen = new Set<string>();
    for (let page = 1; page <= first.pageCount; page += 1) {
      const result = await searchCatalog(testDb.db, parseCatalogParams({ pagina: String(page) }));
      for (const item of result.items) seen.add(item.slug);
    }
    expect(seen.size).toBe(50);
  });

  it.each([
    { zona: 'el-poblado' },
    { tipo: 'casa' },
    { precioMin: '3000000', precioMax: '6000000' },
    { habitaciones: '3', banos: '2' },
    { parqueaderos: '2' },
    { amoblado: 'si' },
    { amoblado: 'no', mascotas: 'si' },
    { disponibilidad: 'proximamente' },
    { zona: 'envigado', tipo: 'casa', mascotas: 'si', precioMax: '15000000' },
    { q: 'itagui' },
    { q: 'Itagüí loft' },
    { q: 'poblado balsos' },
  ])('matches the reference semantics for %o', async (query) => {
    const filters = parseCatalogParams(query);
    const result = await searchCatalog(testDb.db, { ...filters, pagina: 1 });
    const reference = expected(filters);
    expect(result.total).toBe(reference.length);
    expect(result.items.map((item) => item.slug).sort()).toEqual(
      reference
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id))
        .slice(0, PAGE_SIZE)
        .map((row) => row.slug)
        .sort(),
    );
  });

  it('searches accent-insensitively by title, neighbourhood and municipality', async () => {
    const byMunicipality = await searchCatalog(testDb.db, parseCatalogParams({ q: 'itagui' }));
    expect(byMunicipality.total).toBe(7);
    const byNeighbourhood = await searchCatalog(testDb.db, parseCatalogParams({ q: 'zuniga' }));
    expect(byNeighbourhood.items.map((item) => item.slug)).toEqual(['apartamento-vidrio-y-madera-zuniga']);
    const byTitle = await searchCatalog(testDb.db, parseCatalogParams({ q: 'Penthouse' }));
    expect(byTitle.items[0]?.slug).toBe('penthouse-el-tesoro');
  });

  it('treats LIKE wildcards in the query literally', async () => {
    const result = await searchCatalog(testDb.db, parseCatalogParams({ q: '%' }));
    expect(result.total).toBe(0);
  });

  it('sorts by rent, area and recency', async () => {
    const all = async (orden: string) => {
      const items = [];
      for (let page = 1; page <= 5; page += 1) {
        items.push(...(await searchCatalog(testDb.db, parseCatalogParams({ orden, pagina: String(page) }))).items);
      }
      return items;
    };
    const ascending = (await all('precio-asc')).map((item) => item.monthlyRent);
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b));
    const descending = (await all('precio-desc')).map((item) => item.monthlyRent);
    expect(descending).toEqual([...descending].sort((a, b) => b - a));
    const area = (await all('area-desc')).map((item) => item.areaM2);
    expect(area).toEqual([...area].sort((a, b) => b - a));
    const newest = await searchCatalog(testDb.db, parseCatalogParams({}));
    const latest = [...canonical].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
    expect(newest.items[0]?.slug).toBe(latest?.slug);
  });

  it('combines search, filters, sorting and pagination', async () => {
    const filters = parseCatalogParams({ zona: 'el-poblado', mascotas: 'si', orden: 'precio-asc', pagina: '2' });
    const reference = expected(filters).sort((a, b) => a.monthlyRent - b.monthlyRent || a.id.localeCompare(b.id));
    const result = await searchCatalog(testDb.db, filters);
    expect(result.total).toBe(reference.length);
    if (reference.length > PAGE_SIZE) {
      expect(result.page).toBe(2);
      expect(result.items.map((item) => item.slug)).toEqual(reference.slice(PAGE_SIZE, PAGE_SIZE * 2).map((row) => row.slug));
    } else {
      expect(result.page).toBe(1);
    }
  });

  it('clamps an out-of-range page and reports an empty result cleanly', async () => {
    const clamped = await searchCatalog(testDb.db, parseCatalogParams({ pagina: '99' }));
    expect(clamped.page).toBe(5);
    const empty = await searchCatalog(testDb.db, parseCatalogParams({ q: 'inexistente' }));
    expect(empty).toMatchObject({ total: 0, page: 1, pageCount: 1, rangeStart: 0, rangeEnd: 0, items: [] });
  });
});

describe('other property queries', () => {
  it('finds a published property by slug and rejects unknown slugs', async () => {
    const property = await findPublishedBySlug(testDb.db, 'loft-ladrillo-provenza');
    expect(property?.name).toBe('Loft Ladrillo Provenza');
    expect(property?.images.length).toBeGreaterThanOrEqual(4);
    expect(await findPublishedBySlug(testDb.db, 'no-existe')).toBeNull();
  });

  it('returns six featured properties', async () => {
    expect(await findFeatured(testDb.db, 6)).toHaveLength(6);
  });

  it('suggests three similar properties, never the property itself', async () => {
    const base = await findPublishedBySlug(testDb.db, 'casa-aleros-del-escobero');
    if (!base) throw new Error('missing property');
    const similar = await findSimilar(testDb.db, base);
    expect(similar).toHaveLength(3);
    expect(similar.map((item) => item.id)).not.toContain(base.id);
    expect(similar.every((item) => item.type === 'casa')).toBe(true);
  });

  it('loads favourite cards in the requested order and counts by zone', async () => {
    const cards = await findCardsBySlugs(testDb.db, ['penthouse-el-tesoro', 'loft-ladrillo-provenza', 'no-existe']);
    expect(cards.map((card) => card.slug)).toEqual(['penthouse-el-tesoro', 'loft-ladrillo-provenza']);
    const counts = await countByZone(testDb.db);
    expect(Object.values(counts).reduce((sum, value) => sum + value, 0)).toBe(50);
    expect(counts['el-poblado']).toBe(12);
  });
});
