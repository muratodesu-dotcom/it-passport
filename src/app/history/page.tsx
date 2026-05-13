"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearHistory, getBookmarks, getHistory, getStreak, getWrongQuestionIds } from "@/lib/history";
import { QuizResult, categoryLabels, Category } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [streak, setStreak] = useState({ current: 0, longest: 0, studiedToday: false });

  useEffect(() => {
    setHistory(getHistory());
    setWrongCount(getWrongQuestionIds().length);
    setBookmarkCount(getBookmarks().length);
    setStreak(getStreak());
  }, []);

  const handleClear = () => {
    if (!window.confirm("学習履歴をすべて削除しますか？間違えた問題の追跡もリセットされます。")) return;
    clearHistory();
    setHistory([]);
    setWrongCount(0);
    setStreak({ current: 0, longest: 0, studiedToday: false });
  };

  const bestScore = history.length > 0
    ? Math.max(...history.map((h) => h.percentage))
    : 0;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.percentage, 0) / history.length)
    : 0;
  const passRate = history.length > 0
    ? Math.round((history.filter((h) => h.passed).length / history.length) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">学習履歴</h1>
        <div className="w-12" />
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-lg font-medium mb-2">まだ履歴がありません</p>
          <p className="text-[var(--muted)] text-sm mb-6">
            クイズに挑戦すると、ここに結果が表示されます。
          </p>
          <button
            onClick={() => router.push("/quiz?category=all")}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
          >
            クイズに挑戦する
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">🔥 連続学習</p>
                <p className="text-2xl font-bold">{streak.current}日</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">最長 {streak.longest}日</p>
              </div>
              <Link
                href={wrongCount > 0 ? "/quiz?source=wrong" : "#"}
                className={`block ${wrongCount > 0 ? "hover:text-[var(--primary)]" : "pointer-events-none opacity-70"}`}
              >
                <p className="text-xs text-[var(--muted)] mb-1">🎯 復習対象</p>
                <p className="text-2xl font-bold">{wrongCount}問</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">{wrongCount > 0 ? "タップで復習" : "なし"}</p>
              </Link>
              <Link
                href={bookmarkCount > 0 ? "/quiz?source=bookmarks" : "#"}
                className={`block ${bookmarkCount > 0 ? "hover:text-[var(--primary)]" : "pointer-events-none opacity-70"}`}
              >
                <p className="text-xs text-[var(--muted)] mb-1">⭐ ブックマーク</p>
                <p className="text-2xl font-bold">{bookmarkCount}問</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">{bookmarkCount > 0 ? "タップで復習" : "なし"}</p>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{bestScore}%</p>
              <p className="text-xs text-[var(--muted)]">最高スコア</p>
            </div>
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4 text-center">
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-[var(--muted)]">平均スコア</p>
            </div>
            <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-4 text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{passRate}%</p>
              <p className="text-xs text-[var(--muted)]">合格率</p>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
            <h2 className="font-semibold mb-4">過去の結果（最新{history.length}件）</h2>
            <div className="space-y-3">
              {history.map((result) => {
                const catLabel = result.category === "all"
                  ? "全分野"
                  : categoryLabels[result.category as Category] || result.category;
                const date = new Date(result.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
                const mins = Math.floor(result.timeSeconds / 60);
                const secs = result.timeSeconds % 60;

                return (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${result.passed ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">{catLabel}</span>
                        {result.mode === "exam" && (
                          <span className="ml-2 inline-block rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">本番</span>
                        )}
                        <span className="text-xs text-[var(--muted)] ml-2">{dateStr}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${result.passed ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                          {result.percentage}%
                        </span>
                        <span className="text-xs text-[var(--muted)] ml-2">
                          {result.score}/{result.total} ({mins}:{secs.toString().padStart(2, "0")})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleClear}
            className="w-full py-3 bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)] font-medium rounded-xl transition-colors text-[var(--muted)] text-sm"
          >
            履歴をクリア
          </button>
        </>
      )}
    </div>
  );
}
