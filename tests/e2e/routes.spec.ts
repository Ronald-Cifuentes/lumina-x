import { expect, test } from '@playwright/test';
import { queryE2E } from './support/db';
import { E2E_BASE_URL } from './support/env';

test.describe('routes, SEO and data', () => {
  test('the database holds exactly 50 unique properties', async () => {
    const [stats] = await queryE2E<{ total: number; slugs: number; ids: number }>(
      'SELECT COUNT(*) AS total, COUNT(DISTINCT slug) AS slugs, COUNT(DISTINCT id) AS ids FROM properties',
    );
    expect(stats).toEqual({ total: 50, slugs: 50, ids: 50 });
  });

  test('every property listed in the sitemap resolves with its own page', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const urls = [...sitemap.matchAll(/<loc>([^<]+\/propiedades\/[^<]+)<\/loc>/g)].map((match) => match[1] ?? '');
    expect(urls).toHaveLength(50);
    const rows = await queryE2E<{ slug: string; name: string }>('SELECT slug, name FROM properties');
    const names = new Map(rows.map((row) => [row.slug, row.name]));
    for (const url of urls) {
      const path = new URL(url).pathname;
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      const slug = path.split('/').pop() ?? '';
      expect(html, path).toContain(`<link rel="canonical" href="${E2E_BASE_URL}${path}"/>`);
      expect(html).toContain((names.get(slug) ?? 'missing').replace(/&/g, '&amp;'));
    }
  });

  test('unknown properties return a real 404', async ({ request, page }) => {
    expect((await request.get('/propiedades/no-existe')).status()).toBe(404);
    expect((await request.get('/propiedades/%3Cscript%3E')).status()).toBe(404);
    await page.goto('/propiedades/no-existe');
    await expect(page.getByRole('heading', { name: 'Esta puerta no lleva a ninguna parte.' })).toBeVisible();
  });

  test('detail pages expose metadata, Open Graph and structured data', async ({ page }) => {
    await page.goto('/propiedades/casa-aleros-del-escobero');
    await expect(page).toHaveTitle('Casa Aleros del Escobero, Envigado · LÚMINA');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Canon \$ 15\.500\.000 al mes/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/images\/covers\/casa-03\.webp$/);
    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(jsonLd['@graph'][0]['@type']).toBe('RealEstateListing');
    expect(jsonLd['@graph'][0].offers.priceSpecification).toMatchObject({ price: 15_500_000, priceCurrency: 'COP' });
    expect(jsonLd['@graph'][1]['@type']).toBe('BreadcrumbList');
  });

  test('robots and filtered catalogue variants are handled for crawlers', async ({ request, page }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain(`Sitemap: ${E2E_BASE_URL}/sitemap.xml`);
    await page.goto('/propiedades?zona=laureles');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${E2E_BASE_URL}/propiedades`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('pages are served with a nonce-based Content Security Policy', async ({ request }) => {
    const response = await request.get('/');
    const policy = response.headers()['content-security-policy'] ?? '';
    expect(policy).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
    expect(policy).toContain("frame-ancestors 'none'");
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  });
});
