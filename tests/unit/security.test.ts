import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { adminCookieName } from '@/features/admin/cookie';
import { hashPassword, verifyPassword } from '@/features/admin/password';
import { createSession, deleteSession, findSession, SESSION_TTL_MS } from '@/features/admin/session';
import { consumeRateLimit, consumeRateLimits } from '@/shared/security/rate-limit';
import { createTestDatabase, type TestDatabase } from './support/database';

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await createTestDatabase({ seed: false });
});

afterAll(() => testDb.cleanup());

describe('password hashing', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('una contraseña larga y única');
    expect(hash).toMatch(/^scrypt:16384:8:1:[\w-]+:[\w-]+$/);
    expect(hash).not.toContain('$');
    expect(await verifyPassword('una contraseña larga y única', hash)).toBe(true);
    expect(await verifyPassword('una contraseña larga y unica', hash)).toBe(false);
  });

  it('salts every hash and fails closed on malformed input', async () => {
    expect(await hashPassword('misma-clave-123')).not.toBe(await hashPassword('misma-clave-123'));
    for (const malformed of ['', 'scrypt', 'bcrypt:1:2:3:a:b', 'scrypt:0:8:1:abc:def', 'scrypt:16384:8:1:abc:short']) {
      expect(await verifyPassword('x', malformed)).toBe(false);
    }
  });
});

describe('database sessions', () => {
  it('creates, finds and deletes a session; only the token hash is stored', async () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const { token, expiresAt } = await createSession(testDb.db, 'admin@lumina.example', now);
    expect(expiresAt.getTime() - now.getTime()).toBe(SESSION_TTL_MS);
    const stored = await testDb.db.query.adminSessions.findMany();
    expect(stored.some((row) => row.id === token)).toBe(false);

    expect(await findSession(testDb.db, token, now)).toMatchObject({ email: 'admin@lumina.example' });
    expect(await findSession(testDb.db, `${token}x`, now)).toBeNull();
    expect(await findSession(testDb.db, undefined, now)).toBeNull();

    await deleteSession(testDb.db, token);
    expect(await findSession(testDb.db, token, now)).toBeNull();
  });

  it('expires sessions after their time to live', async () => {
    const now = new Date('2026-10-10T12:00:00Z');
    const { token } = await createSession(testDb.db, 'admin@lumina.example', now);
    expect(await findSession(testDb.db, token, new Date(now.getTime() + SESSION_TTL_MS + 1))).toBeNull();
  });

  it('uses a __Host- cookie only on https sites', () => {
    expect(adminCookieName('https://lumina.example')).toBe('__Host-lumina_admin');
    expect(adminCookieName('http://localhost:3000')).toBe('lumina_admin');
  });
});

describe('rate limiting', () => {
  it('allows up to the limit inside a window and recovers after it', async () => {
    const rule = { key: 'prueba:ventana', limit: 3, windowMs: 10_000 };
    const start = 1_000_000;
    expect((await consumeRateLimit(testDb.db, rule, start)).allowed).toBe(true);
    expect((await consumeRateLimit(testDb.db, rule, start + 1)).remaining).toBe(1);
    expect((await consumeRateLimit(testDb.db, rule, start + 2)).allowed).toBe(true);
    const blocked = await consumeRateLimit(testDb.db, rule, start + 3);
    expect(blocked).toMatchObject({ allowed: false, remaining: 0, retryAfterSeconds: 10 });
    expect((await consumeRateLimit(testDb.db, rule, start + 10_001)).allowed).toBe(true);
  });

  it('blocks when any combined rule is exhausted', async () => {
    const now = 5_000_000;
    const rules = [
      { key: 'prueba:cliente', limit: 10, windowMs: 60_000 },
      { key: 'prueba:global', limit: 1, windowMs: 60_000 },
    ];
    expect((await consumeRateLimits(testDb.db, rules, now)).allowed).toBe(true);
    expect((await consumeRateLimits(testDb.db, rules, now + 1)).allowed).toBe(false);
  });
});
