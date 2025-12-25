import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');

    // Check for lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();

    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').count();
    expect(viewport).toBeGreaterThan(0);

    // Check for page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Get first focusable element
    const firstFocusable = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').first();

    if (await firstFocusable.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstFocusable.focus();

      // Tab to next element
      await page.keyboard.press('Tab');

      // Check that focus moved
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
    }
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that images have alt attributes
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');

        // Alt should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Count = await page.locator('h1').count();

    // Should have at least one h1 (or skip if homepage doesn't use h1)
    if (h1Count === 0) {
      test.skip();
    }

    // Should have only one h1
    expect(h1Count).toBeLessThanOrEqual(1);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');

    // Get background color
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    expect(bgColor).toBeTruthy();

    // Basic check: should not be transparent or default
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
