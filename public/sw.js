const CACHE_NAME = "qolbu-cache-v2";
const ASSETS = [
  "/",
  "/sholat",
  "/quran",
  "/quran/yasin",
  "/doa",
  "/sholat-guide",
  "/tahlil",
  "/tasbih",
  "/zakat",
  "/asmaul-husna",
  "/dzikir",
  "/offline",
  "/logo.png",
  "/logo-192.png",
  "/logo-512.png",
];

// Install: cache shell (non-atomic — individual try/catch per asset)
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Gagal cache:', url, err.message);
          })
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Helper: cache-first strategy
const cacheFirst = (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      });
    })
  );
};

// Helper: network-first strategy
const networkFirst = (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
};

// Fetch: route-based strategy
self.addEventListener("fetch", (e) => {
  const url = e.request.url;

  // Audio CDN: cache-first (once downloaded, play from cache)
  if (url.includes("equran.nos.wjv-1.neo.id") || url.includes("everyayah.com") || url.includes("download.quranicaudio.com") || url.includes("audio") && url.endsWith(".mp3")) {
    return cacheFirst(e);
  }

  // Navigation requests: network-first → cache → offline fallback page
  if (e.request.mode === 'navigate') {
    return e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((cached) => cached || caches.match('/offline'))
        )
    );
  }

  // Everything else: network-first with cache fallback
  return networkFirst(e);
});
