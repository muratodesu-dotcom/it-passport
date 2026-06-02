import Link from "next/link";
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
const totalCategories = categories.length - 1;
const estimatedMinutes = Math.ceil(totalQuestions * 0.7);

const featureCards = [
  {
    title: "学習導線を強化",
    description: "ホームからクイズ・学習・履歴に最短で移動できる導線を整理しました。",
    icon: "🧭",
  },
  {
    title: "Doom Scroll学習",
    description: "問題も用語・解説も、無限に流れるフィードでテンポよく連続インプットできます。",
    icon: "🌀",
  },
  {
    title: "試験向けの密度",
    description: "分野別の学習量がひと目で分かり、短いスキマ時間でも着手しやすい設計です。",
    icon: "⚡",
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <header className="mb-8 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm sm:mb-12 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs font-medium text-[var(--primary)] sm:text-sm">
              ITパスポート＆知財3級 対策をもっと楽しく、もっと濃く
            </p>
            <h1 className="mb-4 text-2xl font-bold leading-tight bg-clip-text text-transparent sm:text-4xl" style={{ backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))` }}>
              ITパスポート＆知財3級 学習＆模擬テストアプリ
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              ITパスポート試験と知的財産管理技能検定3級の両方に対応。分野別クイズ、解説付き学習、履歴トラッキングに加えて、各試験の合格基準で採点する本番試験モードを搭載しています。
            </p>

            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                href="/quiz?category=all"
                className="rounded-xl bg-[var(--primary)] px-6 py-3 text-center font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
              >
                まずは総合クイズへ
              </Link>
              <Link
                href="/quiz?mode=exam&exam=it-passport"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                🎯 ITパスポート 本番試験
              </Link>
              <Link
                href="/quiz?mode=exam&exam=chizai"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                ⚖️ 知財3級 本番試験
              </Link>
              <Link
                href="/study?category=strategy"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                問題をDoom Scroll
              </Link>
              <Link
                href="/scroll"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-center font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                🌀 用語をDoom Scroll
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5">
              <p className="text-xs text-[var(--muted)] mb-2">ITパスポート問題数</p>
              <p className="text-3xl font-bold">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5">
              <p className="text-xs text-[var(--muted)] mb-2">知財3級問題数</p>
              <p className="text-3xl font-bold">{chizaiCount}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5 col-span-2">
              <p className="text-xs text-[var(--muted)] mb-2">総合クイズ目安時間</p>
              <p className="text-3xl font-bold">約{estimatedMinutes}分</p>
              <p className="mt-2 text-sm text-[var(--muted)]">移動中は流し見学習、自宅では模擬テスト、という使い分けがおすすめです。</p>
            </div>
          </div>
        </div>
      </header>

      <StudyPulse />

      <section className="mb-8 sm:mb-12 grid gap-4 md:grid-cols-3">
        {featureCards.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm"
          >
            <div className="mb-3 text-3xl">{feature.icon}</div>
            <h2 className="mb-2 text-lg font-semibold">{feature.title}</h2>
            <p className="text-sm leading-relaxed text-[var(--muted)]">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">本番試験モードで腕試し</h2>
          <p className="text-sm text-[var(--muted)]">各試験の公式に近い形式・合格基準で採点します。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/quiz?mode=exam&exam=it-passport"
            className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎯</span>
              <h3 className="font-bold text-lg group-hover:text-[var(--primary)]">ITパスポート 本番試験</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              100問・120分。総合60%以上かつ各分野30%以上で合格判定（公式のIRT方式を正答率で近似）。
            </p>
          </Link>
          <Link
            href="/quiz?mode=exam&exam=chizai"
            className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚖️</span>
              <h3 className="font-bold text-lg group-hover:text-[var(--primary)]">知財3級 本番試験</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              学科形式30問・45分。満点の70%以上で合格判定。知的財産管理技能検定3級に対応。
            </p>
          </Link>
        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">クイズモードで挑戦</h2>
          <p className="text-sm text-[var(--muted)]">本番感覚でテンポよく回答。全分野・分野別の両方に対応。</p>
        </div>
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

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">知財3級 分野別で練習</h2>
          <p className="text-sm text-[var(--muted)]">解説を見ながら分野ごとに練習。本番前の弱点補強に。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chizaiFields.map((f) => (
            <Link
              key={f.id}
              href={`/quiz?mode=practice&exam=chizai&field=${f.id}`}
              className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{f.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)]">{f.title}</h3>
                  <p className="text-sm text-[var(--muted)] mb-2">{f.description}</p>
                  <span className={`inline-block text-xs text-white px-2 py-1 rounded-full bg-gradient-to-r ${f.color}`}>
                    {f.count}問
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">学習モードで復習</h2>
          <p className="text-sm text-[var(--muted)]">集中して理解する通常モードと、連続インプット向けのDoom Scrollモードを搭載。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.slice(1).map((cat) => (
            <Link
              key={cat.id}
              href={`/study?category=${cat.id}`}
              className="block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{cat.icon}</span>
                <span className="rounded-full bg-[var(--badge-bg)] px-2 py-1 text-xs text-[var(--muted)]">{cat.count} cards</span>
              </div>
              <h3 className="font-semibold mb-1">{cat.title}</h3>
              <p className="text-xs text-[var(--muted)] mb-3">解説付き学習 / Doom Scroll対応</p>
              <span className="text-sm font-medium text-[var(--primary)]">学習を始める →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">ゲームモードで楽しく学ぶ</h2>
          <Link href="/games" className="text-sm font-medium text-[var(--primary)]">すべて見る →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: "matching", title: "用語マッチング", desc: "用語と説明をペアにしよう", icon: "🔗", color: "from-cyan-500 to-blue-600" },
            { id: "flashcards", title: "フラッシュカード", desc: "めくって覚えて仕分けする", icon: "🃏", color: "from-violet-500 to-purple-600" },
            { id: "speed", title: "スピードチャレンジ", desc: "60秒で何問解ける？", icon: "⚡", color: "from-orange-500 to-red-500" },
          ].map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{game.icon}</span>
                <span className={`text-xs text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${game.color}`}>NEW</span>
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-[var(--primary)]">{game.title}</h3>
              <p className="text-xs text-[var(--muted)]">{game.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">用語をインプット</h2>
          <p className="text-sm text-[var(--muted)]">調べたいときは一覧、覚えたいときはフィードで。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/scroll"
            className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌀</span>
              <h3 className="font-bold text-lg group-hover:text-[var(--primary)]">用語フィード（Doom Scroll）</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              用語と解説が無限に流れてくる学習フィード。自己テストモードで説明を隠して思い出す練習もできます。
            </p>
          </Link>
          <Link
            href="/glossary"
            className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📖</span>
              <h3 className="font-bold text-lg group-hover:text-[var(--primary)]">用語集を引く</h3>
            </div>
            <p className="text-sm text-[var(--muted)]">
              出題範囲の頻出用語をカテゴリ別に一覧。和英対応つきで、調べたい言葉をすばやく確認できます。
            </p>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold mb-2">履歴を見て、伸びを確認</h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            クイズ結果は学習履歴に保存されます。最高スコア・平均スコア・合格率を見ながら次の復習計画を立てられます。
          </p>
        </div>
        <Link
          href="/history"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] hover:shadow-md transition-all hover:-translate-y-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <span>📊</span>
          <span className="font-medium">学習履歴を見る</span>
        </Link>
      </section>
    </div>
  );
}
