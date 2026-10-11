import { expect, test } from '@playwright/test';
import { SCREENSHOT_DIR, SCREENSHOT_PAGES, settle } from './support/screenshots';

test.describe('desktop renderings', () => {
  for (const [name, path] of SCREENSHOT_PAGES) {
    test(`captures ${name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(path);
      await settle(page);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/desktop-${name}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });
  }
});
