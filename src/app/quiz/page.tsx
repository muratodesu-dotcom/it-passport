"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { getQuestionsByCategory, shuffleQuestions } from "@/data/questions";
import { Question, categoryLabels, Category } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "all";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const qs = shuffleQuestions(getQuestionsByCategory(category));
    const nextStartTime = Date.now();

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers(new Array(qs.length).fill(null));
    setStartTime(nextStartTime);
    setElapsed(0);
  }, [category]);

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

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
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const params = new URLSearchParams({
        category,
        answers: answers.join(","),
        questions: questions.map((q) => q.id).join(","),
        time: totalTime.toString(),
      });
      router.push(`/results?${params.toString()}`);
    }
  }, [currentIndex, questions, answers, category, startTime, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!currentQuestion) return;
      if (e.key >= "1" && e.key <= "4" && !showExplanation) {
        handleAnswer(parseInt(e.key) - 1);
      }
      if ((e.key === "Enter" || e.key === " ") && showExplanation) {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQuestion, showExplanation, handleAnswer, handleNext]);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-sm">
          <p className="text-lg font-medium">このカテゴリの問題が見つかりません。</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <LoadingSpinner />;
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;
  const categoryLabel =
    category === "all"
      ? "全分野"
      : categoryLabels[category as Category] || category;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

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
        <div className="text-right">
          <span className="text-sm font-medium block">
            {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-[var(--muted)] tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full mb-8">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundImage: `linear-gradient(to right, var(--gradient-progress-from), var(--gradient-progress-to))`, width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
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
          let style = "border-[var(--card-border)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]";
          if (showExplanation) {
            if (index === currentQuestion.correctIndex) {
              style = "border-[var(--success)] bg-[var(--success-bg)]";
            } else if (
              index === selectedAnswer &&
              index !== currentQuestion.correctIndex
            ) {
              style = "border-[var(--danger)] bg-[var(--danger-bg)]";
            } else {
              style = "border-[var(--card-border)] opacity-50";
            }
          } else if (selectedAnswer === index) {
            style = "border-[var(--option-selected-border)] bg-[var(--option-selected-bg)]";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all bg-[var(--card)] ${style}`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[var(--badge-bg)] text-sm font-medium mr-3">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
              {!showExplanation && (
                <span className="float-right text-xs text-[var(--muted)] mt-1">
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Keyboard hint */}
      {!showExplanation && (
        <p className="text-center text-xs text-[var(--muted)] mb-4">
          キーボード: 1〜4で選択
        </p>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div
          className={`rounded-xl p-5 mb-6 fade-in ${isCorrect ? "bg-[var(--success-bg)] border border-[var(--success-border)]" : "bg-[var(--danger-bg)] border border-[var(--danger-border)]"}`}
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
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors fade-in"
        >
          {currentIndex < questions.length - 1 ? "次の問題へ →" : "結果を見る →"}
          <span className="text-xs opacity-60 ml-2">(Enter)</span>
        </button>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <QuizContent />
    </Suspense>
  );
}
