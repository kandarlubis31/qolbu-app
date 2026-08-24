import { test, expect, type Page } from '@playwright/test';

// Fixture Aladhan — hijri Ramadan 15 → event berikutnya Nuzulul Qur'an (17) = "2 hari lagi"
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

  test('should show menu grid with 9 items (Jadwal Sholat tile removed — widget card covers it)', async ({
    page,
  }) => {
    const menuCards = page.locator('[href^="/"]:has(svg)').filter({
      hasText:
        /Al-Qur'an|Doa Harian|Kalkulator Zakat|Panduan Sholat|Tahlil|Tasbih|Asmaul Husna|Dzikir|Events/,
    });
    await expect(menuCards).toHaveCount(9);
    // Widget card tetap jadi satu-satunya kartu sholat hijau di atas grid
    await expect(page.locator('#prayer-card')).toHaveCount(1);
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

  test('should navigate to sholat page', async ({ page }) => {
    await page.goto('/sholat');
    await expect(page).toHaveURL(/\/sholat/);
    await expect(page.locator('#prayer-list')).toBeVisible();
  });

  test('should navigate to quran page', async ({ page }) => {
    await page.goto('/quran');
    await expect(page).toHaveURL(/\/quran/);
    await expect(page.getByRole('heading', { name: "Al-Qur'an" })).toBeVisible();
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

// Pipeline jadwal butuh mock network deterministik — SW diblok agar request
// yang diinisiasi Service Worker tidak mem-bypass page.route (gagal di WebKit).
test.describe('Prayer Schedule Pipeline', () => {
  test.use({ serviceWorkers: 'block' });

  test.beforeEach(async ({ page }) => {
    await mockPrayerApis(page);
  });

  test('should write sholat cache on /sholat and show prayer card on dashboard', async ({
    page,
  }) => {
    await page.context().grantPermissions(['geolocation'], { origin: 'http://localhost:4321' });
    await page.context().setGeolocation({ latitude: -6.2, longitude: 106.8166 });

    await page.goto('/sholat');

    // PENTING: #prayer-list > div sudah berisi 5 skeleton sejak load —
    // tunggu CACHE tertulis sebagai sinyal fetch+render selesai, bukan jumlah div.
    let cached: { key: string; value: { data: { timings: Record<string, string> } } } | null = null;
    await expect
      .poll(
        async () => {
          cached = await page.evaluate(() => {
            const keys = Object.keys(localStorage).filter((k) => k.startsWith('sholat-cache-'));
            return keys.length
              ? { key: keys[0], value: JSON.parse(localStorage.getItem(keys[0]) as string) }
              : null;
          });
          return cached;
        },
        { timeout: 15000, intervals: [250, 500, 1000] }
      )
      .not.toBeNull();

    // Ihtiyat +2 → Fajr fixture 04:32 menjadi 04:34
    expect(cached!.value.data.timings.Fajr).toBe('04:34');

    // Dashboard membaca cache → kartu tampil tanpa CTA + hijri bar muncul
    await page.goto('/');
    await expect(page.locator('#prayer-card')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#pt-Fajr')).toHaveText('04:34');
    await expect(page.locator('#prayer-card')).not.toContainText('Belum ada jadwal sholat');
    await expect(page.locator('#hijri-event')).toBeVisible();
  });

  test('should auto-fetch prayer schedule on dashboard without visiting /sholat', async ({
    page,
  }) => {
    // Koordinat tersimpan (dari sesi GPS/manual sebelumnya) — dashboard fetch sendiri
    await page.addInitScript(() => {
      localStorage.setItem(
        'sholat-settings',
        JSON.stringify({ lat: -6.2, lng: 106.8166, method: 20, correction: 2, useGPS: false })
      );
    });

    await page.goto('/');
    await expect(page.locator('#pt-Fajr')).toHaveText('04:34', { timeout: 15000 });
    await expect(page.locator('#prayer-card')).not.toContainText('Belum ada jadwal sholat');

    // Fetch mandiri juga menulis cache untuk kunjungan berikutnya
    const hasCache = await page.evaluate(() =>
      Object.keys(localStorage).some((k) => k.startsWith('sholat-cache-'))
    );
    expect(hasCache).toBe(true);
  });
});
