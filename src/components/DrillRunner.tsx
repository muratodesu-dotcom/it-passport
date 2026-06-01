"use client";

import { useCallback, useEffect, useState } from "react";
import { DrillQuestion } from "@/lib/drills";

interface DrillRunnerProps {
  questions: DrillQuestion[];
  onRestart: () => void;
  onComplete?: (result: { correct: string[]; wrong: string[] }) => void;
}

export default function DrillRunner({ questions, onRestart, onComplete }: DrillRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: string[]; wrong: string[] }>({ correct: [], wrong: [] });
  const [done, setDone] = useState(false);

  const current = questions[index];

  const answer = useCallback(
    (optionIndex: number) => {
      if (revealed || !current) return;
      const isCorrect = optionIndex === current.correctIndex;
      setSelected(optionIndex);
      setRevealed(true);
      if (isCorrect) setScore((s) => s + 1);
      if (current.termKey) {
        setResults((prev) =>
          isCorrect
            ? { ...prev, correct: [...prev.correct, current.termKey!] }
            : { ...prev, wrong: [...prev.wrong, current.termKey!] }
        );
      }
    },
    [revealed, current]
  );

  const next = useCallback(() => {
    if (!revealed) return;
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }, [revealed, index, questions.length]);

  useEffect(() => {
    if (done) onComplete?.(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done || !current) return;
      if (!revealed && e.key >= "1" && e.key <= String(current.options.length)) {
        answer(parseInt(e.key) - 1);
      }
      if (revealed && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [done, current, revealed, answer, next]);

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    setResults({ correct: [], wrong: [] });
    setDone(false);
    onRestart();
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center shadow-sm">
        <p className="text-[var(--muted)]">出題できる問題がありません。</p>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="text-center py-10 fade-in">
        <div className="text-6xl mb-4">{pct === 100 ? "🏆" : pct >= 70 ? "🎉" : "💪"}</div>
        <h2 className="text-2xl font-bold mb-2">スコア {score} / {questions.length}</h2>
        <p className="text-[var(--muted)] mb-6">正答率 {pct}%</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={restart}
            className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
          >
            もう一度
          </button>
        </div>
      </div>
    );
  }

  const progress = ((index + (revealed ? 1 : 0)) / questions.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm text-[var(--muted)]">
        <span>{index + 1} / {questions.length}</span>
        <span className="text-[var(--success)]">{score} 正解</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--progress-bg)] mb-6">
        <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 mb-5 shadow-sm">
        <p className="text-xl font-bold leading-relaxed">{current.prompt}</p>
        {current.promptHint && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">{current.promptHint}</p>
        )}
      </div>

      <div className="space-y-3 mb-5">
        {current.options.map((opt, i) => {
          let style = "border-[var(--card-border)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]";
          if (revealed) {
            if (i === current.correctIndex) style = "border-[var(--success)] bg-[var(--success-bg)]";
            else if (i === selected) style = "border-[var(--danger)] bg-[var(--danger-bg)]";
            else style = "border-[var(--card-border)] opacity-50";
          }
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={revealed}
              className={`flex w-full items-start gap-3 text-left p-4 rounded-xl border-2 bg-[var(--card)] transition-all ${style}`}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--badge-bg)] text-sm font-medium">
                {i + 1}
              </span>
              <span className="flex-1 leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && current.explanation && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--badge-bg)] p-4 mb-5 text-sm leading-relaxed fade-in">
          {current.explanation}
        </div>
      )}

      {revealed && (
        <button
          onClick={next}
          className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-colors fade-in"
        >
          {index < questions.length - 1 ? "次へ →" : "結果を見る →"}
          <span className="text-xs opacity-60 ml-2">(Enter)</span>
        </button>
      )}
    </div>
  );
}
