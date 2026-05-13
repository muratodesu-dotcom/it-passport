"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { allQuestions } from "@/data";
import { categoryLabels, Category } from "@/lib/types";
import { useExam } from "@/lib/examContext";
import { saveResult } from "@/lib/history";
import ScoreRing from "@/components/ScoreRing";
import LoadingSpinner from "@/components/LoadingSpinner";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const saved = useRef(false);
  const { exam } = useExam();

  const category = searchParams.get("category") || "all";
  const answersParam = searchParams.get("answers") || "";
  const questionsParam = searchParams.get("questions") || "";
  const timeParam = parseInt(searchParams.get("time") || "0", 10);

  const answerList = answersParam ? answersParam.split(",").map((value) => Number.parseInt(value, 10)) : [];
  const questionIds = questionsParam ? questionsParam.split(",").map((value) => Number.parseInt(value, 10)).filter((value) => Number.isFinite(value)) : [];
  const questions = questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter(Boolean);

  const correctCount = questions.reduce((count, q, i) => {
    return count + (q && answerList[i] === q.correctIndex ? 1 : 0);
  }, 0);

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = percentage >= 60;

  const minutes = Math.floor(timeParam / 60);
  const seconds = timeParam % 60;

  const categoryLabel =
    category === "all"
      ? "全分野"
      : categoryLabels[category as Category] || category;

  // Save result to history
  useEffect(() => {
    if (saved.current || total === 0) return;
    saved.current = true;
    saveResult({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exam,
      category,
      score: correctCount,
      total,
      percentage,
      timeSeconds: timeParam,
      passed,
    });
  }, [exam, category, correctCount, total, percentage, timeParam, passed]);

  // Category breakdown
  const breakdown: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!q) return;
    if (!breakdown[q.category]) breakdown[q.category] = { correct: 0, total: 0 };
    breakdown[q.category].total++;
    if (answerList[i] === q.correctIndex) breakdown[q.category].correct++;
  });

  const encouragement = percentage === 100
    ? "パーフェクト！素晴らしい！🎉"
    : percentage >= 80
      ? "とても良い成績です！💪"
      : passed
        ? "合格ライン達成！この調子で頑張りましょう！"
        : percentage >= 40
          ? "もう少しで合格ラインです。復習して再挑戦しましょう！"
          : "基礎からしっかり復習しましょう。学習モードがおすすめです。";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">テスト結果</h1>
        <p className="text-[var(--muted)]">{categoryLabel}</p>
      </div>

      {/* Score card */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-8 mb-6 text-center shadow-sm">
        <ScoreRing percentage={percentage} passed={passed} />
        <p className="text-lg mb-1 mt-4">
          {correctCount} / {total} 問正解
        </p>
        <p className="text-sm text-[var(--muted)] mb-4">
          所要時間: {minutes}分{seconds}秒
        </p>
        <span
          className={`inline-block px-4 py-2 rounded-full text-white font-medium ${passed ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
        >
          {encouragement}
        </span>
      </div>

      {/* Category breakdown */}
      {Object.keys(breakdown).length > 1 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
          <h2 className="font-semibold mb-4">分野別正答率</h2>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([cat, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{categoryLabels[cat as Category]}</span>
                    <span>
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${pct >= 60 ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question review */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm">
        <h2 className="font-semibold mb-4">回答一覧</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            if (!q) return null;
            const isCorrect = answerList[i] === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${isCorrect ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">{isCorrect ? "⭕" : "❌"}</span>
                  <div className="flex-1 text-sm">
                    <p className="font-medium mb-1">
                      問{i + 1}: {q.question}
                    </p>
                    {!isCorrect && (
                      <p className="text-[var(--muted)]">
                        正解: {q.options[q.correctIndex]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/quiz?category=${category}`)}
          className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
        >
          もう一度挑戦
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)] font-medium rounded-xl transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResultsContent />
    </Suspense>
  );
}
