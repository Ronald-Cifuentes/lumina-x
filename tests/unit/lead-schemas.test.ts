import { describe, expect, it } from 'vitest';
import { createAdvisorySchema, createVisitSchema, firstErrors, inquirySchema, ownerSchema, visitDateBounds } from '@/features/leads/schemas';

const NOW = new Date('2026-10-10T15:00:00Z');

const contact = {
  fullName: 'Valentina Restrepo',
  email: 'Valentina@Ejemplo.co ',
  phone: '+57 (300) 123-4567',
  consent: 'on',
};

describe('inquirySchema', () => {
  it('accepts and normalises a valid inquiry', () => {
    const parsed = inquirySchema.parse({ ...contact, propertyId: 'lum-002', message: '  Hola,\r\n\r\n\r\n¿sigue disponible?  ' });
    expect(parsed.email).toBe('valentina@ejemplo.co');
    expect(parsed.phone).toBe('+573001234567');
    expect(parsed.message).toBe('Hola,\n\n¿sigue disponible?');
    expect(parsed.consent).toBe(true);
  });

  it('reports a Spanish message per invalid field', () => {
    const result = inquirySchema.safeParse({ fullName: 'A', email: 'no-es-correo', phone: '12', propertyId: 'x', message: 'corto' });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = firstErrors(result.error);
    expect(Object.keys(errors).sort()).toEqual(['consent', 'email', 'fullName', 'message', 'phone', 'propertyId']);
    expect(errors.consent).toContain('aviso de privacidad');
  });

  it('strips markup and control characters before storing', () => {
    const parsed = inquirySchema.parse({
      ...contact,
      fullName: '<b>Ana</b>\u0007 María',
      propertyId: 'lum-010',
      message: '<img src=x onerror=alert(1)> Quiero visitar el apartamento',
    });
    expect(parsed.fullName).toBe('bAna/b María');
    expect(parsed.message).not.toContain('<');
    expect(parsed.message).not.toContain('>');
  });

  it('requires an explicit consent tick', () => {
    const result = inquirySchema.safeParse({ ...contact, consent: undefined, propertyId: 'lum-002', message: 'Mensaje suficientemente largo' });
    expect(result.success).toBe(false);
  });
});

describe('visit request schema', () => {
  const schema = createVisitSchema(NOW);
  const base = { ...contact, propertyId: 'lum-002', preferredTime: '10:00' };

  it('computes the allowed window in Bogotá time', () => {
    expect(visitDateBounds(NOW)).toEqual({ min: '2026-10-11', max: '2026-12-09' });
  });

  it('accepts a future weekday slot', () => {
    expect(schema.safeParse({ ...base, preferredDate: '2026-10-13' }).success).toBe(true);
  });

  it.each([
    ['2026-10-10', 'a partir de mañana'],
    ['2026-10-11', 'lunes a sábado'],
    ['2027-03-01', 'próximos 60 días'],
    ['2026-13-40', 'fecha válida'],
  ])('rejects %s', (preferredDate, message) => {
    const result = schema.safeParse({ ...base, preferredDate });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstErrors(result.error).preferredDate).toContain(message);
  });

  it('rejects a time outside the published slots', () => {
    const result = schema.safeParse({ ...base, preferredDate: '2026-10-13', preferredTime: '23:00' });
    expect(result.success).toBe(false);
  });
});

describe('advisory and owner schemas', () => {
  it('allows an advisory without a preferred date', () => {
    const parsed = createAdvisorySchema(NOW).parse({ ...contact, message: 'Busco apartamento en Laureles', preferredDate: '', preferredTime: '' });
    expect(parsed.preferredDate).toBeUndefined();
    expect(parsed.preferredTime).toBeUndefined();
  });

  it('parses owner numbers written with thousands separators', () => {
    const parsed = ownerSchema.parse({
      ...contact,
      propertyType: 'casa',
      municipality: 'envigado',
      neighborhood: 'Loma del Escobero',
      areaM2: '320',
      bedrooms: '4',
      expectedRent: '$ 12.500.000',
    });
    expect(parsed.expectedRent).toBe(12_500_000);
    expect(parsed.areaM2).toBe(320);
  });

  it('rejects unknown enums and absurd values', () => {
    const result = ownerSchema.safeParse({
      ...contact,
      propertyType: 'castillo',
      municipality: 'bogota',
      neighborhood: 'X',
      areaM2: '3',
      bedrooms: '40',
      expectedRent: '100',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(firstErrors(result.error)).sort()).toEqual(
        ['areaM2', 'bedrooms', 'expectedRent', 'municipality', 'neighborhood', 'propertyType'].sort(),
      );
    }
  });
});
