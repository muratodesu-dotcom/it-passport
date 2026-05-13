import Link from "next/link";

const games = [
  {
    id: "term-quiz",
    title: "用語クイズ",
    description: "説明から正しい用語を4択で選ぶ。連続正解でストリークを伸ばそう。",
    icon: "📝",
    tag: "4択",
  },
  {
    id: "memory",
    title: "メモリーマッチ",
    description: "カードを裏返してペアを探す神経衰弱。短期記憶を鍛えよう。",
    icon: "🧠",
    tag: "記憶",
  },
  {
    id: "matching",
    title: "用語マッチング",
    description: "並べた用語と説明を線でつなぐ。スピードと正確さで評価。",
    icon: "🔗",
    tag: "ペア",
  },
  {
    id: "flashcards",
    title: "フラッシュカード",
    description: "めくって覚える定番の暗記モード。覚えた/もう一度で仕分け。",
    icon: "🃏",
    tag: "暗記",
  },
  {
    id: "speed",
    title: "スピードチャレンジ",
    description: "60秒で何問解けるか挑戦。連続正解でボーナス。",
    icon: "⚡",
    tag: "60秒",
  },
];

export default function GamesHub() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-1">ゲームモード</h1>
        <p className="text-sm text-[var(--muted)]">
          クイズだけじゃない。手を動かしてIT用語を身につけよう。
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.id}`}
            className="group flex items-start gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl leading-none mt-0.5">{game.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold group-hover:text-[var(--primary)] transition-colors">
                  {game.title}
                </h2>
                <span className="rounded-full bg-[var(--badge-bg)] px-2 py-0.5 text-[0.65rem] font-medium text-[var(--muted)]">
                  {game.tag}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted)]">
                {game.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
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
