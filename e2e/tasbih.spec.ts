import { test, expect } from '@playwright/test';

test.describe('Tasbih Digital Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasbih');
    await page.waitForLoadState('networkidle');
  });

  test('should load tasbih page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tasbih Digital/);
  });

  test('should show counter at 0', async ({ page }) => {
    const counter = page.locator('#count-display');
    await expect(counter).toHaveText('0');
  });

  test('should increment counter on click', async ({ page }) => {
    const counterBtn = page.locator('#counter-btn');
    await counterBtn.click();
    await expect(page.locator('#count-display')).toHaveText('1');

    await counterBtn.click();
    await expect(page.locator('#count-display')).toHaveText('2');
  });

  test('should increment counter on space key', async ({ page }) => {
    await page.keyboard.press('Space');
    await expect(page.locator('#count-display')).toHaveText('1');
  });

  test('should show progress bar', async ({ page }) => {
    const progressBar = page.locator('#progress-bar');
    // Progress bar might have hidden class initially but should be in DOM
    await expect(progressBar).toBeAttached();
    await expect(page.locator('#progress-text')).toContainText('0 / 33');
  });

  test('should update target selection', async ({ page }) => {
    await page.selectOption('#target-select', '99');
    await expect(page.locator('#progress-text')).toContainText('0 / 99');
  });

  test('should have dhikr selection buttons', async ({ page }) => {
    const dhikrButtons = page.locator('.dhikr-btn');
    await expect(dhikrButtons).toHaveCount(4);

    const activeDhikr = page.locator('#current-dhikr');
    await expect(activeDhikr).toHaveText('Subhanallah');
  });

  test('should toggle vibration', async ({ page }) => {
    const vibrateBtn = page.locator('#toggle-vibrate');
    await expect(vibrateBtn).toHaveText(/Getar: ON/);

    await vibrateBtn.click();
    await expect(vibrateBtn).toHaveText(/Getar: OFF/);
  });

  test('should show statistics section', async ({ page }) => {
    const stats = page.locator('text=Statistik Hari Ini');
    await expect(stats).toBeVisible();
  });

  test('should reset counter', async ({ page }) => {
    const counterBtn = page.locator('#counter-btn');
    await counterBtn.click();
    await counterBtn.click();
    await expect(page.locator('#count-display')).toHaveText('2');

    await page.click('#reset-btn');
    await expect(page.locator('#count-display')).toHaveText('0');
  });
});
