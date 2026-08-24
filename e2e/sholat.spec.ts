import { test, expect, type Page } from '@playwright/test';

const ALADHAN_FIXTURE = {
  code: 200,
  status: 'OK',
  data: {
    timings: {
      Fajr: '04:32',
      Dhuhr: '11:58',
      Asr: '15:14',
      Maghrib: '17:55',
      Isha: '19:03',
      Imsak: '04:22',
      Sunrise: '05:47',
    },
    date: {
      hijri: { day: '15', month: { en: 'Ramadan' }, year: '1447' },
      gregorian: { day: '24', month: { en: 'August' }, year: '2026' },
    },
  },
};

async function mockPrayerApis(page: Page) {
  await page.route('**/api.aladhan.com/**', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(ALADHAN_FIXTURE) })
  );
  await page.route('**/nominatim.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ address: { city: 'Jakarta' } }),
    })
  );
}

test.describe('Jadwal Sholat Page', () => {
  // SW diblok agar mock page.route tidak bocor ke request Service Worker
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ page }) => {
    await mockPrayerApis(page);
    await page.goto('/sholat');
  });

  test('should load sholat page with title', async ({ page }) => {
    await expect(page).toHaveTitle(/Jadwal Sholat/);
  });

  test('should show countdown timer', async ({ page }) => {
    const countdown = page.locator('#countdown');
    await expect(countdown).not.toHaveText('--:--:--', { timeout: 15000 });
    await expect(countdown).toHaveText(/\d{2}:\d{2}:\d{2}/);
  });

  test('should show prayer list with 5 prayers', async ({ page }) => {
    // Tunggu render nyata (bukan skeleton): Subuh harus berisi waktu hasil ihtiyat
    await expect(page.locator('#prayer-list')).toContainText('04:34', { timeout: 15000 });
    await expect(page.locator('#prayer-list > div')).toHaveCount(5);
  });

  test('should show Imsak time', async ({ page }) => {
    await expect(page.locator('#imsak-container')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#imsak-time')).toHaveText('04:24'); // 04:22 + ihtiyat 2
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

  test('should write sholat cache after successful fetch', async ({ page }) => {
    let cached = null;
    await expect
      .poll(
        async () => {
          cached = await page.evaluate(
            () => Object.keys(localStorage).find((k) => k.startsWith('sholat-cache-')) || null
          );
          return cached;
        },
        { timeout: 15000 }
      )
      .not.toBeNull();
    const parsed = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), cached);
    expect(parsed.data.timings.Fajr).toBe('04:34');
  });
});
