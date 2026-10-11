import { expect, test } from '@playwright/test';

test.describe('property detail page', () => {
  test('shows the complete rental information without waiting for animations', async ({ page }) => {
    await page.goto('/propiedades/apartamento-mirador-de-los-balsos');
    await expect(page.getByTestId('property-title')).toHaveText('Apartamento Mirador de Los Balsos');
    await expect(page.getByTestId('detail-rent')).toHaveText('$ 12.800.000');
    await expect(page.getByTestId('detail-admin-fee')).toHaveText('+ administración $ 1.450.000 al mes');
    await expect(page.locator('[data-availability="disponible"]').first()).toBeVisible();
    const facts = page.getByTestId('key-facts');
    for (const text of ['210 m²', 'Habitaciones', 'Baños', 'Parqueaderos']) await expect(facts).toContainText(text);
    await expect(page.getByText('Ficha ficticia con fines demostrativos.', { exact: false })).toBeVisible();
    await expect(page.getByText('Imágenes ilustrativas').first()).toBeVisible();
  });

  test('features and detailed information are collapsible', async ({ page }) => {
    await page.goto('/propiedades/apartamento-mirador-de-los-balsos');
    const amenities = page.getByTestId('amenities');
    await expect(amenities).toHaveAttribute('open', '');
    await expect(amenities.getByText('Piscina')).toBeVisible();
    await amenities.locator('summary').click();
    await expect(amenities.getByText('Piscina')).toBeHidden();
    const details = page.getByTestId('details');
    await expect(details.getByText('Estrato')).toBeHidden();
    await details.locator('summary').click();
    await expect(details.getByText('Estrato')).toBeVisible();
    await expect(details).toContainText('LUM-002');
  });

  test('the gallery lightbox supports keyboard navigation and restores focus', async ({ page }) => {
    await page.goto('/propiedades/apartamento-mirador-de-los-balsos');
    const trigger = page.getByRole('button', { name: /Ampliar fotografía 2 de 5/ });
    await trigger.click();
    const lightbox = page.getByTestId('lightbox');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('02');
    await page.keyboard.press('ArrowRight');
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('03');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('01');
    await lightbox.getByRole('button', { name: 'Fotografía anterior' }).click();
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('05');
    await expect(lightbox.locator('img')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a photograph that fails to load is replaced by the designed fallback', async ({ page }) => {
    await page.route(/\/_next\/image\?url=%2Fimages%2Fcovers%2Fapto-14\.webp/, (route) => route.abort());
    await page.goto('/propiedades/apartamento-mirador-de-los-balsos');
    const fallback = page.getByTestId('image-fallback').first();
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveAccessibleName(/fotografía no disponible/);
    await expect(page.getByTestId('property-title')).toBeVisible();
  });

  test('similar properties are suggested and link to real pages', async ({ page }) => {
    await page.goto('/propiedades/casa-aleros-del-escobero');
    const similar = page.getByTestId('similar-properties').getByTestId('property-card');
    await expect(similar).toHaveCount(3);
    await expect(similar.first()).toContainText('Casa');
    await similar.first().getByRole('link').click();
    await expect(page).toHaveURL(/\/propiedades\/casa-/);
  });
});
