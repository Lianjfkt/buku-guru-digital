const CACHE_NAME = 'ruang-guru-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/dashboard',
  '/jadwal',
  '/agenda',
  '/penilaian',
  '/kehadiran',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response untuk cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Jangan cache chrome-extension atau request auth api
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, resClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Fallback jika offline
        return caches.match(event.request);
      })
  );
});
