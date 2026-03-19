"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getQuestionsByCategory } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "strategy";

  const questions = getQuestionsByCategory(category);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const question = questions[currentIndex];
  const categoryLabel = categoryLabels[category as Category] || category;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        }
      }
      if (e.key === "ArrowRight" && showAnswer && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setShowAnswer(false);
      }
      if (e.key === "ArrowLeft" && showAnswer && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
        setShowAnswer(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showAnswer, currentIndex, questions.length]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg">問題が見つかりません</p>
        <button
          onClick={() => router.push("/")}
          className="text-[var(--primary)] hover:underline"
        >
          ホームに戻る
        </button>
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
      <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full mb-8">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question card */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
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
            className={`p-4 rounded-xl border-2 transition-all bg-[var(--card)] ${
              showAnswer && index === question.correctIndex
                ? "border-[var(--success)] bg-[var(--success-bg)]"
                : showAnswer
                  ? "border-[var(--card-border)] opacity-50"
                  : "border-[var(--card-border)]"
            }`}
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--badge-bg)] text-sm font-medium mr-3">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </div>
        ))}
      </div>

      {/* Toggle answer */}
      {!showAnswer ? (
        <div>
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors mb-2"
          >
            答えと解説を見る
          </button>
          <p className="text-center text-xs text-[var(--muted)] opacity-60">
            キーボード: Space / Enterで表示
          </p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--explanation-bg)] border border-[var(--explanation-border)] rounded-xl p-5 mb-6 fade-in">
            <p className="font-bold mb-2 text-[var(--explanation-title)]">
              正解: {String.fromCharCode(65 + question.correctIndex)}.{" "}
              {question.options[question.correctIndex]}
            </p>
            <p className="text-sm leading-relaxed text-[var(--explanation-text)]">
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
                className="flex-1 py-3 bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)] font-medium rounded-xl transition-colors"
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
          <p className="text-center text-xs text-[var(--muted)] mt-2 opacity-60">
            キーボード: ← → で移動
          </p>
        </>
      )}
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudyContent />
    </Suspense>
  );
}
