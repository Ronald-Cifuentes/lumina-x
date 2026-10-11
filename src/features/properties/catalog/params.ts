import { z } from 'zod';
import { formatCOPShort } from '@/shared/lib/format';
import { sanitizeText } from '@/shared/lib/text';
import {
  AVAILABILITY,
  AVAILABILITY_LABELS,
  type Availability,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  type PropertyType,
  ZONE_LABELS,
  ZONES,
  type Zone,
} from '../domain';

export const CATALOG_PATH = '/propiedades';
export const PAGE_SIZE = 12;
export const MAX_QUERY_LENGTH = 80;

export const SORT_OPTIONS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Canon: menor a mayor' },
  { value: 'precio-desc', label: 'Canon: mayor a menor' },
  { value: 'area-desc', label: 'Área: mayor a menor' },
  { value: 'area-asc', label: 'Área: menor a mayor' },
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
export const DEFAULT_SORT: SortOption = 'recientes';

export const RENT_STEPS = [
  1_500_000, 2_000_000, 2_500_000, 3_000_000, 4_000_000, 5_000_000, 7_000_000, 10_000_000, 15_000_000,
  20_000_000,
] as const;

export const MIN_COUNT_OPTIONS = {
  habitaciones: [1, 2, 3, 4],
  banos: [1, 2, 3],
  parqueaderos: [1, 2],
} as const;

export type FurnishedFilter = 'si' | 'no';

export type CatalogFilters = {
  q?: string;
  zona?: Zone;
  tipo?: PropertyType;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  banos?: number;
  parqueaderos?: number;
  amoblado?: FurnishedFilter;
  mascotas?: true;
  disponibilidad?: Availability;
  orden: SortOption;
  pagina: number;
};

export type FilterKey = Exclude<keyof CatalogFilters, 'orden' | 'pagina'>;

export const FILTER_KEYS: readonly FilterKey[] = [
  'q',
  'zona',
  'tipo',
  'precioMin',
  'precioMax',
  'habitaciones',
  'banos',
  'parqueaderos',
  'amoblado',
  'mascotas',
  'disponibilidad',
];

export const DEFAULT_FILTERS: CatalogFilters = { orden: DEFAULT_SORT, pagina: 1 };

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

const first = (params: RawParams, key: string): string | undefined => {
  const value = params instanceof URLSearchParams ? params.get(key) ?? undefined : params[key];
  const single = Array.isArray(value) ? value[0] : value;
  const trimmed = single?.trim();
  return trimmed ? trimmed : undefined;
};

const parseWith = <T>(schema: z.ZodType<T>, value: string | undefined): T | undefined => {
  if (value === undefined) return undefined;
  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
};

const rentSchema = z.coerce.number().int().min(0).max(100_000_000);
const countSchema = (max: number) => z.coerce.number().int().min(1).max(max);
const pageSchema = z.coerce.number().int().min(1).max(10_000);

/** Parses untrusted query parameters. Invalid values are ignored rather than failing the page. */
export const parseCatalogParams = (params: RawParams): CatalogFilters => {
  const query = first(params, 'q');
  const cleanedQuery = query ? sanitizeText(query).slice(0, MAX_QUERY_LENGTH) : undefined;
  let precioMin = parseWith(rentSchema, first(params, 'precioMin'));
  let precioMax = parseWith(rentSchema, first(params, 'precioMax'));
  if (precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) {
    [precioMin, precioMax] = [precioMax, precioMin];
  }
  const filters: CatalogFilters = {
    q: cleanedQuery || undefined,
    zona: parseWith(z.enum(ZONES), first(params, 'zona')),
    tipo: parseWith(z.enum(PROPERTY_TYPES), first(params, 'tipo')),
    precioMin: precioMin || undefined,
    precioMax: precioMax || undefined,
    habitaciones: parseWith(countSchema(10), first(params, 'habitaciones')),
    banos: parseWith(countSchema(10), first(params, 'banos')),
    parqueaderos: parseWith(countSchema(10), first(params, 'parqueaderos')),
    amoblado: parseWith(z.enum(['si', 'no']), first(params, 'amoblado')),
    mascotas: first(params, 'mascotas') === 'si' ? true : undefined,
    disponibilidad: parseWith(z.enum(AVAILABILITY), first(params, 'disponibilidad')),
    orden: parseWith(z.enum(SORT_OPTIONS.map((option) => option.value) as [SortOption, ...SortOption[]]), first(params, 'orden')) ?? DEFAULT_SORT,
    pagina: parseWith(pageSchema, first(params, 'pagina')) ?? 1,
  };
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined)) as CatalogFilters;
};

const serializeValue = (key: FilterKey, value: CatalogFilters[FilterKey]): string | undefined => {
  if (value === undefined) return undefined;
  if (key === 'mascotas') return value ? 'si' : undefined;
  return String(value);
};

/** Canonical, stable serialisation: defaults are omitted so URLs stay short and shareable. */
export const toSearchParams = (filters: CatalogFilters): URLSearchParams => {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = serializeValue(key, filters[key]);
    if (value) params.set(key, value);
  }
  if (filters.orden !== DEFAULT_SORT) params.set('orden', filters.orden);
  if (filters.pagina > 1) params.set('pagina', String(filters.pagina));
  return params;
};

export const catalogHref = (filters: CatalogFilters): string => {
  const query = toSearchParams(filters).toString();
  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH;
};

/** Applies a change to the filters and resets pagination, as any new filter changes the result set. */
export const updateFilters = (
  filters: CatalogFilters,
  patch: Partial<Omit<CatalogFilters, 'pagina'>>,
): CatalogFilters => {
  const next = { ...filters, ...patch, pagina: 1 } as CatalogFilters;
  for (const key of FILTER_KEYS) {
    if (next[key] === undefined) delete next[key];
  }
  return next;
};

export const clearFilters = (filters: CatalogFilters): CatalogFilters => ({ orden: filters.orden, pagina: 1 });

export const hasActiveFilters = (filters: CatalogFilters): boolean =>
  FILTER_KEYS.some((key) => filters[key] !== undefined);

export type ActiveFilter = { key: FilterKey; label: string };

export const describeActiveFilters = (filters: CatalogFilters): ActiveFilter[] => {
  const active: ActiveFilter[] = [];
  if (filters.q) active.push({ key: 'q', label: `“${filters.q}”` });
  if (filters.zona) active.push({ key: 'zona', label: ZONE_LABELS[filters.zona] });
  if (filters.tipo) active.push({ key: 'tipo', label: PROPERTY_TYPE_LABELS[filters.tipo] });
  if (filters.precioMin) active.push({ key: 'precioMin', label: `Desde ${formatCOPShort(filters.precioMin)}` });
  if (filters.precioMax) active.push({ key: 'precioMax', label: `Hasta ${formatCOPShort(filters.precioMax)}` });
  if (filters.habitaciones) active.push({ key: 'habitaciones', label: `${filters.habitaciones}+ habitaciones` });
  if (filters.banos) active.push({ key: 'banos', label: `${filters.banos}+ baños` });
  if (filters.parqueaderos) active.push({ key: 'parqueaderos', label: `${filters.parqueaderos}+ parqueaderos` });
  if (filters.amoblado) active.push({ key: 'amoblado', label: filters.amoblado === 'si' ? 'Amoblado' : 'Sin amoblar' });
  if (filters.mascotas) active.push({ key: 'mascotas', label: 'Acepta mascotas' });
  if (filters.disponibilidad) active.push({ key: 'disponibilidad', label: AVAILABILITY_LABELS[filters.disponibilidad] });
  return active;
};

/** Page numbers to show: first, last and the current page with one neighbour on each side. */
export const pageWindow = (page: number, pageCount: number): (number | 'gap')[] => {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((value, index) => {
    const previous = sorted[index - 1];
    return previous !== undefined && value - previous > 1 ? ['gap' as const, value] : [value];
  });
};

export const sortLabel = (sort: SortOption): string =>
  SORT_OPTIONS.find((option) => option.value === sort)?.label ?? SORT_OPTIONS[0].label;
