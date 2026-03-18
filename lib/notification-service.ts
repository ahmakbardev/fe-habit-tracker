import api from './axios';

const VAPID_PUBLIC_KEY = 'BEStur5-9xp43ohkryv1_BETJfnUNJoCCvc-bFL6RJV3x4LytsL4DYxNf7ocDxtW9P-aZC5jk4JJHxDcng-6ybk';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationService = {
  async requestPermission() {
    console.log("🛠️ NotificationService: requestPermission called");
    if (!('Notification' in window)) {
      console.log('❌ NotificationService: Browser does not support notifications.');
      return false;
    }

    try {
      console.log("📝 NotificationService: Asking for browser permission...");
      const permission = await Notification.requestPermission();
      console.log("📝 NotificationService: Browser permission result:", permission);
      
      if (permission === 'granted') {
        console.log("✅ NotificationService: Permission granted, subscribing user...");
        await this.subscribeUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ NotificationService: Error in requestPermission:", error);
      return false;
    }
  },

  async subscribeUser() {
    try {
      console.log("🔍 NotificationService: Checking Service Worker registration...");
      
      if (!('serviceWorker' in navigator)) {
        console.error("❌ NotificationService: Service Worker not supported");
        return;
      }

      // Pastikan SW terdaftar
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log("⚠️ NotificationService: SW not registered, registering now...");
        registration = await navigator.serviceWorker.register("/sw.js");
      }

      // Tunggu sampai SW aktif (biar nggak hang di .ready)
      console.log("⏳ NotificationService: Waiting for Service Worker to be active...");
      
      // Jika SW baru saja didaftarkan, kita harus menunggu dia aktif
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("SW activation timeout")), 10000);
        
        if (registration?.active) {
          clearTimeout(timeout);
          resolve();
        } else {
          const sw = registration?.installing || registration?.waiting;
          sw?.addEventListener('statechange', () => {
            if (sw?.state === 'activated') {
              clearTimeout(timeout);
              resolve();
            }
          });
          
          // Fallback: jika sudah ready tapi belum active
          navigator.serviceWorker.ready.then(() => {
            clearTimeout(timeout);
            resolve();
          });
        }
      });

      console.log("✅ NotificationService: Service Worker is active and ready");

      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log("ℹ️ NotificationService: Found existing subscription");
        await this.sendSubscriptionToServer(existingSubscription);
        return existingSubscription;
      }

      console.log("🔑 NotificationService: Requesting new subscription...");
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('✅ NotificationService: New subscription created');
      
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('❌ NotificationService: Failed to subscribe user:', error);
    }
  },

  async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const { endpoint, keys } = subscription.toJSON();
      console.log("📤 Sending subscription to Laravel...", { endpoint, keys });
      
      const response = await api.post('/push-subscriptions', {
        endpoint,
        keys: {
          auth: keys?.auth,
          p256dh: keys?.p256dh
        },
        content_encoding: "aesgcm" // Ditambahkan sesuai requirement backend
      });
      
      console.log('✅ Subscription saved in Laravel database:', response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Error saving subscription to Laravel:', errorMessage);
    }
  },

  async unsubscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await api.delete('/push-subscriptions', {
          data: { endpoint: subscription.endpoint }
        });
        console.log('User unsubscribed');
      }
    } catch (error) {
      console.error('Error unsubscribing user:', error);
    }
  }
};
