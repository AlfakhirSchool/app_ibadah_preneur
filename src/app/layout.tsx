import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import { PWARegister } from "@/components/PWARegister";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ibadah Planner - SMP Islam Modern Al Fakhir",
  description:
    "Aplikasi pencatatan ibadah harian siswa SMP Islam Modern Al Fakhir. Pantau shalat, tilawah, murojaah, dan kegiatan ibadah lainnya.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ibadah Planner",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#064e3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SessionProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1 pb-20 sm:pb-0">{children}</main>
            <Navbar />
          </div>
        </SessionProvider>
        <PWARegister />
      </body>
    </html>
  );
}
