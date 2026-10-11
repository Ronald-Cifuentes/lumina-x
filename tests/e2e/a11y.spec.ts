import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { settle } from './support/screenshots';

const PAGES = [
  '/',
  '/propiedades',
  '/propiedades?zona=el-poblado&mascotas=si',
  '/propiedades/apartamento-mirador-de-los-balsos',
  '/contacto',
  '/propietarios',
  '/favoritos',
  '/privacidad',
  '/admin/login',
];

test.describe('accessibility (WCAG 2.2 AA rules in axe-core)', () => {
  for (const path of PAGES) {
    test(`no serious or critical violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await settle(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations
        .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
        .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).slice(0, 3).join(' | ')}`);
      expect(blocking).toEqual([]);
    });
  }

  test('keyboard users can reach the filters and operate a radio group', async ({ page }) => {
    await page.goto('/propiedades');
    const laureles = page.getByTestId('filters-desktop').getByRole('radio', { name: 'Laureles' });
    await laureles.focus();
    await page.keyboard.press('Space');
    await expect(page).toHaveURL(/zona=laureles/);
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/zona=belen/);
  });
});
