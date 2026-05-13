"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getTermPairs } from "@/data";
import { Category, categoryLabels, categoryByExam } from "@/lib/types";
import { useExam } from "@/lib/examContext";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsGame() {
  const { exam } = useExam();
  const [category, setCategory] = useState<Category | "all">("all");
  const allPairs = useMemo(() => getTermPairs(exam), [exam]);
  const [cards, setCards] = useState(() => shuffle(allPairs));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [showFront, setShowFront] = useState<"term" | "description">("term");

  const pool = category === "all" ? allPairs : allPairs.filter((t) => t.category === category);

  useEffect(() => {
    setCategory("all");
    setGameStarted(false);
    setCards(shuffle(allPairs));
  }, [exam, allPairs]);

  const startGame = useCallback(() => {
    const shuffled = shuffle(pool);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
    setGameStarted(true);
  }, [pool]);

  const current = cards[index];
  const isComplete = gameStarted && index >= cards.length;

  const handleMark = (type: "known" | "unknown") => {
    if (type === "known") {
      setKnown((prev) => new Set([...prev, index]));
    } else {
      setUnknown((prev) => new Set([...prev, index]));
    }
    setFlipped(false);
    setTimeout(() => setIndex((i) => i + 1), 150);
  };

  const retryUnknown = () => {
    const unknownCards = Array.from(unknown).map((i) => cards[i]);
    setCards(shuffle(unknownCards));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!gameStarted || isComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped) setFlipped(true);
      }
      if (flipped && (e.key === "ArrowRight" || e.key === "1")) handleMark("known");
      if (flipped && (e.key === "ArrowLeft" || e.key === "2")) handleMark("unknown");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStarted, isComplete, flipped, index]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/games" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">フラッシュカード</h1>
      <p className="text-[var(--muted)] mb-6">カードをめくって用語を覚えよう。知ってる/知らないで仕分け</p>

      {/* Settings */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", ...categoryByExam[exam]] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat as Category | "all"); setGameStarted(false); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {cat === "all" ? "全分野" : categoryLabels[cat as Category]}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setShowFront(showFront === "term" ? "description" : "term")}
          className="text-xs rounded-full px-3 py-1 bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          表面: {showFront === "term" ? "用語→説明" : "説明→用語"}
        </button>
      </div>

      {!gameStarted && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🃏</div>
          <p className="text-lg mb-6 text-[var(--muted)]">{pool.length}枚のカードで学習</p>
          <button
            onClick={startGame}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            スタート
          </button>
        </div>
      )}

      {gameStarted && !isComplete && current && (
        <>
          <div className="flex items-center justify-between mb-4 text-sm text-[var(--muted)]">
            <span>{index + 1} / {cards.length}</span>
            <span className="flex gap-3">
              <span className="text-[var(--success)]">{known.size} 覚えた</span>
              <span className="text-[var(--danger)]">{unknown.size} もう一度</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--progress-bg)] mb-6">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${((index) / cards.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div className="perspective-1000 mb-6">
            <div
              onClick={() => !flipped && setFlipped(true)}
              className={`relative w-full min-h-[240px] cursor-pointer transition-transform duration-500 transform-style-3d ${flipped ? "rotate-y-180" : ""}`}
            >
              {/* Front */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card)] p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-lg ${flipped ? "invisible" : ""}`}>
                <span className="inline-block rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs mb-4 text-[var(--muted)]">
                  {categoryLabels[current.category]}
                </span>
                <p className="text-xl font-bold leading-relaxed">
                  {showFront === "term" ? current.term : current.description}
                </p>
                <p className="mt-4 text-xs text-[var(--muted)]">タップで<span className="hidden md:inline">、または Space/Enter で</span>めくる</p>
              </div>

              {/* Back */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-[var(--primary)] bg-[var(--option-selected-bg)] p-8 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-lg ${!flipped ? "invisible" : ""}`}>
                <p className="text-xs text-[var(--muted)] mb-2">{showFront === "term" ? "説明" : "用語"}</p>
                <p className="text-lg leading-relaxed font-medium">
                  {showFront === "term" ? current.description : current.term}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {flipped && (
            <div className="flex gap-3 justify-center fade-in">
              <button
                onClick={() => handleMark("unknown")}
                className="flex-1 max-w-[200px] rounded-xl border-2 border-[var(--danger-border)] bg-[var(--danger-bg)] px-6 py-3 font-medium text-[var(--danger)] transition-all hover:-translate-y-0.5"
              >
                もう一度<span className="hidden md:inline"> (&larr;)</span>
              </button>
              <button
                onClick={() => handleMark("known")}
                className="flex-1 max-w-[200px] rounded-xl border-2 border-[var(--success-border)] bg-[var(--success-bg)] px-6 py-3 font-medium text-[var(--success)] transition-all hover:-translate-y-0.5"
              >
                覚えた<span className="hidden md:inline"> (&rarr;)</span>
              </button>
            </div>
          )}
        </>
      )}

      {isComplete && (
        <div className="text-center py-12 fade-in">
          <div className="text-6xl mb-4">
            {unknown.size === 0 ? "🏆" : known.size > unknown.size ? "🎉" : "💪"}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {unknown.size === 0 ? "全部覚えた！" : "セッション完了！"}
          </h2>
          <div className="flex justify-center gap-6 mb-6 text-sm">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--success)]">{known.size}</p>
              <p className="text-[var(--muted)]">覚えた</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--danger)]">{unknown.size}</p>
              <p className="text-[var(--muted)]">もう一度</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{Math.round((known.size / cards.length) * 100)}%</p>
              <p className="text-[var(--muted)]">定着率</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            {unknown.size > 0 && (
              <button
                onClick={retryUnknown}
                className="rounded-xl bg-[var(--danger)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5"
              >
                間違えた{unknown.size}枚を復習
              </button>
            )}
            <button
              onClick={startGame}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              全カードでやり直す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
