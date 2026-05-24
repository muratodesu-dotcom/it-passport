"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getQuestionsByExam } from "@/data/questions";
import { Question, examShortLabels } from "@/lib/types";
import { FieldId, fieldOptions, itemField, parseExam } from "@/lib/examFields";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TIME_LIMIT = 60;

function SpeedChallenge() {
  const searchParams = useSearchParams();
  const exam = parseExam(searchParams.get("exam"));
  const [field, setField] = useState<FieldId>("all");
  const [pool, setPool] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameState, setGameState] = useState<"idle" | "playing" | "done">("idle");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredPool = useMemo(() => {
    const base = getQuestionsByExam(exam);
    return field === "all" ? base : base.filter((q) => itemField(exam, q) === field);
  }, [exam, field]);
  const current = pool[index];

  const startGame = useCallback(() => {
    setPool(shuffle(filteredPool));
    setIndex(0);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(TIME_LIMIT);
    setGameState("playing");
    setFlash(null);
    setSelectedIdx(null);
  }, [filteredPool]);

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameState("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  const handleAnswer = useCallback((optionIdx: number) => {
    if (gameState !== "playing" || !current || flash) return;

    setSelectedIdx(optionIdx);
    const isCorrect = optionIdx === current.correctIndex;

    if (isCorrect) {
      setCorrect((c) => c + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setFlash("correct");
    } else {
      setWrong((w) => w + 1);
      setStreak(0);
      setFlash("wrong");
    }

    setTimeout(() => {
      setFlash(null);
      setSelectedIdx(null);
      if (index + 1 >= pool.length) {
        setPool((prev) => [...prev, ...shuffle(filteredPool)]);
      }
      setIndex((i) => i + 1);
    }, 300);
  }, [gameState, current, flash, index, pool.length, filteredPool]);

  // Keyboard shortcuts
  useEffect(() => {
    if (gameState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 4) handleAnswer(num - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameState, handleAnswer]);

  const timerColor = timeLeft <= 10 ? "text-[var(--danger)]" : timeLeft <= 20 ? "text-orange-500" : "text-[var(--foreground)]";
  const timerBarWidth = (timeLeft / TIME_LIMIT) * 100;
  const timerBarColor = timeLeft <= 10 ? "bg-[var(--danger)]" : timeLeft <= 20 ? "bg-orange-500" : "bg-[var(--primary)]";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/games" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ゲーム一覧</Link>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-2xl font-bold">スピードチャレンジ</h1>
        <span className="rounded-full bg-[var(--badge-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--primary)]">{examShortLabels[exam]}</span>
      </div>
      <p className="text-[var(--muted)] mb-6">60秒以内にできるだけ多くの問題に正解しよう</p>

      {/* Field selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {fieldOptions(exam).map((opt) => (
          <button
            key={opt.id}
            onClick={() => { setField(opt.id); if (gameState !== "playing") setGameState("idle"); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              field === opt.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--badge-bg)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {gameState === "idle" && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⚡</div>
          <p className="text-lg mb-2 text-[var(--muted)]">60秒間のスピードクイズ</p>
          <p className="text-sm mb-6 text-[var(--muted)]">キーボード(1-4)で素早く回答できます</p>
          <button
            onClick={startGame}
            className="rounded-xl bg-[var(--primary)] px-8 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            チャレンジ開始
          </button>
        </div>
      )}

      {gameState === "playing" && current && (
        <>
          {/* Timer and stats bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-sm">
              <span className="text-[var(--success)] font-medium">{correct} 正解</span>
              <span className="text-[var(--danger)] font-medium">{wrong} 不正解</span>
              {streak >= 3 && (
                <span className="text-orange-500 font-bold animate-pulse">{streak}連続!</span>
              )}
            </div>
            <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>
              {timeLeft}
            </span>
          </div>

          {/* Timer bar */}
          <div className="w-full h-2 rounded-full bg-[var(--progress-bg)] mb-6">
            <div
              className={`h-full rounded-full ${timerBarColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${timerBarWidth}%` }}
            />
          </div>

          {/* Flash overlay */}
          <div className={`rounded-2xl border-2 p-6 mb-4 transition-colors duration-200 ${
            flash === "correct" ? "border-[var(--success-border)] bg-[var(--success-bg)]" :
            flash === "wrong" ? "border-[var(--danger-border)] bg-[var(--danger-bg)]" :
            "border-[var(--card-border)] bg-[var(--card)]"
          }`}>
            <p className="text-base font-medium leading-relaxed mb-4">
              {current.question}
            </p>

            <div className="grid gap-2">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={flash !== null}
                  className={`text-left rounded-xl border-2 px-4 py-3 text-sm transition-all duration-150 ${
                    selectedIdx === i && flash === "correct" ? "border-[var(--success)] bg-[var(--success-bg)]" :
                    selectedIdx === i && flash === "wrong" ? "border-[var(--danger)] bg-[var(--danger-bg)]" :
                    flash !== null && i === current.correctIndex ? "border-[var(--success)] bg-[var(--success-bg)]" :
                    "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--badge-bg)] flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {gameState === "done" && (
        <div className="text-center py-12 fade-in">
          <div className="text-6xl mb-4">
            {correct >= 15 ? "🏆" : correct >= 10 ? "🔥" : correct >= 5 ? "👍" : "💪"}
          </div>
          <h2 className="text-2xl font-bold mb-4">タイムアップ！</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-md mx-auto">
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-3xl font-bold text-[var(--success)]">{correct}</p>
              <p className="text-xs text-[var(--muted)]">正解</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-3xl font-bold text-[var(--danger)]">{wrong}</p>
              <p className="text-xs text-[var(--muted)]">不正解</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-3xl font-bold">
                {correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0}%
              </p>
              <p className="text-xs text-[var(--muted)]">正答率</p>
            </div>
            <div className="rounded-2xl bg-[var(--badge-bg)] p-4">
              <p className="text-3xl font-bold text-orange-500">{bestStreak}</p>
              <p className="text-xs text-[var(--muted)]">最大連続</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={startGame}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              もう一度挑戦
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

export default function SpeedPage() {
  return (
    <Suspense fallback={null}>
      <SpeedChallenge />
    </Suspense>
  );
}
