import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDatabase, type Database } from '@/db/client';
import { runMigrations, seedProperties } from '@/db/maintenance';

export type TestDatabase = { db: Database; cleanup: () => void };

/** A throwaway SQLite file per test file, migrated and (optionally) seeded with the canonical catalogue. */
export const createTestDatabase = async ({ seed = true }: { seed?: boolean } = {}): Promise<TestDatabase> => {
  const directory = mkdtempSync(join(tmpdir(), 'lumina-test-'));
  const db = createDatabase(`file:${join(directory, 'test.db')}`);
  await runMigrations(db);
  if (seed) await seedProperties(db);
  return {
    db,
    cleanup: () => {
      db.$client.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
};
