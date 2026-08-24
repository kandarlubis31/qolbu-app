import { test, expect } from '@playwright/test';

test.describe('Doa Harian Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/doa');
    await page.waitForLoadState('networkidle');
  });

  test('should load doa page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Doa/);
  });

  test('should show 47 doa cards', async ({ page }) => {
    const doaCards = page.locator('#doa-container > div');
    await expect(doaCards).toHaveCount(47);
  });

  test('should have category filter buttons', async ({ page }) => {
    const categories = [
      'Semua',
      'Sehari-hari',
      "Al-Qur'an",
      'Sholat',
      'Rizki',
      'Keluarga',
      'Sakit',
      'Perjalanan',
      'Taubat',
    ];

    for (const cat of categories) {
      await expect(page.locator(`.cat-btn:has-text("${cat}")`)).toBeVisible();
    }
  });

  test('should filter by category', async ({ page }) => {
    // Click Sholat category
    await page.click('.cat-btn:has-text("Sholat")');

    const visibleCards = page.locator('#doa-container > div:not(.hidden)');
    await expect(visibleCards).toHaveCount(6); // 6 sholat doa
  });

  test('should search doa by title', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('wudhu');

    const visibleCards = page.locator('#doa-container > div:not(.hidden)');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('Wudhu');
  });

  test('should copy doa to clipboard', async ({ page }) => {
    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const firstCopyBtn = page.locator('.copy-btn').first();
    await firstCopyBtn.click();

    // Check for toast notification
    const toast = page.locator('#toast');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('disalin');
  });

  test('should show empty state for no results', async ({ page }) => {
    const searchInput = page.locator('#search-input');
    await searchInput.fill('xyznonexistent');

    const emptyState = page.locator('#empty-state');
    await expect(emptyState).not.toHaveClass('hidden');
    await expect(emptyState).toContainText('Doa tidak ditemukan');
  });
});
