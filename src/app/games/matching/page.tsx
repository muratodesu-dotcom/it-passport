"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { termPairs, TermPair } from "@/data/terms";
import { Category, categoryLabels } from "@/lib/types";

type MatchItem = {
  id: string;
  text: string;
  pairId: number;
  type: "term" | "description";
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

const ROUND_SIZE = 6;

export default function MatchingGame() {
  const [category, setCategory] = useState<Category | "all">("all");
  const [round, setRound] = useState<TermPair[]>([]);
  const [items, setItems] = useState<{ terms: MatchItem[]; descs: MatchItem[] }>({ terms: [], descs: [] });
  const [selected, setSelected] = useState<MatchItem | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundNum, setRoundNum] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const pool = category === "all" ? termPairs : termPairs.filter((t) => t.category === category);

  const startNewRound = useCallback(() => {
    const picked = pickRound(pool, Math.min(ROUND_SIZE, pool.length));
    setRound(picked);
    const terms: MatchItem[] = shuffle(
      picked.map((p, i) => ({ id: `t-${i}`, text: p.term, pairId: i, type: "term" as const }))
    );
    const descs: MatchItem[] = shuffle(
      picked.map((p, i) => ({ id: `d-${i}`, text: p.description, pairId: i, type: "description" as const }))
    );
    setItems({ terms, descs });
    setSelected(null);
    setMatched(new Set());
    setWrong(null);
    setAttempts(0);
    setScore(0);
    setRoundNum((n) => n + 1);
    setStartTime(Date.now());
    setGameStarted(true);
  }, [pool]);

  useEffect(() => {
    if (!gameStarted) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 200);
    return () => clearInterval(timer);
  }, [gameStarted, startTime]);

  const isComplete = matched.size === round.length && round.length > 0;

  useEffect(() => {
    if (isComplete) setGameStarted(false);
  }, [isComplete]);

  const handleClick = (item: MatchItem) => {
    if (matched.has(item.pairId) && ((selected?.type !== item.type) || selected?.pairId === item.pairId)) return;
    if (wrong) return;

    if (!selected) {
      setSelected(item);
      return;
    }

    if (selected.id === item.id) {
      setSelected(null);
      return;
    }

    if (selected.type === item.type) {
      setSelected(item);
      return;
    }

    setAttempts((a) => a + 1);
    if (selected.pairId === item.pairId) {
      setMatched((prev) => new Set([...prev, item.pairId]));
      setScore((s) => s + 1);
      setSelected(null);
    } else {
      setWrong(item.id);
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 600);
    }
  };

  const getItemClass = (item: MatchItem) => {
    if (matched.has(item.pairId)) return "border-[var(--success-border)] bg-[var(--success-bg)] opacity-60 scale-95";
    if (wrong === item.id || (wrong && selected?.id === item.id)) return "border-[var(--danger-border)] bg-[var(--danger-bg)] animate-shake";
    if (selected?.id === item.id) return "border-[var(--primary)] bg-[var(--option-selected-bg)] ring-2 ring-[var(--primary)]/30";
    return "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/games" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">用語マッチング</h1>
      <p className="text-[var(--muted)] mb-6">左の用語と右の説明をクリックしてペアを見つけよう</p>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "strategy", "management", "technology"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setGameStarted(false); setRound([]); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {cat === "all" ? "全分野" : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {round.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔗</div>
          <p className="text-lg mb-6 text-[var(--muted)]">
            {pool.length}個の用語ペアから{Math.min(ROUND_SIZE, pool.length)}問を出題
          </p>
          <button
            onClick={startNewRound}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            スタート
          </button>
        </div>
      )}

      {round.length > 0 && !isComplete && (
        <>
          <div className="flex items-center justify-between mb-4 text-sm text-[var(--muted)]">
            <span>ラウンド {roundNum} — {matched.size}/{round.length} マッチ</span>
            <span>{elapsed}秒</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--progress-bg)] mb-6">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(matched.size / round.length) * 100}%` }}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">用語</p>
              {items.terms.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${getItemClass(item)}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">説明</p>
              {items.descs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm leading-relaxed transition-all duration-200 ${getItemClass(item)}`}
                >
                  {item.text}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isComplete && (
        <div className="text-center py-12 fade-in">
          <div className="text-6xl mb-4">{attempts === round.length ? "🏆" : attempts <= round.length + 2 ? "🎉" : "👍"}</div>
          <h2 className="text-2xl font-bold mb-2">
            {attempts === round.length ? "パーフェクト！" : "クリア！"}
          </h2>
          <p className="text-[var(--muted)] mb-2">
            {round.length}ペアを{attempts}回の試行でマッチ — {elapsed}秒
          </p>
          <p className="text-sm text-[var(--muted)] mb-6">
            正確率: {Math.round((round.length / attempts) * 100)}%
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={startNewRound}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              次のラウンド
            </button>
            <Link
              href="/games"
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
            >
              ゲーム一覧へ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
