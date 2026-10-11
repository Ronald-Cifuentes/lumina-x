import { describe, expect, it } from 'vitest';
import { DEFAULT_DATABASE_URL, resolveDatabaseConfig } from '@/db/config';
import { DEFAULT_SITE_URL, resolveSiteUrl } from '@/shared/config/site-url';

describe('database configuration', () => {
  it('uses the local SQLite file when nothing is configured', () => {
    expect(resolveDatabaseConfig({})).toEqual({ url: DEFAULT_DATABASE_URL });
    expect(resolveDatabaseConfig({ DATABASE_URL: '  ', TURSO_DATABASE_URL: '' })).toEqual({ url: DEFAULT_DATABASE_URL });
  });

  it('prefers DATABASE_URL with its own token over the Turso integration variables', () => {
    expect(
      resolveDatabaseConfig({
        DATABASE_URL: 'libsql://own.example.turso.io',
        DATABASE_AUTH_TOKEN: 'own-token',
        TURSO_DATABASE_URL: 'libsql://integration.example.turso.io',
        TURSO_AUTH_TOKEN: 'integration-token',
      }),
    ).toEqual({ url: 'libsql://own.example.turso.io', authToken: 'own-token' });
  });

  it('falls back to the variables injected by the Vercel Turso integration', () => {
    expect(
      resolveDatabaseConfig({ TURSO_DATABASE_URL: ' libsql://integration.example.turso.io ', TURSO_AUTH_TOKEN: 'integration-token' }),
    ).toEqual({ url: 'libsql://integration.example.turso.io', authToken: 'integration-token' });
    expect(resolveDatabaseConfig({ TURSO_DATABASE_URL: 'libsql://integration.example.turso.io', DATABASE_AUTH_TOKEN: 'other' })).toEqual({
      url: 'libsql://integration.example.turso.io',
    });
  });

  it('refuses a local SQLite file on Vercel', () => {
    expect(() => resolveDatabaseConfig({ VERCEL: '1' })).toThrow(/TURSO_DATABASE_URL/);
    expect(() => resolveDatabaseConfig({ VERCEL: '1', DATABASE_URL: 'file:./data/lumina.db' })).toThrow(/libSQL remota/);
    expect(resolveDatabaseConfig({ VERCEL: '1', TURSO_DATABASE_URL: 'libsql://db.example.turso.io', TURSO_AUTH_TOKEN: 't' })).toEqual({
      url: 'libsql://db.example.turso.io',
      authToken: 't',
    });
  });
});

describe('site URL', () => {
  it('prefers SITE_URL, then the Vercel production domain, then localhost', () => {
    expect(resolveSiteUrl({ SITE_URL: ' https://lumina.example ', VERCEL_PROJECT_PRODUCTION_URL: 'other.vercel.app' })).toBe(
      'https://lumina.example',
    );
    expect(resolveSiteUrl({ SITE_URL: '', VERCEL_PROJECT_PRODUCTION_URL: 'lumina-x.vercel.app' })).toBe('https://lumina-x.vercel.app');
    expect(resolveSiteUrl({})).toBe(DEFAULT_SITE_URL);
  });
});
