import { test, expect } from '@playwright/test';

test.describe('Surat Yasin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran/yasin');
  });

  test('should load yasin page with title and 83 ayat', async ({ page }) => {
    await expect(page).toHaveTitle(/Surat Yasin/);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('.ayat-card')).toHaveCount(83);
  });

  test('should show fadhilah note with hadith grading caveat', async ({ page }) => {
    await expect(page.locator('main')).toContainText('Fadhilah Surat Yasin');
    await expect(page.locator('main')).toContainText('derajatnya dinilai beragam');
  });

  test('should have per-ayat audio buttons with valid src pattern', async ({ page }) => {
    const audioBtns = page.locator('.btn-audio');
    await expect(audioBtns).toHaveCount(83);
    await expect(audioBtns.first()).toHaveAttribute('data-audio', /036001\.mp3$/);
  });

  test('should open yasin settings modal and apply font size', async ({ page }) => {
    await page.click('#settings-btn');
    const range = page.locator('#font-size-range-yasin');
    await range.evaluate((el: HTMLInputElement) => {
      el.value = '5';
      el.dispatchEvent(new Event('input'));
    });
    // Tunggu transisi font-size selesai — poll computed style sampai nilai final
    const arab = page.locator('.text-arab').first();
    await expect
      .poll(() => arab.evaluate((el) => parseInt(window.getComputedStyle(el).fontSize)), {
        timeout: 5000,
      })
      .toBe(48); // 3rem untuk size 5

    // Modal tertutup via tombol close
    await page.click('#close-settings-yasin');
    await expect(page.locator('#close-settings-yasin')).toHaveCount(0);
  });
});
