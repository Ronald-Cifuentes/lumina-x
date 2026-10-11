import { chromium, devices, type FullConfig } from '@playwright/test';
import { E2E_BASE_URL } from './support/env';

const WARM_PATHS = ['/', '/propiedades', '/propiedades/apartamento-mirador-de-los-balsos'];

/**
 * Next.js optimises images on first request. On a fresh server that first pass
 * is slow, so the image variants used by the desktop and mobile projects are
 * requested once here, the way a CDN would hold them in production.
 */
export default async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch();
  try {
    for (const device of [{ viewport: { width: 1440, height: 900 } }, devices['Pixel 7']]) {
      const context = await browser.newContext(device);
      const page = await context.newPage();
      for (const path of WARM_PATHS) {
        await page.goto(`${E2E_BASE_URL}${path}`, { waitUntil: 'load', timeout: 180_000 });
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += 700) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(100);
        }
        await page.waitForLoadState('networkidle', { timeout: 180_000 });
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
