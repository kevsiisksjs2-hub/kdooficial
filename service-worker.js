
const CACHE_NAME = 'kdo-v2';
const DYNAMIC_CACHE = 'kdo-dynamic-v2';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install: Cache core app shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// Fetch: Handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. Ignore API calls (Google AI, etc) - Network Only
  if (url.hostname.includes('googleapis.com') || url.pathname.includes('/api/')) {
    return;
  }

  // 2. Navigation (HTML) - Network First, fallback to Cache, fallback to Offline Page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // 3. Assets (JS, CSS, Images, Fonts) - Stale-While-Revalidate or Cache First
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then(response => {
        // Check for valid response
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
          return response;
        }

        // Clone response to cache it
        const responseToCache = response.clone();

        caches.open(DYNAMIC_CACHE).then(cache => {
          // Only cache http/https requests
          if (event.request.url.startsWith('http')) {
             cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});
