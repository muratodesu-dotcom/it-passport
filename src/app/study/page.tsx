"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { getQuestionsByCategory } from "@/data/questions";
import { categoryLabels, Category } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

type FeedItem = {
  feedId: string;
  questionIndex: number;
};

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "strategy";

  const questions = useMemo(() => getQuestionsByCategory(category), [category]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [doomScrollMode, setDoomScrollMode] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [revealedFeedItems, setRevealedFeedItems] = useState<number[]>([]);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const question = questions[currentIndex];
  const categoryLabel = categoryLabels[category as Category] || category;
  const studiedCount = showAnswer ? currentIndex + 1 : currentIndex;
  const mastery = questions.length > 0 ? Math.round((studiedCount / questions.length) * 100) : 0;

  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setFeedItems(
      questions.slice(0, Math.min(4, questions.length)).map((_, index) => ({
        feedId: `${category}-${index}`,
        questionIndex: index,
      }))
    );
    setRevealedFeedItems([]);
  }, [category, questions]);

  useEffect(() => {
    if (!doomScrollMode) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (!firstEntry?.isIntersecting) return;

        setFeedItems((prev) => {
          if (prev.length >= questions.length) return prev;
          const nextIndex = prev.length;
          return [
            ...prev,
            {
              feedId: `${category}-${nextIndex}`,
              questionIndex: nextIndex,
            },
          ];
        });
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [doomScrollMode, category, questions.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (doomScrollMode) return;
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
  }, [doomScrollMode, showAnswer, currentIndex, questions.length]);

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

  const focusTips = [
    `${categoryLabel}は全${questions.length}問。短時間の周回で定着しやすい構成です。`,
    "答えを見る前に、なぜその選択肢が正しいかを1文で説明すると記憶に残りやすくなります。",
    "不安な問題は後でクイズモードでもう一度解き、瞬発力を確認しましょう。",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="mb-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              ← 戻る
            </button>
            <p className="text-sm font-medium text-[var(--primary)] mb-2">
              学習モード - {categoryLabel}
            </p>
            <h1 className="text-3xl font-bold mb-3">一問ずつでも、ひたすら流し見でも。</h1>
            <p className="text-[var(--muted)] max-w-2xl leading-relaxed">
              通常モードは集中して1問ずつ確認、Doom Scrollモードは次々にカードをめくりながら連続復習できます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-full lg:min-w-[320px] lg:max-w-[360px]">
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-xs text-[var(--muted)] mb-1">進捗</p>
              <p className="text-2xl font-bold">{mastery}%</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-xs text-[var(--muted)] mb-1">見た問題</p>
              <p className="text-2xl font-bold">{studiedCount}</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4 col-span-2">
              <div className="flex items-center justify-between mb-2 text-xs text-[var(--muted)]">
                <span>学習トラック</span>
                <span>{studiedCount} / {questions.length}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--progress-bg)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${mastery}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDoomScrollMode(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${!doomScrollMode ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)]"}`}
          >
            集中モード
          </button>
          <button
            onClick={() => setDoomScrollMode(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${doomScrollMode ? "bg-[var(--accent)] text-white" : "bg-[var(--secondary-btn-bg)] hover:bg-[var(--secondary-btn-hover)]"}`}
          >
            Doom Scrollモード ∞
          </button>
          <span className="text-xs text-[var(--muted)]">
            {doomScrollMode ? "下へスクロールすると問題が自動追加されます。" : "Space / Enter で答え表示、← → で移動できます。"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {!doomScrollMode ? (
            <>
              <div className="w-full h-2 bg-[var(--progress-bg)] rounded-full mb-8">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div className="bg-[var(--card)] rounded-xl border border-[var(--card-border)] p-6 mb-6 shadow-sm fade-in" key={currentIndex}>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
                  問{currentIndex + 1}
                </span>
                <p className="text-lg font-medium leading-relaxed mt-4">
                  {question.question}
                </p>
              </div>

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
                      正解: {String.fromCharCode(65 + question.correctIndex)}. {" "}
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
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item, feedPosition) => {
                const feedQuestion = questions[item.questionIndex];
                const revealed = revealedFeedItems.includes(feedQuestion.id);

                return (
                  <article
                    key={item.feedId}
                    className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm slide-in"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[var(--muted)] mb-1">
                          {categoryLabel} / フィード {feedPosition + 1}
                        </p>
                        <h2 className="font-semibold text-lg">{feedQuestion.question}</h2>
                      </div>
                      <span className="rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs text-[var(--muted)]">
                        問{item.questionIndex + 1}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {feedQuestion.options.map((option, optionIndex) => {
                        const isCorrect = optionIndex === feedQuestion.correctIndex;
                        return (
                          <div
                            key={`${item.feedId}-${optionIndex}`}
                            className={`rounded-xl border p-4 transition-all ${revealed && isCorrect ? "border-[var(--success)] bg-[var(--success-bg)]" : "border-[var(--card-border)]"}`}
                          >
                            <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            {option}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-xl bg-[var(--badge-bg)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{revealed ? "答えを表示中" : "まだ答えは隠れています"}</p>
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {revealed ? `正解は ${String.fromCharCode(65 + feedQuestion.correctIndex)} です。` : "スクロールの勢いに飲まれず、まず自分で考えてみましょう。"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setRevealedFeedItems((prev) =>
                              revealed ? prev.filter((id) => id !== feedQuestion.id) : [...prev, feedQuestion.id]
                            )
                          }
                          className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors"
                        >
                          {revealed ? "答えを閉じる" : "答えを見る"}
                        </button>
                      </div>

                      {revealed && (
                        <p className="mt-3 text-sm leading-relaxed text-[var(--explanation-text)] fade-in">
                          {feedQuestion.explanation}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}

              <div ref={loaderRef} className="rounded-2xl border border-dashed border-[var(--card-border)] p-5 text-center text-sm text-[var(--muted)]">
                {feedItems.length < questions.length
                  ? "さらに下へスクロールすると次の問題が流れてきます…"
                  : "ここまでで全問題を読み切りました。上に戻って復習してもOKです。"}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold mb-3">学習を濃くするヒント</h2>
            <ul className="space-y-3 text-sm text-[var(--muted)] leading-relaxed">
              {focusTips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-0.5 text-base">✨</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="font-semibold mb-3">次のアクション</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/quiz?category=${category}`)}
                className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
              >
                この分野でクイズに挑戦
              </button>
              <button
                onClick={() => router.push("/history")}
                className="w-full rounded-xl bg-[var(--secondary-btn-bg)] px-4 py-3 font-medium transition-colors hover:bg-[var(--secondary-btn-hover)]"
              >
                学習履歴を確認
              </button>
            </div>
          </div>
        </aside>
      </div>
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
