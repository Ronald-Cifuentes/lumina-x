import { expect, type Page, test } from '@playwright/test';

const translateY = (page: Page, plane: string) =>
  page.locator(`[data-plane="${plane}"]`).evaluate((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return 0;
    return new DOMMatrixReadOnly(transform).m42;
  });

test.describe('motion system', () => {
  test('hero planes move at different speeds while scrolling natively', async ({ page }) => {
    await page.goto('/');
    expect(await translateY(page, 'background')).toBeCloseTo(0, 0);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await expect.poll(() => translateY(page, 'background')).toBeLessThan(-5);
    await expect.poll(() => translateY(page, 'fragment')).toBeLessThan(-15);
    const [background, fragment, foreground] = await Promise.all([
      translateY(page, 'background'),
      translateY(page, 'fragment'),
      translateY(page, 'foreground'),
    ]);
    expect(background).toBeGreaterThanOrEqual(-45);
    expect(fragment).toBeGreaterThanOrEqual(-110);
    expect(foreground).toBeGreaterThanOrEqual(-20);
    expect(Math.abs(fragment)).toBeGreaterThan(Math.abs(background));
    expect(Math.abs(background)).toBeGreaterThan(Math.abs(foreground));
  });

  test('editorial images reveal when scrolled into view', async ({ page }) => {
    await page.goto('/');
    const reveal = page.getByTestId('featured-item').first().locator('[data-reveal]');
    await reveal.scrollIntoViewIfNeeded();
    await expect.poll(() => reveal.evaluate((element) => getComputedStyle(element).clipPath)).toMatch(/inset\(0(%|px)?\)/);
  });

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('large spatial motion and the looping cue are disabled', async ({ page }) => {
      await page.goto('/');
      await page.mouse.wheel(0, 600);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
      await page.waitForTimeout(400);
      for (const plane of ['background', 'fragment', 'foreground']) {
        expect(await translateY(page, plane), plane).toBe(0);
      }
      const animation = await page.getByTestId('scroll-cue-line').evaluate((element) => getComputedStyle(element).animationName);
      expect(animation).toBe('none');
    });

    test('content is shown immediately instead of being revealed', async ({ page }) => {
      await page.goto('/');
      const reveal = page.getByTestId('featured-item').first().locator('[data-reveal]');
      await reveal.scrollIntoViewIfNeeded();
      await expect.poll(() => reveal.evaluate((element) => getComputedStyle(element).clipPath), { timeout: 2_000 }).toMatch(
        /inset\(0(%|px)?\)/,
      );
    });
  });
});
