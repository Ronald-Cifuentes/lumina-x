import { count, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { inquiries, ownerSubmissions, properties } from '@/db/schema';
import {
  type LeadContext,
  PERSISTENCE_FAILURE,
  SPAM_REJECTION,
  submitAdvisoryLead,
  submitOwnerLead,
  submitPropertyLead,
} from '@/features/leads/service';
import { createTestDatabase, type TestDatabase } from './support/database';

const NOW = new Date('2026-10-10T15:00:00Z');
let testDb: TestDatabase;

const context = (overrides: Partial<LeadContext> = {}): LeadContext => ({
  db: testDb.db,
  clientKey: `cliente-${Math.random()}`,
  limits: { perClient: 5, global: 100, windowMs: 60_000 },
  now: NOW,
  ...overrides,
});

const inquiry = {
  fullName: 'Camilo Arango',
  email: 'camilo@example.com',
  phone: '3001234567',
  consent: 'on',
  propertyId: 'lum-002',
  message: 'Hola, ¿sigue disponible el apartamento?',
};

const countRows = async (table: typeof inquiries | typeof ownerSubmissions) => {
  const [row] = await testDb.db.select({ value: count() }).from(table);
  return row?.value ?? 0;
};

beforeAll(async () => {
  testDb = await createTestDatabase();
});

afterAll(() => testDb.cleanup());

describe('property inquiries and visit requests', () => {
  it('persists a valid inquiry and returns a tracking reference', async () => {
    const result = await submitPropertyLead('consulta', inquiry, context());
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.reference).toMatch(/^[0-9A-F]{8}$/);
    const rows = await testDb.db.select().from(inquiries).where(eq(inquiries.email, 'camilo@example.com'));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'consulta', propertyId: 'lum-002', status: 'nuevo', consentVersion: 'aviso-privacidad-2026-10' });
  });

  it('persists a visit request as a request, not a confirmed booking', async () => {
    const result = await submitPropertyLead(
      'visita',
      { ...inquiry, email: 'visita@example.com', message: '', preferredDate: '2026-10-14', preferredTime: '15:00' },
      context(),
    );
    expect(result.status).toBe('success');
    if (result.status === 'success') expect(result.message).toContain('No es una cita confirmada');
    const [row] = await testDb.db.select().from(inquiries).where(eq(inquiries.email, 'visita@example.com'));
    expect(row).toMatchObject({ kind: 'visita', preferredDate: '2026-10-14', preferredTime: '15:00', message: null });
  });

  it('rejects invalid submissions without writing anything and echoes the values', async () => {
    const before = await countRows(inquiries);
    const result = await submitPropertyLead('consulta', { ...inquiry, email: 'mal', consent: '' }, context());
    expect(result.status).toBe('error');
    if (result.status === 'error') {
      expect(result.fieldErrors).toMatchObject({ email: expect.any(String), consent: expect.any(String) });
      expect(result.values?.fullName).toBe('Camilo Arango');
    }
    expect(await countRows(inquiries)).toBe(before);
  });

  it('silently refuses honeypot submissions without storing them or reporting success', async () => {
    const before = await countRows(inquiries);
    const result = await submitPropertyLead('consulta', { ...inquiry, website: 'https://spam.example' }, context());
    expect(result).toEqual({ status: 'error', message: SPAM_REJECTION });
    expect(await countRows(inquiries)).toBe(before);
  });

  it('refuses unknown, unpublished and reserved properties appropriately', async () => {
    expect((await submitPropertyLead('consulta', { ...inquiry, propertyId: 'lum-999' }, context())).status).toBe('error');

    await testDb.db.update(properties).set({ published: false }).where(eq(properties.id, 'lum-003'));
    expect((await submitPropertyLead('consulta', { ...inquiry, propertyId: 'lum-003' }, context())).status).toBe('error');

    const reserved = await submitPropertyLead(
      'visita',
      { ...inquiry, propertyId: 'lum-005', preferredDate: '2026-10-14', preferredTime: '10:00' },
      context(),
    );
    expect(reserved.status).toBe('error');
    if (reserved.status === 'error') expect(reserved.message).toContain('reservado');
  });

  it('rate limits repeated submissions from the same client', async () => {
    const shared = context({ clientKey: 'cliente-insistente', limits: { perClient: 2, global: 100, windowMs: 60_000 } });
    expect((await submitPropertyLead('consulta', { ...inquiry, email: 'r1@example.com' }, shared)).status).toBe('success');
    expect((await submitPropertyLead('consulta', { ...inquiry, email: 'r2@example.com' }, shared)).status).toBe('success');
    const blocked = await submitPropertyLead('consulta', { ...inquiry, email: 'r3@example.com' }, shared);
    expect(blocked.status).toBe('error');
    if (blocked.status === 'error') expect(blocked.message).toContain('demasiadas solicitudes');
    expect(await testDb.db.select().from(inquiries).where(eq(inquiries.email, 'r3@example.com'))).toHaveLength(0);
  });

  it('never reports success when the database write fails', async () => {
    const failing = context();
    const original = failing.db.insert.bind(failing.db);
    const spy = vi.spyOn(failing.db, 'insert');
    // Two rate-limit upserts succeed; the inquiry insert itself fails.
    spy.mockImplementationOnce(original).mockImplementationOnce(original).mockImplementationOnce(() => {
      throw new Error('disco lleno');
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await submitPropertyLead('consulta', { ...inquiry, email: 'falla@example.com' }, failing);
    expect(result).toEqual({ status: 'error', message: PERSISTENCE_FAILURE });
    spy.mockRestore();
    expect(await testDb.db.select().from(inquiries).where(eq(inquiries.email, 'falla@example.com'))).toHaveLength(0);
  });
});

describe('advisory and owner submissions', () => {
  it('stores an advisory request', async () => {
    const result = await submitAdvisoryLead(
      { ...inquiry, email: 'asesoria@example.com', propertyId: undefined, message: 'Busco casa con jardín en Envigado', preferredDate: '', preferredTime: '' },
      context(),
    );
    expect(result.status).toBe('success');
    const [row] = await testDb.db.select().from(inquiries).where(eq(inquiries.email, 'asesoria@example.com'));
    expect(row).toMatchObject({ kind: 'asesoria', propertyId: null, preferredDate: null });
  });

  it('stores an owner submission with parsed numbers', async () => {
    const before = await countRows(ownerSubmissions);
    const result = await submitOwnerLead(
      {
        ...inquiry,
        email: 'propietaria@example.com',
        propertyType: 'apartamento',
        municipality: 'sabaneta',
        neighborhood: 'Aves María',
        areaM2: '82',
        bedrooms: '2',
        expectedRent: '3.200.000',
      },
      context(),
    );
    expect(result.status).toBe('success');
    expect(await countRows(ownerSubmissions)).toBe(before + 1);
    const [row] = await testDb.db.select().from(ownerSubmissions).where(eq(ownerSubmissions.email, 'propietaria@example.com'));
    expect(row).toMatchObject({ expectedRent: 3_200_000, areaM2: 82, bedrooms: 2, municipality: 'sabaneta' });
  });
});
