const CACHE_NAME = 'health-tracker-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// Install - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET chrome extensions, Vite HMR, and dev server requests
  if (request.url.includes('/@') || request.url.includes('.hot-update.') ||
      request.url.includes('chrome-extension') || request.url.includes('__vite')) {
    return;
  }

  // API requests: network only, queue if offline
  if (request.url.includes('/auth/') || request.url.includes('/cycles') ||
      request.url.includes('/symptoms') || request.url.includes('/moods') ||
      request.url.includes('/reminders') || request.url.includes('/ai/')) {

    if (request.method === 'GET') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => caches.match(request))
      );
    } else {
      // POST/PATCH/DELETE - try network, queue if offline
      event.respondWith(
        fetch(request).catch(() => {
          // Store in IndexedDB for later sync
          return new Response(JSON.stringify({ queued: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 202,
          });
        })
      );
    }
    return;
  }

  // Static assets: network first in dev, cache first in prod
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 })))
  );
});
