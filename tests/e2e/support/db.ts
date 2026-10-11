import { createClient } from '@libsql/client';
import { E2E_DATABASE_URL } from './env';

/** Direct read access to the e2e database, used to prove that submissions were really persisted. */
export const queryE2E = async <T = Record<string, unknown>>(sql: string, args: (string | number)[] = []): Promise<T[]> => {
  const client = createClient({ url: E2E_DATABASE_URL });
  try {
    const result = await client.execute({ sql, args });
    return result.rows as unknown as T[];
  } finally {
    client.close();
  }
};

/** Next Monday–Saturday date at least two days ahead, in YYYY-MM-DD (Bogotá). */
export const upcomingVisitDate = (): string => {
  const date = new Date(Date.now() + 2 * 86_400_000);
  while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
};
