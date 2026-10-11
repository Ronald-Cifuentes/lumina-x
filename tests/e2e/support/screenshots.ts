import type { Page } from '@playwright/test';

export const SCREENSHOT_DIR = 'docs/screenshots';

export const SCREENSHOT_PAGES = [
  ['inicio', '/'],
  ['propiedades', '/propiedades'],
  ['propiedades-filtradas', '/propiedades?zona=el-poblado&tipo=apartamento&orden=precio-desc'],
  ['ficha', '/propiedades/apartamento-mirador-de-los-balsos'],
  ['contacto', '/contacto'],
] as const;

/**
 * Waits for the page to settle before a capture or an audit. With `scroll`, it first walks the page so lazy images
 * load and one-time reveals run; viewport-only captures skip that walk.
 */
export const settle = async (page: Page, { scroll = true }: { scroll?: boolean } = {}) => {
  if (scroll) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(scroll ? 1_200 : 600);
};
