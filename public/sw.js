// Service Worker for RADIO KONTROLLE PWA
const CACHE_NAME = 'radiokontrolle-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/assets/kontrolle-app-icon-192.png',
  '/assets/kontrolle-app-icon-512.png',
  '/assets/kontrolle-color-icon.svg',
  '/assets/bng-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial skip:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // IMPORTANT: Never intercept or cache audio streams, live broadcasts, range requests, or Digital Asset Links
  if (
    request.destination === 'audio' ||
    request.destination === 'video' ||
    url.includes('stream') ||
    url.includes('icecast') ||
    url.includes('live') ||
    url.includes('.well-known') ||
    request.headers.get('range') ||
    request.method !== 'GET'
  ) {
    return;
  }

  // Network-first strategy with cache fallback for HTML / API, Cache-first for static icons
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse && (url.includes('/assets/') || url.includes('/icons/'))) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            !url.includes('api/')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match('/'));
    })
  );
});
