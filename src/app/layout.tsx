import type { Metadata, Viewport } from "next";
import Link from "next/link";
import ThemeSelector from "@/components/ThemeSelector";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
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
      <body className="min-h-screen">
        <ServiceWorkerRegistrar />
        <ThemeSelector />
        <div className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold tracking-wide text-[var(--foreground)]">ITパス＆知財3級</Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/study?category=strategy" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Study</Link>
              <Link href="/games" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Games</Link>
              <Link href="/glossary" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Glossary</Link>
              <Link href="/history" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">History</Link>
              <Link href="/settings" className="rounded-full border border-[var(--card-border)] px-3 py-1.5 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card)]">Settings</Link>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
