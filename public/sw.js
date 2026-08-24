// Qolbu App Service Worker - Enhanced caching strategy
const CACHE_VERSION = 'v7';
const CACHE_NAME = `qolbu-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/logo-192.png',
  '/logo-512.png',
  '/favicon.ico',
  '/favicon.svg',
  // Fonts - subset WOFF2 (PJS 27KB + Amiri arabic/latin regular 125KB).
  // Amiri *Bold* sengaja TIDAK diprecache — tak ada konten bold-arab; lazy-load bila perlu.
  '/fonts/PlusJakartaSans-Variable.woff2',
  '/fonts/AmiriArabic-Regular.woff2',
  '/fonts/AmiriLatin-Regular.woff2',
  // Pages
  '/dzikir',
  '/asmaul-husna',
  '/doa',
  '/tahlil',
  '/tasbih',
  '/zakat',
  '/sholat-guide',
  '/sholat',
  '/events-hijri',
  '/quran',
  '/quran/yasin',
  '/quran/index',
];

// Audio CDN domains for cache-first strategy
const AUDIO_CDNS = ['equran.nos.wjv-1.neo.id', 'everyayah.com', 'download.quranicaudio.com'];

// API domains to bypass cache
const API_DOMAINS = [
  'equran.id',
  'api.aladhan.com',
  'nominatim.openstreetmap.org',
  'googleapis.com',
  'gstatic.com',
];

// INSTALL
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

// ACTIVATE
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

// Helper: Check if URL is audio
function isAudioRequest(url) {
  return (
    AUDIO_CDNS.some((domain) => url.hostname.includes(domain)) ||
    (url.pathname.includes('audio') && url.pathname.endsWith('.mp3'))
  );
}

// Helper: Check if URL is API
function isApiRequest(url) {
  return API_DOMAINS.some((domain) => url.hostname.includes(domain));
}

// Helper: Check if response is fresh
function isFresh(response) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  const responseDate = new Date(dateHeader).getTime();
  return Date.now() - responseDate < MAX_CACHE_AGE;
}

// FETCH STRATEGY
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP or non-GET
  if (!url.protocol.startsWith('http') || request.method !== 'GET') return;

  // Bypass APIs
  if (isApiRequest(url)) return;

  // Audio files - Cache First
  if (isAudioRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // HTML Navigation - Network First with Cache Fallback
  const isHtmlNavigation =
    request.mode === 'navigate' ||
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

  // Assets (CSS, JS, Images, Fonts) - Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok && isFresh(response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      // Return cached immediately, update in background
      return cached || fetchPromise;
    })
  );
});

// Periodic cleanup of old cache entries
self.addEventListener('message', (event) => {
  if (event.data === 'cleanup-cache') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          cache.match(request).then((response) => {
            if (response && !isFresh(response)) {
              cache.delete(request);
            }
          });
        });
      });
    });
  }
});
