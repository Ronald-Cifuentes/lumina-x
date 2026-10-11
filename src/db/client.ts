import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export const DEFAULT_DATABASE_URL = 'file:./data/lumina.db';

const ensureLocalDirectory = (url: string) => {
  if (!url.startsWith('file:')) return;
  const path = url.slice('file:'.length);
  if (path === ':memory:' || path.length === 0) return;
  mkdirSync(dirname(resolve(path)), { recursive: true });
};

export const createDatabase = (url: string, authToken?: string) => {
  ensureLocalDirectory(url);
  const client = createClient(authToken ? { url, authToken } : { url });
  return drizzle({ client, schema });
};

export type Database = ReturnType<typeof createDatabase>;

const globalForDatabase = globalThis as typeof globalThis & { luminaDatabase?: Database };

export const getDatabase = (): Database => {
  globalForDatabase.luminaDatabase ??= createDatabase(
    process.env.DATABASE_URL || DEFAULT_DATABASE_URL,
    process.env.DATABASE_AUTH_TOKEN || undefined,
  );
  return globalForDatabase.luminaDatabase;
};
