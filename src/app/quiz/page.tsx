"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { getQuestionsByCategory, shuffleQuestions } from "@/data/questions";
import { Question, categoryLabels, Category } from "@/lib/types";

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "all";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const qs = shuffleQuestions(getQuestionsByCategory(category));
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
  }, [category]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback(
    (index: number) => {
      if (showExplanation) return;
      setSelectedAnswer(index);
      setShowExplanation(true);
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = index;
        return next;
      });
    },
    [showExplanation, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const params = new URLSearchParams({
        category,
        answers: answers.join(","),
        questions: questions.map((q) => q.id).join(","),
        time: elapsed.toString(),
      });
      router.push(`/results?${params.toString()}`);
    }
  }, [currentIndex, questions, answers, category, startTime, router]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;
  const categoryLabel =
    category === "all"
      ? "全分野"
      : categoryLabels[category as Category] || category;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← 戻る
        </button>
        <span className="text-sm font-medium text-[var(--muted)]">
          {categoryLabel}
        </span>
        <span className="text-sm font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-[var(--muted)]">
            {categoryLabels[currentQuestion.category]}
          </span>
          <span className="text-xs text-[var(--muted)]">
            問{currentIndex + 1}
          </span>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          let style = "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
          if (showExplanation) {
            if (index === currentQuestion.correctIndex) {
              style = "border-green-500 bg-green-50";
            } else if (
              index === selectedAnswer &&
              index !== currentQuestion.correctIndex
            ) {
              style = "border-red-500 bg-red-50";
            } else {
              style = "border-gray-200 opacity-50";
            }
          } else if (selectedAnswer === index) {
            style = "border-blue-500 bg-blue-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${style}`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-medium mr-3">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div
          className={`rounded-xl p-5 mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <p className="font-bold mb-2">
            {isCorrect ? "⭕ 正解！" : "❌ 不正解"}
          </p>
          <p className="text-sm leading-relaxed">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
        >
          {currentIndex < questions.length - 1 ? "次の問題へ →" : "結果を見る →"}
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">読み込み中...</div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
