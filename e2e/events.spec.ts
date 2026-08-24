import { test, expect } from '@playwright/test';

test.describe('Events Kalender Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events-hijri');
  });

  test('should load events page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Events Kalender/);
    await expect(page.getByRole('heading', { name: 'Events Hijriah & Masehi' })).toBeVisible();
  });

  test('should show hijri panel by default with month cards', async ({ page }) => {
    const hijriPanel = page.locator('#panel-hijri');
    await expect(hijriPanel).toBeVisible();
    await expect(page.locator('#panel-masehi')).toBeHidden();
    await expect(hijriPanel).toContainText('Maulid Nabi');
    await expect(page.locator('#tab-hijri')).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to masehi panel via tab', async ({ page }) => {
    await page.click('#tab-masehi');
    const masehiPanel = page.locator('#panel-masehi');
    await expect(masehiPanel).toBeVisible();
    await expect(page.locator('#panel-hijri')).toBeHidden();
    await expect(masehiPanel).toContainText('Hari Kemerdekaan Republik Indonesia');
    await expect(masehiPanel).toContainText('Hari Raya Natal');
    await expect(page.locator('#tab-masehi')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#tab-hijri')).toHaveAttribute('aria-selected', 'false');
  });

  test('should show libur nasional badge on masehi events', async ({ page }) => {
    await page.click('#tab-masehi');
    // exact match agar tidak ikut menghitung elemen wrapper
    await expect(
      page.locator('#panel-masehi').getByText('Libur Nasional', { exact: true })
    ).toHaveCount(5);
    await expect(
      page.locator('#panel-masehi').getByText('Peringatan', { exact: true })
    ).toHaveCount(10);
  });

  test('should switch back to hijri panel', async ({ page }) => {
    await page.click('#tab-masehi');
    await expect(page.locator('#panel-masehi')).toBeVisible();
    await page.click('#tab-hijri');
    await expect(page.locator('#panel-hijri')).toBeVisible();
    await expect(page.locator('#panel-masehi')).toBeHidden();
  });
});
