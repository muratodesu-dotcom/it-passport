"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { getQuestionsByCategory, getQuestionsByExam, shuffleQuestions, questions as allQuestions } from "@/data/questions";
import { Question, categoryLabels, Category, QuizMode, ExamType, examShortLabels } from "@/lib/types";
import { examRules } from "@/lib/scoring";
import { getBookmarks, getWrongQuestionIds, isBookmarked, toggleBookmark } from "@/lib/history";
import { saveQuizSession } from "@/lib/quizSession";
import LoadingSpinner from "@/components/LoadingSpinner";

type Source = "category" | "wrong" | "bookmarks";

function buildQuestionPool(source: Source, category: string): Question[] {
  if (source === "wrong") {
    const ids = new Set(getWrongQuestionIds());
    return allQuestions.filter((q) => ids.has(q.id));
  }
  if (source === "bookmarks") {
    const ids = new Set(getBookmarks());
    return allQuestions.filter((q) => ids.has(q.id));
  }
  return getQuestionsByCategory(category);
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "all";
  const mode: QuizMode = searchParams.get("mode") === "exam" ? "exam" : "practice";
  const examType: ExamType = searchParams.get("exam") === "chizai" ? "chizai" : "it-passport";
  const examTimeLimitSeconds = examRules[examType].timeLimitSeconds;
  const sourceParam = searchParams.get("source");
  const source: Source = sourceParam === "wrong" || sourceParam === "bookmarks" ? sourceParam : "category";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [bookmarkTick, setBookmarkTick] = useState(0);
  const [emptyPool, setEmptyPool] = useState(false);

  useEffect(() => {
    let pool: Question[];
    if (mode === "exam") {
      // 本番試験モードは試験種別ごとの全問題から規定数を出題する。
      pool = shuffleQuestions(getQuestionsByExam(examType)).slice(0, examRules[examType].questionCount);
    } else {
      pool = shuffleQuestions(buildQuestionPool(source, category));
    }
    const nextStartTime = Date.now();
    setQuestions(pool);
    setEmptyPool(pool.length === 0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers(new Array(pool.length).fill(null));
    setStartTime(nextStartTime);
    setElapsed(0);
  }, [category, mode, source, examType]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const currentQuestion = questions[currentIndex];
  const revealAnswers = mode === "practice";

  const finishQuiz = useCallback(
    (finalAnswers: (number | null)[]) => {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      saveQuizSession({
        category,
        mode,
        examType: mode === "exam" ? examType : undefined,
        source,
        questionIds: questions.map((q) => q.id),
        answers: finalAnswers,
        timeSeconds: totalTime,
      });
      router.push("/results");
    },
    [category, mode, examType, source, questions, startTime, router]
  );

  const handleAnswer = useCallback(
    (index: number) => {
      if (revealAnswers && showExplanation) return;
      setSelectedAnswer(index);
      if (revealAnswers) {
        setShowExplanation(true);
      }
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = index;
        return next;
      });
    },
    [revealAnswers, showExplanation, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(answers[currentIndex + 1] ?? null);
      setShowExplanation(false);
    } else {
      finishQuiz(answers);
    }
  }, [currentIndex, questions.length, answers, finishQuiz]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setSelectedAnswer(answers[currentIndex - 1] ?? null);
    setShowExplanation(false);
  }, [currentIndex, answers]);

  const handleSubmitExam = useCallback(() => {
    finishQuiz(answers);
  }, [answers, finishQuiz]);

  const handleToggleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    toggleBookmark(currentQuestion.id);
    setBookmarkTick((t) => t + 1);
  }, [currentQuestion]);

  useEffect(() => {
    if (mode !== "exam") return;
    if (elapsed >= examTimeLimitSeconds && questions.length > 0) {
      finishQuiz(answers);
    }
  }, [mode, elapsed, examTimeLimitSeconds, answers, finishQuiz, questions.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!currentQuestion) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key) - 1;
        if (idx < currentQuestion.options.length) handleAnswer(idx);
      }
      if (e.key === "Enter" || e.key === " ") {
        if (revealAnswers && showExplanation) {
          e.preventDefault();
          handleNext();
        } else if (!revealAnswers && selectedAnswer !== null) {
          e.preventDefault();
          handleNext();
        }
      }
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "b" || e.key === "B") handleToggleBookmark();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQuestion, revealAnswers, showExplanation, selectedAnswer, handleAnswer, handleNext, handlePrev, handleToggleBookmark]);

  const bookmarked = useMemo(() => {
    if (!currentQuestion) return false;
    void bookmarkTick;
    return isBookmarked(currentQuestion.id);
  }, [currentQuestion, bookmarkTick]);

  if (emptyPool) {
    const message = source === "wrong"
      ? "間違えた問題はまだありません。クイズに挑戦すると、ここに復習対象が溜まります。"
      : source === "bookmarks"
        ? "ブックマークされた問題がありません。問題画面の☆ボタンでブックマークできます。"
        : "このカテゴリの問題が見つかりません。";
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-sm">
          <p className="text-lg font-medium">{message}</p>
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
  const headerLabel = source === "wrong"
    ? "間違えた問題のみ"
    : source === "bookmarks"
      ? "ブックマーク"
      : category === "all"
        ? "全分野"
        : categoryLabels[category as Category] || category;

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeLeft = mode === "exam" ? Math.max(0, examTimeLimitSeconds - elapsed) : null;
  const timeLeftMin = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const timeLeftSec = timeLeft !== null ? timeLeft % 60 : 0;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-2 mb-6">
        <button
          onClick={() => router.push("/")}
          className="shrink-0 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← 戻る
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-sm font-medium text-[var(--muted)]">
          {mode === "exam" ? `${examShortLabels[examType]} 本番試験モード` : headerLabel}
        </span>
        <div className="shrink-0 text-right">
          <span className="text-sm font-medium block tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
          {timeLeft !== null ? (
            <span className={`text-xs tabular-nums ${timeLeft < 60 ? "text-[var(--danger)] font-semibold" : "text-[var(--muted)]"}`}>
              残り {timeLeftMin}:{timeLeftSec.toString().padStart(2, "0")}
            </span>
          ) : (
            <span className="text-xs text-[var(--muted)] tabular-nums">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full mb-8">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ backgroundImage: `linear-gradient(to right, var(--gradient-progress-from), var(--gradient-progress-to))`, width: `${progress}%` }}
        />
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
              {categoryLabels[currentQuestion.category]}
            </span>
            <span className="text-xs text-[var(--muted)]">
              問{currentIndex + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "ブックマークを外す" : "ブックマークに追加"}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${bookmarked ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-300/40 dark:bg-amber-400/20 dark:text-amber-100" : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:border-amber-400 hover:text-amber-700"}`}
          >
            <span>{bookmarked ? "★" : "☆"}</span>
            <span>{bookmarked ? "ブックマーク済" : "あとで復習"}</span>
          </button>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {currentQuestion.question}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          let style = "border-[var(--card-border)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]";
          if (revealAnswers && showExplanation) {
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
              disabled={revealAnswers && showExplanation}
              className={`flex w-full items-start gap-3 text-left p-4 rounded-xl border-2 transition-all bg-[var(--card)] ${style}`}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 leading-relaxed">{option}</span>
              {!(revealAnswers && showExplanation) && (
                <span className="mt-0.5 hidden shrink-0 text-xs text-[var(--muted)] sm:block">
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {mode === "practice" && !showExplanation && (
        <p className="text-center text-xs text-[var(--muted)] mb-4">
          キーボード: 1〜4で選択 · Bでブックマーク
        </p>
      )}

      {mode === "exam" && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm">
          <span className="text-[var(--muted)]">回答済 {answeredCount} / {questions.length}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40"
            >
              ← 前へ
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= questions.length - 1}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40"
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {revealAnswers && showExplanation && (
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

      {revealAnswers && showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors fade-in"
        >
          {currentIndex < questions.length - 1 ? "次の問題へ →" : "結果を見る →"}
          <span className="text-xs opacity-60 ml-2">(Enter)</span>
        </button>
      )}

      {mode === "exam" && (
        <button
          onClick={handleSubmitExam}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors"
        >
          {currentIndex < questions.length - 1 ? "途中で採点する" : "提出して採点する →"}
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
