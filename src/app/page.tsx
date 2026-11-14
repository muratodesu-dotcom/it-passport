import Link from "@/components/SiteLink";
import type { ReactNode } from "react";
import { chizaiQuestions, itPassportQuestions } from "@/data/questions";
import { ipFieldLabels } from "@/lib/types";
import StudyPulse from "@/components/StudyPulse";

const categoryDefinitions = [
  {
    id: "all",
    title: "全分野",
    description: `ストラテジ・マネジメント・テクノロジの全${itPassportQuestions.length}問`,
    color: "bg-indigo-600",
    icon: "📚",
  },
  {
    id: "strategy",
    title: "ストラテジ系",
    description: "企業活動、法務、経営戦略、システム戦略",
    color: "bg-blue-600",
    icon: "💼",
  },
  {
    id: "management",
    title: "マネジメント系",
    description: "開発技術、プロジェクトマネジメント、サービスマネジメント",
    color: "bg-emerald-700",
    icon: "📋",
  },
  {
    id: "technology",
    title: "テクノロジ系",
    description: "基礎理論、コンピュータシステム、技術要素、セキュリティ",
    color: "bg-purple-600",
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
  { id: "all", title: "全分野", description: "特許・意匠商標・著作権・その他をまとめて", color: "bg-amber-700", icon: "⚖️" },
  { id: "patent", title: ipFieldLabels.patent, description: "特許法・実用新案法", color: "bg-blue-600", icon: "🔬" },
  { id: "design-trademark", title: ipFieldLabels["design-trademark"], description: "意匠法・商標法", color: "bg-rose-600", icon: "🎨" },
  { id: "copyright", title: ipFieldLabels.copyright, description: "著作権法・著作隣接権", color: "bg-fuchsia-700", icon: "✍️" },
  { id: "other", title: ipFieldLabels.other, description: "不正競争防止法・契約・条約", color: "bg-teal-700", icon: "📜" },
];
const chizaiFields = chizaiFieldDefinitions.map((f) => ({
  ...f,
  count: f.id === "all" ? chizaiQuestions.length : chizaiQuestions.filter((q) => (q.ipField ?? "other") === f.id).length,
}));
const estimatedMinutes = Math.ceil(totalQuestions * 0.7);

// 本番試験の条件をチップで。補足は title（ホバー）へ。
function ExamChips({ items, note }: { items: string[]; note?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" title={note}>
      {items.map((item) => (
        <span key={item} className="rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
          {item}
        </span>
      ))}
    </div>
  );
}

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
      <summary className="flex cursor-pointer list-none select-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--card-hover)] [&::-webkit-details-marker]:hidden">
        <span className="text-xl" aria-hidden>{icon}</span>
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
      <div className="border-t border-[var(--card-border)] p-4">{children}</div>
    </details>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:py-8">
      {/* Title row: name, scope chips, the two everyday actions */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight sm:text-2xl">ITパスポート＆知財3級</h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-1">
              <span aria-hidden>📚</span> IT <b className="font-semibold tabular-nums">{totalQuestions}</b>問
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-1">
              <span aria-hidden>⚖️</span> 知財 <b className="font-semibold tabular-nums">{chizaiCount}</b>問
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--badge-bg)] px-2.5 py-1" title="総合クイズの目安時間">
              <span aria-hidden>⏱</span> 約<b className="font-semibold tabular-nums">{estimatedMinutes}</b>分
            </span>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Link
            href="/quiz?category=all"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] px-5 font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            <span aria-hidden>✏️</span> 総合クイズ
          </Link>
          <Link
            href="/study?category=strategy"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-5 font-medium transition-colors hover:bg-[var(--card-hover)]"
          >
            <span aria-hidden>📖</span> 学習モード
          </Link>
        </div>
      </header>

      <StudyPulse />

      {/* 目的別メニュー（折りたたみ） */}
      <div className="space-y-3">
        <Section icon="🎯" title="本番試験モードで腕試し" hint="公式に近い形式・合格基準で採点" defaultOpen>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href="/quiz?mode=exam&exam=it-passport"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>🎯</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">ITパスポート 本番試験</h3>
              </div>
              <ExamChips items={["100問", "120分", "総合60%＋各分野30%"]} note="公式のIRT方式を正答率で近似" />
            </Link>
            <Link
              href="/quiz?mode=exam&exam=chizai"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>⚖️</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">知財3級 本番試験</h3>
              </div>
              <ExamChips items={["学科30問", "45分", "70%で合格"]} />
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
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-0.5 font-bold group-hover/card:text-[var(--primary)]">{cat.title}</h3>
                    <p className="mb-2 text-sm text-[var(--muted)]">{cat.description}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${cat.color}`}>
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
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div className="flex-1">
                    <h3 className="mb-0.5 font-bold group-hover/card:text-[var(--primary)]">{f.title}</h3>
                    <p className="mb-2 text-sm text-[var(--muted)]">{f.description}</p>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${f.color}`}>
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
                className="block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
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
                className="block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
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
              { id: "matching", title: "用語マッチング", desc: "用語と説明をペアにしよう", icon: "🔗" },
              { id: "flashcards", title: "フラッシュカード", desc: "めくって覚えて仕分けする", icon: "🃏" },
              { id: "speed", title: "スピードチャレンジ", desc: "60秒で何問解ける？", icon: "⚡" },
            ].map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
              >
                <span className="mb-2 block text-2xl" aria-hidden>{game.icon}</span>
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
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>🌀</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">用語フィード（Doom Scroll）</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">用語が流れるフィード。説明を隠して自己テストも。</p>
            </Link>
            <Link
              href="/glossary"
              className="group/card block rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4 transition-[box-shadow,border-color] hover:border-[var(--option-hover-border)] hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden>📖</span>
                <h3 className="text-lg font-bold group-hover/card:text-[var(--primary)]">用語集を引く</h3>
              </div>
              <p className="text-sm text-[var(--muted)]">頻出用語をカテゴリ別に。和英対応。</p>
            </Link>
          </div>
        </Section>

        <Section icon="📊" title="履歴を見て、伸びを確認" hint="最高・平均スコアと合格率から復習計画を立てる">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              最高・平均スコアと合格率の推移を確認できます。
            </p>
            <Link
              href="/history"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-[var(--muted)] transition-[color,box-shadow] hover:text-[var(--foreground)] hover:shadow-md"
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
