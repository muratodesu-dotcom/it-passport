"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { getQuestionsByCategory, getQuestionsByExam, getQuestionsByExamField, shuffleQuestions, withShuffledOptions, questions as allQuestions } from "@/data/questions";
import { Question, categoryLabels, Category, QuizMode, ExamType, examShortLabels, devFieldLabels } from "@/lib/types";
import { fieldLabel, hasExamMode, itemField, parseExam } from "@/lib/examFields";
import { fieldStyle } from "@/lib/fieldColors";
import { examRules } from "@/lib/scoring";
import { getBookmarks, getWrongQuestionIds, isBookmarked, toggleBookmark } from "@/lib/history";
import { getDueQuestionIds } from "@/lib/srs";
import { saveQuizSession } from "@/lib/quizSession";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExplanationEn from "@/components/ExplanationEn";
import CodeText from "@/components/CodeText";

type Source = "category" | "wrong" | "bookmarks" | "review";

function buildQuestionPool(source: Source, category: string): Question[] {
  if (source === "wrong") {
    const ids = new Set(getWrongQuestionIds());
    return allQuestions.filter((q) => ids.has(q.id));
  }
  if (source === "bookmarks") {
    const ids = new Set(getBookmarks());
    return allQuestions.filter((q) => ids.has(q.id));
  }
  if (source === "review") {
    // Spaced-repetition: questions whose review is due, soonest first.
    const due = getDueQuestionIds();
    const byId = new Map(allQuestions.map((q) => [q.id, q]));
    return due.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
  }
  return getQuestionsByCategory(category);
}

function QuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "all";
  const examType: ExamType = parseExam(searchParams.get("exam"));
  // The AIエンジニア track has no 本番試験; an exam link for it falls back to practice.
  const mode: QuizMode = searchParams.get("mode") === "exam" && hasExamMode(examType) ? "exam" : "practice";
  const examTimeLimitSeconds = examRules[examType].timeLimitSeconds;
  const sourceParam = searchParams.get("source");
  const source: Source =
    sourceParam === "wrong" || sourceParam === "bookmarks" || sourceParam === "review"
      ? sourceParam
      : "category";
  // 知財3級の分野別練習で出題範囲を絞る IpField（"all" 含む）。
  const field = searchParams.get("field") || "all";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [bookmarkTick, setBookmarkTick] = useState(0);
  const [emptyPool, setEmptyPool] = useState(false);
  // Consecutive correct answers in this session (reset on a wrong answer).
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let pool: Question[];
    if (mode === "exam") {
      // 本番試験モードは試験種別ごとの全問題から規定数を出題する。
      pool = shuffleQuestions(getQuestionsByExam(examType)).slice(0, examRules[examType].questionCount);
    } else if (source === "category" && examType !== "it-passport") {
      // 知財3級・AIエンジニアは分野別に練習できる。
      pool = shuffleQuestions(getQuestionsByExamField(examType, field));
    } else {
      pool = shuffleQuestions(buildQuestionPool(source, category));
    }
    // 選択肢を並び替える（出題データは正解が先頭に偏っているため）。問題idで
    // 並びが決まるので、結果画面でも同じ並びを再現できる。
    pool = pool.map((q) => withShuffledOptions(q));
    const nextStartTime = Date.now();
    setQuestions(pool);
    setEmptyPool(pool.length === 0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers(new Array(pool.length).fill(null));
    setStartTime(nextStartTime);
    setElapsed(0);
    setStreak(0);
  }, [category, mode, source, examType, field]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const currentQuestion = questions[currentIndex];
  // The AI Engineer track is in English, so its quiz screen is too.
  const en = examType === "dev";

  const finishQuiz = useCallback(
    (finalAnswers: (number | null)[]) => {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      saveQuizSession({
        category,
        field,
        mode,
        // 練習でも試験種別を残し、結果画面で知財は分野（IpField）別に集計する。
        examType,
        source,
        questionIds: questions.map((q) => q.id),
        answers: finalAnswers,
        timeSeconds: totalTime,
      });
      router.push("/results");
    },
    [category, field, mode, examType, source, questions, startTime, router]
  );

  const handleAnswer = useCallback(
    (index: number) => {
      // 一度回答して解説が出たら、その問題の選択肢は確定して変更できない。
      if (showExplanation) return;
      setSelectedAnswer(index);
      setShowExplanation(true);
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = index;
        return next;
      });
      if (currentQuestion) {
        setStreak((s) => (index === currentQuestion.correctIndex ? s + 1 : 0));
      }
    },
    [showExplanation, currentIndex, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(answers[nextIndex] ?? null);
      // 回答済みの問題に移動したときは、解説を再表示する。
      setShowExplanation(answers[nextIndex] != null);
    } else {
      finishQuiz(answers);
    }
  }, [currentIndex, questions.length, answers, finishQuiz]);

  const handlePrev = useCallback(() => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    setSelectedAnswer(answers[prevIndex] ?? null);
    setShowExplanation(answers[prevIndex] != null);
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
        if (showExplanation) {
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
  }, [currentQuestion, showExplanation, handleAnswer, handleNext, handlePrev, handleToggleBookmark]);

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
        : source === "review"
          ? "本日の復習対象はありません。クイズや練習を解くと、忘れた頃に復習カードが出題されます。"
          : "このカテゴリの問題が見つかりません。";
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center shadow-sm">
          <p className="text-lg font-medium">{message}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-3 font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)]"
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
  const { color: fieldColor, icon: fieldIcon } = fieldStyle(itemField(examType, currentQuestion));
  // Quiz limited to a single field/category (practice by field only).
  const scopedToField =
    mode === "practice" &&
    source === "category" &&
    (examType !== "it-passport" ? field !== "all" : category !== "all");
  const showAnswerBar = mode === "practice" && showExplanation;
  const headerLabel = source === "wrong"
    ? "間違えた問題のみ"
    : source === "bookmarks"
      ? "ブックマーク"
      : source === "review"
      ? "復習（間隔反復）"
      : examType !== "it-passport"
        ? field === "all"
          ? `${examShortLabels[examType]} ${examType === "dev" ? "· All fields" : "全分野"}`
          : fieldLabel(examType, field)
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
    <div className={`max-w-2xl mx-auto px-4 py-8 ${showAnswerBar ? "pb-24" : ""}`}>
      <div className="flex items-center justify-between gap-2 mb-6">
        <button
          onClick={() => router.push("/")}
          className="shrink-0 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← {en ? "Back" : "戻る"}
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-sm font-medium text-[var(--muted)]">
          {mode === "exam" ? `${examShortLabels[examType]} 本番試験モード` : headerLabel}
        </span>
        <div className="shrink-0 text-right">
          <span
            className={scopedToField ? "inline-block rounded-full px-2 py-0.5 text-sm font-bold tabular-nums" : "text-sm font-medium block tabular-nums"}
            style={scopedToField ? { backgroundColor: `${fieldColor}1f`, color: fieldColor } : undefined}
          >
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

      <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={
            scopedToField
              ? { backgroundColor: fieldColor, width: `${progress}%` }
              : { backgroundImage: `linear-gradient(to right, var(--gradient-progress-from), var(--gradient-progress-to))`, width: `${progress}%` }
          }
        />
      </div>
      {/* Fixed-height row so the streak chip appearing doesn't move the card. */}
      <div className="mb-4 mt-1.5 flex h-6 items-center justify-end">
        {streak >= 2 && (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700 tabular-nums dark:bg-orange-400/15 dark:text-orange-300">
            {en ? `🔥 ${streak} in a row` : `🔥 ${streak}連続`}
          </span>
        )}
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: fieldColor }}
            >
              {fieldIcon}{" "}
              {currentQuestion.devField ? devFieldLabels[currentQuestion.devField] : categoryLabels[currentQuestion.category]}
            </span>
            <span className="text-xs text-[var(--muted)]">
              {en ? `Q${currentIndex + 1}` : `問${currentIndex + 1}`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? (en ? "Remove bookmark" : "ブックマークを外す") : (en ? "Bookmark" : "ブックマークに追加")}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors ${bookmarked ? "border-amber-400 bg-amber-100 text-amber-900 dark:border-amber-300/40 dark:bg-amber-400/20 dark:text-amber-100" : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:border-amber-400 hover:text-amber-700"}`}
          >
            <span>{bookmarked ? "★" : "☆"}</span>
            <span>{bookmarked ? (en ? "Bookmarked" : "ブックマーク済") : (en ? "Review later" : "あとで復習")}</span>
          </button>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          <CodeText text={currentQuestion.question} />
        </p>
      </div>

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
              className={`flex w-full items-start gap-3 text-left p-4 rounded-xl border-2 transition-colors bg-[var(--card)] ${style}`}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 leading-relaxed"><CodeText text={option} /></span>
              {!showExplanation && (
                <span className="mt-0.5 hidden shrink-0 text-xs text-[var(--muted)] sm:block">
                  {index + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {!showExplanation && (
        <p className="text-center text-xs text-[var(--muted)] mb-4">
          {en ? "Keys: 1–4 to answer · B to bookmark" : "キーボード: 1〜4で選択 · Bでブックマーク"}
        </p>
      )}

      {showExplanation && (
        <div
          className={`rounded-xl p-5 mb-6 fade-in ${isCorrect ? "bg-[var(--success-bg)] border border-[var(--success-border)]" : "bg-[var(--danger-bg)] border border-[var(--danger-border)]"}`}
        >
          <p className="font-bold mb-2">
            {isCorrect ? (en ? "⭕ Correct" : "⭕ 正解！") : (en ? "❌ Incorrect" : "❌ 不正解")}
          </p>
          <p className="text-sm leading-relaxed">
            <CodeText text={currentQuestion.explanation} />
          </p>
          <ExplanationEn id={currentQuestion.id} />
        </div>
      )}

      {showAnswerBar && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--card-border)] px-4 pt-3 backdrop-blur"
          style={{
            backgroundColor: "color-mix(in srgb, var(--card) 95%, transparent)",
            paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <span
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap transition-colors ${isCorrect ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"}`}
            >
              {isCorrect ? (en ? "⭕ Correct" : "⭕ 正解") : (en ? "❌ Incorrect" : "❌ 不正解")}
            </span>
            <button
              onClick={handleNext}
              className="min-h-12 flex-1 whitespace-nowrap rounded-xl bg-[var(--primary)] px-5 font-medium text-[var(--on-primary)] transition-colors hover:bg-[var(--primary-hover)] sm:ml-auto sm:flex-none"
            >
              {currentIndex < questions.length - 1 ? (en ? "Next question →" : "次の問題へ →") : (en ? "See results →" : "結果を見る →")}
              <span className="ml-2 hidden text-xs opacity-60 sm:inline">(Enter)</span>
            </button>
          </div>
        </div>
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

      {mode === "exam" && (
        <button
          onClick={handleSubmitExam}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] font-medium rounded-xl transition-colors"
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
