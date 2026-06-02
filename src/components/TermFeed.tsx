"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TermPair } from "@/data/terms";
import { Category, categoryLabels, ExamType, IpField, ipFieldLabels } from "@/lib/types";
import Furigana from "@/components/Furigana";
import TermExplanationEn from "@/components/TermExplanationEn";
import {
  TermGrade,
  getKnownTerms,
  getTermBookmarks,
  getTermSrsState,
  gradeTerm,
  toggleTermBookmark,
  toggleTermKnown,
  weakFirstScore,
} from "@/lib/termProgress";

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

// Weak-first order: terms due soonest (and never-studied ones) come first.
// Ties are broken randomly so repeated passes don't feel identical.
function weakFirstOrder(terms: TermPair[]): TermPair[] {
  const srs = getTermSrsState();
  const now = new Date();
  return shuffle(terms)
    .map((t) => ({ t, score: weakFirstScore(srs[t.term], now) }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.t);
}

const GRADES: { id: TermGrade; label: string; cls: string }[] = [
  { id: "forgot", label: "忘れた", cls: "border-[var(--danger-border)] text-[var(--danger)] hover:bg-[var(--danger-bg)]" },
  { id: "vague", label: "あいまい", cls: "border-[var(--card-border)] hover:bg-[var(--card-hover)]" },
  { id: "known", label: "わかった", cls: "border-[var(--success-border)] text-[var(--success)] hover:bg-[var(--success-bg)]" },
];

type FeedCard = { key: number; term: TermPair };

interface TermFeedProps {
  terms: TermPair[];
  exam: ExamType;
  /** Self-test mode: hide the explanation until the learner reveals it. */
  revealMode: boolean;
  /** Order the deck weak-first using the term SRS schedule. */
  weakFirst?: boolean;
  /** Called after the learner bookmarks, archives, or grades a term. */
  onProgressChange?: () => void;
}

/**
 * An endless "doom scroll" deck of glossary terms: one card on screen at a
 * time with Back / Next controls (plus arrow keys and swipe). Next keeps
 * pulling fresh terms forever — once the shuffled pool is exhausted it
 * reshuffles — so studying never hits a dead end.
 *
 * Each card can be bookmarked (⭐), archived as "known" (✓, drops it from the
 * pool next time), and — in self-test mode — revealed/re-hidden with a tap and
 * self-graded (忘れた / あいまい / わかった) to feed the term SRS schedule.
 */
export default function TermFeed({ terms, exam, revealMode, weakFirst = false, onProgressChange }: TermFeedProps) {
  const [cards, setCards] = useState<FeedCard[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  // Mirror the persisted bookmark/known sets so the card reacts instantly.
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [known, setKnown] = useState<Set<string>>(new Set());

  const orderRef = useRef<TermPair[]>([]);
  const cursorRef = useRef(0);
  const seqRef = useRef(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setBookmarked(new Set(getTermBookmarks()));
    setKnown(new Set(getKnownTerms()));
  }, []);

  // Pull the next term, looping (and reshuffling) through the pool forever.
  const nextTerm = useCallback((): FeedCard | null => {
    if (orderRef.current.length === 0) return null;
    if (cursorRef.current >= orderRef.current.length) {
      orderRef.current = weakFirst ? weakFirstOrder(orderRef.current) : shuffle(orderRef.current);
      cursorRef.current = 0;
    }
    return { key: seqRef.current++, term: orderRef.current[cursorRef.current++] };
  }, [weakFirst]);

  // Reset the deck whenever the term pool or ordering changes.
  useEffect(() => {
    orderRef.current = weakFirst ? weakFirstOrder(terms) : shuffle(terms);
    cursorRef.current = 0;
    seqRef.current = 0;
    setRevealed(new Set());
    setPos(0);
    const first = terms.length > 0 ? nextTerm() : null;
    setCards(first ? [first] : []);
  }, [terms, nextTerm, weakFirst]);

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

  const toggleBookmark = useCallback(() => {
    if (!current) return;
    const nowOn = toggleTermBookmark(current.term.term);
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (nowOn) next.add(current.term.term);
      else next.delete(current.term.term);
      return next;
    });
    onProgressChange?.();
  }, [current, onProgressChange]);

  const toggleKnown = useCallback(() => {
    if (!current) return;
    const nowOn = toggleTermKnown(current.term.term);
    setKnown((prev) => {
      const next = new Set(prev);
      if (nowOn) next.add(current.term.term);
      else next.delete(current.term.term);
      return next;
    });
    onProgressChange?.();
    // Marking a term known is also a strong "move on" signal.
    if (nowOn) goNext();
  }, [current, onProgressChange, goNext]);

  const grade = useCallback(
    (g: TermGrade) => {
      if (!current) return;
      gradeTerm(current.term.term, g);
      onProgressChange?.();
      goNext();
    },
    [current, onProgressChange, goNext]
  );

  // Keyboard: ←/k back, →/j next, space reveal-or-next, 1/2/3 grade when shown.
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
      } else if (revealMode && isRevealed && (e.key === "1" || e.key === "2" || e.key === "3")) {
        e.preventDefault();
        grade(GRADES[Number(e.key) - 1].id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goBack, goNext, revealMode, isRevealed, toggleReveal, grade]);

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
  const isBookmarked = bookmarked.has(t.term);
  const isKnown = known.has(t.term);

  return (
    <div>
      {/* Progress header */}
      <div className="mb-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            学習した用語 <span className="font-semibold text-[var(--foreground)]">{learned}</span> / {total}語
          </span>
          <span className="hidden sm:inline">
            ← / → で移動{revealMode ? " · space で答え · 1〜3 で自己採点" : ""}
          </span>
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
          if (revealMode) toggleReveal();
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`card-enter flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card)] shadow-md ${
          revealMode ? "cursor-pointer" : ""
        }`}
      >
        <div className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${accent}`} />
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className={`rounded-full bg-gradient-to-r ${accent} px-3 py-1 text-[11px] font-medium text-white`}>
              {badgeLabel(exam, t)}
            </span>
            {/* Per-card actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? "ブックマークを外す" : "ブックマークに追加"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark();
                }}
                className={`grid h-8 w-8 place-items-center rounded-full border text-sm transition-colors ${
                  isBookmarked
                    ? "border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-300/30 dark:bg-amber-400/10"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <span aria-hidden>{isBookmarked ? "⭐️" : "☆"}</span>
              </button>
              <button
                type="button"
                aria-pressed={isKnown}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleKnown();
                }}
                className={`flex h-8 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors ${
                  isKnown
                    ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success)]"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:bg-[var(--card-hover)]"
                }`}
              >
                <span aria-hidden>{isKnown ? "✓" : "＋"}</span>
                覚えた
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            <Furigana term={t.term} />
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{t.english}</p>

          <div className="mt-5 flex-1">
            {isRevealed ? (
              <div key={`${current.key}-shown`} className={revealMode ? "flip-in" : "fade-in"}>
                <p className="text-[15px] leading-relaxed text-[var(--foreground)] sm:text-base">
                  {t.description}
                </p>
                <TermExplanationEn term={t.term} />
                {revealMode && (
                  <p className="mt-3 text-center text-xs text-[var(--muted)]">タップで隠す</p>
                )}
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

      {/* Self-grading (self-test mode, once revealed) */}
      {revealMode && isRevealed && (
        <div className="mt-4">
          <p className="mb-2 text-center text-xs text-[var(--muted)]">どれくらい覚えていた？</p>
          <div className="grid grid-cols-3 gap-2">
            {GRADES.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => grade(g.id)}
                className={`rounded-2xl border bg-[var(--card)] px-3 py-3 text-sm font-medium transition-colors ${g.cls}`}
              >
                {g.label}
                <span className="ml-1 hidden text-[10px] opacity-60 sm:inline">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
