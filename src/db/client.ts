import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { resolveDatabaseConfig } from './config';
import * as schema from './schema';

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
  if (!globalForDatabase.luminaDatabase) {
    const { url, authToken } = resolveDatabaseConfig();
    globalForDatabase.luminaDatabase = createDatabase(url, authToken);
  }
  return globalForDatabase.luminaDatabase;
};
