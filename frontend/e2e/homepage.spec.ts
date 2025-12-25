import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display the homepage', async ({ page }) => {
    await page.goto('/');

    // Check that page loaded
    await expect(page).toHaveTitle(/Captain Bitbeard/i);

    // Check for main heading or logo
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that we have some interactive elements (buttons, links, etc.)
    const buttons = page.locator('button, a[href]');
    await expect(buttons.first()).toBeVisible();
  });

  test('should have correct font loaded', async ({ page }) => {
    await page.goto('/');

    // Check that Press Start 2P font is available
    const fontFaceSet = await page.evaluate(() => {
      return document.fonts.check('12px "Press Start 2P"');
    });

    // If font is not immediately ready, wait for it
    if (!fontFaceSet) {
      await page.waitForTimeout(2000);
      const fontReady = await page.evaluate(() => {
        return document.fonts.check('12px "Press Start 2P"');
      });
      expect(fontReady).toBe(true);
    }
  });

  test('should not show only blue screen', async ({ page }) => {
    await page.goto('/');

    // Take a screenshot to verify visually
    await page.waitForLoadState('networkidle');

    // Check that there's actual content (not just background)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.trim().length).toBeGreaterThan(0);
  });
});
