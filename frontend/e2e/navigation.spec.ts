import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should have working navigation links or buttons', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find all interactive navigation elements (links or buttons)
    const navElements = page.locator('nav a, header a, [role="navigation"] a, nav button, header button, button[type="button"]');
    const count = await navElements.count();

    // Should have at least some interactive navigation elements
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate between pages without errors', async ({ page }) => {
    await page.goto('/');

    // Listen for console errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Try to navigate to common routes
    const routes = ['/', '/login'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Check that page loaded successfully
      const title = await page.title();
      expect(title).toBeTruthy();
    }

    // Should not have critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') && // Common benign error
      !e.includes('favicon')           // Missing favicon is not critical
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should handle 404 or redirect on invalid routes', async ({ page }) => {
    const response = await page.goto('/this-route-definitely-does-not-exist-12345');

    // Should either show 404, redirect to home, or show error page
    const is404 = response?.status() === 404;
    const redirectedHome = page.url().endsWith('/');
    const hasNotFoundText = await page.locator('text=/404|not found|page.*found/i')
      .isVisible({ timeout: 1000 })
      .catch(() => false);

    expect(is404 || redirectedHome || hasNotFoundText).toBe(true);
  });
});
