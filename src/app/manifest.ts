import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "資格学習 — ITパスポート / 知財3級",
    short_name: "資格学習",
    description: "ITパスポート試験と知的財産管理技能検定3級に対応した学習・クイズアプリ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    lang: "ja",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "今日の20問",
        short_name: "今日の問題",
        description: "弱点分野からの20問チャレンジ",
        url: "/quiz?category=all&length=20",
      },
      {
        name: "復習モード",
        short_name: "復習",
        description: "間違えた問題を集中ドリル",
        url: "/review",
      },
      {
        name: "用語インデックス",
        short_name: "用語",
        description: "全用語の検索・閲覧",
        url: "/terms",
      },
    ],
  };
}
