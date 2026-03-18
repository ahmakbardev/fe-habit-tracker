"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationService } from "@/lib/notification-service";

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

export default function PushNotificationManager() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    setPermissionStatus(Notification.permission);
    
    // Langsung munculkan setelah 2 detik untuk testing
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    console.log("🖱️ Button Clicked: Enable Now");
    const granted = await NotificationService.requestPermission();
    console.log("🖱️ Permission result in component:", granted);
    if (granted) {
      setPermissionStatus('granted');
    } else {
      setPermissionStatus(Notification.permission);
    }
    setShowPrompt(false);
  };

  const handleDeny = () => {
    setShowPrompt(false);
    // User can manually enable later in settings
  };

  const triggerTestNotification = async () => {
    console.log("🔔 Triggering test notification...");
    if (!("serviceWorker" in navigator)) {
      alert("Browser kamu tidak mendukung Service Worker.");
      return;
    }
    
    try {
      // Menggunakan navigator.serviceWorker.ready untuk memastikan SW sudah aktif
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker Ready:", registration);
      
      if (!registration) {
        // Fallback: coba daftarkan ulang jika benar-benar kosong
        const newReg = await navigator.serviceWorker.register("/sw.js");
        console.log("🆕 Re-registered Service Worker:", newReg);
        alert("Service Worker baru didaftarkan. Coba klik tombol lonceng sekali lagi.");
        return;
      }

      await registration.showNotification('🔥 Target Habit Hari Ini!', {
        body: 'Kamu sudah lari 3km, tinggal 2km lagi untuk mencapai target harianmu. Ayo semangat!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1000', // Gambar lari keren sebagai contoh
        vibrate: [200, 100, 200, 100, 200],
        tag: 'test-notification',
        actions: [
          { action: 'view_app', title: '🚀 Buka Aplikasi' },
          { action: 'mark_done', title: '✅ Selesai' }
        ]
      } as ExtendedNotificationOptions);
      
      console.log("🚀 Notification command sent to OS!");
    } catch (err) {
      console.error("❌ Failed to show notification:", err);
      alert("Gagal memunculkan notifikasi: " + err);
    }
  };

  // If permission is already granted, don't show anything (removed test button)
  if (permissionStatus === 'granted') {
    return null;
  }

  if (permissionStatus === 'unsupported' || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="fixed bottom-24 right-4 px-5 md:right-6 md:w-80 z-[998]"
      >
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-purple-500/10 p-2 rounded-xl">
                <Bell className="w-6 h-6 text-purple-400" />
              </div>
              <button 
                onClick={handleDeny}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-lg font-bold mb-1">Enable Reminders?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Get notified 5-10 minutes before your todos start. Never miss a task again!
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                className="flex-1 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-all text-sm"
              >
                Later
              </button>
              <button
                onClick={handleAllow}
                className="flex-[2] py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
              >
                Enable Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
