import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vitest';
import { countProperties, runMigrations, seedProperties } from '@/db/maintenance';
import { properties } from '@/db/schema';
import { createTestDatabase, type TestDatabase } from './support/database';

let current: TestDatabase | undefined;

afterEach(() => {
  current?.cleanup();
  current = undefined;
});

describe('migrations and seed', () => {
  it('creates exactly 50 properties and re-running is idempotent', async () => {
    current = await createTestDatabase({ seed: false });
    const first = await seedProperties(current.db);
    expect(first).toMatchObject({ canonical: 50, before: 0, after: 50, inserted: 50 });

    await runMigrations(current.db);
    const second = await seedProperties(current.db);
    expect(second).toMatchObject({ before: 50, after: 50, inserted: 0 });
    expect(await countProperties(current.db)).toBe(50);
  });

  it('keeps admin edits on a normal re-seed and restores canonical values with reset', async () => {
    current = await createTestDatabase();
    await current.db.update(properties).set({ monthlyRent: 1 }).where(eq(properties.id, 'lum-001'));

    await seedProperties(current.db);
    const [kept] = await current.db.select().from(properties).where(eq(properties.id, 'lum-001'));
    expect(kept?.monthlyRent).toBe(1);

    await seedProperties(current.db, { reset: true });
    const [restored] = await current.db.select().from(properties).where(eq(properties.id, 'lum-001'));
    expect(restored?.monthlyRent).toBe(4_600_000);
    expect(await countProperties(current.db)).toBe(50);
  });
});
