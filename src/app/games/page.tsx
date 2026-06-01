import Link from "next/link";
import { ExamType, examShortLabels } from "@/lib/types";
import { drillList } from "@/lib/drills";
import { chizaiDrillList } from "@/data/chizaiDrills";
import { itPassportDrillList } from "@/data/itDrills";

const specializedDrills: Record<ExamType, typeof drillList> = {
  "it-passport": itPassportDrillList,
  chizai: chizaiDrillList,
};

const specializedLabel: Record<ExamType, string> = {
  "it-passport": "ITパスポート 特化ドリル",
  chizai: "知財3級 特化ドリル",
};

const games = [
  {
    id: "matching",
    title: "用語マッチング",
    description: "用語と説明をペアにしよう。正確さとスピードを競え！",
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

const exams: { id: ExamType; accent: string }[] = [
  { id: "it-passport", accent: "from-blue-500 to-indigo-600" },
  { id: "chizai", accent: "from-emerald-500 to-teal-600" },
];

export default function GamesHub() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <header className="mb-8 text-center sm:mb-10">
        <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-sm font-medium text-[var(--primary)]">
          楽しく学ぶ
        </p>
        <h1 className="text-2xl font-bold mb-3 bg-clip-text text-transparent sm:text-3xl" style={{ backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))` }}>
          ゲームモード
        </h1>
        <p className="text-[var(--muted)] max-w-lg mx-auto">
          ITパスポートと知財3級、それぞれの用語をゲーム感覚で身につけよう。
        </p>
      </header>

      <div className="space-y-10">
        {exams.map((exam) => (
          <section key={exam.id}>
            <div className="mb-4 flex items-center gap-3">
              <span className={`inline-block h-6 w-1.5 rounded-full bg-gradient-to-b ${exam.accent}`} />
              <h2 className="text-xl font-bold">{examShortLabels[exam.id]}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {games.map((game) => (
                <Link
                  key={`${exam.id}-${game.id}`}
                  href={`/games/${game.id}?exam=${exam.id}`}
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
                  <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                    {game.description}
                  </p>
                  <span className="text-sm font-medium text-[var(--primary)]">
                    プレイする →
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-5 mb-3 text-sm font-semibold text-[var(--muted)]">用語ドリル</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {drillList.map((drill) => (
                <Link
                  key={`${exam.id}-${drill.kind}`}
                  href={`/games/drills/${drill.kind}?exam=${exam.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{drill.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold group-hover:text-[var(--primary)]">{drill.title}</span>
                    <span className="block text-xs text-[var(--muted)]">{drill.description}</span>
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-5 mb-3 text-sm font-semibold text-[var(--muted)]">{specializedLabel[exam.id]}</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {specializedDrills[exam.id].map((drill) => (
                <Link
                  key={`${exam.id}-${drill.kind}`}
                  href={`/games/drills/${drill.kind}?exam=${exam.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <span className="text-2xl">{drill.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold group-hover:text-[var(--primary)]">{drill.title}</span>
                    <span className="block text-xs text-[var(--muted)]">{drill.description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
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
