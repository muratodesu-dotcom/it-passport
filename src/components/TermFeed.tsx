"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TermPair } from "@/data/terms";
import { Category, categoryLabels, ExamType, ipFieldLabels } from "@/lib/types";

const categoryAccent: Record<Category, string> = {
  strategy: "from-blue-500 to-cyan-500",
  management: "from-green-500 to-emerald-500",
  technology: "from-purple-500 to-pink-500",
};

function badgeLabel(exam: ExamType, t: TermPair): string {
  if (exam === "chizai") return ipFieldLabels[t.ipField ?? "other"];
  return categoryLabels[t.category];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BATCH = 6;

type FeedCard = { key: number; term: TermPair };

interface TermFeedProps {
  terms: TermPair[];
  exam: ExamType;
  /** Self-test mode: hide the explanation until the learner reveals it. */
  revealMode: boolean;
}

/**
 * An endless, shuffled "doom scroll" feed of glossary terms and their
 * explanations. New cards load as you scroll; once every term has been shown
 * once it reshuffles and keeps going, so learning never hits a dead end.
 */
export default function TermFeed({ terms, exam, revealMode }: TermFeedProps) {
  const [feed, setFeed] = useState<FeedCard[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const orderRef = useRef<TermPair[]>([]);
  const cursorRef = useRef(0);
  const seqRef = useRef(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());

  // Pull the next n cards, looping (and reshuffling) through the pool forever.
  const buildBatch = useCallback((n: number): FeedCard[] => {
    const out: FeedCard[] = [];
    for (let i = 0; i < n; i++) {
      if (orderRef.current.length === 0) break;
      if (cursorRef.current >= orderRef.current.length) {
        orderRef.current = shuffle(orderRef.current);
        cursorRef.current = 0;
      }
      out.push({ key: seqRef.current++, term: orderRef.current[cursorRef.current++] });
    }
    return out;
  }, []);

  // Reset the feed whenever the term pool changes (exam / filter / search).
  useEffect(() => {
    orderRef.current = shuffle(terms);
    cursorRef.current = 0;
    seqRef.current = 0;
    cardRefs.current.clear();
    setRevealed(new Set());
    setActiveIndex(0);
    setFeed(buildBatch(Math.min(BATCH, terms.length) || 0));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [terms, buildBatch]);

  // Infinite scroll: append more cards as the loader sentinel approaches.
  useEffect(() => {
    const node = loaderRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setFeed((prev) => [...prev, ...buildBatch(BATCH)]);
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [buildBatch]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const reveal = useCallback((key: number) => {
    setRevealed((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const scrollToCard = useCallback(
    (index: number) => {
      const card = feed[index];
      if (!card) return;
      const el = cardRefs.current.get(card.key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setActiveIndex(index);
      }
    },
    [feed]
  );

  // Keyboard: j/k or arrows to move, space/enter to reveal in self-test mode.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollToCard(Math.min(activeIndex + 1, feed.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollToCard(Math.max(activeIndex - 1, 0));
      } else if (e.key === " " || e.key === "Enter") {
        if (!revealMode) return;
        e.preventDefault();
        const card = feed[activeIndex];
        if (card) reveal(card.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, feed, revealMode, reveal, scrollToCard]);

  const uniqueCount = useMemo(
    () => new Set(feed.map((f) => f.term.term)).size,
    [feed]
  );
  const total = terms.length;
  const progress = total > 0 ? Math.min(100, Math.round((uniqueCount / total) * 100)) : 0;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--card-border)] p-10 text-center text-sm text-[var(--muted)]">
        条件に一致する用語がありませんでした。
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-[57px] z-30 mb-4 rounded-2xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card)_92%,transparent)] px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            学習した用語 <span className="font-semibold text-[var(--foreground)]">{uniqueCount}</span> / {total}語
          </span>
          <span className="hidden sm:inline">j / k · 矢印で移動{revealMode ? " · space で説明を表示" : ""}</span>
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

      <div className="space-y-3">
        {feed.map((card, position) => {
          const t = card.term;
          const isActive = position === activeIndex;
          const isRevealed = !revealMode || revealed.has(card.key);
          const accent = categoryAccent[t.category];

          return (
            <article
              key={card.key}
              ref={(el) => {
                if (el) cardRefs.current.set(card.key, el);
              }}
              onClick={() => {
                setActiveIndex(position);
                if (revealMode) reveal(card.key);
              }}
              className={`cursor-pointer overflow-hidden rounded-2xl border-2 bg-[var(--card)] shadow-sm card-enter transition-colors ${
                isActive ? "border-[var(--accent)]/50" : "border-[var(--card-border)]"
              }`}
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold leading-snug">{t.term}</h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{t.english}</p>
                  </div>
                  <span className={`shrink-0 rounded-full bg-gradient-to-r ${accent} px-2.5 py-1 text-[10px] font-medium text-white`}>
                    {badgeLabel(exam, t)}
                  </span>
                </div>

                {isRevealed ? (
                  <p className="text-[15px] leading-relaxed text-[var(--foreground)] fade-in">{t.description}</p>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      reveal(card.key);
                    }}
                    className="w-full rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--badge-bg)] py-4 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--secondary-btn-hover)]"
                  >
                    タップして説明を表示
                  </button>
                )}
              </div>
            </article>
          );
        })}

        <div ref={loaderRef} className="py-8 text-center">
          {uniqueCount >= total ? (
            <p className="text-xs text-[var(--muted)]">
              全{total}語を一巡しました 🎉 シャッフルして続けます…
            </p>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <span className="inline-block h-4 w-4 rounded-full border-2 border-[var(--muted)] border-t-transparent animate-spin" />
              読み込み中…
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-all hover:scale-105 hover:bg-[var(--primary-hover)] fade-in"
          aria-label="トップに戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
