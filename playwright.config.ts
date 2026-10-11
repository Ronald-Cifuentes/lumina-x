import { defineConfig, devices } from '@playwright/test';
import { E2E_ADMIN, E2E_BASE_URL, E2E_DATABASE_URL, E2E_PORT, E2E_WHATSAPP, hashForE2E } from './tests/e2e/support/env';

/**
 * End-to-end tests run against the production build (`next start`) with an
 * isolated SQLite database that is recreated before the server starts.
 * Run `pnpm build` first.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  // One retry absorbs the rare case where the OS kills the local server under memory pressure
  // (scripts/e2e-server.mjs restarts it and logs the exit); retried tests are reported as flaky.
  retries: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /.*\.mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      testMatch: /.*\.mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'pnpm --silent db:reset && node scripts/e2e-server.mjs',
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      E2E_PORT: String(E2E_PORT),
      DATABASE_URL: E2E_DATABASE_URL,
      SITE_URL: E2E_BASE_URL,
      WHATSAPP_BUSINESS_NUMBER: E2E_WHATSAPP,
      ADMIN_EMAIL: E2E_ADMIN.email,
      ADMIN_PASSWORD_HASH: hashForE2E(E2E_ADMIN.password),
      FORM_RATE_LIMIT_MAX: '1000',
      FORM_GLOBAL_RATE_LIMIT_MAX: '5000',
      LOGIN_RATE_LIMIT_MAX: '200',
    },
  },
});
