import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
