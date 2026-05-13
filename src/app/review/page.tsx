"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuestions } from "@/data";
import { useExam } from "@/lib/examContext";
import { getHistory } from "@/lib/history";
import { Question, categoryLabels, examLabels, Category } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReviewPage() {
  const router = useRouter();
  const { exam } = useExam();
  const allQuestions = useMemo(() => getQuestions(exam), [exam]);
  const questionById = useMemo(() => new Map(allQuestions.map((q) => [q.id, q])), [allQuestions]);

  const missedPool = useMemo(() => {
    // Build a stats map: for each qid in this exam, how many right/wrong overall
    const stats = new Map<number, { wrong: number; right: number; lastWrong: string | null }>();
    for (const result of getHistory()) {
      if (result.exam !== exam) continue;
      if (!result.questionIds || !result.answers) continue;
      result.questionIds.forEach((qid, i) => {
        const q = questionById.get(qid);
        if (!q) return;
        const ans = result.answers![i];
        if (ans === null || ans === undefined) return;
        const cur = stats.get(qid) ?? { wrong: 0, right: 0, lastWrong: null };
        if (ans === q.correctIndex) {
          cur.right += 1;
        } else {
          cur.wrong += 1;
          cur.lastWrong = result.date;
        }
        stats.set(qid, cur);
      });
    }
    // Include only questions you got wrong at least once and haven't yet gotten 2 consecutive right
    // (For simplicity we use wrong > right)
    const missedIds: { qid: number; stat: { wrong: number; right: number; lastWrong: string | null } }[] = [];
    stats.forEach((stat, qid) => {
      if (stat.wrong > 0 && stat.wrong >= stat.right) {
        missedIds.push({ qid, stat });
      }
    });
    return missedIds;
  }, [exam, questionById]);

  const groupedByCategory = useMemo(() => {
    const byCat: Record<string, { qid: number; question: Question }[]> = {};
    for (const { qid } of missedPool) {
      const q = questionById.get(qid);
      if (!q) continue;
      const cat = q.category;
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push({ qid, question: q });
    }
    return byCat;
  }, [missedPool, questionById]);

  const [round, setRound] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedThisRound, setMissedThisRound] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");

  useEffect(() => {
    setState("idle");
    setRound([]);
  }, [exam]);

  const startRound = useCallback((category: string | "all") => {
    const pool =
      category === "all"
        ? missedPool.map(({ qid }) => questionById.get(qid)!).filter(Boolean)
        : (groupedByCategory[category] ?? []).map(({ question }) => question);
    if (pool.length === 0) return;
    setRound(shuffle(pool).slice(0, Math.min(20, pool.length)));
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setMissedThisRound([]);
    setState("playing");
  }, [missedPool, groupedByCategory, questionById]);

  const current = round[index];
  const handlePick = (i: number) => {
    if (selected !== null || !current) return;
    setSelected(i);
    if (i === current.correctIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedThisRound((m) => [...m, current.id]);
    }
  };

  const next = () => {
    if (index + 1 >= round.length) {
      setState("done");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  };

  useEffect(() => {
    if (state !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (selected === null) {
        const n = parseInt(e.key);
        if (n >= 1 && n <= 4) handlePick(n - 1);
      } else if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, selected, index, round.length]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&larr; ホーム</Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">復習モード</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        過去に間違えた問題だけを集めて出題します（{examLabels[exam]}）
      </p>

      {state === "idle" && (
        <>
          {missedPool.length === 0 ? (
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-lg font-medium mb-2">復習できる問題がまだありません</p>
              <p className="text-sm text-[var(--muted)] mb-6">
                クイズを解いて間違えた問題は、ここで復習できます。
              </p>
              <button
                onClick={() => router.push("/quiz?category=all")}
                className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
              >
                クイズを始める
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{missedPool.length}</p>
                  <p className="text-sm text-[var(--muted)]">復習待ちの問題</p>
                </div>
                <button
                  onClick={() => startRound("all")}
                  className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                >
                  まとめて復習 →
                </button>
              </div>

              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">分野別</p>
              <div className="space-y-2">
                {Object.entries(groupedByCategory)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([cat, items]) => (
                    <button
                      key={cat}
                      onClick={() => startRound(cat)}
                      className="w-full flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="font-medium text-sm">{categoryLabels[cat as Category] ?? cat}</span>
                      <span className="text-sm text-[var(--muted)]">{items.length}問 →</span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {state === "playing" && current && (
        <>
          <div className="flex items-center justify-between mb-3 text-sm text-[var(--muted)]">
            <span>{index + 1} / {round.length}</span>
            <span className="text-[var(--success)]">{correctCount} 正解</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--progress-bg)] mb-5">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${(index / round.length) * 100}%` }}
            />
          </div>

          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--muted)]">
                {categoryLabels[current.category as Category] ?? current.category}
              </span>
              <span className="text-[0.65rem] text-[var(--muted)]">復習</span>
            </div>
            <p className="text-base leading-relaxed">{current.question}</p>
          </div>

          <div className="grid gap-2">
            {current.options.map((opt, i) => {
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
                    <span className="flex-1">{opt}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4 fade-in">
              <div className={`rounded-xl px-4 py-3 mb-3 text-sm ${
                selected === current.correctIndex
                  ? "border border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                  : "border border-[var(--danger-border)] bg-[var(--danger-bg)]"
              }`}>
                <p className="font-semibold mb-1">
                  {selected === current.correctIndex ? "⭕ 正解！" : "❌ 不正解"}
                </p>
                <p className="text-[var(--foreground)] opacity-80">{current.explanation}</p>
              </div>
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

      {state === "done" && (
        <div className="text-center py-10 fade-in">
          <div className="text-6xl mb-4">
            {missedThisRound.length === 0 ? "🏆" : correctCount >= round.length * 0.7 ? "🎉" : "💪"}
          </div>
          <h2 className="text-2xl font-bold mb-3">復習完了</h2>
          <p className="text-[var(--muted)] mb-1">
            {round.length}問中 {correctCount}問 正解 ({Math.round((correctCount / round.length) * 100)}%)
          </p>
          <p className="text-sm text-[var(--muted)] mb-6">
            {missedThisRound.length === 0
              ? "今回はすべて正解！結果は履歴に保存されます。"
              : `${missedThisRound.length}問はまだ復習プールに残ります。`}
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => setState("idle")}
              className="rounded-xl bg-[var(--primary)] px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
            >
              復習を続ける
            </button>
            <Link
              href="/"
              className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 font-medium transition-all hover:-translate-y-0.5 hover:bg-[var(--card-hover)]"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
