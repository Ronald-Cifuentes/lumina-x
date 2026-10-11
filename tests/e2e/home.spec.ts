import { expect, test } from '@playwright/test';

test.describe('landing page', () => {
  test('renders the editorial hero with headline, CTAs, search and scroll cue', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /No buscas un inmueble\. Buscas cómo quieres vivir\./ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar propiedades' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Agenda una asesoría' }).first()).toBeVisible();
    await expect(page.getByRole('search', { name: 'Buscar propiedades en arriendo' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Desliza/ })).toBeVisible();
    await expect(page.locator('[data-plane="background"]')).toHaveCount(1);
    await expect(page.locator('[data-plane="fragment"]')).toHaveCount(1);
    await expect(page.locator('[data-plane="foreground"]')).toHaveCount(1);
    await expect(page.getByText('Portafolio demostrativo', { exact: true }).first()).toBeVisible();
  });

  test('hero search sends clean, shareable parameters to the storefront', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('search', { name: 'Buscar propiedades en arriendo' });
    await search.getByLabel('Ubicación').selectOption('envigado');
    await search.getByLabel('Tipo').selectOption('casa');
    await search.getByRole('button', { name: 'Buscar residencias' }).click();
    await expect(page).toHaveURL(/\/propiedades\?zona=envigado&tipo=casa$/);
    await expect(page.getByTestId('result-count')).toContainText(/\d+ residencias?/);
    const cards = page.getByTestId('property-grid').getByTestId('property-card');
    await expect(cards.first()).toContainText('Casa · Envigado');
  });

  test('shows six featured residences that open their detail pages', async ({ page }) => {
    await page.goto('/');
    const featured = page.getByTestId('featured-item');
    await expect(featured).toHaveCount(6);
    const first = featured.first().getByRole('link');
    const href = await first.getAttribute('href');
    expect(href).toMatch(/^\/propiedades\/[a-z0-9-]+$/);
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByTestId('property-title')).toBeVisible();
  });

  test('neighbourhood panels filter the catalogue by area', async ({ page }) => {
    await page.goto('/');
    for (const zone of ['el-poblado', 'laureles', 'envigado', 'sabaneta']) {
      await expect(page.getByTestId(`zone-panel-${zone}`)).toHaveAttribute('href', `/propiedades?zona=${zone}`);
    }
    await page.getByTestId('zone-panel-laureles').click();
    await expect(page).toHaveURL(/zona=laureles/);
    await expect(page.getByRole('radio', { name: 'Laureles' }).first()).toBeChecked();
    await expect(page.getByTestId('result-count')).toContainText('8 residencias');
  });

  test('includes trust and conversion paths without invented social proof', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Un proceso claro, sin letra pequeña.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Inscribe tu inmueble' })).toHaveAttribute('href', '/propietarios');
    const html = (await page.content()).toLowerCase();
    for (const forbidden of ['testimonio', 'calificación', 'estrellas', 'clientes satisfechos', 'aggregaterating']) {
      expect(html).not.toContain(forbidden);
    }
    await expect(page.getByTestId('demo-disclaimer')).toContainText('no constituyen una oferta real');
  });

  test('has no horizontal overflow on desktop', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
