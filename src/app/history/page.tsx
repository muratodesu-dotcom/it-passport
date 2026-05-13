"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getHistory, clearHistory } from "@/lib/history";
import { QuizResult, categoryLabels, Category, examLabels, Exam } from "@/lib/types";
import { useExam } from "@/lib/examContext";

export default function HistoryPage() {
  const router = useRouter();
  const { exam } = useExam();
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [showAllExams, setShowAllExams] = useState(false);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filtered = useMemo(
    () => (showAllExams ? history : history.filter((h) => !h.exam || h.exam === exam)),
    [history, showAllExams, exam]
  );

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const bestScore = filtered.length > 0
    ? Math.max(...filtered.map((h) => h.percentage))
    : 0;
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, h) => s + h.percentage, 0) / filtered.length)
    : 0;
  const passRate = filtered.length > 0
    ? Math.round((filtered.filter((h) => h.passed).length / filtered.length) * 100)
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

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowAllExams(false)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${!showAllExams ? "bg-[var(--primary)] text-white" : "bg-[var(--badge-bg)] text-[var(--muted)]"}`}
        >
          {examLabels[exam]}のみ
        </button>
        <button
          onClick={() => setShowAllExams(true)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${showAllExams ? "bg-[var(--primary)] text-white" : "bg-[var(--badge-bg)] text-[var(--muted)]"}`}
        >
          すべて
        </button>
      </div>

      {filtered.length === 0 ? (
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
          {/* Stats summary */}
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

          {/* History list */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
            <h2 className="font-semibold mb-4">過去の結果（最新{filtered.length}件）</h2>
            <div className="space-y-3">
              {filtered.map((result) => {
                const catLabel = result.category === "all"
                  ? "全分野"
                  : categoryLabels[result.category as Category] || result.category;
                const date = new Date(result.date);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
                const mins = Math.floor(result.timeSeconds / 60);
                const secs = result.timeSeconds % 60;
                const resultExam = result.exam as Exam | undefined;

                return (
                  <div
                    key={result.id}
                    className={`p-3 rounded-lg border ${result.passed ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {showAllExams && resultExam && (
                          <span className="rounded-full bg-[var(--badge-bg)] px-2 py-0.5 text-[0.65rem] text-[var(--muted)]">
                            {examLabels[resultExam]}
                          </span>
                        )}
                        <span className="font-medium text-sm">{catLabel}</span>
                        <span className="text-xs text-[var(--muted)]">{dateStr}</span>
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

          {/* Clear button */}
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
