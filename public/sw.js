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

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', event => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  let data = {
    title: 'Reminder Habit Tracker',
    body: 'Ada sesuatu yang perlu kamu kerjakan!',
    icon: '/icon-192x192.png',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/icon-192x192.png', // Monochrome icon for Android
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [
      { action: 'view_app', title: 'Buka Aplikasi' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Redirect ke halaman spesifik jika ada ID di data
  let urlToOpen = '/';
  if (event.notification.data && event.notification.data.id) {
    // Sesuaikan path berdasarkan tipe data (misal: /tasks/[id])
    urlToOpen = `/tasks`; 
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Jika tab aplikasi sudah terbuka, fokus ke tab tersebut
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika belum ada tab terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
