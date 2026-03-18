"use client";

import dynamic from "next/dynamic";

const PWAInstaller = dynamic(() => import("./PWAInstaller"), { ssr: false });
const SplashScreen = dynamic(() => import("./SplashScreen"), { ssr: false });

export default function ClientOnlyWrapper() {
  return (
    <>
      <SplashScreen />
      <PWAInstaller />
    </>
  );
}
