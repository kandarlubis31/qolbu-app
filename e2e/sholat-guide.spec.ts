import { test, expect } from '@playwright/test';

test.describe('Panduan Sholat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sholat-guide');
  });

  test('should load guide page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Panduan Sholat/);
    await expect(page.locator('#guide-container > details')).toHaveCount(28);
  });

  test('should enforce single-open accordion', async ({ page }) => {
    const first = page.locator('#guide-container > details').nth(0);
    const second = page.locator('#guide-container > details').nth(1);
    await first.locator('summary').click();
    await expect(first).toHaveAttribute('open');
    await second.locator('summary').click();
    await expect(second).toHaveAttribute('open');
    await expect(first).not.toHaveAttribute('open');
  });

  test('should filter steps via search and show empty state', async ({ page }) => {
    await page.fill('#search-input', 'qunut');
    await expect(page.locator('#guide-container > details:not(.hidden)')).toHaveCount(1);
    await expect(page.locator('#guide-container')).toContainText('Qunut');

    await page.fill('#search-input', 'xyznonexistent');
    await expect(page.locator('#empty-state')).toBeVisible();
    await expect(page.locator('#empty-state')).toContainText('Langkah tidak ditemukan');

    await page.fill('#search-input', '');
    await expect(page.locator('#guide-container > details:not(.hidden)')).toHaveCount(28);
  });

  test('should bookmark a step, show badge and modal entry', async ({ page }) => {
    const firstBookmark = page.locator('.bookmark-btn').first();
    await firstBookmark.click();
    await expect(page.locator('#toast')).toContainText('disimpan');
    await expect(page.locator('#bookmark-badge')).toBeVisible();

    await page.click('#view-bookmarks');
    const modal = page.locator('#bookmarks-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#bookmarks-list > div')).toHaveCount(1);

    // Klik item bookmark → modal tutup + langkah terbuka
    await page.locator('#bookmarks-list > div').first().click();
    await expect(modal).toBeHidden();
    await expect(page.locator('#guide-container > details').first()).toHaveAttribute('open');
  });

  test('should mark step complete and update progress', async ({ page }) => {
    await expect(page.locator('#current-step-text')).toHaveText('0');
    // Tombol ada di dalam body accordion — buka dulu
    const first = page.locator('#guide-container > details').first();
    await first.locator('summary').click();
    await first.locator('.mark-complete-btn').click();
    await expect(page.locator('#current-step-text')).toHaveText('1');
    await expect(page.locator('#progress-bar')).not.toHaveAttribute('style', /width: 0%/);
    // Tombol berubah state jadi "Selesai"
    await expect(first.locator('.mark-complete-btn')).toContainText('Selesai');
  });

  test('should have exactly 2 playable full-surah audios', async ({ page }) => {
    const enabled = page.locator('.audio-btn:not([disabled])');
    await expect(enabled).toHaveCount(2);
    await expect(enabled.first()).toHaveAttribute(
      'data-audio',
      /download\.quranicaudio\.com.*\/001\.mp3$/
    );
    await expect(enabled.nth(1)).toHaveAttribute(
      'data-audio',
      /download\.quranicaudio\.com.*\/112\.mp3$/
    );
    // Sisanya disabled dengan label Audio N/A
    await expect(page.locator('.audio-btn[disabled]')).toHaveCount(26);
  });

  test('should run and stop practice mode', async ({ page }) => {
    const practiceBtn = page.locator('#practice-btn');
    await practiceBtn.click();
    // Langkah pertama langsung terbuka + label berubah
    await expect(page.locator('#guide-container > details').first()).toHaveAttribute('open');
    await expect(practiceBtn).toContainText('Hentikan Praktik');
    await expect(page.locator('#practice-hint')).toContainText('Sedang berjalan');

    await practiceBtn.click();
    await expect(practiceBtn).toContainText('Mulai Praktik');
    await expect(page.locator('#practice-hint')).toContainText('tiap 15 detik');
  });
});
