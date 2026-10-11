import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';
import { resolveDatabaseConfig } from './src/db/config';

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: resolveDatabaseConfig(),
  strict: true,
  verbose: true,
});
