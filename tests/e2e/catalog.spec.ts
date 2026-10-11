import { expect, type Page, test } from '@playwright/test';

const grid = (page: Page) => page.getByTestId('property-grid');
const cards = (page: Page) => grid(page).getByTestId('property-card');
const rents = async (page: Page) =>
  (await grid(page).getByTestId('card-rent').evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute('data-value')))));

test.describe('rental storefront', () => {
  test('lists the catalogue in a three-column grid with a live count', async ({ page }) => {
    await page.goto('/propiedades');
    await expect(page.getByTestId('result-count')).toContainText('50 residencias · mostrando 1–12');
    await expect(cards(page)).toHaveCount(12);
    const columns = await grid(page).evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(3);
    const card = cards(page).first();
    await expect(card).toContainText('/mes');
    await expect(card).toContainText(/Adm\.|Sin administración/);
    await expect(card).toContainText('m²');
    await expect(card.locator('[data-availability]')).toBeVisible();
  });

  test('search, combined filters, sorting and pagination work together and stay in the URL', async ({ page }) => {
    await page.goto('/propiedades');

    await page.getByLabel('Buscar por nombre, barrio o municipio').fill('medellin');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await expect(page).toHaveURL(/\/propiedades\?q=medellin$/);
    await expect(page.getByTestId('result-count')).toContainText('24 residencias');

    const filters = page.getByTestId('filters-desktop');
    await filters.getByRole('radio', { name: 'Apartamento' }).check();
    await expect(page).toHaveURL(/q=medellin&tipo=apartamento/);
    await filters.getByLabel('Hasta').selectOption('10000000');
    await expect(page).toHaveURL(/precioMax=10000000/);
    await filters.getByRole('group', { name: 'Habitaciones' }).getByRole('radio', { name: '2+' }).check();
    await expect(page).toHaveURL(/habitaciones=2/);

    await page.getByLabel('Ordenar por').selectOption('precio-asc');
    await expect(page).toHaveURL(/orden=precio-asc/);
    await expect(page.getByTestId('result-count')).not.toContainText('Actualizando');
    const sorted = await rents(page);
    expect(sorted.length).toBeGreaterThan(0);
    expect(sorted).toEqual([...sorted].sort((a, b) => a - b));
    expect(sorted.every((rent) => rent <= 10_000_000)).toBe(true);

    const chips = page.getByRole('list', { name: 'Filtros activos' });
    await expect(chips).toContainText('“medellin”');
    await expect(chips).toContainText('Apartamento');
    await expect(chips).toContainText('Hasta $10 M');
    await expect(chips).toContainText('2+ habitaciones');

    await page.reload();
    await expect(page.getByRole('radio', { name: 'Apartamento' }).first()).toBeChecked();
    await expect(page.getByLabel('Ordenar por')).toHaveValue('precio-asc');
    expect(await rents(page)).toEqual(sorted);
  });

  test('pagination preserves filters and browser history', async ({ page }) => {
    await page.goto('/propiedades?mascotas=si&orden=precio-desc');
    await expect(page.getByTestId('result-count')).toContainText(/mostrando 1–12/);
    const firstPage = await rents(page);
    await page.getByRole('navigation', { name: 'Paginación' }).getByRole('link', { name: 'Página 2' }).click();
    await expect(page).toHaveURL(/mascotas=si&orden=precio-desc&pagina=2#resultados$/);
    await expect(page.getByTestId('result-count')).toContainText(/mostrando 13–/);
    // Cards of the previous page keep their exit animation for a moment after the URL changes.
    await expect
      .poll(async () => {
        const secondPage = await rents(page);
        return secondPage.length === 12 && Math.max(...secondPage) <= Math.min(...firstPage);
      })
      .toBe(true);
    await page.goBack();
    await expect(page).toHaveURL(/mascotas=si&orden=precio-desc$/);
    await expect(page.getByTestId('result-count')).toContainText(/mostrando 1–12/);
  });

  test('removing chips and clearing everything resets the result set', async ({ page }) => {
    await page.goto('/propiedades?zona=sabaneta&tipo=casa');
    await expect(page.getByTestId('result-count')).toContainText('2 residencias');
    await page.getByRole('list', { name: 'Filtros activos' }).getByRole('button', { name: /Casa/ }).click();
    await expect(page).toHaveURL(/\/propiedades\?zona=sabaneta$/);
    await expect(page.getByTestId('result-count')).toContainText('8 residencias');
    await page.getByRole('button', { name: 'Limpiar todo' }).click();
    await expect(page).toHaveURL(/\/propiedades$/);
    await expect(page.getByTestId('result-count')).toContainText('50 residencias');
  });

  test('shows a useful empty state with a reset action', async ({ page }) => {
    await page.goto('/propiedades?zona=itagui&tipo=casa&precioMin=20000000');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('result-count')).toContainText('Sin resultados');
    await page.getByRole('link', { name: 'Restablecer filtros' }).click();
    await expect(page).toHaveURL(/\/propiedades$/);
    await expect(cards(page)).toHaveCount(12);
  });

  test('editorial carousel is keyboard operable and reports progress', async ({ page }) => {
    await page.goto('/propiedades');
    const carousel = page.getByTestId('editorial-carousel');
    await expect(carousel.getByTestId('carousel-counter')).toContainText('01');
    const previous = carousel.getByRole('button', { name: 'Anterior' });
    const next = carousel.getByRole('button', { name: 'Siguiente' });
    await expect(previous).toBeDisabled();
    await next.click();
    await expect(previous).toBeEnabled();
    await expect(carousel.getByTestId('carousel-counter')).not.toContainText(/^\s*01/);
    const track = carousel.getByRole('list');
    await track.focus();
    const before = await track.evaluate((element) => element.scrollLeft);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before);
    const progress = await carousel.getByTestId('carousel-progress').evaluate((element) => getComputedStyle(element).transform);
    expect(progress).not.toBe('none');
  });

  test('cards link to their detail pages', async ({ page }) => {
    await page.goto('/propiedades?orden=precio-desc');
    await cards(page).first().getByRole('link').click();
    await expect(page).toHaveURL(/\/propiedades\/penthouse-el-tesoro$/);
  });
});
