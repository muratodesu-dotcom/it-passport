"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getTermPairs } from "@/data";
import { Category, categoryLabels, TermPair, categoryByExam } from "@/lib/types";
import { useExam } from "@/lib/examContext";

type Card = {
  id: string;
  pairId: number;
  type: "term" | "description";
  text: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound(pool: TermPair[], count: number): TermPair[] {
  return shuffle(pool).slice(0, count);
}

const SIZES = [6, 8, 10] as const;
type Size = (typeof SIZES)[number];

export default function MemoryGame() {
  const { exam } = useExam();
  const [category, setCategory] = useState<Category | "all">("all");
  const [size, setSize] = useState<Size>(6);
  const [round, setRound] = useState<TermPair[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [activeTerm, setActiveTerm] = useState<TermPair | null>(null);

  const allPairs = useMemo(() => getTermPairs(exam), [exam]);
  const pool = useMemo(
    () => (category === "all" ? allPairs : allPairs.filter((t) => t.category === category)),
    [category, allPairs]
  );

  useEffect(() => {
    setCategory("all");
    setGameStarted(false);
  }, [exam]);

  const startGame = useCallback(() => {
    const picked = pickRound(pool, Math.min(size, pool.length));
    const built: Card[] = [];
    picked.forEach((p, i) => {
      built.push({ id: `t-${i}`, pairId: i, type: "term", text: p.term });
      built.push({ id: `d-${i}`, pairId: i, type: "description", text: p.description });
    });
    setRound(picked);
    setCards(shuffle(built));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setStartTime(Date.now());
    setElapsed(0);
    setGameStarted(true);
    setActiveTerm(null);
    setPeeking(true);
    setTimeout(() => setPeeking(false), 1800);
  }, [pool, size]);

  useEffect(() => {
    if (!gameStarted) return;
    const isComplete = matched.size === cards.length / 2 && cards.length > 0;
    if (isComplete) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 250);
    return () => clearInterval(timer);
  }, [gameStarted, startTime, matched.size, cards.length]);

  const isComplete = gameStarted && matched.size === cards.length / 2 && cards.length > 0;

  const handleClick = (card: Card) => {
    if (peeking || isComplete) return;
    if (matched.has(card.pairId)) return;
    if (flipped.includes(card.id)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((c) => c.id === id)!);
      if (a.pairId === b.pairId && a.type !== b.type) {
        setMatched((prev) => new Set([...prev, a.pairId]));
        const pair = round[a.pairId];
        if (pair) setActiveTerm(pair);
        setTimeout(() => setFlipped([]), 600);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const gridCols = size === 6 ? "grid-cols-3 sm:grid-cols-4" : size === 8 ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/games" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">メモリーマッチ</h1>
      <p className="text-sm text-[var(--muted)] mb-6">カードをめくって用語と説明のペアを見つけよう</p>

      {/* Settings */}
      {!gameStarted && (
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-xs text-[var(--muted)] mb-2">分野</p>
            <div className="flex flex-wrap gap-2">
              {(["all", ...categoryByExam[exam]] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat as Category | "all")}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    category === cat
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {cat === "all" ? "全分野" : categoryLabels[cat as Category]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--muted)] mb-2">ペア数</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    size === s
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {s}ペア
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!gameStarted && (
        <div className="text-center py-10">
          <div className="text-5xl mb-4">🧠</div>
          <p className="text-sm text-[var(--muted)] mb-6">
            {size}ペア（{size * 2}枚）でスタート。最初の1.8秒はチラ見せ！
          </p>
          <button
            onClick={startGame}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            スタート
          </button>
        </div>
      )}

      {gameStarted && !isComplete && (
        <>
          <div className="flex items-center justify-between mb-3 text-sm text-[var(--muted)]">
            <span>{matched.size}/{cards.length / 2} ペア</span>
            <span className="flex gap-3">
              <span>手数 {moves}</span>
              <span className="tabular-nums">{elapsed}秒</span>
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--progress-bg)] mb-5">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(matched.size / (cards.length / 2)) * 100}%` }}
            />
          </div>

          <div className={`grid ${gridCols} gap-1.5 sm:gap-3`}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.has(card.pairId) || peeking;
              const isMatched = matched.has(card.pairId);
              return (
                <button
                  key={card.id}
                  onClick={() => handleClick(card)}
                  disabled={isMatched || peeking}
                  className={`relative aspect-[3/4] rounded-lg sm:rounded-xl border transition-all duration-200 text-[0.65rem] leading-snug sm:text-sm sm:leading-tight ${
                    isFlipped
                      ? isMatched
                        ? "border-[var(--success-border)] bg-[var(--success-bg)] opacity-70"
                        : "border-[var(--primary)] bg-[var(--card)] shadow-md"
                      : "border-[var(--card-border)] bg-gradient-to-br from-[var(--badge-bg)] to-[var(--card)] hover:-translate-y-0.5 hover:shadow"
                  }`}
                >
                  {isFlipped ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center overflow-hidden">
                      <span className={`absolute top-0.5 left-1 text-[0.5rem] sm:text-[0.55rem] uppercase tracking-wider font-semibold ${
                        card.type === "term" ? "text-[var(--primary)]" : "text-[var(--muted)]"
                      }`}>
                        {card.type === "term" ? "用語" : "説明"}
                      </span>
                      <span className={`${card.type === "term" ? "font-bold" : "font-normal"} line-clamp-5 sm:line-clamp-6`}>
                        {card.text}
                      </span>
                    </div>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl opacity-30">?</span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTerm && matched.size > 0 && matched.size < cards.length / 2 && (
            <div className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-xs text-[var(--muted)] fade-in">
              <span className="font-semibold text-[var(--foreground)]">{activeTerm.term}</span>
              <span className="opacity-70"> — {activeTerm.english}</span>
            </div>
          )}
        </>
      )}

      {isComplete && (
        <div className="text-center py-12 fade-in">
          <div className="text-6xl mb-4">
            {moves <= cards.length / 2 + 1 ? "🏆" : moves <= cards.length ? "🎉" : "👍"}
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {moves <= cards.length / 2 + 1 ? "完璧！" : "クリア！"}
          </h2>
          <p className="text-[var(--muted)] mb-1">
            {cards.length / 2}ペアを {moves}手 / {elapsed}秒
          </p>
          <p className="text-sm text-[var(--muted)] mb-6">
            効率 {Math.round(((cards.length / 2) / moves) * 100)}%
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={startGame}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              もう一度
            </button>
            <button
              onClick={() => setGameStarted(false)}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
            >
              設定を変更
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
