import { describe, expect, it } from 'vitest';
import {
  catalogHref,
  clearFilters,
  DEFAULT_FILTERS,
  describeActiveFilters,
  hasActiveFilters,
  pageWindow,
  parseCatalogParams,
  toSearchParams,
  updateFilters,
} from '@/features/properties/catalog/params';

describe('parseCatalogParams', () => {
  it('returns the defaults for an empty query', () => {
    expect(parseCatalogParams({})).toEqual(DEFAULT_FILTERS);
  });

  it('parses every supported filter', () => {
    const filters = parseCatalogParams({
      q: '  Balsos ',
      zona: 'el-poblado',
      tipo: 'apartamento',
      precioMin: '3000000',
      precioMax: '15000000',
      habitaciones: '2',
      banos: '2',
      parqueaderos: '1',
      amoblado: 'no',
      mascotas: 'si',
      disponibilidad: 'disponible',
      orden: 'precio-desc',
      pagina: '2',
    });
    expect(filters).toEqual({
      q: 'Balsos',
      zona: 'el-poblado',
      tipo: 'apartamento',
      precioMin: 3_000_000,
      precioMax: 15_000_000,
      habitaciones: 2,
      banos: 2,
      parqueaderos: 1,
      amoblado: 'no',
      mascotas: true,
      disponibilidad: 'disponible',
      orden: 'precio-desc',
      pagina: 2,
    });
  });

  it('ignores invalid or hostile values instead of failing', () => {
    const filters = parseCatalogParams({
      zona: 'narnia',
      tipo: 'castillo',
      precioMin: '-5',
      habitaciones: 'muchas',
      banos: '99',
      orden: 'aleatorio',
      pagina: '0',
      mascotas: 'quizas',
      q: '<script>alert(1)</script>',
    });
    expect(filters.zona).toBeUndefined();
    expect(filters.tipo).toBeUndefined();
    expect(filters.precioMin).toBeUndefined();
    expect(filters.habitaciones).toBeUndefined();
    expect(filters.banos).toBeUndefined();
    expect(filters.mascotas).toBeUndefined();
    expect(filters.orden).toBe('recientes');
    expect(filters.pagina).toBe(1);
    expect(filters.q).toBe('scriptalert(1)/script');
  });

  it('swaps an inverted rent range and takes the first value of repeated keys', () => {
    const filters = parseCatalogParams({ precioMin: '8000000', precioMax: '2000000', zona: ['laureles', 'belen'] });
    expect(filters.precioMin).toBe(2_000_000);
    expect(filters.precioMax).toBe(8_000_000);
    expect(filters.zona).toBe('laureles');
  });

  it('accepts URLSearchParams and truncates long queries', () => {
    const filters = parseCatalogParams(new URLSearchParams({ q: 'a'.repeat(200), tipo: 'loft' }));
    expect(filters.q).toHaveLength(80);
    expect(filters.tipo).toBe('loft');
  });
});

describe('serialisation', () => {
  it('round-trips through the URL and omits defaults', () => {
    const filters = parseCatalogParams({ zona: 'sabaneta', habitaciones: '3', mascotas: 'si', orden: 'area-desc', pagina: '2' });
    const href = catalogHref(filters);
    expect(href).toBe('/propiedades?zona=sabaneta&habitaciones=3&mascotas=si&orden=area-desc&pagina=2');
    expect(parseCatalogParams(new URLSearchParams(href.split('?')[1]))).toEqual(filters);
    expect(catalogHref(DEFAULT_FILTERS)).toBe('/propiedades');
    expect(toSearchParams(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('resets pagination whenever a filter changes and keeps the sort on clear', () => {
    const filters = parseCatalogParams({ zona: 'laureles', orden: 'precio-asc', pagina: '3' });
    const changed = updateFilters(filters, { tipo: 'casa' });
    expect(changed).toMatchObject({ zona: 'laureles', tipo: 'casa', pagina: 1, orden: 'precio-asc' });
    const removed = updateFilters(changed, { zona: undefined });
    expect('zona' in removed).toBe(false);
    expect(clearFilters(changed)).toEqual({ orden: 'precio-asc', pagina: 1 });
  });

  it('describes active filters for the chips', () => {
    const filters = parseCatalogParams({ q: 'loft', zona: 'el-poblado', precioMax: '5000000', amoblado: 'si' });
    expect(hasActiveFilters(filters)).toBe(true);
    expect(describeActiveFilters(filters).map((item) => item.label)).toEqual(['“loft”', 'El Poblado', 'Hasta $5 M', 'Amoblado']);
    expect(hasActiveFilters(parseCatalogParams({ orden: 'precio-asc', pagina: '2' }))).toBe(false);
  });
});

describe('pageWindow', () => {
  it('lists every page when there are few', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('collapses distant pages into gaps', () => {
    expect(pageWindow(1, 12)).toEqual([1, 2, 'gap', 12]);
    expect(pageWindow(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12]);
    expect(pageWindow(12, 12)).toEqual([1, 'gap', 11, 12]);
  });
});
