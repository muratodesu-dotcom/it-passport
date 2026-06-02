"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TermPair } from "@/data/terms";
import { Category, categoryLabels, ExamType, IpField, ipFieldLabels } from "@/lib/types";
import Furigana from "@/components/Furigana";
import TermExplanationEn from "@/components/TermExplanationEn";

const accentByCategory: Record<Category, string> = {
  strategy: "from-blue-500 to-cyan-500",
  management: "from-emerald-500 to-green-500",
  technology: "from-purple-500 to-pink-500",
};

const accentByIpField: Record<IpField, string> = {
  patent: "from-indigo-500 to-blue-500",
  "design-trademark": "from-rose-500 to-orange-500",
  copyright: "from-amber-500 to-yellow-500",
  other: "from-teal-500 to-emerald-500",
};

function badgeLabel(exam: ExamType, t: TermPair): string {
  return exam === "chizai" ? ipFieldLabels[t.ipField ?? "other"] : categoryLabels[t.category];
}

function accentFor(exam: ExamType, t: TermPair): string {
  return exam === "chizai" ? accentByIpField[t.ipField ?? "other"] : accentByCategory[t.category];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type FeedCard = { key: number; term: TermPair };

interface TermFeedProps {
  terms: TermPair[];
  exam: ExamType;
  /** Self-test mode: hide the explanation until the learner reveals it. */
  revealMode: boolean;
}

/**
 * An endless "doom scroll" deck of glossary terms: one card on screen at a
 * time with Back / Next controls (plus arrow keys and swipe). Next keeps
 * pulling fresh terms forever — once the shuffled pool is exhausted it
 * reshuffles — so studying never hits a dead end.
 */
export default function TermFeed({ terms, exam, revealMode }: TermFeedProps) {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const orderRef = useRef<TermPair[]>([]);
  const cursorRef = useRef(0);
  const seqRef = useRef(0);
  const touchStartX = useRef<number | null>(null);

  // Pull the next term, looping (and reshuffling) through the pool forever.
  const nextTerm = useCallback((): FeedCard | null => {
    if (orderRef.current.length === 0) return null;
    if (cursorRef.current >= orderRef.current.length) {
      orderRef.current = shuffle(orderRef.current);
      cursorRef.current = 0;
    }
    return { key: seqRef.current++, term: orderRef.current[cursorRef.current++] };
  }, []);

  // Reset the deck whenever the term pool changes (exam / filter / search).
  useEffect(() => {
    orderRef.current = shuffle(terms);
    cursorRef.current = 0;
    seqRef.current = 0;
    setRevealed(new Set());
    setPos(0);
    const first = terms.length > 0 ? nextTerm() : null;
    setCards(first ? [first] : []);
  }, [terms, nextTerm]);

  const goNext = useCallback(() => {
    if (pos + 1 < cards.length) {
      setPos(pos + 1);
      return;
    }
    // At the end of what we've seen: pull a fresh term and advance onto it.
    const card = nextTerm();
    if (card) {
      setCards((prev) => [...prev, card]);
      setPos(pos + 1);
    }
  }, [pos, cards.length, nextTerm]);

  const goBack = useCallback(() => {
    setPos((p) => Math.max(0, p - 1));
  }, []);

  const current = cards[pos];

  const isRevealed = !revealMode || (current ? revealed.has(current.key) : false);

  const toggleReveal = useCallback(() => {
    if (!current) return;
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(current.key)) next.delete(current.key);
      else next.add(current.key);
      return next;
    });
  }, [current]);

  // Keyboard: ←/k back, →/j/space next (space reveals first in self-test mode).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft" || e.key === "k") {
        e.preventDefault();
        goBack();
      } else if (e.key === "ArrowRight" || e.key === "j") {
        e.preventDefault();
        goNext();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (revealMode && !isRevealed) toggleReveal();
        else goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goBack, goNext, revealMode, isRevealed, toggleReveal]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) goNext();
    else if (dx > 50) goBack();
  };

  const learned = useMemo(
    () => new Set(cards.slice(0, pos + 1).map((c) => c.term.term)).size,
    [cards, pos]
  );
  const total = terms.length;
  const progress = total > 0 ? Math.min(100, Math.round((learned / total) * 100)) : 0;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--card-border)] p-10 text-center text-sm text-[var(--muted)]">
        条件に一致する用語がありませんでした。
      </div>
    );
  }

  // Terms exist but the init effect hasn't built the first card yet (it runs
  // right after mount); render nothing for that frame rather than flashing the
  // empty-state message above.
  if (!current) return null;

  const t = current.term;
  const accent = accentFor(exam, t);

  return (
    <div>
      {/* Progress header */}
      <div className="mb-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            学習した用語 <span className="font-semibold text-[var(--foreground)]">{learned}</span> / {total}語
          </span>
          <span className="hidden sm:inline">← / → で移動{revealMode ? " · space で答え" : ""}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--progress-bg)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundImage: `linear-gradient(to right, var(--gradient-progress-from), var(--gradient-progress-to))`,
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* The card */}
      <article
        key={current.key}
        onClick={() => {
          if (revealMode && !isRevealed) toggleReveal();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="card-enter flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] shadow-md"
      >
        <div className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${accent}`} />
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`rounded-full bg-gradient-to-r ${accent} px-3 py-1 text-[11px] font-medium text-white`}>
              {badgeLabel(exam, t)}
            </span>
            <span className="text-xs text-[var(--muted)]">{learned} / {total}</span>
          </div>

          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            <Furigana term={t.term} />
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.english}</p>

          <div className="mt-5 flex-1">
            {isRevealed ? (
              <div className="fade-in">
                <p className="text-[15px] leading-relaxed text-[var(--foreground)] sm:text-base">
                  {t.description}
                </p>
                <TermExplanationEn term={t.term} />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReveal();
                }}
                className="flex h-full min-h-[120px] w-full items-center justify-center rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--badge-bg)] text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--secondary-btn-hover)]"
              >
                <span aria-hidden className="mr-2">🫥</span> タップして説明を表示
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Back / Next controls */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={pos === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3.5 font-medium transition-all hover:bg-[var(--card-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          戻る
        </button>
        <button
          type="button"
          onClick={goNext}
          className="flex flex-[1.6] items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3.5 font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
        >
          次へ
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        カードをスワイプ、または ← / → キーでも移動できます
      </p>
    </div>
  );
}
