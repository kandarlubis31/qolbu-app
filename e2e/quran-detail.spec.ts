import { test, expect } from '@playwright/test';

test.describe('Quran Surah Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quran/1'); // Al-Fatihah
    await page.waitForLoadState('networkidle');
  });

  test('should load surah detail page', async ({ page }) => {
    await expect(page).toHaveTitle(/Surat Al-Fatihah/);
    await expect(page.locator('h1:has-text("Surat Al-Fatihah")')).toBeVisible();
  });

  test('should show 7 ayat for Al-Fatihah', async ({ page }) => {
    const ayatCards = page.locator('.ayat-card');
    await expect(ayatCards).toHaveCount(7);
  });

  test('should show arabic, latin, and translation for each ayat', async ({ page }) => {
    const firstAyat = page.locator('.ayat-card').first();
    await expect(firstAyat.locator('.text-arab')).toBeVisible();
    await expect(firstAyat.locator('.text-latin')).toBeVisible();
    await expect(firstAyat.locator('.text-arti')).toBeVisible();
  });

  test('should play audio on click', async ({ page }) => {
    const audioBtn = page.locator('.btn-audio').first();
    await audioBtn.click();

    // Check that pause icon appears
    await expect(audioBtn.locator('.icon-pause')).not.toHaveClass('hidden');
    // icon-play has multiple classes including hidden
    await expect(audioBtn.locator('.icon-play')).toHaveClass(/hidden/);

    // Click again to pause
    await audioBtn.click();
    await expect(audioBtn.locator('.icon-play')).not.toHaveClass('hidden');
  });

  test('should switch to Mushaf mode', async ({ page }) => {
    await page.click('#btn-mushaf');
    await expect(page.locator('#view-mushaf')).not.toHaveClass('hidden');
    await expect(page.locator('#view-terjemah')).toHaveClass(/hidden/);

    await page.click('#btn-terjemah');
    await expect(page.locator('#view-terjemah')).not.toHaveClass('hidden');
    await expect(page.locator('#view-mushaf')).toHaveClass(/hidden/);
  });

  test('should open settings modal', async ({ page }) => {
    await page.click('#settings-btn');
    // Wait for modal to become visible (remove hidden class) - the modal has inline script
    await page.waitForTimeout(500);
    await expect(page.locator('#settings-modal').first()).not.toHaveClass('hidden', {
      timeout: 5000,
    });
    await expect(page.locator('#settings-modal').first()).toBeVisible({ timeout: 5000 });
    // Use first() to handle potential duplicate text in other modals
    await expect(page.locator('h3:has-text("Tampilan Bacaan")').first()).toBeVisible();
  });

  test('should change font size', async ({ page }) => {
    await page.click('#settings-btn');
    const fontSlider = page.locator('#font-size-range').first();
    // Range input might not be directly fillable, use evaluate
    await fontSlider.evaluate((el: HTMLInputElement) => {
      el.value = '5';
      el.dispatchEvent(new Event('input'));
    });

    // Check that font size changed
    const arabText = page.locator('.text-arab').first();
    const fontSize = await arabText.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseInt(fontSize)).toBeGreaterThan(30); // 3rem = 48px for size 5
  });

  test('should toggle latin text', async ({ page }) => {
    await page.click('#settings-btn');
    const toggleLatin = page.locator('#toggle-latin').first();
    await toggleLatin.evaluate((el: HTMLInputElement) => {
      el.checked = false;
      el.dispatchEvent(new Event('change'));
    });
    await expect(page.locator('.text-latin').first()).toHaveCSS('display', 'none');

    await toggleLatin.evaluate((el: HTMLInputElement) => {
      el.checked = true;
      el.dispatchEvent(new Event('change'));
    });
    await expect(page.locator('.text-latin').first()).not.toHaveCSS('display', 'none');
  });

  test('should navigate back to quran index', async ({ page }) => {
    await page.click('a[href="/quran"]');
    await expect(page).toHaveURL(/\/quran$/);
  });
});
