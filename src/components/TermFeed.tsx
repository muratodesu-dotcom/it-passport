"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TermPair } from "@/data/terms";
import { Category, ExamType, IpField, ipFieldLabels } from "@/lib/types";
import Furigana from "@/components/Furigana";

// Each glossary field gets a "persona" account so the feed reads like a social
// timeline of posts rather than a list of cards.
type Persona = { name: string; handle: string; emoji: string; tag: string; accent: string };

const itPersonas: Record<Category, Persona> = {
  strategy: { name: "経営戦略ラボ", handle: "strategy_lab", emoji: "📊", tag: "ストラテジ", accent: "from-blue-500 to-cyan-500" },
  management: { name: "PMニュース", handle: "pm_desk", emoji: "🗂️", tag: "マネジメント", accent: "from-emerald-500 to-green-500" },
  technology: { name: "テック速報", handle: "tech_stream", emoji: "💻", tag: "テクノロジ", accent: "from-purple-500 to-pink-500" },
};

const ipPersonas: Record<IpField, Persona> = {
  patent: { name: "特許ノート", handle: "patent_note", emoji: "📑", tag: "特許", accent: "from-indigo-500 to-blue-500" },
  "design-trademark": { name: "意匠商標室", handle: "tm_design", emoji: "🏷️", tag: "意匠商標", accent: "from-rose-500 to-orange-500" },
  copyright: { name: "著作権ラボ", handle: "copyright_lab", emoji: "✍️", tag: "著作権", accent: "from-amber-500 to-yellow-500" },
  other: { name: "知財よもやま", handle: "ip_today", emoji: "⚖️", tag: "知財", accent: "from-teal-500 to-emerald-500" },
};

function personaFor(exam: ExamType, t: TermPair): Persona {
  return exam === "chizai" ? ipPersonas[t.ipField ?? "other"] : itPersonas[t.category];
}

// Deterministic hash so each term always shows the same like/repost counts and
// timestamp — the numbers feel real and never jump between renders.
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

function relativeTime(minutes: number): string {
  if (minutes < 60) return `${Math.max(1, minutes)}分`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間`;
  return `${Math.floor(hours / 24)}日`;
}

type Stats = { replies: number; reposts: number; likes: number; time: string };

function statsFor(term: string): Stats {
  const h = hashStr(term);
  return {
    replies: h % 240,
    reposts: 5 + ((h >> 4) % 1200),
    likes: 30 + ((h >> 8) % 18000),
    time: relativeTime((h >> 3) % (60 * 24 * 6)),
  };
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
 * An endless, shuffled "doom scroll" feed of glossary terms styled like a
 * social-media timeline — each term is a post from a field "account" with
 * likes, reposts and bookmarks. New posts load as you scroll; once every term
 * has been shown once it reshuffles and keeps going, so learning never ends.
 */
export default function TermFeed({ terms, exam, revealMode }: TermFeedProps) {
  const [feed, setFeed] = useState<FeedCard[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [reposted, setReposted] = useState<Set<number>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const orderRef = useRef<TermPair[]>([]);
  const cursorRef = useRef(0);
  const seqRef = useRef(0);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Map<number, HTMLElement>>(new Map());
  const feedRef = useRef<FeedCard[]>(feed);

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
    setLiked(new Set());
    setSaved(new Set());
    setReposted(new Set());
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

  // Keep the scroll handler's view of the feed current without re-subscribing.
  useEffect(() => {
    feedRef.current = feed;
  }, [feed]);

  // On scroll, toggle the back-to-top button and keep activeIndex on the card
  // nearest the viewport center, so keyboard nav (j/k) continues from what the
  // learner is actually looking at instead of a stale index after scrolling.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setShowScrollTop(window.scrollY > 600);
      const mid = window.innerHeight / 2;
      const cards = feedRef.current;
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current.get(cards[i].key);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        } else if (best !== -1) {
          // Cards are in document order, so distance is unimodal: once it grows
          // again we have passed the centered card.
          break;
        }
      }
      if (best !== -1) setActiveIndex((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const reveal = useCallback((key: number) => {
    setRevealed((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const toggleIn = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Set<number>>>, key: number) => {
      setter((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    []
  );

  // Self-test mode: flip the active card between hidden and revealed.
  const toggleReveal = useCallback((key: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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

  // Keyboard: j/k or arrows to move, space/enter to flip in self-test mode,
  // l to like the centered post.
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
      } else if (e.key === "l") {
        const card = feed[activeIndex];
        if (card) toggleIn(setLiked, card.key);
      } else if (e.key === " " || e.key === "Enter") {
        if (!revealMode) return;
        e.preventDefault();
        const card = feed[activeIndex];
        if (card) toggleReveal(card.key);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, feed, revealMode, toggleReveal, toggleIn, scrollToCard]);

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
      <div className="sticky top-14 z-30 mb-4 rounded-2xl border border-[var(--card-border)] bg-[color:color-mix(in_srgb,var(--card)_92%,transparent)] px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            学習した用語 <span className="font-semibold text-[var(--foreground)]">{uniqueCount}</span> / {total}語
          </span>
          <span className="hidden sm:inline">j / k で移動 · l でいいね{revealMode ? " · space で答え" : ""}</span>
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
          const persona = personaFor(exam, t);
          const stats = statsFor(t.term);
          const isLiked = liked.has(card.key);
          const isSaved = saved.has(card.key);
          const isReposted = reposted.has(card.key);
          const fieldTag = exam === "chizai" ? ipFieldLabels[t.ipField ?? "other"] : persona.tag;

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
              className={`cursor-pointer rounded-2xl border bg-[var(--card)] p-4 shadow-sm card-enter transition-colors ${
                isActive ? "border-[var(--accent)]/50" : "border-[var(--card-border)]"
              }`}
            >
              {/* Post header: avatar + account + time */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${persona.accent} text-lg shadow-sm`}
                  aria-hidden
                >
                  {persona.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="truncate font-bold">{persona.name}</span>
                    <svg className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor" aria-label="認証済み">
                      <path d="M12 1l2.4 2.1 3.2-.3 1.3 2.9 2.9 1.3-.3 3.2L24 12l-2.1 2.4.3 3.2-2.9 1.3-1.3 2.9-3.2-.3L12 23l-2.4-2.1-3.2.3-1.3-2.9L2.2 17l.3-3.2L0 12l2.1-2.4-.3-3.2 2.9-1.3L6 2.2l3.2.3L12 1zm-1.3 13.2l5.3-5.3-1.3-1.3-4 4-1.7-1.7L7 11.2l3 3z" />
                    </svg>
                    <span className="truncate text-[var(--muted)]">@{persona.handle}</span>
                    <span className="text-[var(--muted)]">·</span>
                    <span className="shrink-0 text-[var(--muted)]">{stats.time}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">#{fieldTag}</p>
                </div>
                <span className="shrink-0 text-[var(--muted)]" aria-hidden>···</span>
              </div>

              {/* Post body: the term + reading, English, and explanation */}
              <div className="mt-3">
                <h2 className="text-xl font-bold leading-snug">
                  <Furigana term={t.term} />
                </h2>
                <p className="mt-0.5 text-xs text-[var(--muted)]">{t.english}</p>

                {isRevealed ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--foreground)] fade-in">
                    {t.description}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      reveal(card.key);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--badge-bg)] py-4 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--secondary-btn-hover)]"
                  >
                    <span aria-hidden>🫥</span> 答えを隠しています・タップで表示
                  </button>
                )}
              </div>

              {/* Action bar: reply / repost / like / bookmark / share */}
              <div className="mt-3 flex items-center justify-between text-[var(--muted)]">
                <span className="flex items-center gap-1.5 text-xs" aria-label="返信">
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  {formatCount(stats.replies)}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIn(setReposted, card.key);
                  }}
                  aria-pressed={isReposted}
                  className={`flex items-center gap-1.5 text-xs transition-colors hover:text-emerald-500 ${isReposted ? "text-emerald-500" : ""}`}
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                  {formatCount(stats.reposts + (isReposted ? 1 : 0))}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIn(setLiked, card.key);
                  }}
                  aria-pressed={isLiked}
                  className={`flex items-center gap-1.5 text-xs transition-colors hover:text-rose-500 ${isLiked ? "text-rose-500" : ""}`}
                >
                  <svg className={`h-[18px] w-[18px] transition-transform ${isLiked ? "scale-110" : ""}`} viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {formatCount(stats.likes + (isLiked ? 1 : 0))}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIn(setSaved, card.key);
                  }}
                  aria-pressed={isSaved}
                  aria-label="ブックマーク"
                  className={`transition-colors hover:text-[var(--primary)] ${isSaved ? "text-[var(--primary)]" : ""}`}
                >
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>

                <span className="text-[var(--muted)]" aria-hidden>
                  <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <path d="M16 6l-4-4-4 4" />
                    <path d="M12 2v13" />
                  </svg>
                </span>
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
