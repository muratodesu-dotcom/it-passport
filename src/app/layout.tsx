import type { Metadata } from "next";
import Link from "next/link";
import ThemeSelector from "@/components/ThemeSelector";
import ExamSelector from "@/components/ExamSelector";
import { ExamProvider } from "@/lib/examContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "資格学習アプリ — ITパスポート / 知財3級",
  description: "ITパスポート試験と知的財産管理技能検定3級に対応した学習・クイズアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen">
        <ExamProvider>
          <ThemeSelector />
          <div className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="text-sm font-semibold tracking-wide text-[var(--foreground)]">資格学習</Link>
              <nav className="flex items-center gap-3 text-sm">
                <Link href="/study" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Study</Link>
                <Link href="/terms" className="hidden sm:inline text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Terms</Link>
                <Link href="/games" className="text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Games</Link>
                <Link href="/review" className="hidden sm:inline text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">Review</Link>
                <Link href="/history" className="hidden sm:inline text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">History</Link>
                <ExamSelector />
                <Link href="/settings" className="rounded-full border border-[var(--card-border)] px-3 py-1.5 font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card)]">Settings</Link>
              </nav>
            </div>
          </div>
          {children}
        </ExamProvider>
      </body>
    </html>
  );
}
