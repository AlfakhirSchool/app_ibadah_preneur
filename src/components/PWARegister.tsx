"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    // Jangan registrasi Service Worker jika dibuka di aplikasi Android (APK)
    // agar tidak bentrok dengan sistem internal App
    const isAndroidApp = navigator.userAgent.includes("IbadahPlannerAndroidApp");
    
    if (!isAndroidApp && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope);
        })
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    }
  }, []);

  return null;
}
