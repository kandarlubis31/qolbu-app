import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load home page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Qolbu/);
  });

  test('should show greeting', async ({ page }) => {
    await expect(page.locator('text=Assalamualaikum')).toBeVisible();
    await expect(page.locator('text=Sobat Qolbu')).toBeVisible();
  });

  test('should show quote of the day without placeholder', async ({ page }) => {
    const quote = page.locator('#quote-text');
    await expect(quote).toBeVisible();
    await expect(quote).not.toHaveText(/Memuat kata mutiara/);
    await expect(quote).toHaveText(/".+"/);
  });

  test('should show quote source attribution', async ({ page }) => {
    const source = page.locator('#quote-source');
    await expect(source).toBeVisible();
    const text = (await source.innerText()).trim();
    expect(text.length).toBeGreaterThan(0);
  });

  test('should keep quote visible after client-side round trip', async ({ page }) => {
    await page.click('a[href="/doa"]');
    await page.waitForTimeout(600);
    await page.click('a[href="/"]');
    await page.waitForTimeout(1200);
    const quote = page.locator('#quote-text');
    await expect(quote).toBeVisible();
    await expect(quote).not.toContainText('Memuat kata mutiara');
  });

  test('should show menu grid with 10 items', async ({ page }) => {
    const menuCards = page.locator('[href^="/"]:has(svg)').filter({
      hasText:
        /Jadwal Sholat|Al-Qur'an|Doa Harian|Kalkulator Zakat|Panduan Sholat|Tahlil|Tasbih|Asmaul Husna|Dzikir|Events/,
    });
    await expect(menuCards).toHaveCount(10);
  });

  test('should navigate to sholat page', async ({ page }) => {
    await page.goto('/sholat');
    await expect(page).toHaveURL(/\/sholat/);
    // Check for content that exists on the sholat page
    await expect(page.locator('#prayer-list')).toBeVisible();
  });

  test('should navigate to quran page', async ({ page }) => {
    await page.goto('/quran');
    await expect(page).toHaveURL(/\/quran/);
    await expect(page.locator('text=Al-Qur')).toBeVisible();
  });

  test('should navigate to doa page', async ({ page }) => {
    await page.goto('/doa');
    await expect(page).toHaveURL(/\/doa/);
    await expect(page.locator('text=Ensiklopedia Doa')).toBeVisible();
  });

  test('should navigate to tasbih page', async ({ page }) => {
    await page.goto('/tasbih');
    await expect(page).toHaveURL(/\/tasbih/);
    await expect(page.locator('text=Tasbih Digital')).toBeVisible();
  });
});
