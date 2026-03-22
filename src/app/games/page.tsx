import Link from "next/link";

const games = [
  {
    id: "matching",
    title: "用語マッチング",
    description: "左の用語と右の説明をペアにしよう。正確さとスピードを競え！",
    icon: "🔗",
    color: "from-cyan-500 to-blue-600",
    badge: "記憶力",
  },
  {
    id: "flashcards",
    title: "フラッシュカード",
    description: "カードをめくって用語と説明を暗記。覚えた/もう一度で仕分けできる。",
    icon: "🃏",
    color: "from-violet-500 to-purple-600",
    badge: "暗記",
  },
  {
    id: "speed",
    title: "スピードチャレンジ",
    description: "60秒以内にできるだけ多くの問題に正解しよう。連続正解でボーナス！",
    icon: "⚡",
    color: "from-orange-500 to-red-500",
    badge: "反射神経",
  },
];

export default function GamesHub() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-sm font-medium text-[var(--primary)]">
          楽しく学ぶ
        </p>
        <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))` }}>
          ゲームモード
        </h1>
        <p className="text-[var(--muted)] max-w-lg mx-auto">
          クイズだけじゃない！ゲーム感覚でIT用語を身につけよう。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="group block rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{game.icon}</span>
              <span
                className={`inline-block text-xs text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${game.color}`}
              >
                {game.badge}
              </span>
            </div>
            <h2 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
              {game.title}
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
              {game.description}
            </p>
            <span className="text-sm font-medium text-[var(--primary)]">
              プレイする →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          &larr; ホームに戻る
        </Link>
      </div>
    </div>
  );
}
