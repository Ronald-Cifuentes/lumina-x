import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL ?? 'file:./data/lumina.db';
const authToken = process.env.DATABASE_AUTH_TOKEN;

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: authToken ? { url, authToken } : { url },
  strict: true,
  verbose: true,
});
