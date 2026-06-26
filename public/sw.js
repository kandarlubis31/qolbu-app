// Qolbu App Service Worker - Perbaikan Validasi Cache & SPA-Routing Astro
const CACHE_VERSION = 'v4';
const CACHE_NAME = `qolbu-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/favicon.svg',
  '/dzikir',
  '/asmaul-husna',
  '/doa',
  '/tahlil',
  '/tasbih',
  '/zakat',
  '/sholat-guide',
  '/sholat',
  '/quran',
  '/quran/yasin'
];

// INSTALL & ACTIVATE Events tetap aman (Gunakan implementasi allSettled kamu yang sudah bagus)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Pre-cache failed:', url, err.message))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('qolbu-cache-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH STRATEGY UPDATE ───────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (!url.protocol.startsWith('http') || request.method !== 'GET') return;

  // Bypass External APIs & CDN
  if (
    url.hostname.includes('googleapis.com') || 
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('equran.id') || 
    url.hostname.includes('equran.nos')
  ) return;

  // Deteksi Navigasi: Berlaku untuk request 'navigate' murni ATAU request halaman HTML via Astro Router
  const isHtmlNavigation = request.mode === 'navigate' || 
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isHtmlNavigation) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached || caches.match(OFFLINE_URL));

        return cached || networkFetch;
      })
    );
    return;
  }

  // Assets (CSS, JS, Images) -> Stale-While-Revalidate
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