"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useExam } from "@/lib/examContext";
import { getQuestions } from "@/data";
import { categoryByExam, categoryLabels, examLongLabels, Category } from "@/lib/types";
import { getHistory, getStudyStreak } from "@/lib/history";

const categoryIcons: Record<string, string> = {
  strategy: "💼",
  management: "📋",
  technology: "💻",
  patent: "💡",
  design: "🎨",
  trademark: "®️",
  copyright: "©️",
  "unfair-competition": "⚖️",
  treaty: "🌐",
};

const categoryColors: Record<string, string> = {
  strategy: "from-blue-500 to-cyan-500",
  management: "from-green-500 to-emerald-500",
  technology: "from-purple-500 to-pink-500",
  patent: "from-indigo-500 to-violet-600",
  design: "from-pink-500 to-rose-500",
  trademark: "from-amber-500 to-orange-500",
  copyright: "from-emerald-500 to-teal-500",
  "unfair-competition": "from-rose-500 to-red-500",
  treaty: "from-cyan-500 to-sky-500",
};

const categoryDescriptions: Record<string, string> = {
  strategy: "企業活動、法務、経営戦略、システム戦略",
  management: "開発技術、プロジェクトマネジメント、サービスマネジメント",
  technology: "基礎理論、コンピュータシステム、技術要素、セキュリティ",
  patent: "特許権・実用新案権、出願手続き、職務発明、実施権",
  design: "意匠登録要件、部分意匠・関連意匠・画像意匠・建築物",
  trademark: "商標登録、自他識別力、立体・音・色彩商標、不使用取消",
  copyright: "著作物・著作者・著作財産権・著作隣接権、保護期間",
  "unfair-competition": "周知/著名表示、商品形態模倣、営業秘密、ドメイン",
  treaty: "パリ条約・PCT・ベルヌ条約・TRIPS、弁理士、種苗法",
};

export default function Home() {
  const { exam } = useExam();
  const [history, setHistory] = useState<ReturnType<typeof getHistory>>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastStudyDate: null as string | null });

  useEffect(() => {
    setHistory(getHistory());
    setStreak(getStudyStreak());
  }, []);

  const questions = useMemo(() => getQuestions(exam), [exam]);
  const questionById = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  // Determine the weakest category for today's recommended drill
  const todayTarget = useMemo(() => {
    const buckets = new Map<Category, { correct: number; total: number }>();
    categoryByExam[exam].forEach((c) => buckets.set(c, { correct: 0, total: 0 }));
    for (const result of history) {
      if (result.exam !== exam) continue;
      if (!result.questionIds || !result.answers) continue;
      result.questionIds.forEach((qid, i) => {
        const q = questionById.get(qid);
        if (!q) return;
        const ans = result.answers![i];
        if (ans === null || ans === undefined) return;
        const b = buckets.get(q.category as Category)!;
        b.total += 1;
        if (ans === q.correctIndex) b.correct += 1;
      });
    }
    let weakestCat: Category | null = null;
    let weakestScore = 101;
    let hasAnyData = false;
    buckets.forEach((b, cat) => {
      if (b.total === 0) return;
      hasAnyData = true;
      const pct = (b.correct / b.total) * 100;
      if (pct < weakestScore) {
        weakestScore = pct;
        weakestCat = cat;
      }
    });
    // If no data yet, pick the first category as a starting point
    if (!hasAnyData) return { category: categoryByExam[exam][0], reason: "first" as const, percentage: null };
    return { category: weakestCat!, reason: "weakest" as const, percentage: Math.round(weakestScore) };
  }, [history, exam, questionById]);
  const categories = useMemo(() => {
    const cats = categoryByExam[exam];
    return [
      {
        id: "all",
        title: "全分野",
        description: `${categoryLabels[cats[0]]}を含む全${questions.length}問`,
        icon: "📚",
        color: "from-indigo-500 to-purple-600",
        count: questions.length,
      },
      ...cats.map((cat) => ({
        id: cat,
        title: categoryLabels[cat],
        description: categoryDescriptions[cat] ?? "",
        icon: categoryIcons[cat] ?? "📘",
        color: categoryColors[cat] ?? "from-slate-500 to-slate-600",
        count: questions.filter((q) => q.category === cat).length,
      })),
    ];
  }, [exam, questions]);

  const totalQuestions = questions.length;
  const totalCategories = categoryByExam[exam].length;
  const estimatedMinutes = Math.max(1, Math.ceil(totalQuestions * 0.7));
  const firstCategory = categoryByExam[exam][0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-10 rounded-[2rem] border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-[var(--badge-bg)] px-3 py-1 text-sm font-medium text-[var(--primary)]">
              {examLongLabels[exam]} 対応
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))` }}>
              {examLongLabels[exam]} 学習＆模擬テスト
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              分野別クイズ・解説付き学習・ゲームモード・履歴トラッキングを搭載。試験はナビゲーション右上から切り替えできます。
            </p>

            {/* Today's recommendation */}
            <div className="mt-6 rounded-xl border border-[var(--card-border)] bg-[var(--badge-bg)] p-4 mb-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {streak.current > 0 && (
                      <span className="text-sm font-bold text-orange-500">🔥 {streak.current}日連続</span>
                    )}
                    <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">今日の20問</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    {todayTarget.reason === "first"
                      ? "まずは「" + categoryLabels[todayTarget.category] + "」から始めてみましょう。"
                      : `現在の弱点分野「${categoryLabels[todayTarget.category]}」（${todayTarget.percentage}%）を補強しましょう。`}
                  </p>
                </div>
                <Link
                  href={`/quiz?category=${todayTarget.category}&length=20`}
                  className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] whitespace-nowrap"
                >
                  挑戦する →
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/quiz?category=all&length=20"
                className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
              >
                総合クイズ（20問）
              </Link>
              <Link
                href="/review"
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                🎯 間違えた問題を復習
              </Link>
              <Link
                href={`/study?category=${firstCategory}`}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
              >
                学習モードで復習
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5">
              <p className="text-xs text-[var(--muted)] mb-2">収録問題数</p>
              <p className="text-3xl font-bold">{totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5">
              <p className="text-xs text-[var(--muted)] mb-2">分野数</p>
              <p className="text-3xl font-bold">{totalCategories}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-5 col-span-2">
              <p className="text-xs text-[var(--muted)] mb-2">総合クイズ目安時間</p>
              <p className="text-3xl font-bold">約{estimatedMinutes}分</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
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
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary)]">{cat.title}</h3>
                  <p className="text-sm text-[var(--muted)] mb-2">{cat.description}</p>
                  <span className={`inline-block text-xs text-white px-2 py-1 rounded-full bg-gradient-to-r ${cat.color}`}>
                    {cat.count}問
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h2 className="text-xl font-semibold">ゲームモードで楽しく学ぶ</h2>
          <Link href="/games" className="text-sm font-medium text-[var(--primary)]">すべて見る →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { id: "term-quiz", title: "用語クイズ", icon: "📝" },
            { id: "memory", title: "メモリーマッチ", icon: "🧠" },
            { id: "matching", title: "用語マッチング", icon: "🔗" },
            { id: "flashcards", title: "フラッシュカード", icon: "🃏" },
            { id: "speed", title: "スピードチャレンジ", icon: "⚡" },
          ].map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{game.icon}</span>
              <span className="text-sm font-medium leading-tight group-hover:text-[var(--primary)]">{game.title}</span>
            </Link>
          ))}
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
