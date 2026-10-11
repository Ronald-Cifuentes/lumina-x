import { randomBytes, scryptSync } from 'node:crypto';

export const E2E_PORT = Number(process.env.E2E_PORT ?? 3947);
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
export const E2E_DATABASE_URL = 'file:./data/e2e.db';
export const E2E_WHATSAPP = '570000000000';

/** Test-only credentials for the isolated e2e server; never used by the real app configuration. */
export const E2E_ADMIN = { email: 'admin-e2e@lumina.example', password: 'solo-para-pruebas-e2e-2026' } as const;

/** Mirrors src/features/admin/password.ts (scrypt:N:r:p:salt:hash) synchronously for the Playwright config. */
export const hashForE2E = (password: string): string => {
  const salt = randomBytes(16);
  const key = scryptSync(password.normalize('NFKC'), salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return ['scrypt', 16_384, 8, 1, salt.toString('base64url'), key.toString('base64url')].join(':');
};
