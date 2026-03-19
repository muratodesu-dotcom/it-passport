"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { getQuestionsByCategory } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "strategy";

  const questions = getQuestionsByCategory(category);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const question = questions[currentIndex];
  const categoryLabel = categoryLabels[category as Category] || category;

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">問題が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← 戻る
        </button>
        <span className="text-sm font-medium text-[var(--muted)]">
          学習モード - {categoryLabel}
        </span>
        <span className="text-sm font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-[var(--muted)]">
          問{currentIndex + 1}
        </span>
        <p className="text-lg font-medium leading-relaxed mt-4">
          {question.question}
        </p>
      </div>

      {/* Options (display only) */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 transition-all ${
              showAnswer && index === question.correctIndex
                ? "border-green-500 bg-green-50"
                : showAnswer
                  ? "border-gray-200 opacity-50"
                  : "border-gray-200"
            }`}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-medium mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </div>
        ))}
      </div>

      {/* Toggle answer */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors mb-4"
        >
          答えと解説を見る
        </button>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="font-bold mb-2 text-blue-800">
              正解: {String.fromCharCode(65 + question.correctIndex)}.{" "}
              {question.options[question.correctIndex]}
            </p>
            <p className="text-sm leading-relaxed text-blue-900">
              {question.explanation}
            </p>
          </div>

          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => {
                  setCurrentIndex((i) => i - 1);
                  setShowAnswer(false);
                }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-colors"
              >
                ← 前の問題
              </button>
            )}
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentIndex((i) => i + 1);
                  setShowAnswer(false);
                }}
                className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
              >
                次の問題 →
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
              >
                ホームに戻る
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">読み込み中...</div>
        </div>
      }
    >
      <StudyContent />
    </Suspense>
  );
}
