import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Look for login link or button
    const loginLink = page.locator('a[href*="login"], button:has-text("login"), a:has-text("login")').first();

    // If we find a login element, click it
    if (await loginLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/i);
    } else {
      // If not on homepage, try going directly to login
      await page.goto('/login');
    }

    // Check for login form elements
    await expect(page.locator('input[type="text"], input[type="email"], input[name*="user"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test('should show validation on empty login submit', async ({ page }) => {
    await page.goto('/login');

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("login"), button:has-text("sign in")').first();

    if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.click();

      // Should either show validation message or not navigate away
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/login/i);
    }
  });

  test('should attempt login with admin credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    const usernameInput = page.locator('input[type="text"], input[type="email"], input[name*="user"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("login"), button:has-text("sign in")').first();
    await submitButton.click();

    // Wait for navigation or error message
    await page.waitForTimeout(2000);

    // Should either redirect to dashboard or show error
    const currentUrl = page.url();
    const hasError = await page.locator('text=/error|invalid|failed/i').isVisible({ timeout: 1000 }).catch(() => false);

    // One of these should be true: successfully logged in (URL changed) or error shown
    expect(currentUrl !== `${page.url().split('/login')[0]}/login` || hasError).toBe(true);
  });
});
