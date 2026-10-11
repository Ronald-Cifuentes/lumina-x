import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { imageManifest } from '@/content/images';
import { allCatalogImages } from '@/content/images/catalog';
import { buildPropertyRows } from '@/db/seed/build';
import { listings } from '@/db/seed/listings';
import { DEMO_NOTICE, MUNICIPALITIES, PROPERTY_TYPES, ZONE_MUNICIPALITY } from '@/features/properties/domain';

const rows = buildPropertyRows(new Date('2026-10-10T12:00:00Z'));

describe('canonical 50-property dataset', () => {
  it('contains exactly 50 records with unique ids, slugs, names and covers', () => {
    expect(listings).toHaveLength(50);
    expect(new Set(rows.map((row) => row.id)).size).toBe(50);
    expect(new Set(rows.map((row) => row.slug)).size).toBe(50);
    expect(new Set(rows.map((row) => row.name)).size).toBe(50);
    expect(new Set(rows.map((row) => row.images[0]?.src)).size).toBe(50);
  });

  it('is deterministic', () => {
    const again = buildPropertyRows(new Date('2026-10-10T12:00:00Z'));
    expect(again).toEqual(rows);
  });

  it('covers every property type and the four municipalities', () => {
    expect(new Set(rows.map((row) => row.type))).toEqual(new Set(PROPERTY_TYPES));
    expect(new Set(rows.map((row) => row.municipality))).toEqual(new Set(MUNICIPALITIES));
  });

  it('keeps municipality consistent with the zone', () => {
    for (const row of rows) expect(row.municipality).toBe(ZONE_MUNICIPALITY[row.zone]);
  });

  it('uses plausible, varied COP budgets with the administration fee below the rent', () => {
    const rents = rows.map((row) => row.monthlyRent);
    expect(Math.min(...rents)).toBeGreaterThanOrEqual(1_000_000);
    expect(Math.max(...rents)).toBeLessThanOrEqual(20_000_000);
    expect(new Set(rents).size).toBeGreaterThan(40);
    for (const row of rows) {
      if (row.administrationFee !== null && row.administrationFee !== undefined) {
        expect(row.administrationFee).toBeLessThan(row.monthlyRent * 0.2);
      }
      expect(row.areaM2).toBeGreaterThan(20);
      expect(row.bedrooms).toBeGreaterThanOrEqual(1);
      expect(row.bathrooms).toBeGreaterThanOrEqual(1);
    }
  });

  it('gives every listing a substantive, distinct and explicitly fictional description', () => {
    const leads = listings.map((listing) => listing.lead);
    expect(new Set(leads).size).toBe(50);
    for (const row of rows) {
      expect(row.description.length).toBeGreaterThan(300);
      expect(row.description).toContain(DEMO_NOTICE);
      expect(row.amenities.length).toBeGreaterThanOrEqual(2);
      expect(row.summary.length).toBeLessThanOrEqual(160);
    }
  });

  it('features six properties for the landing page', () => {
    expect(rows.filter((row) => row.featured)).toHaveLength(6);
  });

  it('references only downloaded, non-empty image files with dimensions and alt text', () => {
    for (const image of allCatalogImages) {
      const entry = imageManifest[image.key];
      expect(entry, image.key).toBeDefined();
      const file = join(process.cwd(), 'public', entry?.src ?? '');
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(5_000);
      expect(image.alt.length).toBeGreaterThan(10);
    }
    for (const row of rows) {
      expect(row.images.length).toBeGreaterThanOrEqual(4);
      for (const image of row.images) {
        expect(image.width).toBeGreaterThan(0);
        expect(image.height).toBeGreaterThan(0);
        expect(image.blurDataURL.startsWith('data:image/webp;base64,')).toBe(true);
      }
    }
  });
});
