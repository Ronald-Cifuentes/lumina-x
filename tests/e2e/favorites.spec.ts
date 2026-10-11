import { expect, test } from '@playwright/test';

test.describe('favourites', () => {
  test('persist in the browser after a reload and appear on the favourites page', async ({ page }) => {
    await page.goto('/propiedades');
    const firstCard = page.getByTestId('property-grid').getByTestId('property-card').first();
    const slug = await firstCard.getAttribute('data-slug');
    const button = firstCard.getByRole('button', { name: /Guardar .* en favoritos/ });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('favorites-count')).toHaveText('1');

    await page.reload();
    const reloaded = page.locator(`[data-testid="property-grid"] [data-favorite="${slug}"]`);
    await expect(reloaded).toHaveAttribute('aria-pressed', 'true');

    await page.goto('/favoritos');
    const list = page.getByTestId('favorites-list');
    await expect(list.getByTestId('property-card')).toHaveCount(1);
    await expect(list.getByTestId('property-card')).toHaveAttribute('data-slug', slug ?? '');

    await list.getByRole('button', { name: /Guardar .* en favoritos/ }).click();
    await page.reload();
    await expect(page.getByTestId('favorites-empty')).toBeVisible();
  });

  test('can be saved from the detail page', async ({ page }) => {
    await page.goto('/propiedades/loft-suite-cumbres');
    const save = page.getByRole('button', { name: 'Guardar Loft Suite Cumbres en favoritos' });
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Guardar Loft Suite Cumbres en favoritos' })).toHaveAttribute('aria-pressed', 'true');
  });
});
