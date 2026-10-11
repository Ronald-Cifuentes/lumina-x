export const DEFAULT_DATABASE_URL = 'file:./data/lumina.db';

export type DatabaseConfig = { url: string; authToken?: string };

type Env = Record<string, string | undefined>;

const filled = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * Where the app reads and writes its data.
 *
 * `DATABASE_URL`/`DATABASE_AUTH_TOKEN` win; `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` are the names that the Turso
 * integration of the Vercel Marketplace injects. Each URL keeps its own token. Without either, a local SQLite file
 * is used, which Vercel cannot provide (read-only, per-instance filesystem), so a deployment there fails loudly.
 */
export const resolveDatabaseConfig = (env: Env = process.env): DatabaseConfig => {
  const explicitUrl = filled(env.DATABASE_URL);
  const tursoUrl = filled(env.TURSO_DATABASE_URL);
  const url = explicitUrl ?? tursoUrl ?? DEFAULT_DATABASE_URL;
  const authToken = explicitUrl ? filled(env.DATABASE_AUTH_TOKEN) : tursoUrl ? filled(env.TURSO_AUTH_TOKEN) : undefined;

  if (filled(env.VERCEL) && url.startsWith('file:')) {
    throw new Error(
      'En Vercel la base de datos debe ser libSQL remota (Turso): define TURSO_DATABASE_URL y TURSO_AUTH_TOKEN ' +
        '(o DATABASE_URL y DATABASE_AUTH_TOKEN) en las variables de entorno del proyecto.',
    );
  }
  return authToken ? { url, authToken } : { url };
};
