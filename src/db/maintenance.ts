import { resolve } from 'node:path';
import { count, getTableColumns, sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { Database } from './client';
import { properties } from './schema';
import { buildPropertyRows } from './seed/build';

export const MIGRATIONS_FOLDER = resolve(process.cwd(), 'drizzle');

export const runMigrations = (db: Database, migrationsFolder = MIGRATIONS_FOLDER) =>
  migrate(db, { migrationsFolder });

export const countProperties = async (db: Database): Promise<number> => {
  const [row] = await db.select({ value: count() }).from(properties);
  return row?.value ?? 0;
};

const PRESERVED_ON_RESET = new Set(['id', 'createdAt']);

const canonicalColumns = Object.fromEntries(
  Object.entries(getTableColumns(properties))
    .filter(([key]) => !PRESERVED_ON_RESET.has(key))
    .map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)]),
);

export type SeedResult = { canonical: number; before: number; after: number; inserted: number };

/**
 * Inserts the canonical catalogue. Existing rows (matched by slug) are kept
 * as they are, so admin edits survive; `reset` restores canonical values.
 */
export const seedProperties = async (
  db: Database,
  { reset = false }: { reset?: boolean } = {},
): Promise<SeedResult> => {
  const rows = buildPropertyRows();
  const before = await countProperties(db);
  const insert = db.insert(properties).values(rows);
  if (reset) {
    await insert.onConflictDoUpdate({ target: properties.slug, set: canonicalColumns });
  } else {
    await insert.onConflictDoNothing({ target: properties.slug });
  }
  const after = await countProperties(db);
  return { canonical: rows.length, before, after, inserted: after - before };
};
