import { expect, type Page, test } from '@playwright/test';

/** Cumulative Layout Shift (excluding shifts caused by input) while the page loads and is scrolled once. */
const measureLayoutShift = async (page: Page) => {
  await page.evaluate(() => {
    const store = window as unknown as { __cls: number };
    store.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) store.__cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(800);
  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
};

const largestContentfulPaint = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<{ tag: string; src: string; text: string; time: number }>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as unknown as { element: Element | null; startTime: number }[];
          const last = entries.at(-1);
          const element = last?.element;
          resolve({
            tag: element?.tagName ?? '',
            src: element instanceof HTMLImageElement ? element.currentSrc : '',
            text: element?.textContent?.slice(0, 60) ?? '',
            time: Math.round(last?.startTime ?? 0),
          });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );

test.describe('performance safeguards', () => {
  test('the hero photograph is preloaded and is the largest contentful paint', async ({ page }, testInfo) => {
    await page.goto('/');
    const preload = page.locator('link[rel="preload"][as="image"]');
    await expect(preload).toHaveCount(1);
    expect(await preload.getAttribute('imagesrcset')).toContain('%2Fimages%2Fsite%2Fhero.webp');
    expect(await page.locator('img[alt^="Casa contemporánea de dos niveles"]').getAttribute('loading')).not.toBe('lazy');

    const lcp = await largestContentfulPaint(page);
    testInfo.annotations.push({ type: 'LCP', description: `${lcp.tag} ${lcp.time} ms` });
    expect(lcp.tag === 'IMG' ? lcp.src : lcp.text).toMatch(/hero\.webp|No buscas un inmueble/);
  });

  test('below-the-fold imagery is lazy and media boxes reserve their space', async ({ page }, testInfo) => {
    await page.goto('/');
    const featured = page.getByTestId('featured-item').locator('img');
    await expect(featured).toHaveCount(6);
    for (const loading of await featured.evaluateAll((images) => images.map((image) => image.getAttribute('loading')))) {
      expect(loading).toBe('lazy');
    }
    const cls = await measureLayoutShift(page);
    testInfo.annotations.push({ type: 'CLS', description: cls.toFixed(4) });
    expect(cls).toBeLessThan(0.1);
  });

  test('catalogue and detail pages stay visually stable while loading', async ({ page }, testInfo) => {
    for (const path of ['/propiedades', '/propiedades/casa-aleros-del-escobero']) {
      await page.goto(path);
      const cls = await measureLayoutShift(page);
      testInfo.annotations.push({ type: `CLS ${path}`, description: cls.toFixed(4) });
      expect(cls, path).toBeLessThan(0.1);
    }
  });

  test('the storefront sends only the visible page of properties, not the whole dataset', async ({ request }) => {
    const html = await (await request.get('/propiedades')).text();
    const slugs = new Set([...html.matchAll(/data-slug="([a-z0-9-]+)"/g)].map((match) => match[1]));
    expect(slugs.size).toBeGreaterThan(0);
    expect(slugs.size).toBeLessThanOrEqual(18);
    const filtered = await (await request.get('/propiedades?pagina=2')).text();
    const pageTwo = new Set([...filtered.matchAll(/data-slug="([a-z0-9-]+)"/g)].map((match) => match[1]));
    expect(pageTwo.size).toBeLessThanOrEqual(12);
  });
});
