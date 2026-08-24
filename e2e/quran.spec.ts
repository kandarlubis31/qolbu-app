import { test, expect } from '@playwright/test';

test.describe('Al-Quran Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran');
    await page.waitForLoadState('networkidle');
  });

  test('should load quran page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Al-Qur/);
  });

  test('should show 114 surah cards', async ({ page }) => {
    const surahCards = page.locator('.surat-card');
    await expect(surahCards).toHaveCount(114);
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('#search-surat');
    await expect(searchInput).toBeVisible();
  });

  test('should filter surahs on search', async ({ page }) => {
    const searchInput = page.locator('#search-surat');
    await searchInput.fill('Al-Fatihah');

    const visibleCards = page.locator('.surat-card:not(.hidden)');
    await expect(visibleCards).toHaveCount(1);
    await expect(visibleCards.first()).toContainText('Al-Fatihah');
  });

  test('should switch to Juz tab', async ({ page }) => {
    await page.click('#tab-juz');

    const juzCards = page.locator('#view-juz a');
    await expect(juzCards).toHaveCount(30);
  });

  test('should navigate to surah detail page', async ({ page }) => {
    await page.click('.surat-card:has-text("Al-Fatihah")');
    await expect(page).toHaveURL(/\/quran\/1/);
    await expect(page.locator('h1:has-text("Surat Al-Fatihah")')).toBeVisible();
  });

  test('should navigate to Yasin page', async ({ page }) => {
    await page.goto('/quran/yasin');
    await expect(page).toHaveURL(/\/quran\/yasin/);
    // Use first() to handle multiple elements with same text
    await expect(page.locator('h1:has-text("Surat Yasin")').first()).toBeVisible();
  });
});
