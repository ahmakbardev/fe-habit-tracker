"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show popup after a short delay or based on some logic
      // For now, show it 3 seconds after load if not installed
      const timer = setTimeout(() => {
        if (!window.matchMedia("(display-mode: standalone)").matches) {
          setShowPopup(true);
          sessionStorage.setItem("pwa-popup-active", "true");
        }
      }, 3000);

      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPopup(false);
      setDeferredPrompt(null);
      sessionStorage.removeItem("pwa-popup-active");
      console.log("PWA was installed");
    });

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("SW registered: ", registration);
          },
          (registrationError) => {
            console.log("SW registration failed: ", registrationError);
          }
        );
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPopup(false);
  };

  if (isInstalled || !showPopup || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[999]"
      >
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="text-lg font-bold mb-1">Install App</h3>
            <p className="text-slate-400 text-sm mb-4">
              Install our app on your home screen for a better experience and quick access.
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Add to Home Screen
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
