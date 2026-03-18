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
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.subscribeUser();
      return true;
    }
    return false;
  },

  async subscribeUser() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // Optional: Send to server anyway to ensure it's up to date
        await this.sendSubscriptionToServer(existingSubscription);
        return existingSubscription;
      }

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      };

      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      console.log('User subscribed:', subscription);
      
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
    }
  },

  async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const { endpoint, keys } = subscription.toJSON();
      await api.post('/push-subscriptions', {
        endpoint,
        keys: {
          auth: keys?.auth,
          p256dh: keys?.p256dh
        }
      });
      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
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
