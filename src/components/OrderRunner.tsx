"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FlowSet } from "@/data/chizaiDrills";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function OrderRunner({ sets }: { sets: FlowSet[] }) {
  const [setIndex, setSetIndex] = useState(0);
  const [nonce, setNonce] = useState(0);
  const active = sets[setIndex];

  // Shuffled step list the user picks from.
  const shuffled = useMemo(() => shuffle(active.steps), [active, nonce]);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    setPicked([]);
  }, [active, nonce]);

  const pick = useCallback(
    (step: string) => {
      if (picked.includes(step)) return;
      setPicked((prev) => [...prev, step]);
    },
    [picked]
  );

  const reset = () => setPicked([]);
  const reshuffle = () => setNonce((n) => n + 1);
  const nextSet = () => {
    setSetIndex((i) => (i + 1) % sets.length);
    setNonce((n) => n + 1);
  };

  const complete = picked.length === active.steps.length;
  const correctCount = picked.filter((step, i) => step === active.steps[i]).length;
  const allCorrect = complete && correctCount === active.steps.length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{active.title}</h2>
        {sets.length > 1 && (
          <button onClick={nextSet} className="text-sm text-[var(--primary)] hover:underline">別の流れ →</button>
        )}
      </div>
      <p className="mb-4 text-sm text-[var(--muted)]">正しい順序になるように上から順にタップしてください。</p>

      {/* Chosen order */}
      <div className="mb-5 space-y-2">
        {active.steps.map((_, i) => {
          const step = picked[i];
          const isPlaced = step !== undefined;
          const correct = complete && step === active.steps[i];
          const style = !isPlaced
            ? "border-dashed border-[var(--card-border)] text-[var(--muted)]"
            : !complete
              ? "border-[var(--primary)] bg-[var(--option-selected-bg)]"
              : correct
                ? "border-[var(--success)] bg-[var(--success-bg)]"
                : "border-[var(--danger)] bg-[var(--danger-bg)]";
          return (
            <div key={i} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm ${style}`}>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--badge-bg)] text-xs font-bold">{i + 1}</span>
              <span>{isPlaced ? step : "—"}</span>
            </div>
          );
        })}
      </div>

      {/* Choices */}
      {!complete && (
        <div className="mb-5 flex flex-wrap gap-2">
          {shuffled.map((step) => (
            <button
              key={step}
              onClick={() => pick(step)}
              disabled={picked.includes(step)}
              className={`rounded-xl border-2 px-4 py-2 text-sm transition-all ${
                picked.includes(step)
                  ? "border-[var(--card-border)] opacity-40"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--option-hover-border)] hover:bg-[var(--option-hover-bg)]"
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      )}

      {complete && (
        <div className={`mb-5 rounded-xl border p-4 text-sm fade-in ${allCorrect ? "border-[var(--success-border)] bg-[var(--success-bg)]" : "border-[var(--danger-border)] bg-[var(--danger-bg)]"}`}>
          <p className="font-semibold mb-1">{allCorrect ? "⭕ 正解！" : `❌ ${correctCount} / ${active.steps.length} 正しい位置`}</p>
          {!allCorrect && (
            <p className="leading-relaxed text-[var(--muted)]">正しい順序：{active.steps.join(" → ")}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {!complete ? (
          <button onClick={reset} className="rounded-xl bg-[var(--secondary-btn-bg)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--secondary-btn-hover)]">
            やり直す
          </button>
        ) : (
          <button onClick={reshuffle} className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)]">
            もう一度
          </button>
        )}
      </div>
    </div>
  );
}
