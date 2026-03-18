import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./fonts.css";
import ClientOnlyWrapper from "./components/ClientOnlyWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habit Tracker & Notes",
  description: "Your ultimate productivity companion",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HabitTracker",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Static Splash Screen - Rendered immediately by browser */}
        <div 
          id="pwa-static-splash"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#020617",
            transition: "opacity 0.5s ease-in-out",
          }}
        >
          {/* Ambient Glow */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "256px",
            height: "256px",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            filter: "blur(100px)",
            borderRadius: "9999px",
          }} />
          
          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              backgroundColor: "white",
              borderRadius: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.2)",
              marginBottom: "24px",
              marginInline: "auto"
            }}>
              <img src="/icons/favicon.svg" alt="Logo" style={{ width: "40px", height: "40px" }} />
            </div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-0.025em",
              margin: 0
            }}>
              HabitFlow
            </h1>
            <p style={{
              color: "#64748b",
              fontSize: "14px",
              marginTop: "4px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}>
              Productivity Reimagined
            </p>
          </div>
        </div>

        {/* Konten Utama dirender lebih dulu */}
        {children}
        
        {/* Komponen Client dimuat di akhir dan hanya di sisi client */}
        <ClientOnlyWrapper />

        <svg
          style={{
            position: "absolute",
            width: 0,
            height: 0,
          }}
        >
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          0 0 0 30 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>
      </body>
    </html>
  );
}
