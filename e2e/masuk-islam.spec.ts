import { test, expect } from '@playwright/test';

test.describe('Masuk Islam Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/masuk-islam');
  });

  test('should load with correct title and header', async ({ page }) => {
    await expect(page).toHaveTitle(/Masuk Islam/);
    await expect(page.locator('h1')).toContainText('Masuk Islam');
  });

  test('should show hero with bismillah and ayat pembuka', async ({ page }) => {
    await expect(page.locator('text=Panduan Masuk Islam')).toBeVisible();
    // Ayat Ar-Ra'd 28 di section pembuka
    await expect(page.locator('text=QS. Ar-Ra')).toBeVisible();
  });

  test('should show 3 kisah mualaf accordion', async ({ page }) => {
    await expect(page.locator('text=Malik bin Dinar')).toBeVisible();
    await expect(page.locator('text=Ka\u2019ab bin Zuhair')).toBeVisible();
    await expect(page.locator('text=Marmaduke Pickthall')).toBeVisible();
  });

  test('should open kisah accordion and reveal story content', async ({ page }) => {
    const firstStory = page.locator('details').filter({ hasText: 'Malik bin Dinar' }).first();
    await firstStory.locator('summary').click();
    // Konten cerita hanya ada di dalam body accordion
    await expect(page.locator('text=tumpahkan seluruh araknya')).toBeVisible();
  });

  test('should show 9 step accordion with progress bar', async ({ page }) => {
    await expect(page.locator('text=9 Langkah Masuk Islam')).toBeVisible();
    const steps = page.locator('details.step-item');
    await expect(steps).toHaveCount(9);
    await expect(page.locator('#progress-bar')).toBeVisible();
    await expect(page.locator('#progress-text')).toHaveText(/0 dari 9 langkah selesai/);
  });

  test('should mark step complete and persist progress after reload', async ({ page }) => {
    const firstStep = page.locator('details.step-item').first();
    await firstStep.locator('summary').click();
    await firstStep.locator('.mark-complete-btn').click();

    await expect(page.locator('#progress-text')).toHaveText(/1 dari 9 langkah selesai/);
    await expect(firstStep.locator('.btn-text')).toContainText('Selesai');

    // Progres tersimpan di localStorage
    const stored = await page.evaluate(() => localStorage.getItem('masuk-islam-completed'));
    expect(stored).toContain('langkah-1');

    // Reload: progress tetap
    await page.reload();
    await expect(page.locator('#progress-text')).toHaveText(/1 dari 9 langkah selesai/);
  });

  test('should reset progress via reset button', async ({ page }) => {
    const firstStep = page.locator('details.step-item').first();
    await firstStep.locator('summary').click();
    await firstStep.locator('.mark-complete-btn').click();
    await expect(page.locator('#progress-text')).toHaveText(/1 dari 9 langkah selesai/);

    page.on('dialog', (dialog) => dialog.accept());
    await page.click('#reset-progress');
    await expect(page.locator('#progress-text')).toHaveText(/0 dari 9 langkah selesai/);
  });

  test('should copy syahadat text to clipboard', async ({ page }) => {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.click('#copy-syahadat');
    await expect(page.locator('#toast')).toContainText('Bacaan syahadat disalin!');
  });

  test('should show FAQ section with 6 items', async ({ page }) => {
    await expect(page.locator('text=Pertanyaan & Jawaban')).toBeVisible();
    await expect(
      page.locator('text=Apakah harus ada saksi atau ustadz saat syahadat?')
    ).toBeVisible();
    await expect(page.locator('text=Apakah saya harus mengganti nama?')).toBeVisible();
  });

  test('should link to Panduan Sholat and Al-Quran from steps', async ({ page }) => {
    const quranLink = page.locator('details.step-item a[href="/quran"]').first();
    await expect(quranLink).toBeVisible();

    const guideLink = page.locator('details.step-item a[href="/sholat-guide"]').first();
    await expect(guideLink).toBeVisible();
  });
});
