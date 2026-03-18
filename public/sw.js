const CACHE_NAME = 'habit-tracker-v2';

// Resource yang akan di-cache saat install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/fonts.css',
  '/globals.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Hanya tangani request GET
  if (event.request.method !== 'GET') return;

  // Lewati request chrome-extension atau skema non-http
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Kembalikan cache tapi update di background (Stale-While-Revalidate)
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          }
        });
        return cachedResponse;
      }

      return fetch(event.request).then(response => {
        // Jangan simpan response error atau non-ok
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Opsi: return halaman offline jika gagal fetch sama sekali
        return caches.match('/');
      });
    })
  );
});
