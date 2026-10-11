import { describe, expect, it } from 'vitest';
import type { PropertyRow } from '@/db/schema';
import { buildPropertyRows } from '@/db/seed/build';
import { toProperty } from '@/features/properties/server/queries';
import { propertyJsonLd } from '@/features/properties/seo';
import { rankSimilar, similarityScore } from '@/features/properties/similar';
import { formatArea, formatCOP, formatCOPShort, formatDate, propertyReference } from '@/shared/lib/format';
import { normalizeSearch, sanitizeText, slugify } from '@/shared/lib/text';
import { whatsappLink } from '@/shared/lib/whatsapp';
import { serializeJsonLd } from '@/shared/seo/metadata';

describe('text helpers', () => {
  it('normalises search text and slugs without accents', () => {
    expect(normalizeSearch('  Itagüí   Zúñiga ')).toBe('itagui zuniga');
    expect(slugify('Apartamento Esquina Carlos E.')).toBe('apartamento-esquina-carlos-e');
  });

  it('sanitises single-line and multi-line input', () => {
    expect(sanitizeText(' <b>Hola</b>\u0000  mundo ')).toBe('bHola/b mundo');
    expect(sanitizeText('uno\r\n\r\n\r\n\r\ndos  \t tres', { multiline: true })).toBe('uno\n\ndos tres');
  });
});

describe('formatting', () => {
  it('formats Colombian pesos and areas', () => {
    expect(formatCOP(4_600_000)).toBe('$ 4.600.000');
    expect(formatCOPShort(2_500_000)).toBe('$2,5 M');
    expect(formatArea(78)).toBe('78 m²');
    expect(formatDate('2026-10-06')).toBe('6 de octubre de 2026');
    expect(propertyReference('lum-007')).toBe('LUM-007');
  });

  it('builds an encoded WhatsApp link', () => {
    expect(whatsappLink('570000000000', 'Hola & más')).toBe('https://wa.me/570000000000?text=Hola%20%26%20m%C3%A1s');
  });
});

describe('similar properties', () => {
  const base = { id: 'a', type: 'casa', zone: 'envigado', municipality: 'envigado', monthlyRent: 10_000_000 } as const;

  it('prefers same type, then same zone, then a close budget', () => {
    const sameTypeZone = { ...base, id: 'b' };
    const sameTypeOtherZone = { ...base, id: 'c', zone: 'sabaneta', municipality: 'sabaneta' } as const;
    const otherType = { ...base, id: 'd', type: 'loft' } as const;
    expect(similarityScore(base, sameTypeZone)).toBeGreaterThan(similarityScore(base, sameTypeOtherZone));
    expect(similarityScore(base, sameTypeOtherZone)).toBeGreaterThan(similarityScore(base, otherType));
    expect(rankSimilar(base, [otherType, sameTypeOtherZone, base, sameTypeZone], 2).map((item) => item.id)).toEqual(['b', 'c']);
  });
});

describe('structured data', () => {
  it('describes a listing without unsupported claims and escapes markup', () => {
    const [row] = buildPropertyRows(new Date('2026-10-10T12:00:00Z'));
    if (!row) throw new Error('missing row');
    const property = toProperty({
      ...row,
      floor: row.floor ?? null,
      administrationFee: row.administrationFee ?? null,
      featured: true,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PropertyRow);
    const data = propertyJsonLd(property, new URL('https://lumina.example'));
    const listing = data['@graph'][0];
    expect(listing).toMatchObject({ '@type': 'RealEstateListing', url: `https://lumina.example/propiedades/${row.slug}` });
    const serialised = JSON.stringify(data);
    expect(serialised).not.toMatch(/aggregateRating|review/i);
    expect(serializeJsonLd({ text: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});
