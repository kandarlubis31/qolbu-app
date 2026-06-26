// Qolbu App Service Worker
const CACHE_VERSION = 'v2';
const CACHE_NAME = `qolbu-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Pre-cache semua halaman yang bisa diakses sepenuhnya offline
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/favicon.svg',
  // Halaman konten — semua data inline, 100% offline
  '/dzikir',
  '/asmaul-husna',
  '/doa',
  '/tahlil',
  '/tasbih',
  '/zakat',
  '/sholat-guide',
  '/events-hijri',
  // Quran
  '/quran',
  '/quran/yasin',
  // Sholat (untuk UI + data terakhir yang tersimpan)
  '/sholat',
];

// ─── INSTALL: Pre-cache halaman penting ───────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching', PRECACHE_URLS.length, 'pages...');
      // Gunakan Promise.allSettled agar satu URL gagal tidak menggagalkan semua
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Failed to pre-cache:', url, err.message);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE: Bersihkan cache lama ──────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('qolbu-cache-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH ───────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache request dari extension atau non-http
  if (!url.protocol.startsWith('http')) return;

  // Skip Google Fonts & external CDN — biarkan network handle
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) return;
  if (url.hostname.includes('nominatim.openstreetmap.org')) return;
  if (url.hostname.includes('equran.id') || url.hostname.includes('equran.nos')) return;

  // ── Navigasi (HTML pages) → Cache-first ──────────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Update cache di background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
              }
            })
            .catch(() => {});
          return cached;
        }
        // Belum di-cache, ambil dari network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // ── Assets (CSS, JS, images, fonts) → Stale-while-revalidate ─────
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
