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
  "/logo.png",
];

// Install: cache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
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
    }).catch(() => caches.match(e.request))
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

  // Everything else: network-first with cache fallback
  return networkFirst(e);
});
