"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { questions as allQuestions } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "all";
  const answersParam = searchParams.get("answers") || "";
  const questionsParam = searchParams.get("questions") || "";
  const timeParam = parseInt(searchParams.get("time") || "0", 10);

  const answerList = answersParam.split(",").map(Number);
  const questionIds = questionsParam.split(",").map(Number);
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

  // Category breakdown
  const breakdown: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!q) return;
    if (!breakdown[q.category]) breakdown[q.category] = { correct: 0, total: 0 };
    breakdown[q.category].total++;
    if (answerList[i] === q.correctIndex) breakdown[q.category].correct++;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">テスト結果</h1>
        <p className="text-[var(--muted)]">{categoryLabel}</p>
      </div>

      {/* Score card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6 text-center shadow-sm">
        <div
          className={`text-6xl font-bold mb-2 ${passed ? "text-green-600" : "text-red-600"}`}
        >
          {percentage}%
        </div>
        <p className="text-lg mb-1">
          {correctCount} / {total} 問正解
        </p>
        <p className="text-sm text-[var(--muted)] mb-4">
          所要時間: {minutes}分{seconds}秒
        </p>
        <span
          className={`inline-block px-4 py-2 rounded-full text-white font-medium ${passed ? "bg-green-500" : "bg-red-500"}`}
        >
          {passed ? "合格ライン達成！" : "もう少し頑張りましょう"}
        </span>
      </div>

      {/* Category breakdown */}
      {Object.keys(breakdown).length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
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
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 60 ? "bg-green-500" : "bg-red-400"}`}
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="font-semibold mb-4">回答一覧</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            if (!q) return null;
            const isCorrect = answerList[i] === q.correctIndex;
            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
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
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">読み込み中...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
