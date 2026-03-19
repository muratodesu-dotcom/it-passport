import type { Metadata } from "next";
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
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
