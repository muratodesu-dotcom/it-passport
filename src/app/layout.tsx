import type { Metadata } from "next";
import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITパスポート試験 学習アプリ",
  description: "ITパスポート試験対策のための学習・クイズアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">
        <DarkModeToggle />
        <div className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold tracking-wide text-[var(--foreground)]">IT Passport</Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/study?category=strategy" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Study</Link>
              <Link href="/games" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Games</Link>
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
