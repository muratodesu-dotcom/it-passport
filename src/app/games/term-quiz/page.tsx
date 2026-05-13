"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getTermPairs } from "@/data";
import { Category, categoryLabels, TermPair, categoryByExam } from "@/lib/types";
import { useExam } from "@/lib/examContext";

type Direction = "desc-to-term" | "term-to-desc";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(target: TermPair, distractorPool: TermPair[]) {
  const distractors = shuffle(distractorPool.filter((p) => p.term !== target.term)).slice(0, 3);
  const choices = shuffle([target, ...distractors]);
  return {
    target,
    choices,
    correctIndex: choices.findIndex((c) => c.term === target.term),
  };
}

function buildRound(pool: TermPair[], length: number) {
  return shuffle(pool).slice(0, length).map((target) => buildQuestion(target, pool));
}

function buildRoundFromTargets(targets: TermPair[], distractorPool: TermPair[]) {
  return shuffle(targets).map((target) => buildQuestion(target, distractorPool));
}

export default function TermQuizGame() {
  const { exam } = useExam();
  const [category, setCategory] = useState<Category | "all">("all");
  const [direction, setDirection] = useState<Direction>("desc-to-term");
  const [length, setLength] = useState(10);
  const [round, setRound] = useState<ReturnType<typeof buildRound>>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [missed, setMissed] = useState<TermPair[]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");

  const allPairs = useMemo(() => getTermPairs(exam), [exam]);
  const pool = useMemo(
    () => (category === "all" ? allPairs : allPairs.filter((t) => t.category === category)),
    [category, allPairs]
  );

  useEffect(() => {
    setCategory("all");
    setGameState("idle");
  }, [exam]);

  const startGame = useCallback(() => {
    setRound(buildRound(pool, Math.min(length, pool.length)));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setMissed([]);
    setGameState("playing");
  }, [pool, length]);

  const retryMissed = useCallback(() => {
    if (missed.length === 0) return;
    setRound(buildRoundFromTargets(missed, pool));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setMissed([]);
    setGameState("playing");
  }, [missed, pool]);

  const current = round[index];

  const handlePick = (i: number) => {
    if (selected !== null || !current) return;
    setSelected(i);
    const isCorrect = i === current.correctIndex;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
      setMissed((m) => [...m, current.target]);
    }
  };

  const next = useCallback(() => {
    if (index + 1 >= round.length) {
      setGameState("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }, [index, round.length]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (selected === null) {
        const n = parseInt(e.key);
        if (n >= 1 && n <= 4) handlePick(n - 1);
      } else {
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
          e.preventDefault();
          next();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, selected, next]);

  const renderPrompt = (p: TermPair) => (direction === "desc-to-term" ? p.description : p.term);
  const renderChoice = (p: TermPair) => (direction === "desc-to-term" ? p.term : p.description);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/games" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">用語クイズ</h1>
      <p className="text-sm text-[var(--muted)] mb-6">説明から用語を選ぶ4択クイズ。連続正解でストリークを伸ばそう</p>

      {gameState === "idle" && (
        <div className="space-y-5">
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
            <p className="text-xs text-[var(--muted)] mb-2">出題方向</p>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "desc-to-term", label: "説明 → 用語" },
                { id: "term-to-desc", label: "用語 → 説明" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDirection(opt.id)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    direction === opt.id
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[var(--muted)] mb-2">問題数</p>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setLength(n)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    length === n
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {n}問
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={startGame}
              className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              スタート
            </button>
            <p className="hidden md:block mt-3 text-xs text-[var(--muted)]">数字キー 1-4 で素早く回答、スペース/Enter で次へ</p>
          </div>
        </div>
      )}

      {gameState === "playing" && current && (
        <>
          <div className="flex items-center justify-between mb-3 text-sm text-[var(--muted)]">
            <span>{index + 1} / {round.length}</span>
            <span className="flex gap-3">
              <span className="text-[var(--success)]">{correctCount} 正解</span>
              {streak >= 2 && <span className="text-orange-500 font-semibold">🔥 {streak}連続</span>}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--progress-bg)] mb-5">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(index / round.length) * 100}%` }}
            />
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 mb-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)] mb-2">
              {direction === "desc-to-term" ? "この説明にあてはまる用語は？" : "この用語の説明は？"}
            </p>
            <p className="text-base leading-relaxed">{renderPrompt(current.target)}</p>
          </div>

          <div className="grid gap-2">
            {current.choices.map((choice, i) => {
              const isCorrect = i === current.correctIndex;
              const isSelected = selected === i;
              const showResult = selected !== null;
              return (
                <button
                  key={i}
                  onClick={() => handlePick(i)}
                  disabled={selected !== null}
                  className={`text-left rounded-xl border-2 px-4 py-3 text-sm transition-all duration-150 ${
                    showResult && isCorrect
                      ? "border-[var(--success)] bg-[var(--success-bg)]"
                      : showResult && isSelected
                      ? "border-[var(--danger)] bg-[var(--danger-bg)]"
                      : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]"
                  }`}
                >
                  <span className="inline-flex items-start gap-3 w-full">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--badge-bg)] flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1">{renderChoice(choice)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4 fade-in">
              {selected !== current.correctIndex && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--badge-bg)] px-4 py-3 mb-3 text-sm">
                  <p className="font-semibold text-[var(--foreground)] mb-1">{current.target.term}</p>
                  <p className="text-xs text-[var(--muted)] mb-1">{current.target.english}</p>
                  <p className="text-[var(--muted)]">{current.target.description}</p>
                </div>
              )}
              <button
                onClick={next}
                className="w-full rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:bg-[var(--primary-hover)]"
              >
                {index + 1 >= round.length ? "結果を見る" : "次の問題 →"}
              </button>
            </div>
          )}
        </>
      )}

      {gameState === "done" && (
        <div className="text-center py-10 fade-in">
          <div className="text-6xl mb-4">
            {correctCount === round.length ? "🏆" : correctCount >= round.length * 0.8 ? "🎉" : correctCount >= round.length * 0.5 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-bold mb-3">結果</h2>

          <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
            <div className="rounded-xl bg-[var(--badge-bg)] p-3">
              <p className="text-2xl font-bold">{correctCount}/{round.length}</p>
              <p className="text-xs text-[var(--muted)]">正解</p>
            </div>
            <div className="rounded-xl bg-[var(--badge-bg)] p-3">
              <p className="text-2xl font-bold">{Math.round((correctCount / round.length) * 100)}%</p>
              <p className="text-xs text-[var(--muted)]">正答率</p>
            </div>
            <div className="rounded-xl bg-[var(--badge-bg)] p-3">
              <p className="text-2xl font-bold text-orange-500">{bestStreak}</p>
              <p className="text-xs text-[var(--muted)]">最大連続</p>
            </div>
          </div>

          {missed.length > 0 && (
            <div className="text-left max-w-md mx-auto mb-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">
                復習が必要な用語 ({missed.length})
              </p>
              <ul className="space-y-2 text-sm max-h-56 overflow-y-auto">
                {missed.map((p, i) => (
                  <li key={i} className="border-l-2 border-[var(--danger-border)] pl-3">
                    <p className="font-semibold">{p.term}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{p.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center gap-3 flex-wrap">
            {missed.length > 0 && (
              <button
                onClick={retryMissed}
                className="rounded-xl bg-[var(--danger)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5"
              >
                間違えた{missed.length}問を復習
              </button>
            )}
            <button
              onClick={startGame}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              もう一度
            </button>
            <button
              onClick={() => setGameState("idle")}
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
