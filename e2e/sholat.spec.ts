import { test, expect } from '@playwright/test';

test.describe('Jadwal Sholat Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sholat');
    await page.waitForLoadState('networkidle');
  });

  test('should load sholat page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Jadwal Sholat/);
  });

  test('should show countdown timer', async ({ page }) => {
    const countdown = page.locator('#countdown');
    await expect(countdown).toBeVisible();
    await expect(countdown).not.toHaveText('--:--:--');
  });

  test('should show prayer list with 5 prayers', async ({ page }) => {
    const prayerCards = page.locator('#prayer-list > div');
    await expect(prayerCards).toHaveCount(5);
  });

  test('should show Imsak time', async ({ page }) => {
    const imsakContainer = page.locator('#imsak-container');
    await expect(imsakContainer).toBeVisible();
  });

  test('should show qibla direction', async ({ page }) => {
    const qiblaText = page.locator('#qibla-direction-text');
    await expect(qiblaText).toBeVisible();
    await expect(qiblaText).not.toHaveText('...');
  });

  test('should open settings modal', async ({ page }) => {
    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).toBeVisible();
    await expect(page.locator('text=Pengaturan Sholat')).toBeVisible();
  });

  test('should have correction display', async ({ page }) => {
    const correctionDisplay = page.locator('#correction-display');
    await expect(correctionDisplay).toBeVisible();
  });

  test('should have refresh location button', async ({ page }) => {
    const refreshBtn = page.locator('#refresh-loc-btn');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toHaveText(/Update Lokasi GPS/);
  });
});
