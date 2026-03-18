"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationService } from "@/lib/notification-service";

export default function PushNotificationManager() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    setPermissionStatus(Notification.permission);

    // Show prompt logic:
    // 1. If permission is 'default' (not asked yet)
    // 2. Wait 10 seconds if PWA popup is potentially active
    // 3. Or 5 seconds if already standalone
    if (Notification.permission === 'default') {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const delay = isStandalone ? 5000 : 15000; // Standalone faster (5s), Website slower (15s)

      const timer = setTimeout(() => {
        // Check if PWA installer is currently busy
        if (!sessionStorage.getItem("pwa-popup-active")) {
          setShowPrompt(true);
        } else {
          // If still busy, check again in 5 seconds
          const retryTimer = setInterval(() => {
            if (!sessionStorage.getItem("pwa-popup-active")) {
              setShowPrompt(true);
              clearInterval(retryTimer);
            }
          }, 5000);
        }
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    const granted = await NotificationService.requestPermission();
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

  if (permissionStatus === 'granted' || permissionStatus === 'unsupported' || !showPrompt) {
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
