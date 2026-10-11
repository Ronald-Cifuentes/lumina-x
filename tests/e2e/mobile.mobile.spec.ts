import { expect, type Page, test } from '@playwright/test';

const touchScroll = async (page: Page, x: number, y: number, xDistance: number, yDistance: number) => {
  const session = await page.context().newCDPSession(page);
  await session.send('Input.synthesizeScrollGesture', {
    x,
    y,
    xDistance,
    yDistance,
    gestureSourceType: 'touch',
    speed: 1_500,
    repeatCount: 1,
  });
  await session.detach();
};

test.describe('mobile experience', () => {
  test('pages fit the viewport without horizontal scrolling', async ({ page }) => {
    for (const path of ['/', '/propiedades', '/propiedades/casa-aleros-del-escobero', '/contacto', '/propietarios']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test('the navigation menu opens as a modal, closes with Escape and restores focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Abrir menú' });
    await trigger.click();
    const menu = page.getByRole('dialog', { name: 'Menú' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link', { name: /Propiedades/ })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await menu.getByRole('link', { name: /Agenda una asesoría/ }).click();
    await expect(page).toHaveURL(/\/contacto$/);
    await expect(menu).toBeHidden();
  });

  test('the filter drawer filters live and returns focus when closed', async ({ page }) => {
    await page.goto('/propiedades');
    const trigger = page.getByRole('button', { name: /^Filtros/ });
    await trigger.click();
    const drawer = page.getByRole('dialog', { name: 'Filtros' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('radio', { name: 'Envigado' }).check();
    await expect(page).toHaveURL(/zona=envigado/);
    await drawer.getByRole('group', { name: 'Tipo de inmueble' }).getByRole('radio', { name: 'Casa' }).check();
    await expect(page).toHaveURL(/zona=envigado&tipo=casa/);
    await expect(drawer.getByRole('button', { name: /Ver 4 residencias/ })).toBeVisible();
    await drawer.getByRole('button', { name: /Ver 4 residencias/ }).click();
    await expect(drawer).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByTestId('property-grid').getByTestId('property-card')).toHaveCount(4);
    await expect(trigger).toContainText('2');
  });

  test('touch scrolling moves the page natively and the hero never blocks it', async ({ page }) => {
    await page.goto('/');
    await touchScroll(page, 200, 600, 0, -900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
  });

  test('the editorial carousel scrolls horizontally by touch', async ({ page }) => {
    await page.goto('/propiedades');
    const track = page.getByTestId('editorial-carousel').getByRole('list');
    await track.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    if (!box) throw new Error('carousel not rendered');
    await touchScroll(page, box.x + box.width * 0.8, box.y + 120, -350, 0);
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(50);
  });

  test('the gallery opens a lightbox that can be swiped and closed', async ({ page }) => {
    await page.goto('/propiedades/loft-ladrillo-provenza');
    await page.getByRole('button', { name: /Ampliar fotografía 1 de 5/ }).click();
    const lightbox = page.getByTestId('lightbox');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('01');
    await lightbox.getByRole('button', { name: 'Fotografía siguiente' }).click();
    await expect(lightbox.getByTestId('lightbox-counter')).toContainText('02');
    await lightbox.getByRole('button', { name: 'Cerrar galería' }).click();
    await expect(lightbox).toBeHidden();
  });

  test('the primary contact action stays reachable on property pages', async ({ page }) => {
    await page.goto('/propiedades/casa-aleros-del-escobero');
    const bar = page.getByTestId('mobile-contact-bar');
    await expect(bar).toBeVisible();
    await touchScroll(page, 200, 600, 0, -1200);
    await expect(bar).toBeVisible();
    await bar.getByRole('link', { name: 'Consultar' }).click();
    await expect(page.getByRole('heading', { name: '¿Te interesa esta residencia?' })).toBeInViewport();
  });
});
