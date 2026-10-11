import { expect, type Page, type Response, test } from '@playwright/test';
import { E2E_ADMIN } from './support/env';

const submitLogin = async (page: Page, password: string) => {
  await page.goto('/admin/login');
  await page.getByLabel('Correo').fill(E2E_ADMIN.email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
};

const isActionResponse = (response: Response) =>
  response.request().method() === 'POST' && response.url().includes('/admin/propiedades');

const login = async (page: Page) => {
  await submitLogin(page, E2E_ADMIN.password);
  await expect(page).toHaveURL(/\/admin$/);
};

test.describe('administration', () => {
  test('rejects unauthenticated visitors on every admin route', async ({ page, request }) => {
    for (const path of ['/admin', '/admin/propiedades', '/admin/propiedades/lum-001', '/admin/solicitudes']) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), path).toBe(307);
      expect(response.headers().location, path).toContain('/admin/login');
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login/);
      await expect(page.getByRole('heading', { name: 'Administración' })).toBeVisible();
    }
  });

  test('a forged session cookie is not accepted', async ({ page, context }) => {
    await context.addCookies([{ name: 'lumina_admin', value: 'x'.repeat(43), domain: 'localhost', path: '/' }]);
    await page.goto('/admin/propiedades');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('wrong credentials are refused with a generic message', async ({ page }) => {
    await submitLogin(page, 'contraseña-incorrecta-123');
    await expect(page.getByTestId('login-form').getByRole('alert')).toContainText('Correo o contraseña incorrectos.');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('an administrator manages availability and sees received inquiries', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();

    await page.goto('/admin/propiedades');
    const row = page.getByTestId('admin-row-apartamento-aves-maria');
    await row.getByLabel('Disponibilidad de Apartamento Aves María').selectOption('reservado');
    await Promise.all([page.waitForResponse(isActionResponse), row.getByRole('button', { name: 'Guardar' }).click()]);

    await page.goto('/propiedades/apartamento-aves-maria');
    await expect(page.locator('[data-availability]').first()).toHaveAttribute('data-availability', 'reservado');

    await page.goto('/admin/propiedades');
    await row.getByLabel('Disponibilidad de Apartamento Aves María').selectOption('disponible');
    await Promise.all([page.waitForResponse(isActionResponse), row.getByRole('button', { name: 'Guardar' }).click()]);
    await page.reload();
    await expect(row.getByLabel('Disponibilidad de Apartamento Aves María')).toHaveValue('disponible');

    await page.goto('/admin/solicitudes');
    await expect(page.getByRole('heading', { name: 'Solicitudes', level: 1 })).toBeVisible();

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('an administrator edits a property record with validation', async ({ page }) => {
    await login(page);
    await page.goto('/admin/propiedades/lum-048');
    const form = page.getByTestId('property-edit-form');
    await form.getByLabel('Canon mensual (COP)').fill('12');
    await form.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(form.getByRole('alert')).toContainText('Revisa los campos marcados');

    await form.getByLabel('Canon mensual (COP)').fill('2650000');
    await form.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(form.getByRole('status')).toContainText('Cambios guardados');
    await page.goto('/propiedades/loft-vidrio-calatrava');
    await expect(page.getByTestId('detail-rent')).toHaveText('$ 2.650.000');
  });
});
