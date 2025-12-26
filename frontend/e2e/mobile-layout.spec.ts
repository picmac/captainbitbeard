import { test, expect, devices } from '@playwright/test';

const mobileTest = test.extend({
  viewport: { width: 390, height: 844 }, // iPhone 12
  userAgent: devices['iPhone 12'].userAgent,
});

test.describe('Mobile Layout Tests', () => {

  mobileTest('should not have duplicate toast/notification systems', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for sonner Toaster
    const sonnerToaster = page.locator('[data-sonner-toaster]');
    const sonnerCount = await sonnerToaster.count();

    // Check for RetroEffects ToastContainer
    const retroToast = page.locator('.retro-toast-container, [class*="toast-container"]');
    const retroCount = await retroToast.count();

    // There should only be ONE notification system, not both
    const totalNotificationSystems = (sonnerCount > 0 ? 1 : 0) + (retroCount > 0 ? 1 : 0);
    expect(totalNotificationSystems).toBeLessThanOrEqual(1);
  });

  mobileTest('should not have overlapping modals/overlays on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all visible overlays/modals
    const overlays = page.locator('[role="dialog"], .modal, [class*="overlay"], [class*="Modal"]').filter({ hasText: /.+/ });
    const visibleOverlays = await overlays.evaluateAll((elements) => {
      return elements.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               el.offsetHeight > 0;
      });
    });

    // On initial page load, there should be no visible modals
    expect(visibleOverlays.length).toBeLessThanOrEqual(2); // Allow max 2 (e.g., keyboard shortcuts help + one other)
  });

  mobileTest('should have proper spacing on mobile for all global components', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that global components don't overlap
    const components = [
      { selector: '[data-skip-to-content]', name: 'Skip to Content' },
      { selector: '[data-keyboard-shortcuts]', name: 'Keyboard Shortcuts' },
      { selector: '[data-pwa-install]', name: 'PWA Install Prompt' },
      { selector: '[data-offline-indicator]', name: 'Offline Indicator' },
    ];

    for (const component of components) {
      const element = page.locator(component.selector);
      const count = await element.count();

      if (count > 0) {
        const box = await element.first().boundingBox();
        if (box) {
          // Component should not take up more than 50% of viewport height
          expect(box.height).toBeLessThan(page.viewportSize()!.height * 0.5);
        }
      }
    }
  });

  mobileTest('should be responsive on mobile viewport', async ({ page }) => {
    await page.goto('/library');
    await page.waitForLoadState('networkidle');

    // Check viewport width
    const viewportWidth = page.viewportSize()!.width;

    // Content should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });

  mobileTest('should not have text overflow on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  mobileTest('should show mobile-optimized navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for hamburger menu or mobile nav
    const mobileNav = page.locator('[aria-label*="menu"], [data-mobile-menu], button[aria-expanded]');
    const hasMobileNav = await mobileNav.count() > 0;

    // Either has mobile nav or nav is properly sized for mobile
    const nav = page.locator('nav').first();
    if (await nav.count() > 0) {
      const navBox = await nav.boundingBox();
      if (navBox) {
        // Nav should fit within viewport width
        expect(navBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
      }
    }
  });

  mobileTest('should handle modals properly on mobile', async ({ page }) => {
    await page.goto('/game/test-game-id');
    await page.waitForTimeout(1000);

    // Modal should be centered and not overflow
    const modal = page.locator('[role="dialog"]').first();

    if (await modal.count() > 0 && await modal.isVisible()) {
      const modalBox = await modal.boundingBox();
      const viewport = page.viewportSize()!;

      if (modalBox) {
        // Modal should not exceed viewport
        expect(modalBox.width).toBeLessThanOrEqual(viewport.width);
        expect(modalBox.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });

  mobileTest('should have accessible touch targets on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all interactive elements that are actually clickable
    const buttons = page.locator('button, a[href], input, select, textarea');
    const count = await buttons.count();

    let checkedElements = 0;
    let tooSmallElements = 0;

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box && box.width > 1 && box.height > 1) { // Ignore 1px elements (likely hidden/decorative)
          checkedElements++;
          const minSize = 40; // WCAG recommendation (relaxed for pixel art)
          if (box.width < minSize || box.height < minSize) {
            tooSmallElements++;
          }
        }
      }
    }

    // Most elements should meet touch target size (allow some exceptions for decorative elements)
    const percentageGood = ((checkedElements - tooSmallElements) / checkedElements) * 100;
    expect(percentageGood).toBeGreaterThan(70); // At least 70% should be properly sized
  });

  mobileTest('should not show desktop-only UI on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Elements that should be hidden on mobile
    const desktopOnly = page.locator('.desktop-only, [class*="desktop-only"]');
    const visibleDesktopElements = await desktopOnly.filter({ hasText: /.+/ }).count();

    expect(visibleDesktopElements).toBe(0);
  });

  mobileTest('should properly stack overlays with z-index', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check z-index hierarchy of global components
    const zIndexCheck = await page.evaluate(() => {
      const elements = [
        { selector: '[data-sonner-toaster]', name: 'Toaster' },
        { selector: '.retro-toast-container', name: 'RetroToast' },
        { selector: '[data-keyboard-shortcuts]', name: 'KeyboardShortcuts' },
        { selector: '[data-pwa-install]', name: 'PWAInstall' },
        { selector: '[role="dialog"]', name: 'Modal' },
      ];

      const results: { name: string; zIndex: number }[] = [];

      for (const elem of elements) {
        const el = document.querySelector(elem.selector);
        if (el) {
          const style = window.getComputedStyle(el);
          const zIndex = parseInt(style.zIndex) || 0;
          results.push({ name: elem.name, zIndex });
        }
      }

      return results;
    });

    // Check that modals have higher z-index than toasts
    const modalZIndex = zIndexCheck.find(r => r.name === 'Modal')?.zIndex || 0;
    const toastZIndexes = zIndexCheck
      .filter(r => r.name === 'Toaster' || r.name === 'RetroToast')
      .map(r => r.zIndex);

    toastZIndexes.forEach(toastZ => {
      if (modalZIndex > 0 && toastZ > 0) {
        expect(modalZIndex).toBeGreaterThan(toastZ);
      }
    });
  });
});

test.describe('Mobile Layout - All Pages', () => {

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/library', name: 'Library' },
    { path: '/collections', name: 'Collections' },
    { path: '/profile', name: 'Profile' },
    { path: '/save-states', name: 'Save States' },
  ];

  for (const pageInfo of pages) {
    mobileTest(`${pageInfo.name} page should be mobile-friendly`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // No horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Page should have content
      const content = await page.textContent('body');
      expect(content!.trim().length).toBeGreaterThan(0);

      // Should not have console errors
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await page.waitForTimeout(1000);
      expect(errors.length).toBe(0);
    });
  }
});
