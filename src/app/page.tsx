import Link from "next/link";
import type { ReactNode } from "react";
import { chizaiQuestions, itPassportQuestions } from "@/data/questions";
import { ipFieldLabels } from "@/lib/types";
import StudyPulse from "@/components/StudyPulse";

const categoryDefinitions = [
  {
    id: "all",
    title: "全分野",
    description: `ストラテジ・マネジメント・テクノロジの全${itPassportQuestions.length}問`,
    color: "from-indigo-500 to-purple-600",
    icon: "📚",
  },
  {
    id: "strategy",
    title: "ストラテジ系",
    description: "企業活動、法務、経営戦略、システム戦略",
    color: "from-blue-500 to-cyan-500",
    icon: "💼",
  },
  {
    id: "management",
    title: "マネジメント系",
    description: "開発技術、プロジェクトマネジメント、サービスマネジメント",
    color: "from-green-500 to-emerald-500",
    icon: "📋",
  },
  {
    id: "technology",
    title: "テクノロジ系",
    description: "基礎理論、コンピュータシステム、技術要素、セキュリティ",
    color: "from-purple-500 to-pink-500",
    icon: "💻",
  },
];

const categories = categoryDefinitions.map((category) => ({
  ...category,
  count:
    category.id === "all"
      ? itPassportQuestions.length
      : itPassportQuestions.filter((question) => question.category === category.id).length,
}));

const totalQuestions = itPassportQuestions.length;
const chizaiCount = chizaiQuestions.length;

// 知財3級の分野別練習カード（全分野＋4分野）。本番試験ではなく解説付きの練習導線。
const chizaiFieldDefinitions = [
  { id: "all", title: "全分野", description: "特許・意匠商標・著作権・その他をまとめて", color: "from-amber-500 to-orange-500", icon: "⚖️" },
  { id: "patent", title: ipFieldLabels.patent, description: "特許法・実用新案法", color: "from-blue-500 to-cyan-500", icon: "🔬" },
  { id: "design-trademark", title: ipFieldLabels["design-trademark"], description: "意匠法・商標法", color: "from-pink-500 to-rose-500", icon: "🎨" },
  { id: "copyright", title: ipFieldLabels.copyright, description: "著作権法・著作隣接権", color: "from-purple-500 to-fuchsia-500", icon: "✍️" },
  { id: "other", title: ipFieldLabels.other, description: "不正競争防止法・契約・条約", color: "from-emerald-500 to-teal-500", icon: "📜" },
];
const chizaiFields = chizaiFieldDefinitions.map((f) => ({
  ...f,
  count: f.id === "all" ? chizaiQuestions.length : chizaiQuestions.filter((q) => (q.ipField ?? "other") === f.id).length,
}));
const estimatedMinutes = Math.ceil(totalQuestions * 0.7);

// 折りたたみ式セクション。ネイティブの <details> を使うので追加のJSは不要。
function Section({
  icon,
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  icon: string;
  title: string;
  hint: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm"
    >
      <summary className="flex cursor-pointer list-none select-none items-center gap-3 p-5 transition-colors hover:bg-[var(--card-hover)] [&::-webkit-details-marker]:hidden">
        <span className="text-2xl" aria-hidden>{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-tight">{title}</span>
          <span className="mt-0.5 block text-sm text-[var(--muted)]">{hint}</span>
        </span>
        <svg
          className="h-5 w-5 shrink-0 text-[var(--muted)] transition-transform group-open:rotate-180"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-[var(--card-border)] p-5">{children}</div>
    </details>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      {/* Hero — 要点だけに絞った導入 */}
      <header className="mb-6 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          ITパスポート＆知財3級 対策をひとつのアプリで
        </p>
        <h1
          className="mb-3 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl"
          style={{ backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))` }}
        >
          ITパスポート＆知財3級 学習＆模擬テスト
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          分野別クイズ・解説付き学習・本番試験モードをまとめて。下のメニューから目的に合わせて選べます。
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap">
          <Link
            href="/quiz?category=all"
            className="rounded-xl bg-[var(--primary)] px-6 py-3 text-center font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            総合クイズを始める
          </Link>
          <Link
            href="/study?category=strategy"
            className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
          >
            学習モードへ
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] px-3 py-1.5">
            <span aria-hidden>📚</span> ITパスポート <b className="font-semibold">{totalQuestions}</b>問
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] px-3 py-1.5">
            <span aria-hidden>⚖️</span> 知財3級 <b className="font-semibold">{chizaiCount}</b>問
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--badge-bg)] px-3 py-1.5">
            <span aria-hidden>⏱</span> 総合クイズ 約<b className="font-semibold">{estimatedMinutes}</b>分
          </span>
        </div>
      </header>

      <StudyPulse />

      {/* 目的別メニュー（折りたたみ） */}
      <div className="space-y-3">
        <Section icon="🎯" title="本番試験モードで腕試し" hint="公式に近い形式・合格基準で採点" defaultOpen>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/quiz?mode=exam&exam=it-passport"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">ITパスポート 本番試験</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                100問・120分。総合60%以上かつ各分野30%以上で合格判定（公式のIRT方式を正答率で近似）。
              </p>
            </Link>
            <Link
              href="/quiz?mode=exam&exam=chizai"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">⚖️</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">知財3級 本番試験</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                学科形式30問・45分。満点の70%以上で合格判定。知的財産管理技能検定3級に対応。
              </p>
            </Link>
          </div>
        </Section>

        <Section icon="✏️" title="クイズで挑戦" hint="ITパスポートを分野別に・知財3級を分野別に練習">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">ITパスポート（分野別）</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/quiz?category=${cat.id}`}
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-0.5 font-bold group-hover/card:text-[var(--primary)]">{cat.title}</h3>
                    <p className="mb-2 text-sm text-[var(--muted)]">{cat.description}</p>
                    <span className={`inline-block rounded-full bg-gradient-to-r px-2 py-0.5 text-xs text-white ${cat.color}`}>
                      {cat.count}問
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">知財3級（分野別・解説付き）</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {chizaiFields.map((f) => (
              <Link
                key={f.id}
                href={`/quiz?mode=practice&exam=chizai&field=${f.id}`}
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-0.5 font-bold group-hover/card:text-[var(--primary)]">{f.title}</h3>
                    <p className="mb-2 text-sm text-[var(--muted)]">{f.description}</p>
                    <span className={`inline-block rounded-full bg-gradient-to-r px-2 py-0.5 text-xs text-white ${f.color}`}>
                      {f.count}問
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section icon="📖" title="学習モードで復習" hint="解説付きの通常モード＆連続インプットのDoom Scroll">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">ITパスポート</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {categories.slice(1).map((cat) => (
              <Link
                key={cat.id}
                href={`/study?category=${cat.id}`}
                className="block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="rounded-full bg-[var(--badge-bg)] px-2 py-1 text-xs text-[var(--muted)]">{cat.count} cards</span>
                </div>
                <h3 className="mb-1 font-semibold">{cat.title}</h3>
                <span className="text-sm font-medium text-[var(--primary)]">学習を始める →</span>
              </Link>
            ))}
          </div>

          <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">知財3級（解説 日英対応）</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {chizaiFields.filter((f) => f.id !== "all").map((f) => (
              <Link
                key={f.id}
                href={`/study?exam=chizai&category=${f.id}`}
                className="block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="rounded-full bg-[var(--badge-bg)] px-2 py-1 text-xs text-[var(--muted)]">{f.count} cards</span>
                </div>
                <h3 className="mb-1 font-semibold">{f.title}</h3>
                <span className="text-sm font-medium text-[var(--primary)]">学習を始める →</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section icon="🎮" title="ゲームモードで楽しく学ぶ" hint="マッチング・フラッシュカード・スピード">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { id: "matching", title: "用語マッチング", desc: "用語と説明をペアにしよう", icon: "🔗", color: "from-cyan-500 to-blue-600" },
              { id: "flashcards", title: "フラッシュカード", desc: "めくって覚えて仕分けする", icon: "🃏", color: "from-violet-500 to-purple-600" },
              { id: "speed", title: "スピードチャレンジ", desc: "60秒で何問解ける？", icon: "⚡", color: "from-orange-500 to-red-500" },
            ].map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <span className={`rounded-full bg-gradient-to-r px-2 py-0.5 text-xs text-white ${game.color}`}>NEW</span>
                </div>
                <h3 className="mb-1 font-semibold group-hover/card:text-[var(--primary)]">{game.title}</h3>
                <p className="text-xs text-[var(--muted)]">{game.desc}</p>
              </Link>
            ))}
          </div>
          <Link href="/games" className="mt-4 inline-block text-sm font-medium text-[var(--primary)]">
            すべてのゲームを見る →
          </Link>
        </Section>

        <Section icon="🌀" title="用語をインプット" hint="調べたいときは用語集、覚えたいときはフィード">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link
              href="/scroll"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">🌀</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">用語フィード（Doom Scroll）</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                用語と解説が無限に流れてくる学習フィード。自己テストモードで説明を隠して思い出す練習もできます。
              </p>
            </Link>
            <Link
              href="/glossary"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">用語集を引く</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">
                出題範囲の頻出用語をカテゴリ別に一覧。和英対応つきで、調べたい言葉をすばやく確認できます。
              </p>
            </Link>
          </div>
        </Section>

        <Section icon="📊" title="履歴を見て、伸びを確認" hint="最高・平均スコアと合格率から復習計画を立てる">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              クイズ結果は学習履歴に保存されます。最高スコア・平均スコア・合格率を見ながら次の復習計画を立てられます。
            </p>
            <Link
              href="/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-[var(--muted)] transition-all hover:-translate-y-0.5 hover:text-[var(--foreground)] hover:shadow-md"
            >
              <span>📊</span>
              <span className="font-medium">学習履歴を見る</span>
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}
