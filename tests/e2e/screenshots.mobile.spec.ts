import { expect, test } from '@playwright/test';
import { SCREENSHOT_DIR, SCREENSHOT_PAGES, settle } from './support/screenshots';

test.describe('mobile renderings', () => {
  for (const [name, path] of SCREENSHOT_PAGES) {
    test(`captures ${name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(path);
      await settle(page, { scroll: false });
      await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-${name}.png`, fullPage: false });
      expect(errors).toEqual([]);
    });
  }
});
