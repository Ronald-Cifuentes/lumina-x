import { expect, type Page, test } from '@playwright/test';
import { queryE2E, upcomingVisitDate } from './support/db';

const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

const fillContact = async (scope: Page | ReturnType<Page['locator']>, email: string) => {
  await scope.getByLabel('Nombre completo').fill('Mariana Ochoa');
  await scope.getByLabel('Correo electrónico').fill(email);
  await scope.getByLabel('Teléfono o celular').fill('300 555 0101');
};

test.describe('rental workflows', () => {
  test('a property inquiry is validated, persisted and confirmed', async ({ page }) => {
    await page.goto('/propiedades/apartamento-balcon-de-astorga');
    const form = page.getByTestId('inquiry-form');
    const email = uniqueEmail('consulta');
    await fillContact(form, email);
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.getByRole('button', { name: 'Enviar consulta' }).click();

    const success = page.getByTestId('form-success');
    await expect(success).toContainText('Consulta enviada');
    const reference = (await success.getByTestId('form-reference').textContent())?.trim() ?? '';
    expect(reference).toMatch(/^[0-9A-F]{8}$/);

    const rows = await queryE2E<{ kind: string; property_id: string; id: string; message: string }>(
      'SELECT kind, property_id, id, message FROM inquiries WHERE email = ?',
      [email],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: 'consulta', property_id: 'lum-006' });
    expect(rows[0]?.id.slice(0, 8).toUpperCase()).toBe(reference);
    expect(rows[0]?.message).toContain('Apartamento Balcón de Astorga');
  });

  test('a visit request is stored as a request with its preferred date and time', async ({ page }) => {
    await page.goto('/propiedades/casa-aleros-del-escobero');
    await page.getByRole('tab', { name: 'Solicitar visita' }).click();
    const form = page.getByTestId('visit-form');
    await expect(form).toContainText('no una cita confirmada');
    const email = uniqueEmail('visita');
    const date = upcomingVisitDate();
    await fillContact(form, email);
    await form.getByLabel('Fecha preferida').fill(date);
    await form.getByLabel('Franja horaria').selectOption('10:00');
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.getByRole('button', { name: 'Solicitar visita' }).click();

    await expect(page.getByTestId('form-success')).toContainText('No es una cita confirmada');
    const rows = await queryE2E('SELECT kind, property_id, preferred_date, preferred_time, status FROM inquiries WHERE email = ?', [email]);
    expect(rows).toEqual([{ kind: 'visita', property_id: 'lum-025', preferred_date: date, preferred_time: '10:00', status: 'nuevo' }]);
  });

  test('invalid submissions fail safely with field errors and nothing stored', async ({ page }) => {
    await page.goto('/propiedades/apartamento-balcon-de-astorga');
    const form = page.getByTestId('inquiry-form');
    const email = 'esto-no-es-un-correo';
    await form.getByLabel('Nombre completo').fill('A');
    await form.getByLabel('Correo electrónico').fill(email);
    await form.getByLabel('Teléfono o celular').fill('12');
    await form.getByRole('button', { name: 'Enviar consulta' }).click();

    await expect(form.getByRole('alert')).toContainText('Revisa los campos marcados');
    await expect(form.getByLabel('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByText('Escribe un correo electrónico válido.')).toBeVisible();
    await expect(form.getByText('Debes aceptar el aviso de privacidad para continuar.')).toBeVisible();
    await expect(form.getByLabel('Nombre completo')).toBeFocused();
    await expect(form.getByLabel('Correo electrónico')).toHaveValue(email);
    await expect(page.getByTestId('form-success')).toHaveCount(0);
    expect(await queryE2E('SELECT id FROM inquiries WHERE email = ?', [email])).toHaveLength(0);
  });

  test('a visit date in the past is rejected by the server', async ({ page }) => {
    await page.goto('/propiedades/casa-aleros-del-escobero');
    await page.getByRole('tab', { name: 'Solicitar visita' }).click();
    const form = page.getByTestId('visit-form');
    const email = uniqueEmail('pasado');
    await fillContact(form, email);
    await form.getByLabel('Fecha preferida').fill('2024-01-02');
    await form.getByLabel('Franja horaria').selectOption('09:00');
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.getByRole('button', { name: 'Solicitar visita' }).click();
    await expect(form.getByText('Elige una fecha a partir de mañana.')).toBeVisible();
    expect(await queryE2E('SELECT id FROM inquiries WHERE email = ?', [email])).toHaveLength(0);
  });

  test('honeypot submissions are rejected without being stored', async ({ page }) => {
    await page.goto('/propiedades/apartamento-balcon-de-astorga');
    const form = page.getByTestId('inquiry-form');
    const email = uniqueEmail('bot');
    await fillContact(form, email);
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.locator('input[name="website"]').evaluate((input: HTMLInputElement) => {
      input.value = 'https://spam.example';
    });
    await form.getByRole('button', { name: 'Enviar consulta' }).click();
    await expect(form.getByRole('alert')).toContainText('No pudimos procesar la solicitud');
    await expect(page.getByTestId('form-success')).toHaveCount(0);
    expect(await queryE2E('SELECT id FROM inquiries WHERE email = ?', [email])).toHaveLength(0);
  });

  test('reserved properties do not accept visit requests', async ({ page }) => {
    await page.goto('/propiedades/penthouse-el-tesoro');
    await page.getByRole('tab', { name: 'Solicitar visita' }).click();
    await expect(page.getByRole('tabpanel', { name: 'Solicitar visita' })).toContainText('está reservado');
    await expect(page.getByTestId('visit-form')).toHaveCount(0);
  });

  test('the advisory request is persisted', async ({ page }) => {
    await page.goto('/contacto');
    const form = page.getByTestId('advisory-form');
    const email = uniqueEmail('asesoria');
    await fillContact(form, email);
    await form.getByLabel('¿Qué estás buscando?').fill('Apartamento de dos habitaciones en Laureles, con mascota.');
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.getByRole('button', { name: 'Solicitar asesoría' }).click();
    await expect(page.getByTestId('form-success')).toContainText('Asesoría solicitada');
    expect(await queryE2E('SELECT kind FROM inquiries WHERE email = ?', [email])).toEqual([{ kind: 'asesoria' }]);
  });

  test('the owner submission is persisted with structured data', async ({ page }) => {
    await page.goto('/propietarios');
    const form = page.getByTestId('owner-form');
    const email = uniqueEmail('propietario');
    await fillContact(form, email);
    await form.getByLabel('Tipo de inmueble').selectOption('apartamento');
    await form.getByLabel('Municipio').selectOption('envigado');
    await form.getByLabel('Barrio o sector').fill('Zúñiga');
    await form.getByLabel('Área (m²)').fill('96');
    await form.getByLabel('Habitaciones').fill('3');
    await form.getByLabel('Canon esperado (COP)').fill('5.400.000');
    await form.getByLabel(/Acepto el tratamiento/).check();
    await form.getByRole('button', { name: 'Enviar información del inmueble' }).click();
    await expect(page.getByTestId('form-success')).toContainText('Inmueble recibido');
    expect(await queryE2E('SELECT property_type, municipality, neighborhood, area_m2, bedrooms, expected_rent FROM owner_submissions WHERE email = ?', [email])).toEqual([
      { property_type: 'apartamento', municipality: 'envigado', neighborhood: 'Zúñiga', area_m2: 96, bedrooms: 3, expected_rent: 5_400_000 },
    ]);
  });

  test('the consent notice is accessible and links to the privacy policy', async ({ page }) => {
    await page.goto('/contacto');
    const consent = page.getByLabel(/Acepto el tratamiento/);
    await expect(consent).not.toBeChecked();
    await expect(consent).toHaveAccessibleDescription(/Usamos tu nombre, correo y teléfono solo para responder/);
    await expect(page.getByRole('link', { name: /aviso de privacidad/ }).first()).toHaveAttribute('href', '/privacidad');
  });

  test('the WhatsApp call to action uses the configured business number', async ({ page }) => {
    await page.goto('/propiedades/loft-ladrillo-provenza');
    const link = page.getByTestId('whatsapp-cta');
    await expect(link).toHaveAttribute('href', /^https:\/\/wa\.me\/570000000000\?text=Hola%2C%20me%20interesa%20Loft%20Ladrillo%20Provenza/);
  });
});
