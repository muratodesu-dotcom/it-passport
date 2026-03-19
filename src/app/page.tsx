import Link from "next/link";

const categories = [
  {
    id: "all",
    title: "全分野",
    description: "ストラテジ・マネジメント・テクノロジの全50問",
    color: "from-indigo-500 to-purple-600",
    icon: "📚",
    count: 50,
  },
  {
    id: "strategy",
    title: "ストラテジ系",
    description: "企業活動、法務、経営戦略、システム戦略",
    color: "from-blue-500 to-cyan-500",
    icon: "💼",
    count: 17,
  },
  {
    id: "management",
    title: "マネジメント系",
    description: "開発技術、プロジェクトマネジメント、サービスマネジメント",
    color: "from-green-500 to-emerald-500",
    icon: "📋",
    count: 17,
  },
  {
    id: "technology",
    title: "テクノロジ系",
    description: "基礎理論、コンピュータシステム、技術要素、セキュリティ",
    color: "from-purple-500 to-pink-500",
    icon: "💻",
    count: 16,
  },
];

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ITパスポート試験
        </h1>
        <p className="text-lg text-[var(--muted)]">学習＆模擬テストアプリ</p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">
          クイズモードで挑戦
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/quiz?category=${cat.id}`}
              className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)]">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mb-2">
                    {cat.description}
                  </p>
                  <span
                    className={`inline-block text-xs text-white px-2 py-1 rounded-full bg-gradient-to-r ${cat.color}`}
                  >
                    {cat.count}問
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-center">
          学習モードで復習
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.slice(1).map((cat) => (
            <Link
              key={cat.id}
              href={`/study?category=${cat.id}`}
              className="block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="text-2xl block mb-2">{cat.icon}</span>
              <h3 className="font-semibold mb-1">{cat.title}</h3>
              <p className="text-xs text-[var(--muted)]">解説付き学習</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="text-center">
        <Link
          href="/history"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:shadow-md transition-all hover:-translate-y-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <span>📊</span>
          <span className="font-medium">学習履歴を見る</span>
        </Link>
      </section>
    </div>
  );
}
