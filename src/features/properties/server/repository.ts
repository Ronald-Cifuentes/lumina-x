import 'server-only';
import { cache } from 'react';
import { getDatabase } from '@/db/client';
import type { CatalogFilters } from '../catalog/params';
import type { Property } from '../domain';
import {
  countByZone,
  countPublished,
  findCardsBySlugs,
  findFeatured,
  findPublishedBySlug,
  findSimilar,
  listSitemapEntries,
  searchCatalog,
} from './queries';

export const getCatalogPage = (filters: CatalogFilters) => searchCatalog(getDatabase(), filters);

export const getPropertyBySlug = cache((slug: string) => findPublishedBySlug(getDatabase(), slug));

export const getFeaturedProperties = cache((limit: number = 6) => findFeatured(getDatabase(), limit));

export const getSimilarProperties = (property: Property) => findSimilar(getDatabase(), property);

export const getCardsBySlugs = (slugs: readonly string[]) => findCardsBySlugs(getDatabase(), slugs);

export const getZoneCounts = cache(() => countByZone(getDatabase()));

export const getPublishedCount = cache(() => countPublished(getDatabase()));

export const getSitemapEntries = () => listSitemapEntries(getDatabase());
