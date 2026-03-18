const CACHE_NAME = 'habit-tracker-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Skip caching for now to avoid install errors
  return;
});

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', event => {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;

  let data = {
    title: 'Habit Tracker',
    body: 'Ada pengingat untuk kamu!',
    icon: '/favicon.ico'
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
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [{ action: 'view_app', title: 'Buka Aplikasi' }]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/dashboard');
    })
  );
});
