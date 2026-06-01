import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { themeBootScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITパスポート＆知財3級 学習アプリ",
  description: "ITパスポート試験と知的財産管理技能検定3級に対応した学習・クイズアプリ",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "ITパス＆知財3級",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-screen">
        <ServiceWorkerRegistrar />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
