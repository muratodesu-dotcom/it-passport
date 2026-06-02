"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTermsByExam, TermPair } from "@/data/terms";
import { ExamType, examShortLabels, ipFieldLabels } from "@/lib/types";
import { getKnownTerms, getTermBookmarks } from "@/lib/termProgress";
import TermFeed from "@/components/TermFeed";

type FieldFilter = "all" | string;
type Source = "all" | "bookmarked";

const itFilters: { id: FieldFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "strategy", label: "ストラテジ系" },
  { id: "management", label: "マネジメント系" },
  { id: "technology", label: "テクノロジ系" },
];

const chizaiFilters: { id: FieldFilter; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "patent", label: ipFieldLabels.patent },
  { id: "design-trademark", label: ipFieldLabels["design-trademark"] },
  { id: "copyright", label: ipFieldLabels.copyright },
  { id: "other", label: ipFieldLabels.other },
];

function groupKey(exam: ExamType, t: TermPair): string {
  return exam === "chizai" ? t.ipField ?? "other" : t.category;
}

// Small reusable toggle switch (matches the self-test toggle styling).
function Toggle({
  label,
  hint,
  on,
  onToggle,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl bg-[var(--badge-bg)] px-4 py-3 text-left"
    >
      <span className="text-sm font-medium">
        {label}
        {hint && <span className="ml-1 text-xs text-[var(--muted)]">{hint}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--primary)]" : "bg-[var(--progress-bg)]"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}

export default function ScrollPage() {
  const [exam, setExam] = useState<ExamType>("it-passport");
  const [filter, setFilter] = useState<FieldFilter>("all");
  const [query, setQuery] = useState("");
  const [revealMode, setRevealMode] = useState(false);
  const [source, setSource] = useState<Source>("all");
  const [hideKnown, setHideKnown] = useState(true);
  const [weakFirst, setWeakFirst] = useState(false);

  // Live counts for the pills; refreshed when the feed reports a change.
  const [counts, setCounts] = useState({ bookmark: 0, known: 0 });
  const refreshCounts = useCallback(() => {
    setCounts({ bookmark: getTermBookmarks().length, known: getKnownTerms().length });
  }, []);

  // Snapshot of the bookmark/known sets used for filtering. Refreshed only when
  // a filter control changes — not on every in-feed toggle — so marking a term
  // mid-session doesn't yank it out from under the learner.
  const [filterSets, setFilterSets] = useState<{ known: Set<string>; bookmark: Set<string> }>({
    known: new Set(),
    bookmark: new Set(),
  });
  useEffect(() => {
    setFilterSets({ known: new Set(getKnownTerms()), bookmark: new Set(getTermBookmarks()) });
    refreshCounts();
  }, [exam, filter, query, source, hideKnown, weakFirst, refreshCounts]);

  const normalizedQuery = query.trim().toLowerCase();
  const baseTerms = useMemo(() => getTermsByExam(exam), [exam]);
  const filters = exam === "chizai" ? chizaiFilters : itFilters;

  const filtered = useMemo(() => {
    return baseTerms.filter((t) => {
      if (filter !== "all" && groupKey(exam, t) !== filter) return false;
      if (source === "bookmarked" && !filterSets.bookmark.has(t.term)) return false;
      if (hideKnown && filterSets.known.has(t.term)) return false;
      if (!normalizedQuery) return true;
      return (
        t.term.toLowerCase().includes(normalizedQuery) ||
        t.english.toLowerCase().includes(normalizedQuery) ||
        t.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [baseTerms, exam, filter, normalizedQuery, source, hideKnown, filterSets]);

  const switchExam = (next: ExamType) => {
    setExam(next);
    setFilter("all");
  };

  // Remounting TermFeed on these changes resets and reshuffles the feed cleanly.
  const feedKey = `${exam}-${filter}-${normalizedQuery}-${source}-${hideKnown}-${weakFirst}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          ← 戻る
        </Link>
        <h1 className="text-xl font-bold">用語フィード</h1>
        <Link href="/glossary" className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
          一覧で見る
        </Link>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-[var(--muted)]">
        用語カードを「戻る／次へ」でめくっていく学習フィード。⭐でブックマーク、✓で「覚えた」に仕分けでき、自己テストモードでは自己採点で苦手な語を優先的に復習できます。
      </p>

      <div className="mb-5 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="mb-4 flex gap-2">
          {(["it-passport", "chizai"] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => switchExam(e)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                exam === e
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {examShortLabels[e]}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語・英語名・説明で絞り込み…"
          className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Feed source: all terms vs. just bookmarks */}
        <div className="mt-3 inline-flex rounded-xl border border-[var(--card-border)] p-1 text-xs">
          {([
            { id: "all", label: "すべての用語" },
            { id: "bookmarked", label: `⭐ ブックマーク (${counts.bookmark})` },
          ] as const).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(s.id)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                source === s.id ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          <Toggle
            label="自己テストモード"
            hint="説明を隠して思い出す"
            on={revealMode}
            onToggle={() => setRevealMode((v) => !v)}
          />
          <Toggle
            label="苦手な語を優先"
            hint="自己採点をもとに復習順で出題"
            on={weakFirst}
            onToggle={() => setWeakFirst((v) => !v)}
          />
          <Toggle
            label="覚えた語を隠す"
            hint={`✓ ${counts.known}語をローテーションから除外`}
            on={hideKnown}
            onToggle={() => setHideKnown((v) => !v)}
          />
        </div>
      </div>

      <TermFeed
        key={feedKey}
        terms={filtered}
        exam={exam}
        revealMode={revealMode}
        weakFirst={weakFirst}
        onProgressChange={refreshCounts}
      />
    </div>
  );
}
