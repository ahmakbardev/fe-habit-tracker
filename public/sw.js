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
  return;
});

// PUSH NOTIFICATION HANDLER
self.addEventListener('push', event => {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;

  let data = {
    title: 'Habit Tracker',
    body: 'Ada pengingat baru untukmu! 🔥',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const customData = data.data || {};
  const itemId = customData.id || data.itemId || data.id;
  const targetUrl = data.url || customData.url || '/dashboard';
  
  const isHabit = (data.tag && data.tag.includes('habit')) || 
                  (data.title && data.title.toLowerCase().includes('habit')) ||
                  (targetUrl && targetUrl.includes('habits'));
  
  const isTask = (data.tag && (data.tag.includes('todo') || data.tag.includes('task'))) || 
                 (data.title && (data.title.toLowerCase().includes('task') || data.title.toLowerCase().includes('todo'))) ||
                 (targetUrl && targetUrl.includes('tasks'));

  let bannerImage = data.image;
  if (!bannerImage) {
    if (isHabit) {
      bannerImage = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1000';
    } else if (isTask) {
      bannerImage = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000';
    } else {
      bannerImage = 'https://images.unsplash.com/photo-1506784919141-177b7ec8ee2e?auto=format&fit=crop&q=80&w=1000';
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: bannerImage,
    vibrate: [300, 100, 300, 100, 400],
    tag: data.tag || (itemId ? `item-${itemId}` : 'general-notification'),
    renotify: true,
    data: {
      url: targetUrl,
      itemId: itemId
    },
    actions: [
      { action: 'view_app', title: '🚀 Buka Aplikasi', icon: '/favicon.ico' },
      { action: 'mark_done', title: '✅ Selesai', icon: '/favicon.ico' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// NOTIFICATION CLICK HANDLER - IMPROVED REDIRECTION
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  notification.close();

  // Construct absolute URL for comparison
  const urlToOpen = new URL(data.url || '/dashboard', self.location.origin).href;
  const finalUrl = action === 'mark_done' 
    ? `${urlToOpen}${urlToOpen.includes('?') ? '&' : '?'}action=mark_done&id=${data.itemId}`
    : urlToOpen;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(windowClients => {
      // 1. If there's already a window/PWA open on our origin
      for (let client of windowClients) {
        // Match base path to ensure we use existing app instance
        const clientUrl = new URL(client.url, self.location.origin).href;
        if (clientUrl.startsWith(self.location.origin) && 'focus' in client) {
          // Navigate existing window to new URL and focus
          return client.navigate(finalUrl).then(c => c.focus());
        }
      }
      
      // 2. If no window is open, open a new one.
      // If the app is installed, the browser should open it in standalone mode.
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});
